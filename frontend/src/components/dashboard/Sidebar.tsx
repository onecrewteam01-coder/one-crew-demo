import React from 'react';

export interface AgentNode {
  key: string;
  name: string;
  char: string;
  status: 'ONLINE' | 'OFFLINE' | 'BUSY';
  role: string;
  scope: string;
}

interface SidebarProps {
  agents: AgentNode[];
  activeAgent: string;
  onSelectAgent: (key: string) => void;
}

export default function Sidebar({ agents, activeAgent, onSelectAgent }: SidebarProps) {
  return (
    <aside className="w-full md:w-[280px] bg-[#050507] border border-[#141416] rounded-xl p-4 flex flex-col gap-4 font-mono">
      <div className="border-b border-[#141416] pb-3">
        <h2 className="text-xs font-bold text-slate-100 tracking-wider uppercase flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
          Agent Core Registry
        </h2>
        <p className="text-[10px] text-[#888888] mt-1">
          Active neural agent connections
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {agents.map((agent) => (
          <div
            key={agent.key}
            onClick={() => onSelectAgent(agent.key)}
            className={`p-3 rounded-lg border transition-all cursor-pointer ${
              activeAgent === agent.key
                ? 'bg-white border-white text-black'
                : 'bg-[#08080b] border-[#141416] text-[#f1f5f9] hover:bg-[#0d0d12]'
            }`}
          >
            <div className="flex justify-between items-center mb-1.5">
              <div className="flex items-center gap-2">
                <span
                  className={`w-[18px] h-[18px] rounded text-[10px] flex items-center justify-center font-bold border ${
                    activeAgent === agent.key
                      ? 'bg-black text-white border-black'
                      : 'bg-[#16161c] text-white border-[#141416]'
                  }`}
                >
                  {agent.char}
                </span>
                <span className="text-xs font-bold font-sans">{agent.name}</span>
              </div>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  agent.status === 'ONLINE'
                    ? activeAgent === agent.key
                      ? 'bg-black text-white'
                      : 'border border-neutral-500 text-neutral-400'
                    : 'bg-neutral-800 text-neutral-500'
                }`}
              >
                {agent.status}
              </span>
            </div>
            <div
              className={`text-[10px] ${
                activeAgent === agent.key ? 'text-neutral-700' : 'text-[#888888]'
              }`}
            >
              <div className="truncate"><strong>Role:</strong> {agent.role}</div>
              <div className="truncate mt-0.5"><strong>Scope:</strong> {agent.scope}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto border-t border-[#141416] pt-3 text-[10px] text-[#888888] leading-relaxed">
        <div><strong>Gateway:</strong> TLS 1.3 Tunnel</div>
        <div><strong>Oscillator:</strong> 10Hz Sync Rate</div>
      </div>
    </aside>
  );
}
