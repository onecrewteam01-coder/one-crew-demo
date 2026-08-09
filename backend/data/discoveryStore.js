/**
 * discoveryStore.js — In-memory data store for AI Discovery sessions & generated workspaces.
 * Acts as a mock database until a real DB layer is wired up.
 */

const crypto = require('crypto');

// In-memory stores
const sessions = new Map();
const workspaces = new Map();

// --- Seed a demo workspace so the dashboard has data on first load ---
const DEMO_WORKSPACE_ID = 'demo';

workspaces.set(DEMO_WORKSPACE_ID, {
    id: DEMO_WORKSPACE_ID,
    createdAt: new Date().toISOString(),
    status: 'generated',
    discoveryMeta: {
        totalSteps: 8,
        completedSteps: 8,
        confidenceScores: {
            problemUnderstanding: 0.95,
            targetAudience: 0.90,
            productCategory: 0.92,
            businessModel: 0.85,
            platform: 0.88,
            technicalRequirements: 0.80
        }
    },
    business: {
        executiveSummary: "An AI-powered platform that helps university students prepare for interviews through mock interviews and personalized feedback. The system uses advanced NLP to simulate realistic interview scenarios and provides instant, actionable coaching.",
        vision: "To democratize interview preparation and help every student land their dream job, regardless of their background or access to resources.",
        mission: "Provide accessible, high-quality, AI-driven interview practice to students worldwide.",
        problemStatement: "Students lack affordable, personalized, and realistic interview practice before facing real employers. Traditional coaching is expensive ($100+/hr) and inaccessible to most.",
        solutionSummary: "A web/mobile platform offering AI-simulated technical and behavioral interviews with instant, actionable feedback powered by large language models.",
        customerPersonas: [
            { name: "Alex — CS Senior", description: "Computer Science major preparing for FAANG interviews. Needs algorithmic practice with realistic pressure.", demographic: "21-23, University Student" },
            { name: "Maya — Bootcamp Grad", description: "Career-switcher from marketing. Needs behavioral and portfolio-walkthrough practice.", demographic: "26-32, Career Changer" },
            { name: "Raj — International Student", description: "Strong technical skills but needs help with English communication and cultural norms in US interviews.", demographic: "22-25, International Student" }
        ],
        leanCanvas: {
            problem: "Interview prep is expensive, generic, and inaccessible",
            solution: "AI mock interviews with personalized feedback",
            keyMetrics: "DAU, interviews completed, feedback NPS, conversion rate",
            valueProposition: "Realistic AI interview practice at 1/10th the cost",
            unfairAdvantage: "Proprietary feedback model trained on 50k+ real interviews",
            channels: "University partnerships, LinkedIn, Reddit, TikTok",
            customerSegments: "University students, bootcamp grads, career changers",
            costStructure: "LLM API costs, hosting, engineering team",
            revenueStreams: "Freemium subscriptions, university site licenses"
        },
        uniqueValueProposition: "Realistic AI-driven mock interviews with instant, actionable feedback at a fraction of the cost of human coaching.",
        revenueStrategy: "Freemium model: 3 free interviews/month, $12/mo for unlimited. University bulk licenses at $5/student/semester.",
        marketPositioning: "The most affordable and accessible AI interview coach for students — positioned between free YouTube videos and expensive human coaches."
    },
    branding: {
        startupName: "InterviewAI",
        tagline: "Your personal AI interview coach.",
        brandPersonality: ["Modern", "Professional", "Innovative"],
        logoPrompt: "A sleek, modern logo featuring a stylized speech bubble merged with a neural network node, using deep blue (#0056b3) and white on a clean background.",
        colorPalette: [
            { hex: "#0A1628", name: "Deep Navy", usage: "Primary background" },
            { hex: "#1E90FF", name: "Electric Blue", usage: "Primary accent" },
            { hex: "#00D4AA", name: "Mint Green", usage: "Success / positive" },
            { hex: "#F8F9FA", name: "Cloud White", usage: "Text / light surfaces" },
            { hex: "#FF6B6B", name: "Coral Red", usage: "Alerts / warnings" }
        ],
        typography: {
            primary: "Inter",
            secondary: "JetBrains Mono",
            headingWeight: "700",
            bodyWeight: "400"
        },
        brandGuidelines: "Use clean lines, generous whitespace, and professional imagery. Tone of voice should be encouraging but not patronizing — like a smart friend who happens to be great at interviews."
    },
    product: {
        productRequirementsDocument: "Full PRD available in the product workspace.",
        mvpDefinition: "Web app with email/Google authentication, 5 predefined technical interview scenarios (Arrays, Trees, Graphs, System Design, Behavioral), real-time AI feedback generation, and a personal progress dashboard.",
        userStories: [
            "As a student, I want to take a mock technical interview so I can practice my coding skills under realistic conditions.",
            "As a user, I want to review AI-generated feedback to understand my strengths and weaknesses.",
            "As a returning user, I want to see my progress over time so I feel motivated to keep practicing.",
            "As a free user, I want to try 3 interviews before deciding to subscribe.",
            "As a premium user, I want unlimited interviews and access to advanced analytics."
        ],
        featureBacklog: [
            { feature: "Custom interview scenarios", priority: "High", sprint: "S3" },
            { feature: "Peer-to-peer mock interviews", priority: "Medium", sprint: "S4" },
            { feature: "Resume parsing & tailored questions", priority: "High", sprint: "S3" },
            { feature: "Video response recording", priority: "Low", sprint: "S5" },
            { feature: "Company-specific question banks", priority: "Medium", sprint: "S4" },
            { feature: "Mobile app (iOS/Android)", priority: "High", sprint: "S6" }
        ],
        productRoadmap: {
            q1: "MVP Launch — Core interview engine, auth, feedback",
            q2: "Growth — Custom scenarios, resume parsing, analytics",
            q3: "Scale — Mobile app, peer interviews, enterprise pilot",
            q4: "Enterprise — University site licenses, API, integrations"
        },
        milestones: [
            { name: "Architecture Approved", target: "Week 2", status: "complete" },
            { name: "Core AI Engine", target: "Week 6", status: "in-progress" },
            { name: "Private Alpha", target: "Week 8", status: "pending" },
            { name: "Public Beta", target: "Week 12", status: "pending" },
            { name: "V1 Launch", target: "Week 16", status: "pending" }
        ]
    },
    engineering: {
        recommendedTechStack: {
            frontend: "Next.js 15 + React 19",
            backend: "Node.js + Express 5",
            database: "PostgreSQL via Supabase",
            auth: "Supabase Auth (Email + Google OAuth)",
            ai: "Google Gemini API / OpenAI GPT-4o",
            hosting: "Vercel (FE) + Render (BE)",
            monitoring: "Pino logging + Sentry"
        },
        systemArchitecture: "Client-server architecture with REST API. Frontend SSR via Next.js. Backend stateless Express API connecting to Supabase (DB + Auth) and external AI service. WebSocket for real-time interview streaming.",
        databaseSchema: {
            tables: ["users", "interviews", "questions", "feedback_sessions", "subscriptions", "progress_metrics"],
            relationships: "users → interviews (1:N), interviews → feedback_sessions (1:1), users → subscriptions (1:1)"
        },
        apiOutline: [
            "POST /api/auth/register — Email registration",
            "POST /api/auth/login — Email login",
            "GET  /api/auth/google — OAuth initiation",
            "GET  /api/interviews — List user interviews",
            "POST /api/interviews/start — Begin new interview",
            "POST /api/interviews/:id/respond — Submit answer",
            "GET  /api/interviews/:id/feedback — Get AI feedback",
            "GET  /api/progress — User progress metrics"
        ],
        authenticationStrategy: "Email/Password and Google OAuth via Supabase. JWT tokens for API authentication. Refresh token rotation enabled.",
        deploymentStrategy: "Vercel for Next.js frontend (auto-deploy from main branch). Render for Node.js backend (Docker container). Supabase managed PostgreSQL. GitHub Actions CI/CD pipeline.",
        suggestedFolderStructure: [
            "frontend/ — Next.js app (pages, components, hooks, utils)",
            "backend/ — Express server (routes, middleware, data, public)",
            "shared/ — Shared types and constants",
            "docs/ — Technical documentation",
            ".github/ — CI/CD workflows"
        ]
    },
    projectManagement: {
        initialTaskBoard: {
            todo: ["Setup CI/CD pipeline", "Design system components", "Interview question bank"],
            inProgress: ["Core AI feedback engine", "User authentication flow"],
            review: ["Database schema migration"],
            done: ["Project architecture", "Repository setup", "Supabase provisioning"]
        },
        sprintPlan: [
            { sprint: "Sprint 1 (W1-W2)", focus: "Auth & DB setup, project scaffolding" },
            { sprint: "Sprint 2 (W3-W4)", focus: "Core interview simulation engine" },
            { sprint: "Sprint 3 (W5-W6)", focus: "AI feedback integration & prompt engineering" },
            { sprint: "Sprint 4 (W7-W8)", focus: "Dashboard, analytics, private alpha" }
        ],
        milestones: ["Architecture approved", "Alpha release", "Beta release", "V1 Launch"],
        priorities: [
            { item: "AI feedback accuracy", level: "Critical" },
            { item: "User authentication", level: "High" },
            { item: "Responsive UI", level: "High" },
            { item: "Performance (<2s response)", level: "Medium" },
            { item: "Mobile optimization", level: "Medium" }
        ],
        riskRegister: [
            { risk: "AI response latency >5s", impact: "High", mitigation: "Streaming responses, caching common patterns" },
            { risk: "High LLM API costs", impact: "Medium", mitigation: "Token budgeting, model tiering, caching" },
            { risk: "Low user retention", impact: "High", mitigation: "Gamification, progress tracking, email nudges" },
            { risk: "Supabase rate limits", impact: "Low", mitigation: "Connection pooling, query optimization" }
        ],
        suggestedNextActions: [
            "Review and approve MVP definition",
            "Setup GitHub repositories with branch protection",
            "Provision Supabase project and run initial migration",
            "Create design system in Figma",
            "Write first 10 interview question prompts"
        ]
    }
});

