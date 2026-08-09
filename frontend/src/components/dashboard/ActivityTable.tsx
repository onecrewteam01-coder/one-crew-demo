import React, { useEffect } from 'react';
import { FileText, X, Download, Copy, Check } from 'lucide-react';

// ─── Dummy file content keyed by document name ──────────────────────────────
const DUMMY_CONTENT: Record<string, string> = {
  'startup_pitch_deck_2026.pdf': `ONECREW — STARTUP PITCH DECK 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXECUTIVE SUMMARY
OneCrew is an AI-native startup operating system that replaces disconnected 
productivity tools with a unified multi-agent intelligence layer.

THE PROBLEM
Founders today manage context across 12+ tools — Notion, Slack, Linear,
Figma, Google Docs, Sheets, and more. Every switch costs cognitive overhead.
Every handoff loses context. Every meeting produces decisions that never 
reach the right system.

THE SOLUTION
OneCrew deploys a coordinated fleet of specialist AI agents — Context,
Strategy, and Architecture — that continuously maintain, analyse, and act
on your startup's full knowledge graph. One workspace. One interface.
One crew.

MARKET SIZE
• TAM: $42B — Enterprise knowledge management + AI productivity
• SAM: $8.4B — Early-stage startup teams (seed → Series B)
• SOM: $420M — Developer-first AI workspace segment

TRACTION (as of Jul 2026)
• 847 waitlist sign-ups (organic, zero spend)
• 14 design partners across SaaS, Fintech, HealthTech
• NPS: 72 (beta cohort, n=31)

FUNDING ASK
Raising $1.8M pre-seed at $9M cap SAFE.
Use of funds: 60% engineering, 25% GTM, 15% ops.

TEAM
— Founder & CEO: [REDACTED] — ex-Stripe, Stanford CS
— Co-Founder & CTO: [REDACTED] — ex-DeepMind, distributed systems
`,

  'system_architecture_spec_v2.md': `# System Architecture Specification v2
## OneCrew Core Infrastructure

### Overview
The OneCrew backend is a distributed multi-agent system built on a 
message-broker topology with Redis-backed shared context memory.

### Stack
- **Frontend**: Next.js 16 + TailwindCSS v4 (TypeScript)
- **API Gateway**: FastAPI (Python 3.12) + uvicorn ASGI
- **Agent Runtime**: LangGraph stateful agent orchestration
- **Context Store**: Redis 7.x (vector + key-value hybrid)
- **Message Queue**: RabbitMQ (async task distribution)
- **Database**: PostgreSQL 16 (primary) + Pinecone (embeddings)
- **Deployment**: Docker Compose → AWS ECS Fargate (prod)

### Agent Architecture
\`\`\`
User Input
    │
    ▼
API Gateway (FastAPI)
    │
    ├─► Context Agent    ← Document ingestion, semantic search
    ├─► Strategy Agent   ← Business logic, milestone mapping  
    └─► Architecture Agent ← Build specs, technical scaffolding
         │
         ▼
    Redis Context Store (shared memory)
         │
         ▼
    Response Synthesiser → WebSocket → Frontend
\`\`\`

### Latency Targets
| Operation          | Target  | Current |
|--------------------|---------|---------|
| Chat response P50  | < 800ms | 620ms   |
| Document ingest    | < 3s    | 2.1s    |
| Context retrieval  | < 100ms | 67ms    |
| Agent coordination | < 200ms | 180ms   |

### Security
- All inter-service comms mTLS encrypted
- Secrets via AWS Secrets Manager
- PII redaction layer on ingestion pipeline
`,

  'market_research_competitors.xlsx': `MARKET RESEARCH — COMPETITOR ANALYSIS
══════════════════════════════════════

CATEGORY: AI Productivity / Startup OS

┌─────────────────────┬──────────────┬────────────┬──────────────┐
│ Company             │ Funding      │ Focus      │ Weakness     │
├─────────────────────┼──────────────┼────────────┼──────────────┤
│ Notion AI           │ $275M Series │ Notes/Wiki │ No agents    │
│ Linear              │ $35M Series B│ Issue track│ Dev-only     │
│ Height              │ $5M Seed     │ PM tool    │ No AI        │
│ Dust.tt             │ $5M Seed     │ Agent WS   │ No workspace │
│ Relay.app           │ $4.2M Seed   │ Automation │ No context   │
└─────────────────────┴──────────────┴────────────┴──────────────┘

KEY DIFFERENTIATORS (OneCrew vs field)
✓ Unified workspace + agent fleet (nobody else does both)
✓ Persistent cross-session context memory
✓ Startup-domain-aware agents (not generic LLM wrappers)
✓ Graph-based workspace dependency mapping

PRICING BENCHMARKS
• Notion AI: $16/user/mo
• Linear: $8/user/mo
• Dust.tt: $29/user/mo (team)
• OneCrew target: $49/mo flat (early stage), $99/mo (growth)

ACQUISITION CHANNELS (competitor analysis)
• Notion: Product-led, community, YouTube
• Linear: Dev Twitter/X, OSS integrations
• OneCrew target: Dev newsletters, PH, technical content SEO
`,

  'financial_projections_q3_q4.csv': `Month,MRR ($),Users,Burn ($),Runway (mo)
Aug 2026,0,0,42000,43
Sep 2026,4900,100,44000,41
Oct 2026,12250,250,47000,38
Nov 2026,24500,500,51000,35
Dec 2026,44100,900,55000,31
Jan 2027,68600,1400,60000,26
Feb 2027,98000,2000,65000,21
Mar 2027,137200,2800,70000,17

ASSUMPTIONS
- ACV: $49/mo (solo) / $99/mo (team, avg 2.1 seats)
- Blended ARPU: $49
- Churn: 6% MoM (decreasing to 4% by Q2 2027)
- CAC: $120 (organic-first, paid from Month 4)
- LTV: $817 (at 6% churn)
- LTV:CAC ratio: 6.8x

BURN BREAKDOWN (monthly avg Q3-Q4)
Infrastructure & hosting:  $8,400  (19%)
Engineering salaries:      $28,000 (64%)
Marketing & content:       $5,600  (13%)
G&A:                       $2,000  (4%)
`,

  'user_interview_transcripts.txt': `USER INTERVIEW TRANSCRIPTS
══════════════════════════
OneCrew Beta Research | July 2026 | n=14 sessions

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PARTICIPANT 04 — Fintech Founder, 8-person team
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"The problem isn't that I don't have the information. 
The problem is I don't know where the information is.
Last week I had three different versions of our pitch 
deck and couldn't figure out which one was current."

Pain points flagged:
• Context fragmentation across tools [HIGH]
• Version drift on critical documents [HIGH]  
• Agent suggestions not grounded in actual docs [MED]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PARTICIPANT 07 — Solo founder, pre-revenue
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"I use Notion for everything but AI features are 
too generic. I asked it about my go-to-market and 
it gave me advice for a generic SaaS. It didn't 
even read my PRD that was right there."

Pain points flagged:
• Generic AI advice not domain-specific [HIGH]
• Poor document-to-reasoning connection [HIGH]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PARTICIPANT 11 — CTO, 3-person technical team
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"The workspace graph feature is the thing I didn't 
know I needed. Seeing how market research connects 
to the PRD connects to the architecture — that's 
clarity I've never had before."

Positive signal:
• Graph visualisation resonated strongly [NOTABLE]
• Would pay $99/mo for team tier [INTENT]
`,

  'vision_and_mission.md': `# Vision & Mission
## OneCrew — Foundational Document

### Mission
To give every founder a full-stack AI co-founder that understands 
their business as deeply as they do — and never forgets anything.

### Vision
A world where starting a company is no longer bottlenecked by 
organisational overhead. Where every early-stage team operates 
with the institutional memory and strategic clarity of a 
100-person company, from day one.

### Core Values
1. **Context is everything** — Decisions without context are guesses.
2. **Agents, not assistants** — We build agents that act, not chatbots that answer.
3. **Founders first** — Every feature must reduce founder cognitive load.
4. **Transparent by default** — Every AI action must be explainable.

### North Star Metric
Time-to-insight: the minutes between a founder asking a strategic 
question and receiving a grounded, actionable answer.
Target: < 60 seconds (from any state of the workspace).

### 3-Year Horizon
By 2029, OneCrew becomes the operating layer for 50,000+ early-stage 
teams globally — the first place a founder opens in the morning and 
the last they check before shipping.
`,
};

