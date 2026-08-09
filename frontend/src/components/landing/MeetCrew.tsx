"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import NodeDiagram from './NodeDiagram';

/* Agent data */
const agents = [
    {
        title: 'CEO Agent',
        code: 'AG-001',
        description: 'Translates business vision into actionable product roadmaps, task breakdowns, and strategic planning decisions.',
        floatClass: 'float-slow',
        delayClass: '',
        animDelay: 0,
    },
    {
        title: 'CTO Agent',
        code: 'AG-002',
        description: 'Designs core software architecture, selects tech stacks, and plans APIs, database schemas, and cloud infrastructure.',
        floatClass: 'float-medium',
        delayClass: 'float-delay-1',
        animDelay: 0.15,
    },
    {
        title: 'Developer Agent',
        code: 'AG-003',
        description: 'Implements frontend UIs, backend API endpoints, handles feature testing, code integration, and production deployment.',
        floatClass: 'float-slow',
        delayClass: 'float-delay-2',
        animDelay: 0.3,
    },
];

/* Neural energy SVG connecting left diagram to right panels */
function NeuralConnections() {
    return (
        <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            viewBox="0 0 1000 1000"
            preserveAspectRatio="none"
        >
            <defs>
                <linearGradient id="neural-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="white" stopOpacity="0.15" />
                    <stop offset="50%" stopColor="white" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="white" stopOpacity="0.15" />
                </linearGradient>
            </defs>

            {/* Three neural paths — one to each agent */}
            {[
                { path: 'M 480 300 Q 550 280, 620 220', dur: '3.2s', begin: '0s' },
                { path: 'M 480 500 Q 550 500, 620 500', dur: '3.6s', begin: '0.6s' },
                { path: 'M 480 700 Q 550 720, 620 780', dur: '3.0s', begin: '1.2s' },
            ].map((conn, i) => (
                <g key={`neural-${i}`}>
                    {/* Connection line */}
                    <path
                        d={conn.path}
                        fill="none"
                        stroke="url(#neural-grad)"
                        strokeWidth="0.8"
                        strokeDasharray="4 8"
                        className="energy-stream"
                    />

                    {/* Traveling signal dot */}
                    <circle r="2" fill="white">
                        <animateMotion
                            dur={conn.dur}
                            begin={conn.begin}
                            repeatCount="indefinite"
                            path={conn.path}
                        />
                        <animate
                            attributeName="opacity"
                            values="0;0.7;0.7;0"
                            keyTimes="0;0.1;0.85;1"
                            dur={conn.dur}
                            begin={conn.begin}
                            repeatCount="indefinite"
                        />
                    </circle>

                    {/* Return signal */}
                    <circle r="1.5" fill="white">
                        <animateMotion
                            dur={`${parseFloat(conn.dur) + 0.8}s`}
                            begin={`${parseFloat(conn.begin) + 1.5}s`}
                            repeatCount="indefinite"
                            path={conn.path}
                            keyPoints="1;0"
                            keyTimes="0;1"
                        />
                        <animate
                            attributeName="opacity"
                            values="0;0.4;0.4;0"
                            keyTimes="0;0.1;0.85;1"
                            dur={`${parseFloat(conn.dur) + 0.8}s`}
                            begin={`${parseFloat(conn.begin) + 1.5}s`}
                            repeatCount="indefinite"
                        />
                    </circle>
                </g>
            ))}
        </svg>
    );
}

/* Floating particles around NodeDiagram — client-side only to avoid hydration mismatch */
function DiagramParticles() {
    const [particles, setParticles] = useState<Array<{
        id: number; cx: number; cy: number; r: number; dur: number; delay: number;
    }>>([]);

    useEffect(() => {
        const handle = requestAnimationFrame(() => {
            setParticles(
                Array.from({ length: 20 }, (_, i) => ({
                    id: i,
                    cx: 10 + Math.random() * 35,
                    cy: 10 + Math.random() * 80,
                    r: 0.8 + Math.random() * 1.5,
                    dur: 3 + Math.random() * 4,
                    delay: Math.random() * 5,
                }))
            );
        });
        return () => cancelAnimationFrame(handle);
    }, []);

    if (particles.length === 0) return null;

    return (
        <div className="absolute inset-0 pointer-events-none">
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="absolute rounded-full bg-white"
                    style={{
                        left: `${p.cx}%`,
                        top: `${p.cy}%`,
                        width: p.r * 2,
                        height: p.r * 2,
                        opacity: 0,
                        animation: `diagramParticle ${p.dur}s ease-in-out ${p.delay}s infinite`,
                    }}
                />
            ))}
        </div>
    );
}

