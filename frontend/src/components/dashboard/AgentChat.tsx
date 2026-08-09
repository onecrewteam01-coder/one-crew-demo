'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// @ts-ignore
import { ThinkingOrb } from 'thinking-orbs';

export type AgentKey = 'context' | 'strategy' | 'architecture';

export interface AgentChatMessage {
  id: string;
  type: 'system' | 'user' | 'assistant';
  text: string;
  agentKey?: AgentKey;
  agentChar?: string;
  agentName?: string;
  time?: string;
}

type ThinkingState = 'searching' | 'composing' | 'working';

interface ThinkingPhase {
  state: ThinkingState;
  label: string;
  durationMs: number;
}

const THINKING_PHASES: ThinkingPhase[] = [
  { state: 'composing', label: 'Thinking...', durationMs: 2000 },
  { state: 'working', label: 'Working...', durationMs: 2000 },
  { state: 'searching', label: 'Searching...', durationMs: 2000 },
];

const DEMO_RESPONSES: Record<string, string> = {
  rag:
    'Retrieval-Augmented Generation (RAG) combines a vector search system with an LLM. ' +
    'When you query the model, it first retrieves the most semantically relevant document chunks ' +
    'from a knowledge base using embedding similarity, then passes them as context to the language model. ' +
    'This allows the model to answer questions grounded in private or up-to-date data without retraining.',
  architecture:
    'The system architecture follows a micro-services topology: a Next.js frontend communicates ' +
    'with a FastAPI gateway that routes requests to specialist agents. Agents share a Redis-backed ' +
    'context store, and long-running tasks are queued via a message broker. Each agent publishes ' +
    'structured logs to a central telemetry bus for observability.',
  marketing:
    'The go-to-market strategy targets developer-led growth: seed via developer newsletters and ' +
    'Product Hunt, convert freemium users through an in-product upgrade prompt when they hit ' +
    'usage limits, and upsell enterprise seats through a usage-based pricing model. ' +
    'The first 90-day focus is on technical content SEO and open-source tooling contributions.',
  default:
    'Instruction received and analysed across active context memory. ' +
    'Based on current workspace parameters, the recommended next action is to validate ' +
    'the relevant module dependencies and cross-reference with indexed documents. ' +
    'Let me know if you would like me to drill into a specific domain or generate a structured output.',
};

function getDemoResponse(query: string): string {
  const q = query.toLowerCase();
  if (q.includes('rag') || q.includes('retrieval') || q.includes('augmented')) return DEMO_RESPONSES.rag;
  if (q.includes('architect') || q.includes('system') || q.includes('backend')) return DEMO_RESPONSES.architecture;
  if (q.includes('market') || q.includes('gtm') || q.includes('launch')) return DEMO_RESPONSES.marketing;
  return DEMO_RESPONSES.default;
}

const AGENT_META: Record<AgentKey, { name: string; char: string }> = {
  context: { name: 'Context Agent', char: 'C' },
  strategy: { name: 'Strategy Agent', char: 'S' },
  architecture: { name: 'Architecture Agent', char: 'A' },
};

function simulateAgentResponse(
  query: string,
  onPhaseChange: (phase: ThinkingPhase | null) => void,
  onComplete: (reply: string) => void,
): () => void {
  let cancelled = false;
  const timers: ReturnType<typeof setTimeout>[] = [];

  function runPhase(index: number) {
    if (cancelled || index >= THINKING_PHASES.length) {
      if (!cancelled) {
        onPhaseChange(null);
        onComplete(getDemoResponse(query));
      }
      return;
    }
    const phase = THINKING_PHASES[index];
    onPhaseChange(phase);
    const t = setTimeout(() => runPhase(index + 1), phase.durationMs);
    timers.push(t);
  }

  runPhase(0);
  return () => {
    cancelled = true;
    timers.forEach(clearTimeout);
  };
}

