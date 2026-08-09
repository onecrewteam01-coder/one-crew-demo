"use client";

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Dynamic Canvas-based star texture (soft circular glow)
function createStarTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 16, 16);
    }
    return new THREE.CanvasTexture(canvas);
}

// Dynamic Canvas-based square texture (futuristic digital glowing particle)
function createSquareTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0)';
        ctx.fillRect(0, 0, 16, 16);
        // Soft outer glowing square
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fillRect(2, 2, 12, 12);
        // Solid inner core square
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fillRect(5, 5, 6, 6);
    }
    return new THREE.CanvasTexture(canvas);
}

export default function ThreeBackground() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const width = window.innerWidth;
        const height = window.innerHeight;

        // Create Scene, Camera, and WebGLRenderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        // Mouse Parallax coordinates
        let mouseX = 0;
        let mouseY = 0;
        const handleMouseMove = (event: MouseEvent) => {
            mouseX = (event.clientX / window.innerWidth) - 0.5;
            mouseY = (event.clientY / window.innerHeight) - 0.5;
        };
        window.addEventListener('mousemove', handleMouseMove);

        // Ambient and Point Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        // Use DirectionalLight so that lighting does not decay over distance in modern Three.js,
        // which ensures both the central planet and orbiting bodies receive proper 3D shading.
        const pointLight = new THREE.DirectionalLight(0xffffff, 1);
        pointLight.position.set(5, 5, 5);
        scene.add(pointLight);

        // Central Core Group
        const coreGroup = new THREE.Group();
        scene.add(coreGroup);

        // Inner Core Sphere - Solid, matte, medium grey planet with soft shadow
        const innerCoreGeom = new THREE.SphereGeometry(1.5, 64, 64);
        const innerCoreMat = new THREE.MeshStandardMaterial({
            color: 0x666666,         // Medium grey shade to match the user's reference image
            roughness: 0.85,         // Matte look
            metalness: 0.15,         // Low metalness to avoid reflections
            transparent: false       // Solid opaque sphere
        });
        const innerCore = new THREE.Mesh(innerCoreGeom, innerCoreMat);
        coreGroup.add(innerCore);

        // Outer Wireframe Sphere (restored to original size and opacity)
        const outerWireframeGeom = new THREE.SphereGeometry(2, 24, 24);
        const outerWireframeMat = new THREE.MeshBasicMaterial({
            color: 0x888888,
            wireframe: true,
            transparent: true,
            opacity: 0.12
        });
        const outerWireframe = new THREE.Mesh(outerWireframeGeom, outerWireframeMat);
        coreGroup.add(outerWireframe);

        // Soft radial glow behind the wireframe core (blends object into deep space)
        const glowTexture = createStarTexture();
        const glowMaterial = new THREE.SpriteMaterial({
            map: glowTexture,
            color: 0xffffff,
            transparent: true,
            opacity: 0.12,
            blending: THREE.AdditiveBlending
        });
        const glowSprite = new THREE.Sprite(glowMaterial);
        glowSprite.scale.set(6, 6, 1);
        glowSprite.position.set(0, 0, -1);
        scene.add(glowSprite);

        // Orbiting Agents
        const agents: Array<{
            group: THREE.Group;
            distance: number;
            speed: number;
            angle: number;
        }> = [];

        const agentData = [
            { label: 'CEO', distance: 4, speed: 0.005, color: 0xffffff },
            { label: 'CTO', distance: 5.5, speed: 0.007, color: 0xaaaaaa },
            { label: 'Dev', distance: 7, speed: 0.004, color: 0xcccccc }
        ];

        const agentMeshes: THREE.Mesh[] = [];
        const ringMeshes: THREE.Mesh[] = [];

        agentData.forEach((data, index) => {
            const group = new THREE.Group();
            const geom = new THREE.IcosahedronGeometry(0.4, 0);
            const mat = new THREE.MeshPhongMaterial({
                color: data.color,
                flatShading: true,
                transparent: false // Solid opaque bodies to match user's reference image
            });
            const mesh = new THREE.Mesh(geom, mat);
            agentMeshes.push(mesh);

            // Ring around each agent
            const ringGeom = new THREE.TorusGeometry(0.7, 0.02, 16, 100);
            const ringMat = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.08 // Adjusted (0.2 * 0.4 = 0.08)
            });
            const ring = new THREE.Mesh(ringGeom, ringMat);
            ring.rotation.x = Math.PI / 2;
            ringMeshes.push(ring);

            group.add(mesh);
            group.add(ring);
            scene.add(group);

            agents.push({
                group,
                distance: data.distance,
                speed: data.speed,
                angle: (index / agentData.length) * Math.PI * 2
            });
        });

        // --- Cinematic Observatory Background Elements ---

        // 1. Multi-layered Starfield with Custom Twinkling Shader
        const starTexture = createStarTexture();
        const starShaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                pointTexture: { value: starTexture }
            },
            vertexShader: `
                uniform float time;
                attribute float size;
                attribute float twinkleSpeed;
                attribute float twinklePhase;
                varying float vOpacity;
                void main() {
                    float t = time * twinkleSpeed + twinklePhase;
                    // Slow twinkle between 0.15 and 1.0 opacity
                    vOpacity = 0.15 + 0.85 * (0.5 + 0.5 * sin(t));
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    // Attenuation based on distance to camera
                    gl_PointSize = size * (260.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform sampler2D pointTexture;
                varying float vOpacity;
                void main() {
                    gl_FragColor = vec4(1.0, 1.0, 1.0, vOpacity) * texture2D(pointTexture, gl_PointCoord);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        // Helper to construct random positions & attributes for starfields
        const buildStarGeometry = (count: number, minZ: number, maxZ: number, minSize: number, maxSize: number) => {
            const geom = new THREE.BufferGeometry();
            const positions = new Float32Array(count * 3);
            const sizes = new Float32Array(count);
            const speeds = new Float32Array(count);
            const phases = new Float32Array(count);

            for (let i = 0; i < count; i++) {
                positions[i * 3] = (Math.random() - 0.5) * 45;
                positions[i * 3 + 1] = (Math.random() - 0.5) * 45;
                positions[i * 3 + 2] = Math.random() * (maxZ - minZ) + minZ;

                sizes[i] = Math.random() * (maxSize - minSize) + minSize;
                speeds[i] = Math.random() * 0.8 + 0.2; // Slow twinkle speed
                phases[i] = Math.random() * Math.PI * 2;
            }

            geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geom.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
            geom.setAttribute('twinkleSpeed', new THREE.BufferAttribute(speeds, 1));
            geom.setAttribute('twinklePhase', new THREE.BufferAttribute(phases, 1));
            return geom;
        };

        // Create 3 layers of stars for cinematic parallax depth
        const farGeom = buildStarGeometry(1800, -70, -30, 0.08, 0.16);
        const farStars = new THREE.Points(farGeom, starShaderMaterial);
        scene.add(farStars);

        const midGeom = buildStarGeometry(800, -30, -10, 0.12, 0.24);
        const midStars = new THREE.Points(midGeom, starShaderMaterial);
        scene.add(midStars);

        const nearGeom = buildStarGeometry(150, -10, 8, 0.18, 0.35);
        const nearStars = new THREE.Points(nearGeom, starShaderMaterial);
        scene.add(nearStars);

        // 2. Drifting Tiny Glowing Square Particles (Digital Space feel)
        const squareTexture = createSquareTexture();
        const squareMat = new THREE.PointsMaterial({
            size: 0.15,
            map: squareTexture,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const squareCount = 60;
        const squareGeom = new THREE.BufferGeometry();
        const squarePositions = new Float32Array(squareCount * 3);
        const squareSpeeds = new Float32Array(squareCount);
        const squarePhases = new Float32Array(squareCount);

        for (let i = 0; i < squareCount; i++) {
            squarePositions[i * 3] = (Math.random() - 0.5) * 25;
            squarePositions[i * 3 + 1] = (Math.random() - 0.5) * 25;
            squarePositions[i * 3 + 2] = Math.random() * 15 - 8; // near/mid Z coordinates

            squareSpeeds[i] = Math.random() * 0.006 + 0.003; // drifting speed
            squarePhases[i] = Math.random() * Math.PI * 2;
        }

        squareGeom.setAttribute('position', new THREE.BufferAttribute(squarePositions, 3));
        const squareParticles = new THREE.Points(squareGeom, squareMat);
        scene.add(squareParticles);

        // 3. Concentric background orbital rings & crosshairs HUD
        const ringGeom = new THREE.BufferGeometry();
        const ringPoints = [];
        const ringSegments = 96;
        const ringRadius = 14;
        for (let i = 0; i <= ringSegments; i++) {
            const theta = (i / ringSegments) * Math.PI * 2;
            ringPoints.push(new THREE.Vector3(Math.cos(theta) * ringRadius, Math.sin(theta) * ringRadius, 0));
        }
        ringGeom.setFromPoints(ringPoints);
        const ringMat = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.05
        });

        const bgRing1 = new THREE.LineLoop(ringGeom, ringMat);
        bgRing1.position.set(0, 0, -22);
        bgRing1.rotation.x = Math.PI / 3.5;
        bgRing1.rotation.y = Math.PI / 8;
        scene.add(bgRing1);

        const bgRing2 = bgRing1.clone() as THREE.LineLoop;
        bgRing2.scale.set(1.3, 1.3, 1);
        bgRing2.position.set(0, 0, -25);
        bgRing2.rotation.x = -Math.PI / 4.2;
        bgRing2.rotation.y = -Math.PI / 10;
        scene.add(bgRing2);

        // Faint telemetry crosshair HUD
        const crosshairGeom = new THREE.BufferGeometry();
        const crosshairPoints = [
            new THREE.Vector3(-1.8, 0, 0), new THREE.Vector3(-0.6, 0, 0),
            new THREE.Vector3(0.6, 0, 0), new THREE.Vector3(1.8, 0, 0),
            new THREE.Vector3(0, -1.8, 0), new THREE.Vector3(0, -0.6, 0),
            new THREE.Vector3(0, 0.6, 0), new THREE.Vector3(0, 1.8, 0)
        ];
        crosshairGeom.setFromPoints(crosshairPoints);
        const crosshairMat = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.04
        });
        const crosshair = new THREE.LineSegments(crosshairGeom, crosshairMat);
        crosshair.position.set(0, 0, -14);
        scene.add(crosshair);

        // Camera positioning
        camera.position.z = 12;

        const timer = new THREE.Timer();
        let animationFrameId: number;

        const animate = (timestamp: number) => {
            animationFrameId = requestAnimationFrame(animate);

            timer.update(timestamp);
            const elapsed = timer.getElapsed();

            // Core elements slow rotation
            coreGroup.rotation.y = elapsed * 0.12;
            coreGroup.rotation.x = elapsed * 0.06;

            // Orbiting agents position calculations
            agents.forEach((agent, index) => {
                const currentAngle = (index / agentData.length) * Math.PI * 2 + elapsed * (agent.speed * 60);
                
                // Create an inclined/tilted orbit plane for each agent to enhance depth and parallax
                const inclination = (index - 1) * 0.18; // CEO tilted, CTO flat, Dev tilted in opposite direction
                
                // Elliptical orbit calculation (subtle eccentricity)
                const a = agent.distance;
                const b = agent.distance * 0.86;
                
                // Kepler-like variable speed (accelerates when closer, decelerates when further)
                const smoothAngle = currentAngle + 0.15 * Math.sin(currentAngle);
                
                const rawX = Math.cos(smoothAngle) * a;
                const rawZ = Math.sin(smoothAngle) * b;
                
                // Position the agent group along the inclined ellipse with a soft zero-gravity float
                agent.group.position.x = rawX;
                agent.group.position.z = rawZ * Math.cos(inclination);
                agent.group.position.y = rawZ * Math.sin(inclination) + Math.sin(elapsed * 0.7 + index) * 0.15;
                
                // Rotate the central 3D body (icosahedron) gracefully on multiple axes
                const mesh = agentMeshes[index];
                if (mesh) {
                    mesh.rotation.y = elapsed * 0.35 + (index * 0.4);
                    mesh.rotation.x = elapsed * 0.18;
                    mesh.rotation.z = elapsed * 0.12;
                }
                
                // Spin the outer telemetry rings slowly in reverse for depth contrast
                const ring = ringMeshes[index];
                if (ring) {
                    ring.rotation.z = -elapsed * 0.08;
                }
            });

            // Twinkle shader timing update
            starShaderMaterial.uniforms.time.value = elapsed;

            // Subtle rotation of star layers for independent drift
            farStars.rotation.y = elapsed * 0.001;
            farStars.rotation.x = elapsed * 0.0004;

            midStars.rotation.y = elapsed * 0.0018;
            midStars.rotation.x = elapsed * 0.0007;

            nearStars.rotation.y = elapsed * 0.0028;
            nearStars.rotation.x = elapsed * 0.0012;

            // Drifting particles positional simulation
            const sqPos = squareGeom.getAttribute('position') as THREE.BufferAttribute;
            const sqArr = sqPos.array as Float32Array;
            for (let i = 0; i < squareCount; i++) {
                sqArr[i * 3 + 1] += squareSpeeds[i]; // Drift upward
                sqArr[i * 3] += Math.sin(elapsed * 0.4 + squarePhases[i]) * 0.0015; // Sway side-to-side

                // Wrap boundaries
                if (sqArr[i * 3 + 1] > 15) {
                    sqArr[i * 3 + 1] = -15;
                    sqArr[i * 3] = (Math.random() - 0.5) * 25;
                }
            }
            sqPos.needsUpdate = true;
            squareParticles.rotation.z = elapsed * 0.002;

            // Rotate background telemetry rings and crosshair imperceptibly
            bgRing1.rotation.z = elapsed * 0.003;
            bgRing2.rotation.z = -elapsed * 0.002;
            crosshair.rotation.z = elapsed * 0.005;

            // Smooth mouse parallax mapping
            const targetCamX = mouseX * 2.2;
            const targetCamY = -mouseY * 2.2;
            camera.position.x += (targetCamX - camera.position.x) * 0.035;
            camera.position.y += (targetCamY - camera.position.y) * 0.035;
            camera.lookAt(0, 0, 0);

            renderer.render(scene, camera);
        };

        requestAnimationFrame(animate);

        const handleResize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };

        window.addEventListener('resize', handleResize);

        // Clean up resources on unmount
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);

            // Dispose WebGL geometries & materials
            innerCoreGeom.dispose();
            innerCoreMat.dispose();
            outerWireframeGeom.dispose();
            outerWireframeMat.dispose();

            glowTexture.dispose();
            glowMaterial.dispose();

            starTexture.dispose();
            starShaderMaterial.dispose();
            farGeom.dispose();
            midGeom.dispose();
            nearGeom.dispose();

            squareTexture.dispose();
            squareMat.dispose();
            squareGeom.dispose();

            ringGeom.dispose();
            ringMat.dispose();
            crosshairGeom.dispose();
            crosshairMat.dispose();

            agentMeshes.forEach(mesh => {
                mesh.geometry.dispose();
                if (Array.isArray(mesh.material)) {
                    mesh.material.forEach(m => m.dispose());
                } else {
                    mesh.material.dispose();
                }
            });

            ringMeshes.forEach(mesh => {
                mesh.geometry.dispose();
                if (Array.isArray(mesh.material)) {
                    mesh.material.forEach(m => m.dispose());
                } else {
                    mesh.material.dispose();
                }
            });

            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);

    return (
        <div className="fixed inset-0 w-full h-full pointer-events-none z-0 bg-[#050505] overflow-hidden">
            {/* Pure black vignettes & soft haze layer */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,#050505_95%)] z-1" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.012)_0%,transparent_50%)] z-1" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.009)_0%,transparent_45%)] z-1" />

            {/* Procedural SVG Noise Grain Overlay */}
            <div className="absolute inset-0 opacity-[0.055] bg-[url('data:image/svg+xml,%3Csvg_viewBox=%220_0_200_200%22_xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter_id=%22noiseFilter%22%3E%3CfeTurbulence_type=%22fractalNoise%22_baseFrequency=%220.85%22_numOctaves=%223%22_stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect_width=%22100%25%22_height=%22100%25%22_filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] z-2" />

            {/* Faint Horizontal Scanlines (Grid-like background matching onboarding page) */}
            <div className="absolute inset-0 opacity-[0.025] bg-[repeating-linear-gradient(0deg,rgba(255,255,255,1)_0px,rgba(255,255,255,1)_1px,transparent_1px,transparent_4px)] z-2" />

            {/* WebGL 3D Observer Space Canvas Container */}
            <div ref={containerRef} className="absolute inset-0 w-full h-full opacity-80 z-3" id="threejs-container" />

            {/* Concentric rings on top layer */}
            <div className="orbit-ring w-[700px] h-[700px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.08] z-4" style={{ animationDuration: '100s' }} />
            <div
                className="orbit-ring w-[1000px] h-[1000px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.05] z-4"
                style={{ animationDuration: '130s', animationDirection: 'reverse' }}
            />
            <div
                className="orbit-ring w-[1300px] h-[1300px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] z-4"
                style={{ animationDuration: '160s' }}
            />
        </div>
    );
}
