import React from 'react';

// --- SYSTEM OVERVIEW METRICS CARD GROUP ---
interface SystemOverviewMetricsProps {
  latency: string;
  memory: string;
  agentLoad: string;
  coresActive: number;
}

export function SystemOverviewMetrics({
  latency,
  memory,
  agentLoad,
  coresActive,
}: SystemOverviewMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
      <div className="bg-[#08080b] border border-[#141416] p-3.5 rounded-lg flex flex-col gap-1">
        <span className="font-mono text-[10px] text-[#888888] uppercase tracking-wider">
          Network Latency
        </span>
        <span className="font-mono text-xl sm:text-2xl font-bold text-slate-100">{latency}</span>
        <span className="font-mono text-[10px] text-slate-100 font-medium">Stable</span>
      </div>

      <div className="bg-[#08080b] border border-[#141416] p-3.5 rounded-lg flex flex-col gap-1">
        <span className="font-mono text-[10px] text-[#888888] uppercase tracking-wider">
          Memory Load
        </span>
        <span className="font-mono text-xl sm:text-2xl font-bold text-slate-100">{memory}</span>
        <span className="font-mono text-[10px] text-[#888888]">14.2 / 32 GB</span>
      </div>

      <div className="bg-[#08080b] border border-[#141416] p-3.5 rounded-lg flex flex-col gap-1">
        <span className="font-mono text-[10px] text-[#888888] uppercase tracking-wider">
          Agent Load
        </span>
        <span className="font-mono text-xl sm:text-2xl font-bold text-slate-100">{agentLoad}</span>
        <span className="font-mono text-[10px] text-[#888888]">{coresActive} cores active</span>
      </div>
    </div>
  );
}

// --- BUSINESS VISION PROJECTIONS CARD GROUP ---
interface BusinessVisionProjectionsProps {
  tam: string;
  tamNote?: string;
  sam: string;
  samNote?: string;
  som: string;
  somNote?: string;
}

export function BusinessVisionProjections({
  tam,
  tamNote = "Target sector growth CAGR 12.8%",
  sam,
  samNote = "Primary geographic sector launch",
  som,
  somNote = "3-Year market capture target",
}: BusinessVisionProjectionsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
      <div className="bg-[#08080b] border border-[#141416] p-3.5 rounded-lg flex flex-col gap-1">
        <span className="font-mono text-[10px] text-[#888888] uppercase tracking-wider">
          TAM (Total Addressable Market)
        </span>
        <span className="font-mono text-xl sm:text-2xl font-bold text-slate-100">{tam}</span>
        <span className="text-[10px] text-[#888888]">{tamNote}</span>
      </div>

      <div className="bg-[#08080b] border border-[#141416] p-3.5 rounded-lg flex flex-col gap-1">
        <span className="font-mono text-[10px] text-[#888888] uppercase tracking-wider">
          SAM (Service Addressable Market)
        </span>
        <span className="font-mono text-xl sm:text-2xl font-bold text-slate-100">{sam}</span>
        <span className="text-[10px] text-[#888888]">{samNote}</span>
      </div>

      <div className="bg-[#08080b] border border-[#141416] p-3.5 rounded-lg flex flex-col gap-1">
        <span className="font-mono text-[10px] text-[#888888] uppercase tracking-wider">
          SOM (Service Obtainable Market)
        </span>
        <span className="font-mono text-xl sm:text-2xl font-bold text-slate-100">{som}</span>
        <span className="text-[10px] text-[#888888]">{somNote}</span>
      </div>
    </div>
  );
}
