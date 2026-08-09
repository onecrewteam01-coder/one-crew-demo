import React from 'react';
import { Zap } from 'lucide-react';

// --- CHAT MESSAGE BUBBLE ---
export interface ChatMessageItem {
  id: string;
  type: 'system' | 'user' | 'agent';
  agentKey?: 'context' | 'strategy' | 'architecture';
  agentName?: string;
  agentChar?: string;
  time?: string;
  text: string;
}

interface ChatMessageProps {
  message: ChatMessageItem;
}

export function ChatMessage({ message }: ChatMessageProps) {
  if (message.type === 'system') {
    return (
      <div className="flex flex-col max-w-full self-center bg-[#08080b] border border-dashed border-[#141416] p-2 sm:p-3.5 rounded-md">
        <div className="font-mono text-[9px] sm:text-[10px] text-slate-100 tracking-wider mb-0.5">
          SYSTEM UPDATE
        </div>
        <div className="text-[10px] sm:text-[11px] text-[#888888] font-mono">{message.text}</div>
      </div>
    );
  }

  if (message.type === 'user') {
    return (
      <div className="flex flex-col max-w-[80%] self-end">
        <div className="bg-[#111115] border border-[#26262b] p-2.5 sm:p-3 rounded-lg text-[11px] sm:text-xs text-slate-100 leading-relaxed font-mono">
          {message.text}
        </div>
      </div>
    );
  }

  // Agent message
  return (
    <div className="flex flex-col max-w-[80%] self-start gap-2">
      <div className="flex items-center gap-2 text-[9px] sm:text-[10px]">
        <span className="w-[18px] h-[18px] rounded bg-[#16161c] text-white flex items-center justify-center font-mono font-bold border border-[#141416]">
          {message.agentChar}
        </span>
        <span className="font-mono font-bold text-slate-100">{message.agentName}</span>
        <span className="text-[9px] text-[#444444] font-mono">{message.time}</span>
      </div>
      <div className="bg-[#08080b] border border-[#141416] p-2.5 sm:p-3 rounded-lg text-[11px] sm:text-xs text-slate-100 leading-relaxed">
        {message.text}
      </div>
    </div>
  );
}

// --- PRIORITY BADGE ---
interface PriorityBadgeProps {
  priority: 'high' | 'medium' | 'low';
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span
      className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded ${
        priority === 'high'
          ? 'bg-white text-black'
          : priority === 'medium'
          ? 'border border-[#888888] text-slate-100'
          : 'border border-[#141416] text-[#888888]'
      }`}
    >
      {priority.toUpperCase()} PRIORITY
    </span>
  );
}

// --- WORKFLOW TRIGGERS ---
export interface TriggerItem {
  id: string;
  name: string;
  condition: string;
  routine: string;
  enabled: boolean;
}

interface WorkflowTriggersListProps {
  triggers: TriggerItem[];
}

export function WorkflowTriggersList({ triggers }: WorkflowTriggersListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {triggers.map((trigger) => (
        <div key={trigger.id} className="bg-[#08080b] border border-[#141416] p-3.5 rounded-lg flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <h4 className="font-mono text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-[#888888]" strokeWidth={2} />
              {trigger.name}
            </h4>
            <span
              className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded ${
                trigger.enabled ? 'bg-white text-black' : 'border border-[#141416] text-[#888888]'
              }`}
            >
              {trigger.enabled ? 'ENABLED' : 'DISABLED'}
            </span>
          </div>
          <div className="text-[11px] leading-relaxed text-[#888888]">
            <div className="pb-1 border-b border-dashed border-[#141416] mb-1">
              <strong className="font-mono text-slate-100 mr-1.5 font-medium">Event Condition:</strong>
              {trigger.condition}
            </div>
            <div>
              <strong className="font-mono text-slate-100 mr-1.5 font-medium">Action Routine:</strong>
              {trigger.routine}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}