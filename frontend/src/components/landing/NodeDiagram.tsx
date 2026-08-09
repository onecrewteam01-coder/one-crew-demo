"use client";

import React, { memo } from 'react';

/* Helper: 4-corner tick marks for a rect at (x,y,w,h) */
function CornerTicks({ x, y, w, h, len = 7, op = 0.5, sw = 1 }: {
    x: number; y: number; w: number; h: number;
    len?: number; op?: number; sw?: number;
}) {
    const s = `rgba(255,255,255,${op})`;
    return (
        <g>
            {/* top-left */}
            <line x1={x} y1={y + len} x2={x} y2={y} stroke={s} strokeWidth={sw} />
            <line x1={x} y1={y} x2={x + len} y2={y} stroke={s} strokeWidth={sw} />
            {/* top-right */}
            <line x1={x + w - len} y1={y} x2={x + w} y2={y} stroke={s} strokeWidth={sw} />
            <line x1={x + w} y1={y} x2={x + w} y2={y + len} stroke={s} strokeWidth={sw} />
            {/* bottom-left */}
            <line x1={x} y1={y + h - len} x2={x} y2={y + h} stroke={s} strokeWidth={sw} />
            <line x1={x} y1={y + h} x2={x + len} y2={y + h} stroke={s} strokeWidth={sw} />
            {/* bottom-right */}
            <line x1={x + w - len} y1={y + h} x2={x + w} y2={y + h} stroke={s} strokeWidth={sw} />
            <line x1={x + w} y1={y + h - len} x2={x + w} y2={y + h} stroke={s} strokeWidth={sw} />
        </g>
    );
}

// Center coordinates
const CX = 400;
const CY = 260;

// Symmetric layout coordinates
const CEO_X = 400;
const CEO_Y = CY - 130; // 130

const CTO_X = 560; // 560
const CTO_Y = CY + 130; // 390

const DEV_X = 240; // 240
const DEV_Y = CY + 130; // 390

// Grid points for background matrix effect
const GRID_DOTS: { x: number; y: number }[] = [];
for (let x = 40; x <= 760; x += 40) {
    for (let y = 30; y <= 490; y += 40) {
        GRID_DOTS.push({ x, y });
    }
}

