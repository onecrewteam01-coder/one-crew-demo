"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// ── Shared texture helpers ───────────────────────────────────────────────────

/** Soft radial-gradient dot used for the "star" render stage. */
function createStarTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const g = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    g.addColorStop(0, "rgba(255, 255, 255, 1)");
    g.addColorStop(0.2, "rgba(255, 255, 255, 0.8)");
    g.addColorStop(0.5, "rgba(255, 255, 255, 0.2)");
    g.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 16, 16);
  }
  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

/** Blocky "digital pixel" square used for the intermediate render stage. */
function createPixelTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "rgba(255,255,255,0)";
    ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillRect(2, 2, 12, 12);
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillRect(5, 5, 6, 6);
  }
  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

/**
 * Runtime-generated monochrome ASCII atlas: a single row of glyph cells
 * packed into one texture, sampled per-particle via a glyph index.
 * No external assets — everything is drawn with Canvas2D.
 */
const ASCII_GLYPHS = ["@", "#", "%", "&", "*", "+", ":", ";", "."];
const ASCII_ATLAS_COLS = ASCII_GLYPHS.length;
const ASCII_ATLAS_ROWS = 1;
const ASCII_CELL_SIZE = 72;

function createAsciiAtlas() {
  const canvas = document.createElement("canvas");
  canvas.width = ASCII_CELL_SIZE * ASCII_ATLAS_COLS;
  canvas.height = ASCII_CELL_SIZE * ASCII_ATLAS_ROWS;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(255, 255, 255, 1)";
    ctx.font = `900 ${Math.floor(ASCII_CELL_SIZE * 0.95)}px "Courier New", monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ASCII_GLYPHS.forEach((glyph, i) => {
      const cx = i * ASCII_CELL_SIZE + ASCII_CELL_SIZE / 2;
      const cy = ASCII_CELL_SIZE / 2;
      ctx.fillText(glyph, cx, cy);
    });
  }
  const tex = new THREE.CanvasTexture(canvas);
  // Keep V-axis aligned with gl_PointCoord (both top-origin) so the
  // per-cell UV math in the fragment shader doesn't need to flip.
  tex.flipY = false;
  tex.needsUpdate = true;
  return tex;
}

// ── Particle layer definitions (depth bands, mirrors the old 3-layer setup) ──

interface DepthLayer {
  weight: number; // relative proportion of total particles
  minZ: number;
  maxZ: number;
  minSize: number;
  maxSize: number;
  depthFactor: number; // 0 = far, 1 = near — drives per-particle rotation speed
}

const DEPTH_LAYERS: DepthLayer[] = [
  { weight: 0.65, minZ: -70, maxZ: -30, minSize: 0.14, maxSize: 0.28, depthFactor: 0.1 },
  { weight: 0.29, minZ: -30, maxZ: -10, minSize: 0.22, maxSize: 0.34, depthFactor: 0.5 },
  { weight: 0.06, minZ: -10, maxZ: 8, minSize: 0.42, maxSize: 0.42, depthFactor: 0.9 },
];

const PARTICLE_COUNT = 1000;

// ── Timeline constants (seconds) ─────────────────────────────────────────────

const TRANSITION_START = 2.5; // stars → pixels begins
const STAR_TO_PIXEL_DURATION = 3.0; // ends at 3.5s
const PIXEL_TO_ASCII_DURATION = 4.0; // ends at 5.5s
const DELAY_SPREAD = 0.6; // per-particle random delay so the morph ripples

// ── Component ────────────────────────────────────────────────────────────────

/**
 * Starfield background that performs a one-way cinematic morph:
 *
 *   twinkling stars → glowing pixels → monochrome ASCII glyphs
 *
 * All three visual stages are rendered from the SAME particle system
 * (one BufferGeometry, one ShaderMaterial, one render loop). Nothing is
 * swapped, destroyed, or recreated during the transition — only the
 * per-particle blend weights driving the shader change over time. Once
 * the ASCII stage is reached the particles keep drifting/twinkling/
 * flickering indefinitely; the starfield is never restored.
 *
 * Designed for use on pages where the full 3-D scene would be too
 * distracting (e.g. onboarding steps, login).
 */
export default function StarfieldBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // ── Subtle mouse parallax (unchanged from before) ──────────────────────
    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX / window.innerWidth - 0.5;
      mouseY = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("mousemove", onMouseMove);

    // ── Textures ─────────────────────────────────────────────────────────
    const starTexture = createStarTexture();
    const pixelTexture = createPixelTexture();
    const asciiTexture = createAsciiAtlas();

    // ── Single particle geometry (star + pixel + ASCII all live here) ─────
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const twinkleSpeeds = new Float32Array(PARTICLE_COUNT);
    const twinklePhases = new Float32Array(PARTICLE_COUNT);
    const glyphIndices = new Float32Array(PARTICLE_COUNT);
    const transitionOffsets = new Float32Array(PARTICLE_COUNT);
    const driftSpeeds = new Float32Array(PARTICLE_COUNT);
    const depthFactors = new Float32Array(PARTICLE_COUNT);

    // Weighted random layer picker so we keep the old far/mid/near feel.
    const cumulativeWeights: number[] = [];
    DEPTH_LAYERS.reduce((acc, layer) => {
      const next = acc + layer.weight;
      cumulativeWeights.push(next);
      return next;
    }, 0);

    const pickLayer = (): DepthLayer => {
      const r = Math.random() * cumulativeWeights[cumulativeWeights.length - 1];
      for (let i = 0; i < DEPTH_LAYERS.length; i++) {
        if (r <= cumulativeWeights[i]) return DEPTH_LAYERS[i];
      }
      return DEPTH_LAYERS[DEPTH_LAYERS.length - 1];
    };

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const layer = pickLayer();

      const angle = Math.random() * Math.PI * 2;
      const radius = 15 + Math.pow(Math.random(), 0.8) * 70;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = Math.random() * (layer.maxZ - layer.minZ) + layer.minZ;

      sizes[i] = Math.random() * (layer.maxSize - layer.minSize) + layer.minSize;
      twinkleSpeeds[i] = Math.random() * 0.8 + 0.2;
      twinklePhases[i] = Math.random() * Math.PI * 2;

      glyphIndices[i] = Math.floor(Math.random() * ASCII_GLYPHS.length);
      transitionOffsets[i] = Math.random();
      driftSpeeds[i] = Math.random() * 0.35 + 0.08;
      depthFactors[i] = layer.depthFactor;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("twinkleSpeed", new THREE.BufferAttribute(twinkleSpeeds, 1));
    geometry.setAttribute("twinklePhase", new THREE.BufferAttribute(twinklePhases, 1));
    geometry.setAttribute("glyphIndex", new THREE.BufferAttribute(glyphIndices, 1));
    geometry.setAttribute("transitionOffset", new THREE.BufferAttribute(transitionOffsets, 1));
    geometry.setAttribute("driftSpeed", new THREE.BufferAttribute(driftSpeeds, 1));
    geometry.setAttribute("depthFactor", new THREE.BufferAttribute(depthFactors, 1));

    // ── Shader: star → pixel → ASCII, blended per-particle ─────────────────
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        starTex: { value: starTexture },
        pixelTex: { value: pixelTexture },
        asciiAtlas: { value: asciiTexture },
        atlasCols: { value: ASCII_ATLAS_COLS },
        transitionStart: { value: TRANSITION_START },
        starToPixelDuration: { value: STAR_TO_PIXEL_DURATION },
        pixelToAsciiDuration: { value: PIXEL_TO_ASCII_DURATION },
        delaySpread: { value: DELAY_SPREAD },
      },
      vertexShader: `
        uniform float time;
        uniform float transitionStart;
        uniform float starToPixelDuration;
        uniform float pixelToAsciiDuration;
        uniform float delaySpread;

        attribute float size;
        attribute float twinkleSpeed;
        attribute float twinklePhase;
        attribute float glyphIndex;
        attribute float transitionOffset;
        attribute float driftSpeed;
        attribute float depthFactor;

        varying float vStarAlpha;
        varying float vPixelAlpha;
        varying float vAsciiAlpha;
        varying float vTwinkle;
        varying float vGlyphIndex;

        float hash11(float p) {
          p = fract(p * 0.1031);
          p *= p + 33.33;
          p *= p + p;
          return fract(p);
        }

        void main() {
          // ── Per-particle transition timeline (ripples across the screen) ──
          float delay = transitionOffset * delaySpread;
          float t1Start = transitionStart + delay;
          float t1End   = t1Start + starToPixelDuration;
          const float pixelHold = 2.0;
          float t2Start = t1End + pixelHold;
          float t2End = t2Start + pixelToAsciiDuration;

          float toPixel = smoothstep(t1Start, t1End, time);
          float toAscii = smoothstep(t2Start, t2End, time);

          float starAlpha  = 1.0 - toPixel;
          float asciiAlpha = toAscii;
          // Pixel stage rises through phase 1 and falls away through phase 2 —
          // a genuine triangular hand-off rather than a mix()/crossfade.
          float pixelFade = smoothstep(
              t2Start + 0.7,
              t2End,
              time
          );

          float pixelAlpha = toPixel * (1.0 - pixelFade);

          vStarAlpha  = starAlpha;
          vPixelAlpha = pixelAlpha;
          vAsciiAlpha = asciiAlpha;

          // ── Twinkle / flicker brightness, alive at every stage ─────────────
          float tw = 0.28 + 0.72 * (0.5 + 0.5 * sin(time * twinkleSpeed + twinklePhase));
          vTwinkle = tw;

          // ── Occasional glyph re-roll once ASCII is visible (~2-5%/epoch) ───
          float epoch = floor(time * 0.6);
          float flickerRoll = hash11(glyphIndex * 3.3 + epoch);
          float shouldFlicker = step(0.965, flickerRoll) * asciiAlpha;
          float altGlyph = floor(hash11(glyphIndex * 9.9 + epoch) * float(${ASCII_ATLAS_COLS}.0));
          vGlyphIndex = mix(glyphIndex, altGlyph, shouldFlicker);

          // ── Position: gentle wrapping drift, then per-depth swirl ──────────
          vec3 pos = position;
          pos.y = mod(pos.y + 35.0 + time * driftSpeed, 70.0) - 35.0;

          float rotYSpeed = mix(0.001, 0.0028, depthFactor);
          float rotXSpeed = mix(0.0004, 0.0012, depthFactor);
          float angleY = time * rotYSpeed + twinklePhase;
          float angleX = time * rotXSpeed + twinklePhase * 0.5;

          float cy = cos(angleY), sy = sin(angleY);
          float x1 = pos.x * cy - pos.z * sy;
          float z1 = pos.x * sy + pos.z * cy;
          pos.x = x1;
          pos.z = z1;

          float cx = cos(angleX), sx = sin(angleX);
          float y1 = pos.y * cx - pos.z * sx;
          float z2 = pos.y * sx + pos.z * cx;
          pos.y = y1;
          pos.z = z2;

          // ── Jitter while actively morphing (settles once ASCII solidifies) ─
          float jitterAmt = pixelAlpha * 0.03;
          pos.x += (hash11(glyphIndex * 13.1 + floor(time * 8.0)) - 0.5) * jitterAmt;
          pos.y += (hash11(glyphIndex * 7.7 + floor(time * 8.0) + 1.0) - 0.5) * jitterAmt;

          // ── Size: bulge on the way to "pixel", settle slightly for ASCII ───
          float pixelGrowth = mix(1.0, 2.2, pixelAlpha);

          // Grow even larger once ASCII appears
          float asciiGrowth = mix(pixelGrowth, 3.8, asciiAlpha);

          float finalSize = size * asciiGrowth;

          vec4 mvp = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = min(finalSize * (500.0 / -mvp.z), 36.0);
          gl_Position = projectionMatrix * mvp;
        }
      `,
      fragmentShader: `
        precision mediump float;

        uniform sampler2D starTex;
        uniform sampler2D pixelTex;
        uniform sampler2D asciiAtlas;
        uniform float atlasCols;

        varying float vStarAlpha;
        varying float vPixelAlpha;
        varying float vAsciiAlpha;
        varying float vTwinkle;
        varying float vGlyphIndex;

        void main() {
          vec4 starColor  = texture2D(starTex, gl_PointCoord);
          vec4 pixelColor = texture2D(pixelTex, gl_PointCoord);

          float col = vGlyphIndex;
          vec2 asciiUv = vec2((col + gl_PointCoord.x) / atlasCols, gl_PointCoord.y);
          vec4 asciiColorRaw = texture2D(asciiAtlas, asciiUv);
          // ASCII glyphs stay strictly monochrome (white, alpha-only).
          vec4 asciiColor = vec4(1.0, 1.0, 1.0, asciiColorRaw.a);

          vec4 blended =
            starColor  * vStarAlpha +
            pixelColor * vPixelAlpha +
            asciiColor * vAsciiAlpha;

          vec4 finalColor = blended * vTwinkle;
          finalColor.a *= 0.38;
          finalColor.a = clamp(finalColor.a, 0.0, 1.0);

          if (finalColor.a < 0.01) discard;
          gl_FragColor = finalColor;
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    camera.position.z = 12;

    // ── Render loop ────────────────────────────────────────────────────────
    const timer = new THREE.Timer();
    let rafId: number;

    const animate = (ts: number) => {
      rafId = requestAnimationFrame(animate);
      timer.update(ts);
      const elapsed = timer.getElapsed();

      material.uniforms.time.value = elapsed;

      // Subtle mouse parallax (same feel as before — 50% of the landing page).
      camera.position.x += (mouseX * 0.35 - camera.position.x) * 0.025;
      camera.position.y += (-mouseY * 0.35 - camera.position.y) * 0.025;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    requestAnimationFrame(animate);

    // Resize handler
    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(rafId);

      starTexture.dispose();
      pixelTexture.dispose();
      asciiTexture.dispose();
      geometry.dispose();
      material.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0 bg-[#050505] overflow-hidden">
      {/* Radial vignette — same as ThreeBackground */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_55%,#050505_100%)] z-[1]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.01)_0%,transparent_50%)] z-[1]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.008)_0%,transparent_45%)] z-[1]" />

      {/* Film-grain noise */}
      <div
        className="absolute inset-0 opacity-[0.03] z-[2]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Faint scanlines */}
      <div className="absolute inset-0 opacity-[0.025] bg-[repeating-linear-gradient(0deg,rgba(255,255,255,1)_0px,rgba(255,255,255,1)_1px,transparent_1px,transparent_4px)] z-[2]" />

      {/* WebGL canvas */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full opacity-95 z-[3]" />
    </div>
  );
}
