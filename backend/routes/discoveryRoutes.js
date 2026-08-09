/**
 * discoveryRoutes.js — API routes for the 8-step AI Discovery onboarding flow.
 * Each step accepts founder input and returns AI-extracted/inferred structured data.
 */

const express = require('express');
const router = express.Router();
const store = require('../data/discoveryStore');

// ── Step 1: Startup Discovery ─────────────────────────────────────────────────
// Accepts the founder's startup description and extracts structured insights.
router.post('/analyze', (req, res) => {
    const { description, sessionId } = req.body;

    if (!description || description.trim().length < 20) {
        return res.status(400).json({
            success: false,
            error: 'Please provide a detailed startup description (at least 20 characters).'
        });
    }

    // Create or reuse session
    let session;
    if (sessionId) {
        session = store.getSession(sessionId);
        if (!session) return res.status(404).json({ success: false, error: 'Session not found.' });
    } else {
        session = store.createSession(req.body.userId || 'anonymous');
    }

    // Mock AI extraction — in production this calls an LLM
    const extracted = {
        startupSummary: description.substring(0, 200),
        problemStatement: "Inferred from description — users face difficulty with " + description.split(' ').slice(0, 5).join(' ') + "...",
        proposedSolution: "AI-powered platform addressing the described problem.",
        industry: "Technology",
        productCategory: "SaaS",
        targetAudience: "End users described in the pitch",
        coreWorkflow: "User signs up → uses core feature → receives value",
        mainFeatures: ["Core product feature", "User dashboard", "Notifications"],
        painPoints: ["Current alternatives are expensive", "Existing solutions lack personalization"],
        productComplexity: "Medium",
        keywords: description.split(' ').filter(w => w.length > 4).slice(0, 8),
        initialBusinessModelAssumptions: "Freemium / Subscription"
    };

    const confidenceScores = {
        problemUnderstanding: 0.85,
        targetAudience: 0.70,
        productCategory: 0.90,
        businessModel: 0.65,
        platform: 0.60,
        technicalRequirements: 0.55
    };

    store.updateSession(session.id, 1, { description, extracted, confidenceScores });

    res.status(200).json({
        success: true,
        sessionId: session.id,
        step: 1,
        extracted,
        confidenceScores,
        message: "Startup idea analyzed. Proceed to competitive advantage."
    });
});

// ── Step 2: Competitive Advantage ─────────────────────────────────────────────
router.post('/competitive-advantage', (req, res) => {
    const { sessionId, differentiators } = req.body;
    if (!sessionId) return res.status(400).json({ success: false, error: 'sessionId required.' });

    const session = store.getSession(sessionId);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found.' });

    const generated = {
        uniqueValueProposition: differentiators || "Better, faster, more affordable solution.",
        marketPositioning: "Positioned as the modern, accessible alternative.",
        competitiveAdvantages: ["AI-powered automation", "Lower cost", "Better UX"],
        initialCompetitorAssumptions: ["Competitor A (legacy)", "Competitor B (expensive)"],
        innovationSummary: "Leverages latest AI to deliver value that incumbents cannot."
    };

    store.updateSession(session.id, 2, { differentiators, generated });

    res.status(200).json({ success: true, sessionId, step: 2, generated });
});

// ── Step 3: MVP Planning ──────────────────────────────────────────────────────
router.post('/mvp', (req, res) => {
    const { sessionId, mvpDescription, deferredFeatures } = req.body;
    if (!sessionId) return res.status(400).json({ success: false, error: 'sessionId required.' });

    const session = store.getSession(sessionId);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found.' });

    const generated = {
        mvpDefinition: mvpDescription || "Core product with essential features only.",
        featurePriorities: ["Authentication", "Core workflow", "Basic dashboard"],
        productBacklog: ["Advanced analytics", "Integrations", "Mobile app"],
        userStories: [
            "As a user, I want to sign up easily so I can start using the product.",
            "As a user, I want to complete the core workflow so I get immediate value."
        ],
        suggestedRoadmap: { q1: "MVP", q2: "Growth features", q3: "Scale", q4: "Enterprise" },
        developmentMilestones: ["Alpha (W4)", "Beta (W8)", "Launch (W12)"]
    };

    store.updateSession(session.id, 3, { mvpDescription, deferredFeatures, generated });

    res.status(200).json({ success: true, sessionId, step: 3, generated });
});