// --- Helper Functions ---

function createSession(userId) {
    const id = crypto.randomUUID();
    const session = {
        id,
        userId,
        createdAt: new Date().toISOString(),
        steps: {},
        status: 'in-progress'
    };
    sessions.set(id, session);
    return session;
}

function getSession(sessionId) {
    return sessions.get(sessionId) || null;
}

function updateSession(sessionId, stepNumber, data) {
    const session = sessions.get(sessionId);
    if (!session) return null;
    session.steps[`step${stepNumber}`] = {
        completedAt: new Date().toISOString(),
        data
    };
    sessions.set(sessionId, session);
    return session;
}

function generateWorkspace(sessionId) {
    const session = sessions.get(sessionId);
    if (!session) return null;

    const workspaceId = crypto.randomUUID();
    // In a real system, this would call an LLM to generate workspace from session data.
    // For now, clone the demo workspace with a new ID.
    const demoData = workspaces.get(DEMO_WORKSPACE_ID);
    const workspace = {
        ...JSON.parse(JSON.stringify(demoData)),
        id: workspaceId,
        sessionId,
        createdAt: new Date().toISOString()
    };
    workspaces.set(workspaceId, workspace);

    session.status = 'completed';
    session.workspaceId = workspaceId;
    sessions.set(sessionId, session);

    return workspace;
}

function getWorkspace(workspaceId) {
    return workspaces.get(workspaceId) || null;
}

function getAllWorkspaces() {
    return Array.from(workspaces.values());
}

module.exports = {
    createSession,
    getSession,
    updateSession,
    generateWorkspace,
    getWorkspace,
    getAllWorkspaces,
    DEMO_WORKSPACE_ID
};