const NodeDiagram = memo(function NodeDiagram() {
    return (
        <svg
            viewBox="130 90 540 335"
            preserveAspectRatio="xMidYMid meet"
            className="w-full text-[#e5e2e1]"
            style={{ maxHeight: "100%", width: "100%" }}
        >
            <defs>
                {/* Glow filters for sci-fi atmosphere */}
                <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="glow-sm" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="1.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                {/* Connection arrowheads */}
                <marker id="arr-inbound" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0,1.5 L5,3 L0,4.5" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
                </marker>
                <marker id="arr-cross" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
                    <path d="M0,1 L4,2.5 L0,4" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.6" />
                </marker>
            </defs>

            {/* ── Grid dot background matrix ── */}
            <g>
                {GRID_DOTS.map((dot, index) => (
                    <circle
                        key={`grid-dot-${index}`}
                        cx={dot.x}
                        cy={dot.y}
                        r="1"
                        fill="white"
                        opacity="0.08"
                    />
                ))}
            </g>

            {/* ── Background guidelines ── */}
            <line x1="400" y1="0" x2="400" y2="520" stroke="white" strokeWidth="0.3" strokeOpacity="0.04" strokeDasharray="4 12" />
            <line x1="0" y1={CY} x2="800" y2={CY} stroke="white" strokeWidth="0.3" strokeOpacity="0.04" strokeDasharray="4 12" />

            {/* ── Orbital construction rings ── */}
            <circle cx={CX} cy={CY} r="130" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.08" strokeDasharray="3 8" />
            <circle cx={CX} cy={CY} r="206" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.06" strokeDasharray="4 10" />
            <circle cx={CX} cy={CY} r="60" fill="none" stroke="white" strokeWidth="0.4" strokeOpacity="0.05" strokeDasharray="2 6" />

            {/* Concentric Technical HUD Rings */}
            <circle cx={CX} cy={CY} r="115" fill="none" stroke="white" strokeWidth="0.6" strokeOpacity="0.06" strokeDasharray="60 15 10 15" />
            <circle cx={CX} cy={CY} r="145" fill="none" stroke="white" strokeWidth="0.4" strokeOpacity="0.04" strokeDasharray="5 15" />
            <circle cx={CX} cy={CY} r="215" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.03" strokeDasharray="2 8" />

            {/* Tech Readouts - Left Column */}
            <g opacity="0.18" className="transition-all duration-300">
                <text x="140" y="100" fill="white" fontSize="5" fontFamily="JetBrains Mono, monospace" letterSpacing="0.05em">SYS.STATUS: CONNECTED</text>
                <text x="140" y="108" fill="white" fontSize="5" fontFamily="JetBrains Mono, monospace" letterSpacing="0.05em">PING.TIME: 14.28 ms</text>
                <text x="140" y="116" fill="white" fontSize="5" fontFamily="JetBrains Mono, monospace" letterSpacing="0.05em">SYS.FLOW: DETERMINISTIC</text>
                
                <text x="140" y="240" fill="white" fontSize="5" fontFamily="JetBrains Mono, monospace" letterSpacing="0.05em">NET.NODE_CEO // AG-001</text>
                <text x="140" y="248" fill="white" fontSize="5" fontFamily="JetBrains Mono, monospace" letterSpacing="0.05em">NET.NODE_DEV // AG-003</text>
                <text x="140" y="256" fill="white" fontSize="5" fontFamily="JetBrains Mono, monospace" letterSpacing="0.05em">NET.NODE_CTO // AG-002</text>
            </g>

            {/* Tech Readouts - Right Column */}
            <g opacity="0.18" textAnchor="end" className="transition-all duration-300">
                <text x="660" y="100" fill="white" fontSize="5" fontFamily="JetBrains Mono, monospace" letterSpacing="0.05em">BUILD.VER: 4.0.1-PROD</text>
                <text x="660" y="108" fill="white" fontSize="5" fontFamily="JetBrains Mono, monospace" letterSpacing="0.05em">CORE.HASH: 0x8F9A3B5C</text>
                <text x="660" y="116" fill="white" fontSize="5" fontFamily="JetBrains Mono, monospace" letterSpacing="0.05em">OS_CORE: ACTIVE_NOMINAL</text>
                
                <text x="660" y="240" fill="white" fontSize="5" fontFamily="JetBrains Mono, monospace" letterSpacing="0.05em">SECURE_TUNNEL: ENABLED</text>
                <text x="660" y="248" fill="white" fontSize="5" fontFamily="JetBrains Mono, monospace" letterSpacing="0.05em">ENCRYPTION: AES_256_GCM</text>
                <text x="660" y="256" fill="white" fontSize="5" fontFamily="JetBrains Mono, monospace" letterSpacing="0.05em">COMPILER: TURBOPACK</text>
            </g>

            {/* Outer ticks on orbital ring at agent nodes */}
            {[
                { x: CEO_X, y: CEO_Y },
                { x: CTO_X, y: CTO_Y },
                { x: DEV_X, y: DEV_Y }
            ].map((pos, i) => {
                const dx = pos.x - CX;
                const dy = pos.y - CY;
                const len = Math.sqrt(dx * dx + dy * dy);
                const ux = dx / len;
                const uy = dy / len;
                return (
                    <line
                        key={`ring-tick-${i}`}
                        x1={CX + ux * (len - 6)}
                        y1={CY + uy * (len - 6)}
                        x2={CX + ux * (len + 6)}
                        y2={CY + uy * (len + 6)}
                        stroke="white"
                        strokeWidth="0.5"
                        strokeOpacity="0.15"
                    />
                );
            })}

            {/* ── Spokes (Agents to Center Node) ── */}
            {[
                { x: CEO_X, y: CEO_Y, id: 0 },
                { x: CTO_X, y: CTO_Y, id: 1 },
                { x: DEV_X, y: DEV_Y, id: 2 }
            ].map((ag) => (
                <g key={`spoke-${ag.id}`}>
                    <line
                        x1={ag.x}
                        y1={ag.y}
                        x2={CX}
                        y2={CY}
                        stroke="white"
                        strokeWidth="0.6"
                        strokeOpacity="0.25"
                        strokeDasharray="5 5"
                        markerEnd="url(#arr-inbound)"
                    />
                    {/* Signal packet dots traveling along spokes */}
                    <circle r="2" fill="white">
                        <animateMotion
                            dur={`${2.4 + ag.id * 0.5}s`}
                            begin={`${ag.id * 0.6}s`}
                            repeatCount="indefinite"
                            path={`M${ag.x},${ag.y} L${CX},${CY}`}
                        />
                        <animate
                            attributeName="opacity"
                            values="0;0.9;0.9;0"
                            keyTimes="0;0.1;0.85;1"
                            dur={`${2.4 + ag.id * 0.5}s`}
                            begin={`${ag.id * 0.6}s`}
                            repeatCount="indefinite"
                        />
                    </circle>
                    {/* Return handshake packet */}
                    <circle r="1.5" fill="white">
                        <animateMotion
                            dur={`${3.0 + ag.id * 0.4}s`}
                            begin={`${1.2 + ag.id * 0.5}s`}
                            repeatCount="indefinite"
                            path={`M${CX},${CY} L${ag.x},${ag.y}`}
                        />
                        <animate
                            attributeName="opacity"
                            values="0;0.6;0.6;0"
                            keyTimes="0;0.1;0.85;1"
                            dur={`${3.0 + ag.id * 0.4}s`}
                            begin={`${1.2 + ag.id * 0.5}s`}
                            repeatCount="indefinite"
                        />
                    </circle>
                </g>
            ))}

            {/* ── Cross-links between agents ── */}
            {[
                { x1: CEO_X, y1: CEO_Y, x2: CTO_X, y2: CTO_Y, id: 0 },
                { x1: CTO_X, y1: CTO_Y, x2: DEV_X, y2: DEV_Y, id: 1 },
                { x1: DEV_X, y1: DEV_Y, x2: CEO_X, y2: CEO_Y, id: 2 }
            ].map((link) => (
                <g key={`cross-link-${link.id}`}>
                    <line
                        x1={link.x1}
                        y1={link.y1}
                        x2={link.x2}
                        y2={link.y2}
                        stroke="white"
                        strokeWidth="0.45"
                        strokeOpacity="0.12"
                        strokeDasharray="4 8"
                        markerEnd="url(#arr-cross)"
                    />
                    {/* Signal dot traversing cross-links */}
                    <circle r="1.5" fill="white">
                        <animateMotion
                            dur={`${4.5 + link.id * 0.6}s`}
                            begin={`${link.id * 1.0}s`}
                            repeatCount="indefinite"
                            path={`M${link.x1},${link.y1} L${link.x2},${link.y2}`}
                        />
                        <animate
                            attributeName="opacity"
                            values="0;0.7;0.7;0"
                            keyTimes="0;0.1;0.85;1"
                            dur={`${4.5 + link.id * 0.6}s`}
                            begin={`${link.id * 1.0}s`}
                            repeatCount="indefinite"
                        />
                    </circle>
                </g>
            ))}

            {/* ── CEO Agent Node ── */}
            <g className="transition-all duration-300 hover:opacity-100">
                {/* Label above box */}
                <text
                    x={CEO_X - 62}
                    y={CEO_Y - 29}
                    fill="white"
                    fontSize="6.5"
                    fontFamily="JetBrains Mono, monospace"
                    letterSpacing="0.05em"
                    opacity="0.3"
                >
                    CHIEF EXECUTIVE OFFICER
                </text>

                {/* Box outline */}
                <rect
                    x={CEO_X - 62}
                    y={CEO_Y - 23}
                    width="124"
                    height="46"
                    fill="#050505"
                    stroke="white"
                    strokeWidth="0.7"
                    strokeOpacity="0.25"
                    filter="url(#glow-sm)"
                />

                {/* Header line & code */}
                <line
                    x1={CEO_X - 62}
                    y1={CEO_Y - 12}
                    x2={CEO_X + 62}
                    y2={CEO_Y - 12}
                    stroke="white"
                    strokeWidth="0.4"
                    strokeOpacity="0.15"
                />
                <text
                    x={CEO_X - 56}
                    y={CEO_Y - 16}
                    fill="white"
                    fontSize="5.5"
                    fontFamily="JetBrains Mono, monospace"
                    opacity="0.25"
                >
                    AG-001
                </text>

                {/* Blink indicator */}
                <circle cx={CEO_X + 54} cy={CEO_Y - 17.5} r="1.8" fill="#e5e2e1" opacity="0.4">
                    <animate
                        attributeName="opacity"
                        values="0.1;0.8;0.1"
                        dur="2.2s"
                        repeatCount="indefinite"
                    />
                </circle>

                {/* Text backdrop rectangle */}
                <rect
                    x={CEO_X - 22}
                    y={CEO_Y - 6}
                    width="44"
                    height="18"
                    fill="rgba(255,255,255,0.06)"
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth="0.5"
                    rx="1"
                />

                {/* Centered code letters */}
                <text
                    x={CEO_X}
                    y={CEO_Y + 6.5}
                    textAnchor="middle"
                    fill="white"
                    fontSize="11.5"
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="bold"
                    letterSpacing="0.15em"
                    opacity="0.9"
                >
                    CEO
                </text>

                {/* Tech status mini-bar */}
                <g opacity="0.25">
                    <rect x={CEO_X - 35} y={CEO_Y + 11} width="70" height="1.5" fill="white" />
                    <rect x={CEO_X - 35} y={CEO_Y + 11} width="45" height="1.5" fill="white" opacity="0.7" />
                </g>
                {/* Technical stats overlay in CEO box */}
                <text x={CEO_X - 56} y={CEO_Y + 17} fill="white" fontSize="4" fontFamily="JetBrains Mono, monospace" opacity="0.25">SYS: OK</text>
                <text x={CEO_X + 56} y={CEO_Y + 17} textAnchor="end" fill="white" fontSize="4" fontFamily="JetBrains Mono, monospace" opacity="0.25">KPI: 98%</text>

                {/* Brackets around box */}
                <CornerTicks x={CEO_X - 62} y={CEO_Y - 23} w={124} h={46} len={8} op={0.6} />
            </g>




            {/* ── DEV Agent Node ── */}
            <g className="transition-all duration-300 hover:opacity-100">
                {/* Label above box */}
                <text
                    x={DEV_X - 62}
                    y={DEV_Y - 29}
                    fill="white"
                    fontSize="6.5"
                    fontFamily="JetBrains Mono, monospace"
                    letterSpacing="0.05em"
                    opacity="0.3"
                >
                    LEAD DEVELOPER
                </text>

                {/* Box outline */}
                <rect
                    x={DEV_X - 62}
                    y={DEV_Y - 23}
                    width="124"
                    height="46"
                    fill="#050505"
                    stroke="white"
                    strokeWidth="0.7"
                    strokeOpacity="0.25"
                    filter="url(#glow-sm)"
                />

                {/* Header line & code */}
                <line
                    x1={DEV_X - 62}
                    y1={DEV_Y - 12}
                    x2={DEV_X + 62}
                    y2={DEV_Y - 12}
                    stroke="white"
                    strokeWidth="0.4"
                    strokeOpacity="0.15"
                />
                <text
                    x={DEV_X - 56}
                    y={DEV_Y - 16}
                    fill="white"
                    fontSize="5.5"
                    fontFamily="JetBrains Mono, monospace"
                    opacity="0.25"
                >
                    AG-003
                </text>

                {/* Blink indicator */}
                <circle cx={DEV_X + 54} cy={DEV_Y - 17.5} r="1.8" fill="#e5e2e1" opacity="0.4">
                    <animate
                        attributeName="opacity"
                        values="0.1;0.8;0.1"
                        dur="2.8s"
                        repeatCount="indefinite"
                    />
                </circle>

                {/* Text backdrop rectangle */}
                <rect
                    x={DEV_X - 22}
                    y={DEV_Y - 6}
                    width="44"
                    height="18"
                    fill="rgba(255,255,255,0.06)"
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth="0.5"
                    rx="1"
                />

                {/* Centered code letters */}
                <text
                    x={DEV_X}
                    y={DEV_Y + 6.5}
                    textAnchor="middle"
                    fill="white"
                    fontSize="11.5"
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="bold"
                    letterSpacing="0.15em"
                    opacity="0.9"
                >
                    DEV
                </text>

                {/* Tech status mini-bar */}
                <g opacity="0.25">
                    <rect x={DEV_X - 35} y={DEV_Y + 11} width="70" height="1.5" fill="white" />
                    <rect x={DEV_X - 35} y={DEV_Y + 11} width="58" height="1.5" fill="white" opacity="0.7" />
                </g>
                {/* Technical stats overlay in DEV box */}
                <text x={DEV_X - 56} y={DEV_Y + 17} fill="white" fontSize="4" fontFamily="JetBrains Mono, monospace" opacity="0.25">SYS: OK</text>
                <text x={DEV_X + 56} y={DEV_Y + 17} textAnchor="end" fill="white" fontSize="4" fontFamily="JetBrains Mono, monospace" opacity="0.25">LOC: +4.8K</text>

                {/* Brackets around box */}
                <CornerTicks x={DEV_X - 62} y={DEV_Y - 23} w={124} h={46} len={8} op={0.6} />
            </g>


            {/* ── CTO Agent Node ── */}
            <g className="transition-all duration-300 hover:opacity-100">
                {/* Label above box */}
                <text
                    x={CTO_X - 62}
                    y={CTO_Y - 29}
                    fill="white"
                    fontSize="6.5"
                    fontFamily="JetBrains Mono, monospace"
                    letterSpacing="0.05em"
                    opacity="0.3"
                >
                    CHIEF TECHNOLOGY OFFICER
                </text>

                {/* Box outline */}
                <rect
                    x={CTO_X - 62}
                    y={CTO_Y - 23}
                    width="124"
                    height="46"
                    fill="#050505"
                    stroke="white"
                    strokeWidth="0.7"
                    strokeOpacity="0.25"
                    filter="url(#glow-sm)"
                />

                {/* Header line & code */}
                <line
                    x1={CTO_X - 62}
                    y1={CTO_Y - 12}
                    x2={CTO_X + 62}
                    y2={CTO_Y - 12}
                    stroke="white"
                    strokeWidth="0.4"
                    strokeOpacity="0.15"
                />
                <text
                    x={CTO_X - 56}
                    y={CTO_Y - 16}
                    fill="white"
                    fontSize="5.5"
                    fontFamily="JetBrains Mono, monospace"
                    opacity="0.25"
                >
                    AG-002
                </text>

                {/* Blink indicator */}
                <circle cx={CTO_X + 54} cy={CTO_Y - 17.5} r="1.8" fill="#e5e2e1" opacity="0.4">
                    <animate
                        attributeName="opacity"
                        values="0.1;0.8;0.1"
                        dur="2.5s"
                        repeatCount="indefinite"
                    />
                </circle>

                {/* Text backdrop rectangle */}
                <rect
                    x={CTO_X - 22}
                    y={CTO_Y - 6}
                    width="44"
                    height="18"
                    fill="rgba(255,255,255,0.06)"
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth="0.5"
                    rx="1"
                />

                {/* Centered code letters */}
                <text
                    x={CTO_X}
                    y={CTO_Y + 6.5}
                    textAnchor="middle"
                    fill="white"
                    fontSize="11.5"
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="bold"
                    letterSpacing="0.15em"
                    opacity="0.9"
                >
                    CTO
                </text>

                {/* Tech status mini-bar */}
                <g opacity="0.25">
                    <rect x={CTO_X - 35} y={CTO_Y + 11} width="70" height="1.5" fill="white" />
                    <rect x={CTO_X - 35} y={CTO_Y + 11} width="32" height="1.5" fill="white" opacity="0.7" />
                </g>
                {/* Technical stats overlay in CTO box */}
                <text x={CTO_X - 56} y={CTO_Y + 17} fill="white" fontSize="4" fontFamily="JetBrains Mono, monospace" opacity="0.25">SYS: OK</text>
                <text x={CTO_X + 56} y={CTO_Y + 17} textAnchor="end" fill="white" fontSize="4" fontFamily="JetBrains Mono, monospace" opacity="0.25">STK: TS/NEXT</text>

                {/* Brackets around box */}
                <CornerTicks x={CTO_X - 62} y={CTO_Y - 23} w={124} h={46} len={8} op={0.6} />
            </g>



            {/* ── Center Node (OneCrew OS Core) ── */}
            <g className="transition-all duration-300">
                {/* Connection anchor brackets */}
                <line x1="285" y1={CY - 16} x2="295" y2={CY - 16} stroke="white" strokeWidth="0.6" strokeOpacity="0.3" />
                <line x1="505" y1={CY - 16} x2="515" y2={CY - 16} stroke="white" strokeWidth="0.6" strokeOpacity="0.3" />
                <line x1="285" y1={CY + 16} x2="295" y2={CY + 16} stroke="white" strokeWidth="0.6" strokeOpacity="0.3" />
                <line x1="505" y1={CY + 16} x2="515" y2={CY + 16} stroke="white" strokeWidth="0.6" strokeOpacity="0.3" />

                {/* Central main rectangle */}
                <rect
                    x="295"
                    y={CY - 25}
                    width="210"
                    height="50"
                    fill="#060606"
                    stroke="white"
                    strokeWidth="0.95"
                    strokeOpacity="0.4"
                    filter="url(#glow)"
                />

                {/* Header zone */}
                <rect x="295" y={CY - 25} width="210" height="11" fill="rgba(255,255,255,0.05)" />
                <line x1="295" y1={CY - 14} x2="505" y2={CY - 14} stroke="white" strokeWidth="0.4" strokeOpacity="0.2" />

                <text
                    x="303"
                    y={CY - 17}
                    fill="white"
                    fontSize="5.5"
                    fontFamily="JetBrains Mono, monospace"
                    letterSpacing="0.1em"
                    opacity="0.35"
                >
                    ONECREW SYSTEMS
                </text>

                {/* Core blink indicator */}
                <circle cx="496" cy={CY - 19.5} r="2" fill="white" opacity="0.6">
                    <animate
                        attributeName="opacity"
                        values="0.2;0.9;0.2"
                        dur="1.8s"
                        repeatCount="indefinite"
                    />
                </circle>

                {/* Centered large OS title */}
                <text
                    x="400"
                    y={CY + 12}
                    textAnchor="middle"
                    fill="white"
                    fontSize="14.5"
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="bold"
                    letterSpacing="0.25em"
                    opacity="0.95"
                >
                    OS v2.1
                </text>

                {/* Professional heavy brackets around center */}
                <CornerTicks x={295} y={CY - 25} w={210} h={50} len={10} op={0.8} sw={1.2} />
            </g>

            {/* ── Status line below center node ── */}
            <g>
                <text
                    x="400"
                    y={CY + 40}
                    textAnchor="middle"
                    fill="white"
                    fontSize="5.5"
                    fontFamily="JetBrains Mono, monospace"
                    letterSpacing="0.08em"
                    opacity="0.25"
                >
                    ● ACTIVE - AGENTS: 3 - UPTIME: 99.99%
                </text>
            </g>

            {/* ── Blueprint dimensions & callouts ── */}

            {/* Horizontal span footer dimension */}
            <g opacity="0.12">
                <line x1="240" y1="495" x2="560" y2="495" stroke="white" strokeWidth="0.4" />
                <line x1="240" y1="490" x2="240" y2="500" stroke="white" strokeWidth="0.4" />
                <line x1="560" y1="490" x2="560" y2="500" stroke="white" strokeWidth="0.4" />
                <text
                    x="400"
                    y="511"
                    textAnchor="middle"
                    fill="white"
                    fontSize="5.5"
                    fontFamily="JetBrains Mono, monospace"
                    letterSpacing="0.1em"
                >
                    ←— TEAM SPAN: 320px —→
                </text>
            </g>



            {/* Frame coordinate labels in corners */}
            <g opacity="0.1">
                <text x="12" y="18" fill="white" fontSize="5" fontFamily="JetBrains Mono, monospace">X:0000 Y:0000</text>
                <text x="12" y="510" fill="white" fontSize="5" fontFamily="JetBrains Mono, monospace">X:0000 Y:0520</text>
                <text x="735" y="18" fill="white" fontSize="5" fontFamily="JetBrains Mono, monospace">X:0800 Y:0000</text>
                <text x="735" y="510" fill="white" fontSize="5" fontFamily="JetBrains Mono, monospace">X:0800 Y:0520</text>
            </g>

            {/* Drawing spec stamp bottom right */}
            <g opacity="0.15">
                <rect x="690" y="12" width="98" height="20" fill="none" stroke="white" strokeWidth="0.4" />
                <text
                    x="739"
                    y="25"
                    textAnchor="middle"
                    fill="white"
                    fontSize="5.5"
                    fontFamily="JetBrains Mono, monospace"
                    letterSpacing="0.1em"
                >
                    DWG № OC-2401
                </text>
            </g>
        </svg>
    );
});

export default NodeDiagram;
