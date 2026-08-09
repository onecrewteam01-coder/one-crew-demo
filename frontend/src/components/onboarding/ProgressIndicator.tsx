"use client";

import React from "react";
import { motion } from "framer-motion";

// ── Moon phase SVG renderer ──────────────────────────────────────────────────
//
// Approach: we draw a dark circle and overlay a white lit-face on top.
// The lit face is a "lens" shape made of two arcs — identical to how
// real moon-phase diagrams work:
//   • progress 0   → new moon   (no white area)
//   • progress 0.5 → half moon  (flat left edge, round right)
//   • progress 1   → full moon  (full white circle)
//
// The SVG is 24×24. r = 10 (leaves a 2px margin all around).

interface MoonProps {
  /** 0 = new moon, 1 = full moon */
  progress: number;
  /** renders the outer glow halo */
  isComplete: boolean;
  /** pulses on this step completing */
  isPulsing: boolean;
  size?: number;
}

function Moon({ progress, isComplete, isPulsing, size = 28 }: MoonProps) {
  const R = size / 2 - 2;   // circle radius with 2px margin
  const cx = size / 2;
  const cy = size / 2;

  // Build a SVG path for the lit area.
  // The lit hemisphere is always on the right (waxing convention).
  // We parameterise the "inner ellipse" x-radius from -R (new) → +R (full).
  const xOff = R * (1 - 2 * progress); // +R at p=0 (hidden), -R at p=1 (full)

  // Outer right arc points: top=(cx, cy-R), bottom=(cx, cy+R)
  // Inner left arc:  the x-radius = |xOff|, concave if xOff>0, convex if xOff<0
  const sweepInner = xOff > 0 ? 0 : 1;   // 0=concave, 1=convex → gives crescent/gibbous
  const absX = Math.abs(xOff);

  // Full-moon shortcut: just fill the whole circle
  const isFullMoon = progress >= 0.99;

  // Path for the lit face
  const litPath = isFullMoon
    ? `M ${cx} ${cy - R} A ${R} ${R} 0 1 1 ${cx - 0.001} ${cy - R} Z`
    : `M ${cx} ${cy - R}
       A ${R} ${R} 0 0 1 ${cx} ${cy + R}
       A ${absX} ${R} 0 0 ${sweepInner} ${cx} ${cy - R}
       Z`;

  const glowOpacity = isComplete ? 0.35 : Math.max(0, progress - 0.3) * 0.5;
  const glowBlur = isComplete ? 6 : 3;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Halo glow behind the moon */}
      {progress > 0.25 && (
        <motion.div
          animate={{ opacity: isPulsing ? [glowOpacity, 0.7, glowOpacity] : glowOpacity }}
          transition={{ duration: isPulsing ? 0.8 : 0.6, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full bg-white"
          style={{ filter: `blur(${glowBlur}px)` }}
        />
      )}

      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="relative z-10"
      >
        {/* Dark moon body */}
        <circle cx={cx} cy={cy} r={R} fill="#0a0a0e" />

        {/* Dim crater texture for unlit face at low progress */}
        {!isFullMoon && (
          <circle cx={cx} cy={cy} r={R} fill="rgba(255,255,255,0.08)" />
        )}

        {/* Lit face */}
        {progress > 0.01 && (
          <motion.path
            d={litPath}
            fill="rgba(255,255,255,0.92)"
            initial={false}
            animate={{ opacity: 1 }}
          />
        )}

        {/* Outer rim — dimmer on future steps, bright on completed */}
        <circle
          cx={cx} cy={cy} r={R}
          fill="none"
          stroke={isComplete ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.22)"}
          strokeWidth="0.8"
        />
      </svg>
    </div>
  );
}

// ── Progress calculation helper ──────────────────────────────────────────────

/** Maps a character count to a 0–1 moon-phase progress for the current step. */
export function charCountToProgress(count: number, threshold: number): number {
  if (threshold <= 0) return count > 0 ? 1 : 0;
  return Math.min(1, count / threshold);
}

// ── Comet connector ──────────────────────────────────────────────────────────
//
// A fixed hairline sits between nodes.
// • When isPulsing fires: a comet (glowing head + long fading tail) travels
//   left→right along the line using pure transform/translateX.
// • When both adjacent nodes are complete: the line itself glows persistently
//   with a soft white luminous appearance (animated in once).
//
// NO left/top animation is used anywhere — only transform: translateX.

interface CometConnectorProps {
  /** true while the comet should be travelling across this connector */
  animate: boolean;
  /** true when both nodes on either side of this connector are completed */
  isCompleted: boolean;
}