function SystemMessage({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col max-w-full self-center bg-[#08080b] border border-dashed border-[#141416] p-2 sm:p-3.5 rounded-md"
    >
      <div className="font-mono text-[9px] sm:text-[10px] text-slate-100 tracking-wider mb-0.5">
        SYSTEM UPDATE
      </div>
      <div className="text-[10px] sm:text-[11px] text-[#888888] font-mono">{text}</div>
    </motion.div>
  );
}

export function UserMessage({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex flex-col max-w-[82%] self-end"
    >
      <div className="bg-[#111115] border border-[#26262b] p-2.5 sm:p-3 rounded-xl rounded-br-sm text-[11px] sm:text-xs text-slate-100 leading-relaxed font-mono">
        {text}
      </div>
    </motion.div>
  );
}

export function AssistantMessage({
  text,
  agentChar,
  agentName,
  time,
}: {
  text: string;
  agentChar: string;
  agentName: string;
  time: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex flex-col max-w-[82%] self-start gap-1.5"
    >
      <div className="flex items-center gap-2 text-[9px] sm:text-[10px]">
        <span className="w-[18px] h-[18px] rounded bg-[#16161c] text-white flex items-center justify-center font-mono font-bold border border-[#141416] shrink-0">
          {agentChar}
        </span>
        <span className="font-mono font-bold text-slate-100">{agentName}</span>
        <span className="text-[9px] text-[#444444] font-mono">{time}</span>
      </div>
      <div className="bg-[#08080b] border border-[#141416] p-2.5 sm:p-3 rounded-xl rounded-tl-sm text-[11px] sm:text-xs text-slate-100 leading-relaxed">
        {text}
      </div>
    </motion.div>
  );
}

export function AgentThinkingIndicator({
  phase,
  agentChar,
  agentName,
}: {
  phase: ThinkingPhase;
  agentChar: string;
  agentName: string;
}) {
  return (
    <motion.div
      key="thinking-indicator"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex flex-col max-w-[82%] self-start gap-1.5"
    >
      <div className="flex items-center gap-2 text-[9px] sm:text-[10px]">
        <span className="w-[18px] h-[18px] rounded bg-[#16161c] text-white flex items-center justify-center font-mono font-bold border border-[#141416] shrink-0">
          {agentChar}
        </span>
        <span className="font-mono font-bold text-slate-100">{agentName}</span>
      </div>
      <div className="bg-[#08080b] border border-[#141416] px-3 py-2 rounded-xl rounded-tl-sm flex flex-row items-center gap-2">
        <ThinkingOrb
          state={phase.state}
          size={20}
          aria-label={phase.label}
        />
        <AnimatePresence mode="wait">
          <motion.span
            key={phase.label}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="font-mono text-[10px] text-[#888888] tracking-wide"
          >
            {phase.label}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function ChatInput({
  onSubmit,
  disabled,
}: {
  onSubmit: (text: string) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || disabled) return;
    onSubmit(value.trim());
    setValue('');
  };

  return (
    <div className="bg-[#08080b] border border-[#141416] rounded-lg p-2 sm:p-2.5 shrink-0">
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={disabled ? 'Agent is thinking...' : 'Ask me anything...'}
          autoComplete="off"
          disabled={disabled}
          className="flex-grow bg-transparent border-none outline-none text-[#f1f5f9] text-[11px] sm:text-xs font-mono placeholder:text-[#444444] disabled:opacity-50 disabled:cursor-not-allowed transition-opacity pl-1.5"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="bg-white border-none text-black w-7 h-7 rounded-md flex items-center justify-center cursor-pointer transition-all hover:bg-[#888888] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          <Send className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </form>
    </div>
  );
}

export function ChatMessages({
  messages,
  thinkingPhase,
  activeAgentKey,
  scrollContainerRef,
}: {
  messages: AgentChatMessage[];
  thinkingPhase: ThinkingPhase | null;
  activeAgentKey: AgentKey;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const meta = AGENT_META[activeAgentKey];

  return (
    <div
      ref={scrollContainerRef}
      className="chat-messages-log pr-1 flex flex-col gap-3 mb-4 min-h-0"
    >
      {messages.map((msg) => {
        if (msg.type === 'system') {
          return <SystemMessage key={msg.id} text={msg.text} />;
        }
        if (msg.type === 'user') {
          return <UserMessage key={msg.id} text={msg.text} />;
        }
        return (
          <AssistantMessage
            key={msg.id}
            text={msg.text}
            agentChar={msg.agentChar ?? meta.char}
            agentName={msg.agentName ?? meta.name}
            time={msg.time ?? ''}
          />
        );
      })}

      <AnimatePresence>
        {thinkingPhase && (
          <AgentThinkingIndicator
            phase={thinkingPhase}
            agentChar={meta.char}
            agentName={meta.name}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface AgentChatProps {
  activeAgentKey: AgentKey;
  initialMessages: AgentChatMessage[];
  onSystemLog?: (text: string) => void;
}

export default function AgentChat({
  activeAgentKey,
  initialMessages,
  onSystemLog,
}: AgentChatProps) {
  const [messages, setMessages] = useState<AgentChatMessage[]>(initialMessages);
  const [thinkingPhase, setThinkingPhase] = useState<ThinkingPhase | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const cancelThinkingRef = useRef<(() => void) | null>(null);

  const isThinking = thinkingPhase !== null;

  const scrollToBottom = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
    const timer = setTimeout(scrollToBottom, 50);
    return () => clearTimeout(timer);
  }, [messages, thinkingPhase, scrollToBottom]);

  useEffect(() => {
    return () => { cancelThinkingRef.current?.(); };
  }, []);

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const meta = AGENT_META[activeAgentKey];
    appendMessage({
      id: `msg-system-switch-${Date.now()}`,
      type: 'system',
      text: `${meta.name} activated.`,
    });

    const introMessages: Record<AgentKey, string> = {
      context: "Hello! I've loaded the startup profile directory. Ready to analyze context or structural payload metrics.",
      strategy: "Greetings. Node online. Ready to map MVP phases, competitor vectors, or business vision blueprints.",
      architecture: "System architect active. Ready to build sync targets, compile workspace graphs, or resolve backend payloads.",
    };

    const timer = setTimeout(() => {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      appendMessage({
        id: `msg-agent-intro-${Date.now()}`,
        type: 'assistant',
        text: introMessages[activeAgentKey],
        agentKey: activeAgentKey,
        agentChar: meta.char,
        agentName: meta.name,
        time,
      });
    }, 450);

    return () => clearTimeout(timer);
  }, [activeAgentKey]);

  const appendMessage = (msg: AgentChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  };

  const handleSubmit = (query: string) => {
    if (isThinking) return;

    appendMessage({
      id: `msg-user-${Date.now()}`,
      type: 'user',
      text: query,
    });

    const cancel = simulateAgentResponse(
      query,
      (phase) => setThinkingPhase(phase),
      (reply) => {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const meta = AGENT_META[activeAgentKey];
        appendMessage({
          id: `msg-agent-${Date.now()}`,
          type: 'assistant',
          text: reply,
          agentKey: activeAgentKey,
          agentChar: meta.char,
          agentName: meta.name,
          time,
        });
        cancelThinkingRef.current = null;
      },
    );

    cancelThinkingRef.current = cancel;
  };

  return (
    <div className="agent-chat-container flex flex-col flex-grow overflow-hidden p-4 min-h-0">
      <ChatMessages
        messages={messages}
        thinkingPhase={thinkingPhase}
        activeAgentKey={activeAgentKey}
        scrollContainerRef={scrollContainerRef}
      />
      <ChatInput onSubmit={handleSubmit} disabled={isThinking} />
    </div>
  );
}