// ── Step 4: Startup Identity ──────────────────────────────────────────────────
router.post('/identity', (req, res) => {
    const { sessionId, startupName, hasName, brandPersonality, preferredColors, admiredBrands } = req.body;
    if (!sessionId) return res.status(400).json({ success: false, error: 'sessionId required.' });

    const session = store.getSession(sessionId);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found.' });

    const generated = {
        brandPersonality: brandPersonality || ["Modern", "Professional"],
        nameSuggestions: hasName ? [] : ["NovaBuild", "LaunchPad AI", "FounderFlow"],
        tagline: "Build smarter, launch faster.",
        colorPalette: preferredColors || ["#1E90FF", "#0A1628", "#00D4AA", "#F8F9FA"],
        typographyRecommendations: { primary: "Inter", secondary: "JetBrains Mono" },
        logoPrompt: `A modern, clean logo for "${startupName || 'the startup'}" with geometric shapes and a tech feel.`,
        brandVoice: "Confident, approachable, knowledgeable."
    };

    store.updateSession(session.id, 4, { startupName, hasName, brandPersonality, preferredColors, admiredBrands, generated });

    res.status(200).json({ success: true, sessionId, step: 4, generated });
});

// ── Step 5: Product Configuration ─────────────────────────────────────────────
router.post('/product-config', (req, res) => {
    const { sessionId, productTypes, targetCustomers, startupStage } = req.body;
    if (!sessionId) return res.status(400).json({ success: false, error: 'sessionId required.' });

    const session = store.getSession(sessionId);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found.' });

    store.updateSession(session.id, 5, { productTypes, targetCustomers, startupStage });

    res.status(200).json({
        success: true,
        sessionId,
        step: 5,
        acknowledged: { productTypes, targetCustomers, startupStage }
    });
});

// ── Step 6: Technical Preferences ─────────────────────────────────────────────
router.post('/tech-preferences', (req, res) => {
    const { sessionId, preferredStack, aiFeatures, authentication, database } = req.body;
    if (!sessionId) return res.status(400).json({ success: false, error: 'sessionId required.' });

    const session = store.getSession(sessionId);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found.' });

    const recommendation = {
        stack: preferredStack === 'Let OneCrew Decide' 
            ? { frontend: "Next.js", backend: "Node.js + Express", database: "PostgreSQL via Supabase" }
            : { note: `User prefers: ${preferredStack}` },
        aiIntegration: aiFeatures || "To be determined",
        authStrategy: authentication || ["Email", "Google"],
        databaseChoice: database || "PostgreSQL"
    };

    store.updateSession(session.id, 6, { preferredStack, aiFeatures, authentication, database, recommendation });

    res.status(200).json({ success: true, sessionId, step: 6, recommendation });
});

// ── Step 7: Business Model ────────────────────────────────────────────────────
router.post('/business-model', (req, res) => {
    const { sessionId, revenueModel } = req.body;
    if (!sessionId) return res.status(400).json({ success: false, error: 'sessionId required.' });

    const session = store.getSession(sessionId);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found.' });

    store.updateSession(session.id, 7, { revenueModel });

    res.status(200).json({
        success: true,
        sessionId,
        step: 7,
        acknowledged: { revenueModel: revenueModel || "Not specified" }
    });
});

// ── Step 8: Additional Information ────────────────────────────────────────────
router.post('/additional-info', (req, res) => {
    const { sessionId, additionalInfo } = req.body;
    if (!sessionId) return res.status(400).json({ success: false, error: 'sessionId required.' });

    const session = store.getSession(sessionId);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found.' });

    store.updateSession(session.id, 8, { additionalInfo });

    res.status(200).json({
        success: true,
        sessionId,
        step: 8,
        message: "Additional info captured. Ready to generate workspace."
    });
});

// ── Generate Workspace ────────────────────────────────────────────────────────
// Aggregates all discovery data and produces the complete startup workspace.
router.post('/generate-workspace', (req, res) => {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ success: false, error: 'sessionId required.' });

    const workspace = store.generateWorkspace(sessionId);
    if (!workspace) {
        return res.status(404).json({ success: false, error: 'Session not found or already completed.' });
    }

    res.status(201).json({
        success: true,
        message: "Startup workspace generated successfully!",
        workspaceId: workspace.id,
        dashboardUrl: `/?workspace=${workspace.id}`,
        workspace
    });
});

// ── Get Session Status ────────────────────────────────────────────────────────
router.get('/session/:id', (req, res) => {
    const session = store.getSession(req.params.id);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found.' });

    res.status(200).json({ success: true, session });
});

module.exports = router;