/* Agent glass panel card */
function AgentCard({
    agent,
    index,
}: {
    agent: (typeof agents)[number];
    index: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{
                duration: 0.7,
                delay: agent.animDelay,
                ease: [0.23, 1, 0.32, 1],
            }}
            className={`${agent.floatClass} ${agent.delayClass} flex-1 flex flex-col lg:min-h-0`}
        >
            <div className="agent-card rounded-2xl p-5 lg:p-3 xl:p-4.5 relative group hologram-glow flex-1 flex flex-col justify-center lg:min-h-0">
                {/* Rotating accent ring */}
                <div className="absolute -right-2 -top-2 w-8 h-8 pointer-events-none">
                    <div
                        className={`w-full h-full rounded-full border border-white/[0.08] ${
                            index % 2 === 0 ? 'rotate-slow' : 'rotate-reverse'
                        }`}
                    />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between mb-3 lg:mb-2">
                    <h3 className="font-sora text-xs sm:text-sm font-semibold text-white tracking-tight">
                        {agent.title}
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] sm:text-[11px] tracking-widest text-white/30 uppercase">
                            {agent.code}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-white/50 relative">
                            <span className="absolute inset-0 rounded-full bg-white animate-ping" />
                        </span>
                    </div>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-white/[0.08] mb-3 lg:mb-2" />

                {/* Description */}
                <p className="font-sans text-xs sm:text-sm text-on-surface-variant/70 group-hover:text-on-surface-variant/90 transition-colors duration-300 leading-relaxed text-left">
                    {agent.description}
                </p>
            </div>
        </motion.div>
    );
}

export default function MeetCrew() {
    return (
        <section
            id="scene-meet-crew"
            className="scene-section observatory-depth scanline-overlay px-6 md:px-16 py-20 lg:py-6 xl:py-12 lg:!min-h-0 lg:!h-screen lg:!max-h-screen lg:!overflow-hidden"
        >
            {/* Decorative orbit rings */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="orbit-ring w-[600px] h-[600px] opacity-[0.05]" style={{ animationDuration: '70s' }} />
                <div
                    className="orbit-ring w-[900px] h-[900px] opacity-[0.03] absolute"
                    style={{ animationDuration: '100s', animationDirection: 'reverse' }}
                />
                <div
                    className="orbit-ring w-[1300px] h-[1300px] opacity-[0.02] absolute"
                    style={{ animationDuration: '130s' }}
                />
            </div>

            {/* Light trails */}
            <div className="light-trail top-[25%] left-0" style={{ animationDuration: '11s', animationDelay: '1s' }} />
            <div className="light-trail top-[65%] right-0" style={{ animationDirection: 'reverse', animationDuration: '13s', animationDelay: '3s' }} />
            <div className="light-trail top-[45%] left-[-10%]" style={{ animationDuration: '15s', animationDelay: '5s' }} />

            {/* Floating particles */}
            <DiagramParticles />

            {/* Section heading */}
            <div className="relative z-10 max-w-7xl mx-auto w-full lg:h-full lg:flex lg:flex-col lg:justify-start lg:pt-10 lg:min-h-0">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                    className="text-center mb-10 lg:mb-4 xl:mb-8 lg:shrink-0"
                >
                    <div className="inline-flex items-center gap-2 mb-3 lg:mb-2">
                        <span className="w-1.5 h-1.5 bg-white rounded-full pulse-active" />
                        <span className="font-mono text-xs uppercase tracking-widest text-on-surface-variant/60">
                            INTELLIGENCE NETWORK ACTIVE
                        </span>
                    </div>
                    <h2 className="font-sora text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white mb-3 lg:mb-2 glow-text whitespace-nowrap">
                        Meet Your AI Crew
                    </h2>
                    <p className="font-sans text-sm md:text-base text-on-surface-variant/80 max-w-2xl mx-auto leading-relaxed">
                        Three specialized AI agents working together through a shared intelligence network to turn your vision into reality.
                    </p>
                </motion.div>

                {/* Two-column layout */}
                <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-6 xl:gap-12 items-stretch lg:flex-1 lg:min-h-0">
                    {/* Neural connection SVG overlay (hidden on mobile) */}
                    <div className="absolute inset-0 pointer-events-none hidden lg:block">
                        <NeuralConnections />
                    </div>

                    {/* LEFT — Node Diagram */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-100px' }}
                        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                        className="relative float-slow h-full flex flex-col lg:min-h-0"
                    >
                        {/* Ambient glow behind diagram */}
                        <div className="absolute -inset-6 bg-white/[0.03] blur-3xl rounded-3xl pointer-events-none" />
                        <div className="absolute -inset-12 bg-white/[0.015] blur-[80px] rounded-full pointer-events-none" />

                        {/* Diagram container */}
                        <div className="relative glass-panel p-8 lg:p-6 xl:p-8 rounded-2xl border border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.4)] hologram-glow overflow-hidden h-full flex items-center justify-center flex-1 lg:min-h-0">
                            <NodeDiagram />
                        </div>
                    </motion.div>

                    {/* RIGHT — Agent Cards */}
                    <div className="flex flex-col gap-4 lg:gap-2 xl:gap-4 relative z-10 h-full justify-between lg:min-h-0">
                        {agents.map((agent, index) => (
                            <AgentCard key={agent.code} agent={agent} index={index} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom: observatory fading into infinite darkness */}
            <div className="absolute bottom-0 left-0 right-0 h-60 pointer-events-none"
                style={{
                    background: 'linear-gradient(to bottom, transparent, #050505 80%)',
                }}
            />


        </section>
    );
}
