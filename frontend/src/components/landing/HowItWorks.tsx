"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

import { Lightbulb, Cpu, Rocket } from 'lucide-react';

/* Pipeline stage data */
const stages = [
    {
        icon: Lightbulb,
        label: 'User Idea',
        code: 'INPUT',
        description: 'Your vision enters the system — a single idea ready to be transformed.',
    },
    {
        icon: Cpu,
        label: 'AI Agent Crew',
        code: 'AGENTS',
        description: 'Collaborates to analyze requirements, design architecture, write production-grade code, and deploy.',
    },
    {
        icon: Rocket,
        label: 'Production Ready Product',
        code: 'OUTPUT',
        description: 'A complete, deployed, production-grade application — ready for the world.',
    },
];

/* Floating ambient particles — generated client-side to avoid hydration mismatch */
function AmbientParticles() {
    const [particles, setParticles] = useState<Array<{
        id: number; left: string; top: string; size: number; delay: number; duration: number;
    }>>([]);

    useEffect(() => {
        const handle = requestAnimationFrame(() => {
            setParticles(
                Array.from({ length: 30 }, (_, i) => ({
                    id: i,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    size: 1 + Math.random() * 2,
                    delay: Math.random() * 6,
                    duration: 4 + Math.random() * 4,
                }))
            );
        });
        return () => cancelAnimationFrame(handle);
    }, []);

    if (particles.length === 0) return null;

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="absolute rounded-full bg-white"
                    style={{
                        left: p.left,
                        top: p.top,
                        width: p.size,
                        height: p.size,
                        opacity: 0,
                        animation: `particleDrift ${p.duration}s ease-in-out ${p.delay}s infinite`,
                    }}
                />
            ))}
        </div>
    );
}

/* Energy connector SVG between stages */
function EnergyConnector({ index }: { index: number }) {
    return (
        <div className="flex justify-center my-0">
            <svg width="60" height="64" viewBox="0 0 60 64" className="overflow-visible">
                {/* Main energy line */}
                <line
                    x1="30" y1="0" x2="30" y2="64"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="1"
                    className="energy-stream"
                />
                {/* Side accent lines */}
                <line
                    x1="26" y1="4" x2="26" y2="60"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="0.5"
                    className="energy-stream"
                    style={{ animationDelay: '0.3s' }}
                />
                <line
                    x1="34" y1="4" x2="34" y2="60"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="0.5"
                    className="energy-stream"
                    style={{ animationDelay: '0.6s' }}
                />

                {/* Traveling energy dot */}
                <circle r="2.5" fill="white" opacity="0">
                    <animateMotion
                        dur={`${1.8 + index * 0.3}s`}
                        begin={`${index * 0.4}s`}
                        repeatCount="indefinite"
                        path="M30,0 L30,64"
                    />
                    <animate
                        attributeName="opacity"
                        values="0;0.8;0.8;0"
                        keyTimes="0;0.15;0.8;1"
                        dur={`${1.8 + index * 0.3}s`}
                        begin={`${index * 0.4}s`}
                        repeatCount="indefinite"
                    />
                </circle>

                {/* Secondary return pulse */}
                <circle r="1.5" fill="white" opacity="0">
                    <animateMotion
                        dur={`${2.4 + index * 0.2}s`}
                        begin={`${0.8 + index * 0.3}s`}
                        repeatCount="indefinite"
                        path="M30,64 L30,0"
                    />
                    <animate
                        attributeName="opacity"
                        values="0;0.4;0.4;0"
                        keyTimes="0;0.15;0.8;1"
                        dur={`${2.4 + index * 0.2}s`}
                        begin={`${0.8 + index * 0.3}s`}
                        repeatCount="indefinite"
                    />
                </circle>
            </svg>
        </div>
    );
}