function CometConnector({ animate, isCompleted }: CometConnectorProps) {
  return (
    // overflow:hidden clips the comet cleanly at both edges.
    // height 12px — enough vertical room for the head glow without disturbing layout.
    <div
      className="relative flex-1 overflow-hidden"
      style={{ height: 12, alignSelf: "center" }}
    >
      {/* ── Base dim line — always visible ── */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          right: 0,
          height: 1,
          transform: "translateY(-50%)",
          background: "rgba(255,255,255,0.10)",
          borderRadius: 999,
        }}
      />

      {/* ── Bright overlay — flashes on while the comet is in-flight ── */}
      {/* Fades in instantly when animate=true, fades out slowly after comet exits */}
      <motion.div
        animate={animate ? { opacity: 1 } : { opacity: 0 }}
        transition={animate
          ? { duration: 0.12, delay: 0.45, ease: "easeOut" }  // fades in after comet delay
          : { duration: 0.7, ease: "easeOut" }                // slow fade-out after comet exits
        }
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          right: 0,
          height: 2,
          transform: "translateY(-50%)",
          background: "rgba(255,255,255,0.38)",
          borderRadius: 999,
          filter: "blur(0.5px)",
          boxShadow: "0 0 6px 2px rgba(255,255,255,0.18)",
          pointerEvents: "none",
        }}
      />

      {/* ── Completed glow line — persistent once both nodes are done ── */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={isCompleted ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          right: 0,
          height: 2,
          transform: "translateY(-50%)",
          transformOrigin: "left center",
          background: "linear-gradient(to right, rgba(255,255,255,0.6), rgba(255,255,255,0.28))",
          borderRadius: 999,
          filter: "blur(0.5px)",
          boxShadow:
            "0 0 6px 2px rgba(255,255,255,0.22), 0 0 16px 4px rgba(255,255,255,0.09)",
          pointerEvents: "none",
        }}
      />

      {/* ── Comet — only mounted while animating ── */}
      {animate && (
        <motion.div
          // Pure x-transform travel — no left/top animation.
          // IMPORTANT: do NOT set transform on this element — Framer Motion
          // owns the transform property for x. Use marginTop for vertical centering.
          initial={{ x: "-90px" }}
          animate={{ x: "calc(100% + 10px)" }}
          transition={{
            duration: 1.4,            // deliberate glide
            delay: 0.45,              // waits for moon to complete its phase
            ease: [0.05, 0.7, 0.1, 1],
          }}
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            marginTop: -5,           // vertical center via margin (avoids transform conflict)
            width: 90,               // head (7px) + long tail (80px)
            height: 10,
            pointerEvents: "none",
          }}
        >
          {/* Tail core — sharp linear fade transparent → white toward head */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              width: 80,
              height: 2,
              borderRadius: 999,
              background:
                "linear-gradient(to right, transparent 0%, transparent 10%, rgba(255,255,255,0.04) 35%, rgba(255,255,255,0.7) 100%)",
              filter: "blur(0.5px)",
            }}
          />

          {/* Tail bloom — soft wide haze behind the head */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              width: 80,
              height: 9,
              borderRadius: 999,
              background:
                "linear-gradient(to right, transparent 0%, transparent 15%, rgba(255,255,255,0.02) 45%, rgba(255,255,255,0.22) 100%)",
              filter: "blur(5px)",
            }}
          />

          {/* Head — tiny perfect circle, sits right on the connector line */}
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "50%",
              transform: "translateY(-50%)",
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "white",
              // tight bright core + medium ring + wide soft halo
              boxShadow:
                "0 0 2px 1px rgba(255,255,255,1), 0 0 6px 3px rgba(255,255,255,0.75), 0 0 16px 7px rgba(255,255,255,0.25)",
            }}
          />
        </motion.div>
      )}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

interface MoonProgressIndicatorProps {
  /** Which step is currently active (1-indexed) */
  currentStep: number;
  totalSteps?: number;
  /**
   * Progress within the current step from 0 (empty) to 1 (complete).
   * Drives the moon-phase morphing animation.
   */
  stepProgress: number;
  /** Set to true immediately after the user clicks Continue to trigger pulse */
  isPulsing?: boolean;
  /** When true, suppress the full-moon snap on continue (used for sub-steps sharing the same display step) */
  suppressFullMoon?: boolean;
}

export default function MoonProgressIndicator({
  currentStep,
  totalSteps = 8,
  stepProgress,
  isPulsing = false,
  suppressFullMoon = false,
}: MoonProgressIndicatorProps) {
  return (
    <div className="flex items-center w-full select-none">
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNum    = i + 1;
        const isComplete = stepNum < currentStep;
        const isCurrent  = stepNum === currentStep;
        const isFuture   = stepNum > currentStep;

        // Determine per-moon progress value.
        // When isPulsing+isCurrent: force full moon (1) so the phase completes
        // visually before the comet departs.
        let moonProgress: number;
        if (isComplete)                  moonProgress = 1;
        else if (isCurrent && isPulsing && !suppressFullMoon) moonProgress = 1; // complete the phase first
        else if (isCurrent)              moonProgress = stepProgress;
        else                             moonProgress = 0;

        // When isPulsing=true the step counter has NOT yet incremented.
        // currentStep is still the OLD step, and the destination is currentStep+1.
        // So the comet travels on the connector BEFORE stepNum === currentStep+1.
        const cometActive = isPulsing && stepNum === currentStep + 1;

        // The connector BEFORE stepNum glows when the user has already
        // passed through it — i.e. the right-side node (stepNum) has been
        // reached (is current or already completed).
        // stepNum <= currentStep covers both the current connector and all past ones.
        const connectorCompleted = stepNum <= currentStep;

        return (
          <React.Fragment key={stepNum}>
            {/* Comet connector — inserted before every node except the first */}
            {stepNum > 1 && (
              <CometConnector
                animate={cometActive}
                isCompleted={connectorCompleted}
              />
            )}

            {/* Moon node — untouched */}
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{
                opacity: isFuture ? 0.6 : 1,
                scale:   isCurrent && isPulsing ? [1, 1.18, 1] : 1,
              }}
              transition={{
                opacity: { duration: 0.5 },
                scale: isPulsing
                  ? { duration: 0.8, ease: "easeInOut", times: [0, 0.5, 1] }
                  : { duration: 0.3 },
              }}
            >
              <Moon
                progress={moonProgress}
                isComplete={isComplete}
                isPulsing={isCurrent && isPulsing}
                size={30}
              />
            </motion.div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