function getFileContent(name: string, category: string): string {
  if (DUMMY_CONTENT[name]) return DUMMY_CONTENT[name];
  return `${name.toUpperCase()}
${'─'.repeat(50)}
Category : ${category.toUpperCase()}
Status   : INDEXED

This document has been ingested into the OneCrew context
memory and is available to all active agents.

Document content preview is not available for this file
type in the current demo build. The full indexing pipeline
has processed and vectorised this document for semantic
retrieval by the Context Agent.

To query this document, send a message to the Agent Hub
referencing the document name or topic.`;
}

// ─── Inline Document Viewer (renders inside the card, no overlay) ─────────────
interface DocumentViewerModalProps {
  doc: DocumentItem | null;
  onClose: () => void;
}

export function DocumentViewerModal({ doc, onClose }: DocumentViewerModalProps) {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!doc) return null;

  const content = getFileContent(doc.name, doc.category);
  const ext = doc.name.split('.').pop()?.toUpperCase() ?? '';

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full min-h-0 animate-[fadeSlideIn_0.2s_cubic-bezier(0.16,1,0.3,1)_both]">
      {/* Subheader row — back + meta */}
      <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-[#141416] shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 font-mono text-[10px] px-2 py-1 rounded border border-[#222226] bg-[#0c0c0e] text-[#888] hover:text-white hover:border-white transition-all cursor-pointer shrink-0"
          >
            ← Back
          </button>
          <div className="w-6 h-6 rounded bg-white/5 border border-[#222226] flex items-center justify-center shrink-0">
            <FileText size={11} className="text-slate-400" strokeWidth={2} />
          </div>
          <p className="font-mono text-[11px] font-bold text-slate-100 truncate">{doc.name}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/10 border border-[#222] text-white hidden sm:inline">{ext}</span>
          <span className="font-mono text-[9px] text-[#555] hidden sm:inline">{doc.size}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 font-mono text-[10px] px-2 py-1 rounded border border-[#222226] bg-[#0c0c0e] text-[#888] hover:text-white hover:border-white transition-all cursor-pointer"
          >
            {copied ? <Check size={10} /> : <Copy size={10} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded border border-[#222226] bg-[#0c0c0e] text-[#888] hover:text-white hover:border-white transition-all cursor-pointer"
          >
            <X size={11} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Content area — fills remaining card space */}
      <div className="flex-grow overflow-y-auto min-h-0 bg-[#040405] border border-[#141416] rounded-xl p-4">
        <pre className="font-mono text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
          {content}
        </pre>
      </div>

      {/* Footer status strip */}
      <div className="pt-2 mt-2 border-t border-[#141416] shrink-0">
        <span className="font-mono text-[9px] text-[#333] uppercase tracking-wider">
          INDEXED · {doc.category.toUpperCase()} VAULT · ONECREW CONTEXT MEMORY · {doc.date}
        </span>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}


// --- MILESTONES TABLE ---
export interface MilestoneItem {
  milestone: string;
  targetDate: string;
  funding: string;
  confidence: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'QUEUED';
}

interface MilestonesTableProps {
  items: MilestoneItem[];
}

export function MilestonesTable({ items }: MilestonesTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-left text-xs text-[#f1f5f9]">
        <thead>
          <tr className="border-b border-[#141416] text-[#888888] font-mono uppercase text-[10px]">
            <th className="py-2 px-3">Milestone</th>
            <th className="py-2 px-3">Target Date</th>
            <th className="py-2 px-3">Required Funding</th>
            <th className="py-2 px-3">Confidence Score</th>
            <th className="py-2 px-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx} className="border-b border-white/[0.01] hover:bg-[#0d0d12]/40 transition-colors">
              <td className="py-3 px-3">{item.milestone}</td>
              <td className="py-3 px-3 font-mono">{item.targetDate}</td>
              <td className="py-3 px-3 font-mono">{item.funding}</td>
              <td className="py-3 px-3 font-mono">{item.confidence}</td>
              <td className="py-3 px-3">
                <span
                  className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded ${
                    item.status === 'COMPLETED'
                      ? 'bg-white text-black'
                      : item.status === 'IN_PROGRESS'
                      ? 'border border-[#888888] text-[#f1f5f9]'
                      : 'border border-[#141416] text-[#888888]'
                  }`}
                >
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- API CREDENTIALS TABLE ---
export interface ApiCredentialItem {
  endpoint: string;
  scope: string;
  quota: string;
  usage: string;
  status: string;
}

interface ApiCredentialsTableProps {
  items: ApiCredentialItem[];
}

export function ApiCredentialsTable({ items }: ApiCredentialsTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-left text-xs text-[#f1f5f9]">
        <thead>
          <tr className="border-b border-[#141416] text-[#888888] font-mono uppercase text-[10px]">
            <th className="py-2 px-3">Service Endpoint</th>
            <th className="py-2 px-3">Key Scope</th>
            <th className="py-2 px-3">Monthly Quota</th>
            <th className="py-2 px-3">Usage Rate</th>
            <th className="py-2 px-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx} className="border-b border-white/[0.01] hover:bg-[#0d0d12]/40 transition-colors">
              <td className="py-3 px-3 font-mono text-[#888888]">{item.endpoint}</td>
              <td className="py-3 px-3 font-mono">{item.scope}</td>
              <td className="py-3 px-3 font-mono">{item.quota}</td>
              <td className="py-3 px-3 font-mono">{item.usage}</td>
              <td className="py-3 px-3">
                <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded bg-white text-black">
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


// --- DOCUMENT TRACKER TABLE ---
export interface DocumentItem {
  name: string;
  category: string;
  size: string;
  date: string;
  status: string;
}

interface DocumentTrackerTableProps {
  items: DocumentItem[];
  onView: (doc: DocumentItem) => void;
}

export function DocumentTrackerTable({ items, onView }: DocumentTrackerTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-left text-xs text-[#f1f5f9]">
        <thead>
          <tr className="border-b border-[#141416] text-[#888888] font-mono uppercase text-[10px]">
            <th className="py-2 px-3">Document Name</th>
            <th className="py-2 px-3">Category</th>
            <th className="py-2 px-3">Size</th>
            <th className="py-2 px-3">Uploaded Date</th>
            <th className="py-2 px-3 col-parsing-status">Parsing Status</th>
            <th className="py-2 px-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-6 text-center text-[#888888] font-mono">
                No matching documents found.
              </td>
            </tr>
          ) : (
            items.map((item, idx) => (
              <tr key={idx} className="border-b border-white/[0.01] hover:bg-[#0d0d12]/40 transition-colors">
                <td className="py-3 px-3">
                   <div className="flex items-center gap-2">
                      <FileText
                        className="h-3.5 w-3.5 text-[#888888] shrink-0"
                        strokeWidth={2}
                      />
                      <span>{item.name}</span>
                    </div>
                  </td>
                <td className="py-3 px-3">
                  <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded bg-[#ffffff]/10 border border-[#141416] text-white">
                    {item.category.toUpperCase()}
                  </span>
                </td>
                <td className="py-3 px-3 font-mono text-[#888888]">{item.size}</td>
                <td className="py-3 px-3 font-mono text-[#888888]">{item.date}</td>
                <td className="py-3 px-3 col-parsing-status">
                  <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded bg-white text-black">
                    {item.status}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <button
                    onClick={() => onView(item)}
                    className="font-mono text-[10px] text-white bg-[#0c0c0e] hover:bg-white hover:text-black border border-[#141416] px-2.5 py-1 rounded transition-colors"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