/* Single pipeline module */
function PipelineModule({
    stage,
    index,
}: {
    stage: (typeof stages)[number];
    index: number;
}) {
    const isEndpoint = index === 0 || index === stages.length - 1;

    return (
        <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{
                duration: 0.7,
                delay: index * 0.12,
                ease: [0.23, 1, 0.32, 1],
            }}
            className={`relative float-medium ${index % 2 === 0 ? '' : 'float-delay-1'}`}
        >
            <div
                className={`pipeline-module rounded-2xl px-8 py-6 max-w-md mx-auto relative hologram-glow ${
                    isEndpoint ? 'border-white/20' : ''
                }`}
            >
                {/* Rotating accent ring */}
                <div className="absolute -inset-3 pointer-events-none">
                    <div
                        className={`absolute inset-0 rounded-full border border-white/[0.04] ${
                            index % 2 === 0 ? 'rotate-slow' : 'rotate-reverse'
                        }`}
                    />
                </div>

                {/* Module content */}
                <div className="relative z-10 text-center">
                    {/* Code identifier */}
                    <div className="font-mono text-[10px] tracking-widest text-white/30 uppercase mb-3">
                        {stage.code}
                    </div>

                    {/* Icon */}
                    <div className="mb-3 flex justify-center text-white/70">
                        <stage.icon size={32} strokeWidth={1.5} />
                    </div>

                    {/* Label */}
                    <h3 className="font-sora text-lg font-semibold text-white mb-2 tracking-tight glow-text">
                        {stage.label}
                    </h3>

                    {/* Description */}
                    <p className="font-sans text-xs text-on-surface-variant/70 leading-relaxed max-w-xs mx-auto">
                        {stage.description}
                    </p>

                    {/* Status indicator */}
                    <div className="mt-3 flex items-center justify-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/60">
                            <span className="block w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        </span>
                        <span className="font-mono text-[9px] tracking-widest text-white/40 uppercase">
                            {isEndpoint ? 'READY' : 'PROCESSING'}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default function HowItWorks() {
    return (
        <section
            id="scene-how-it-works"
            className="scene-section scanline-overlay px-6 md:px-16 pt-20 pb-32"
            style={{ overflow: 'visible' }}
        >
            {/* Ambient particles */}
            <AmbientParticles />

            {/* Decorative orbit rings in background */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="orbit-ring w-[500px] h-[500px] opacity-[0.06]" />
                <div
                    className="orbit-ring w-[800px] h-[800px] opacity-[0.04] absolute"
                    style={{ animationDuration: '80s', animationDirection: 'reverse' }}
                />
                <div
                    className="orbit-ring w-[1100px] h-[1100px] opacity-[0.03] absolute"
                    style={{ animationDuration: '120s' }}
                />
            </div>

            {/* Light trails */}
            <div className="light-trail top-[30%] left-0" style={{ animationDuration: '10s' }} />
            <div className="light-trail top-[70%] right-0" style={{ animationDirection: 'reverse', animationDuration: '14s' }} />

            {/* Content */}
            <div className="relative z-10 max-w-4xl mx-auto w-full">
                {/* Section heading */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                    className="text-center mb-14"
                >
                    <div className="inline-flex items-center gap-2 mb-4">
                        <span className="w-1.5 h-1.5 bg-white rounded-full pulse-active" />
                        <span className="font-mono text-xs uppercase tracking-widest text-on-surface-variant/60">
                            SYSTEM PIPELINE PROTOCOL
                        </span>
                    </div>
                    <h2 className="font-sora text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white mb-4 glow-text">
                        How OneCrew Works
                    </h2>
                    <p className="font-sans text-sm md:text-base text-on-surface-variant/80 max-w-xl mx-auto leading-relaxed">
                        Watch the AI Agent Crew transform a single idea into production-ready software.
                    </p>
                </motion.div>

                {/* Pipeline flow */}
                <div className="flex flex-col items-center">
                    {stages.map((stage, index) => (
                        <div key={stage.code}>
                            <PipelineModule stage={stage} index={index} />
                            {index < stages.length - 1 && (
                                <EnergyConnector index={index} />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
