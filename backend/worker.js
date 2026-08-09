/**
 * worker.js — Cloudflare Workers entry point for the One-Crew API.
 *
 * This is a Hono-based reimplementation of the Express server.js,
 * designed to run natively on Cloudflare Workers. The original
 * server.js is preserved for local Node.js development.
 *
 * Key differences from server.js:
 *   - No filesystem access (no static file serving, no dotenv)
 *   - Environment variables come from Worker bindings (env param)
 *   - Uses Hono instead of Express (Cloudflare-native, same patterns)
 *   - No generateWorkspace import (cross-directory, deferred)
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { createClient } from '@supabase/supabase-js';

// ── Import shared data stores (plain JS, no Express dependency) ──
import store from './data/discoveryStore.js';
import planStore from './data/planStore.js';
import orchestratorService from './services/orchestratorService.js';
import orchestratorBridge from './services/orchestratorBridge.js';

const app = new Hono();

// ── Global Middleware ─────────────────────────────────────────────────────────

app.use('*', logger());

app.use('*', async (c, next) => {
  const corsMiddleware = cors({
    origin: [
      'http://localhost:3000',
      c.env.FRONTEND_URL || 'https://one-crew.pages.dev',
    ],
  });
  return corsMiddleware(c, next);
});

// ── Helper: lazily create Supabase clients per request (uses env bindings) ────

function getSupabase(env) {
  // Mock WebSocket for Supabase compatibility
  if (!globalThis.WebSocket) {
    globalThis.WebSocket = class {
      constructor() {}
      addEventListener() {}
      removeEventListener() {}
    };
  }

  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });

  const supabaseAdmin = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_PROD_SERVICE_ROLE_KEY,
    {
      auth: { persistSession: false },
    }
  );

  return { supabase, supabaseAdmin };
}

// ── Auth Middleware ────────────────────────────────────────────────────────────

async function verifyToken(c, next) {
  const authHeader = c.req.header('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Access denied. No token provided.' }, 401);
  }

  const token = authHeader.split(' ')[1];
  const { supabase } = getSupabase(c.env);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return c.json({ error: 'Invalid or expired session token.' }, 401);
  }

  c.set('user', user);
  await next();
}

// ══════════════════════════════════════════════════════════════════════════════
//  HEALTH CHECK
// ══════════════════════════════════════════════════════════════════════════════

app.get('/api/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date(),
    message: 'One Crew Backend Infrastructure is online.',
  });
});

// ══════════════════════════════════════════════════════════════════════════════
//  AUTHENTICATION ENDPOINTS
// ══════════════════════════════════════════════════════════════════════════════

// 1. Email & Password Registration
app.post('/api/auth/register', async (c) => {
  const { email, password, fullName, onboardingData } = await c.req.json();
  const { supabase, supabaseAdmin } = getSupabase(c.env);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        onboarding_data: onboardingData,
      },
    },
  });

  if (error) return c.json({ error: error.message }, 400);

  // Handle Onboarding Data Insertion
  if (onboardingData && data.user) {
    try {
      const { data: startup, error: startupError } = await supabaseAdmin
        .from('startups')
        .insert({
          user_id: data.user.id,
          name: onboardingData.startupIdea || 'My Startup',
          status: 'onboarding',
        })
        .select()
        .single();

      if (startup && !startupError) {
        const { error: onboardingError } = await supabaseAdmin
          .from('startup_onboarding')
          .insert({
            startup_id: startup.id,
            status: 'completed',
            session_data: onboardingData,
          });

        if (onboardingError) {
          console.error(
            'Failed to insert startup_onboarding during registration:',
            onboardingError
          );
        }
        // NOTE: generateWorkspace call removed — will be added back as separate Worker
      } else if (startupError) {
        console.error(
          'Failed to insert startup during registration:',
          startupError
        );
      }
    } catch (insertionError) {
      console.error('Unexpected error inserting startup data:', insertionError);
    }
  }

  return c.json({ message: 'Registration successful!', data }, 201);
});

// 2. Email & Password Login
app.post('/api/auth/login', async (c) => {
  const { email, password } = await c.req.json();
  const { supabase } = getSupabase(c.env);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return c.json({ error: error.message }, 400);

  return c.json({ message: 'Login successful', session: data.session });
});

// 3. Google OAuth Handshake Initiation
app.get('/api/auth/google', async (c) => {
  const { supabase } = getSupabase(c.env);
  const backendUrl =
    c.env.BACKEND_URL || 'http://localhost:5000';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${backendUrl}/api/auth/callback`,
    },
  });

  if (error) return c.json({ error: error.message }, 400);

  return c.redirect(data.url);
});

// 4. OAuth Handshake Callback
app.get('/api/auth/callback', (c) => {
  const frontendUrl = c.env.FRONTEND_URL || 'http://localhost:3000';
  return c.redirect(frontendUrl);
});

// ══════════════════════════════════════════════════════════════════════════════
//  PROTECTED ENDPOINTS
// ══════════════════════════════════════════════════════════════════════════════

app.get('/api/workspace/summary', verifyToken, (c) => {
  const user = c.get('user');
  return c.json({
    message: 'Access granted to secure workspace metrics.',
    authenticatedUser: {
      id: user.id,
      email: user.email,
    },
    data: {
      companyName: 'One Crew Alpha Test',
      complianceStatus: 'Pending Week 8 Hardcode Schedule',
    },
  });
});

// ══════════════════════════════════════════════════════════════════════════════
//  DISCOVERY ROUTES (ported from routes/discoveryRoutes.js)
// ══════════════════════════════════════════════════════════════════════════════

// Step 1: Startup Discovery
app.post('/api/discovery/analyze', async (c) => {
  const body = await c.req.json();
  const { description, sessionId } = body;

  if (!description || description.trim().length < 20) {
    return c.json(
      {
        success: false,
        error:
          'Please provide a detailed startup description (at least 20 characters).',
      },
      400
    );
  }

  let session;
  if (sessionId) {
    session = store.getSession(sessionId);
    if (!session)
      return c.json({ success: false, error: 'Session not found.' }, 404);
  } else {
    session = store.createSession(body.userId || 'anonymous');
  }

  const extracted = {
    startupSummary: description.substring(0, 200),
    problemStatement:
      'Inferred from description — users face difficulty with ' +
      description.split(' ').slice(0, 5).join(' ') +
      '...',
    proposedSolution:
      'AI-powered platform addressing the described problem.',
    industry: 'Technology',
    productCategory: 'SaaS',
    targetAudience: 'End users described in the pitch',
    coreWorkflow: 'User signs up → uses core feature → receives value',
    mainFeatures: [
      'Core product feature',
      'User dashboard',
      'Notifications',
    ],
    painPoints: [
      'Current alternatives are expensive',
      'Existing solutions lack personalization',
    ],
    productComplexity: 'Medium',
    keywords: description
      .split(' ')
      .filter((w) => w.length > 4)
      .slice(0, 8),
    initialBusinessModelAssumptions: 'Freemium / Subscription',
  };

  const confidenceScores = {
    problemUnderstanding: 0.85,
    targetAudience: 0.7,
    productCategory: 0.9,
    businessModel: 0.65,
    platform: 0.6,
    technicalRequirements: 0.55,
  };

  store.updateSession(session.id, 1, {
    description,
    extracted,
    confidenceScores,
  });

  return c.json({
    success: true,
    sessionId: session.id,
    step: 1,
    extracted,
    confidenceScores,
    message: 'Startup idea analyzed. Proceed to competitive advantage.',
  });
});

// Step 2: Competitive Advantage
app.post('/api/discovery/competitive-advantage', async (c) => {
  const { sessionId, differentiators } = await c.req.json();
  if (!sessionId)
    return c.json({ success: false, error: 'sessionId required.' }, 400);

  const session = store.getSession(sessionId);
  if (!session)
    return c.json({ success: false, error: 'Session not found.' }, 404);

  const generated = {
    uniqueValueProposition:
      differentiators || 'Better, faster, more affordable solution.',
    marketPositioning:
      'Positioned as the modern, accessible alternative.',
    competitiveAdvantages: [
      'AI-powered automation',
      'Lower cost',
      'Better UX',
    ],
    initialCompetitorAssumptions: [
      'Competitor A (legacy)',
      'Competitor B (expensive)',
    ],
    innovationSummary:
      'Leverages latest AI to deliver value that incumbents cannot.',
  };

  store.updateSession(session.id, 2, { differentiators, generated });

  return c.json({ success: true, sessionId, step: 2, generated });
});

// Step 3: MVP Planning
app.post('/api/discovery/mvp', async (c) => {
  const { sessionId, mvpDescription, deferredFeatures } = await c.req.json();
  if (!sessionId)
    return c.json({ success: false, error: 'sessionId required.' }, 400);

  const session = store.getSession(sessionId);
  if (!session)
    return c.json({ success: false, error: 'Session not found.' }, 404);

  const generated = {
    mvpDefinition:
      mvpDescription || 'Core product with essential features only.',
    featurePriorities: [
      'Authentication',
      'Core workflow',
      'Basic dashboard',
    ],
    productBacklog: ['Advanced analytics', 'Integrations', 'Mobile app'],
    userStories: [
      'As a user, I want to sign up easily so I can start using the product.',
      'As a user, I want to complete the core workflow so I get immediate value.',
    ],
    suggestedRoadmap: {
      q1: 'MVP',
      q2: 'Growth features',
      q3: 'Scale',
      q4: 'Enterprise',
    },
    developmentMilestones: ['Alpha (W4)', 'Beta (W8)', 'Launch (W12)'],
  };

  store.updateSession(session.id, 3, {
    mvpDescription,
    deferredFeatures,
    generated,
  });

  return c.json({ success: true, sessionId, step: 3, generated });
});

// Step 4: Startup Identity
app.post('/api/discovery/identity', async (c) => {
  const {
    sessionId,
    startupName,
    hasName,
    brandPersonality,
    preferredColors,
    admiredBrands,
  } = await c.req.json();
  if (!sessionId)
    return c.json({ success: false, error: 'sessionId required.' }, 400);

  const session = store.getSession(sessionId);
  if (!session)
    return c.json({ success: false, error: 'Session not found.' }, 404);

  const generated = {
    brandPersonality: brandPersonality || ['Modern', 'Professional'],
    nameSuggestions: hasName
      ? []
      : ['NovaBuild', 'LaunchPad AI', 'FounderFlow'],
    tagline: 'Build smarter, launch faster.',
    colorPalette: preferredColors || [
      '#1E90FF',
      '#0A1628',
      '#00D4AA',
      '#F8F9FA',
    ],
    typographyRecommendations: {
      primary: 'Inter',
      secondary: 'JetBrains Mono',
    },
    logoPrompt: `A modern, clean logo for "${startupName || 'the startup'}" with geometric shapes and a tech feel.`,
    brandVoice: 'Confident, approachable, knowledgeable.',
  };

  store.updateSession(session.id, 4, {
    startupName,
    hasName,
    brandPersonality,
    preferredColors,
    admiredBrands,
    generated,
  });

  return c.json({ success: true, sessionId, step: 4, generated });
});

// Step 5: Product Configuration
app.post('/api/discovery/product-config', async (c) => {
  const { sessionId, productTypes, targetCustomers, startupStage } =
    await c.req.json();
  if (!sessionId)
    return c.json({ success: false, error: 'sessionId required.' }, 400);

  const session = store.getSession(sessionId);
  if (!session)
    return c.json({ success: false, error: 'Session not found.' }, 404);

  store.updateSession(session.id, 5, {
    productTypes,
    targetCustomers,
    startupStage,
  });

  return c.json({
    success: true,
    sessionId,
    step: 5,
    acknowledged: { productTypes, targetCustomers, startupStage },
  });
});

// Step 6: Technical Preferences
app.post('/api/discovery/tech-preferences', async (c) => {
  const { sessionId, preferredStack, aiFeatures, authentication, database } =
    await c.req.json();
  if (!sessionId)
    return c.json({ success: false, error: 'sessionId required.' }, 400);

  const session = store.getSession(sessionId);
  if (!session)
    return c.json({ success: false, error: 'Session not found.' }, 404);

  const recommendation = {
    stack:
      preferredStack === 'Let OneCrew Decide'
        ? {
            frontend: 'Next.js',
            backend: 'Node.js + Express',
            database: 'PostgreSQL via Supabase',
          }
        : { note: `User prefers: ${preferredStack}` },
    aiIntegration: aiFeatures || 'To be determined',
    authStrategy: authentication || ['Email', 'Google'],
    databaseChoice: database || 'PostgreSQL',
  };

  store.updateSession(session.id, 6, {
    preferredStack,
    aiFeatures,
    authentication,
    database,
    recommendation,
  });

  return c.json({ success: true, sessionId, step: 6, recommendation });
});

// Step 7: Business Model
app.post('/api/discovery/business-model', async (c) => {
  const { sessionId, revenueModel } = await c.req.json();
  if (!sessionId)
    return c.json({ success: false, error: 'sessionId required.' }, 400);

  const session = store.getSession(sessionId);
  if (!session)
    return c.json({ success: false, error: 'Session not found.' }, 404);

  store.updateSession(session.id, 7, { revenueModel });

  return c.json({
    success: true,
    sessionId,
    step: 7,
    acknowledged: { revenueModel: revenueModel || 'Not specified' },
  });
});

// Step 8: Additional Information
app.post('/api/discovery/additional-info', async (c) => {
  const { sessionId, additionalInfo } = await c.req.json();
  if (!sessionId)
    return c.json({ success: false, error: 'sessionId required.' }, 400);

  const session = store.getSession(sessionId);
  if (!session)
    return c.json({ success: false, error: 'Session not found.' }, 404);

  store.updateSession(session.id, 8, { additionalInfo });

  return c.json({
    success: true,
    sessionId,
    step: 8,
    message: 'Additional info captured. Ready to generate workspace.',
  });
});

// Generate Workspace
app.post('/api/discovery/generate-workspace', async (c) => {
  const { sessionId } = await c.req.json();
  if (!sessionId)
    return c.json({ success: false, error: 'sessionId required.' }, 400);

  const workspace = store.generateWorkspace(sessionId);
  if (!workspace) {
    return c.json(
      { success: false, error: 'Session not found or already completed.' },
      404
    );
  }

  return c.json(
    {
      success: true,
      message: 'Startup workspace generated successfully!',
      workspaceId: workspace.id,
      dashboardUrl: `/?workspace=${workspace.id}`,
      workspace,
    },
    201
  );
});

// Get Session Status
app.get('/api/discovery/session/:id', (c) => {
  const session = store.getSession(c.req.param('id'));
  if (!session)
    return c.json({ success: false, error: 'Session not found.' }, 404);

  return c.json({ success: true, session });
});

// ══════════════════════════════════════════════════════════════════════════════
//  DASHBOARD ROUTES (ported from routes/dashboardRoutes.js)
// ══════════════════════════════════════════════════════════════════════════════

app.get('/api/dashboard/workspace/:id', (c) => {
  const workspace = store.getWorkspace(c.req.param('id'));
  if (!workspace)
    return c.json({ success: false, error: 'Workspace not found.' }, 404);

  return c.json({ success: true, data: workspace });
});

app.get('/api/dashboard/overview', (c) => {
  const allWorkspaces = store.getAllWorkspaces();
  return c.json({
    success: true,
    status: 'ONLINE',
    activeAgents: 3,
    pipelineStatus: 'Nominal Stream',
    databaseStatus: 'Connected to Supabase',
    totalWorkspaces: allWorkspaces.length,
    recentWorkspace:
      allWorkspaces.length > 0
        ? allWorkspaces[allWorkspaces.length - 1].id
        : null,
  });
});

app.get('/api/dashboard/business/:id', (c) => {
  const workspace = store.getWorkspace(c.req.param('id'));
  if (!workspace)
    return c.json({ success: false, error: 'Workspace not found.' }, 404);

  return c.json({
    success: true,
    section: 'business',
    data: workspace.business,
  });
});

app.get('/api/dashboard/branding/:id', (c) => {
  const workspace = store.getWorkspace(c.req.param('id'));
  if (!workspace)
    return c.json({ success: false, error: 'Workspace not found.' }, 404);

  return c.json({
    success: true,
    section: 'branding',
    data: workspace.branding,
  });
});

app.get('/api/dashboard/product/:id', (c) => {
  const workspace = store.getWorkspace(c.req.param('id'));
  if (!workspace)
    return c.json({ success: false, error: 'Workspace not found.' }, 404);

  return c.json({
    success: true,
    section: 'product',
    data: workspace.product,
  });
});

app.get('/api/dashboard/engineering/:id', (c) => {
  const workspace = store.getWorkspace(c.req.param('id'));
  if (!workspace)
    return c.json({ success: false, error: 'Workspace not found.' }, 404);

  return c.json({
    success: true,
    section: 'engineering',
    data: workspace.engineering,
  });
});

app.get('/api/dashboard/project-management/:id', (c) => {
  const workspace = store.getWorkspace(c.req.param('id'));
  if (!workspace)
    return c.json({ success: false, error: 'Workspace not found.' }, 404);

  return c.json({
    success: true,
    section: 'projectManagement',
    data: workspace.projectManagement,
  });
});

// ══════════════════════════════════════════════════════════════════════════════
//  ORCHESTRATOR ROUTES (ported from routes/orchestratorRoutes.js)
// ══════════════════════════════════════════════════════════════════════════════

app.post('/api/orchestrator/generate-plan', async (c) => {
  const { workspaceId, timeframe } = await c.req.json();

  if (!workspaceId) {
    return c.json({ success: false, error: 'workspaceId is required.' }, 400);
  }

  const validTimeframes = ['week', 'month'];
  const tf = validTimeframes.includes(timeframe) ? timeframe : 'week';

  const plan = orchestratorService.generatePlan(workspaceId, tf);

  if (!plan) {
    return c.json(
      {
        success: false,
        error: 'Workspace not found or has no project management data.',
      },
      404
    );
  }

  return c.json(
    {
      success: true,
      message: `${tf === 'week' ? 'Weekly' : 'Monthly'} plan generated by Orchestrator Agent.`,
      plan,
    },
    201
  );
});

app.get('/api/orchestrator/plan/:planId', (c) => {
  const plan = planStore.getPlan(c.req.param('planId'));
  if (!plan)
    return c.json({ success: false, error: 'Plan not found.' }, 404);

  return c.json({ success: true, plan });
});

app.get('/api/orchestrator/plans/:workspaceId', (c) => {
  const plans = planStore.getPlansByWorkspace(c.req.param('workspaceId'));

  return c.json({
    success: true,
    workspaceId: c.req.param('workspaceId'),
    totalPlans: plans.length,
    plans,
  });
});

app.get('/api/orchestrator/active-plan/:workspaceId', (c) => {
  const plan = planStore.getActivePlan(c.req.param('workspaceId'));

  if (!plan) {
    return c.json(
      {
        success: false,
        error: 'No active plan found for this workspace. Generate one first.',
      },
      404
    );
  }

  return c.json({ success: true, plan });
});

app.get('/api/orchestrator/daily/:planId', (c) => {
  const date = c.req.query('date') || planStore.todayKey();
  const dailyView = planStore.getDailyView(c.req.param('planId'), date);

  if (!dailyView)
    return c.json({ success: false, error: 'Plan not found.' }, 404);

  return c.json({ success: true, ...dailyView });
});

app.patch('/api/orchestrator/deliverable/:planId/:deliverableId', async (c) => {
  const planId = c.req.param('planId');
  const deliverableId = c.req.param('deliverableId');
  const updates = await c.req.json();

  if (!updates || Object.keys(updates).length === 0) {
    return c.json({ success: false, error: 'No updates provided.' }, 400);
  }

  const validStatuses = [
    'pending',
    'in-progress',
    'completed',
    'rolled-over',
  ];
  if (updates.status && !validStatuses.includes(updates.status)) {
    return c.json(
      {
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      },
      400
    );
  }

  const updated = planStore.updateDeliverable(planId, deliverableId, updates);

  if (!updated) {
    return c.json(
      { success: false, error: 'Plan or deliverable not found.' },
      404
    );
  }

  return c.json({
    success: true,
    message: `Deliverable "${updated.title}" updated.`,
    deliverable: updated,
  });
});

app.post('/api/orchestrator/rollforward/:planId', async (c) => {
  const body = await c.req.json();
  const fromDate = body.fromDate || undefined;

  const result = planStore.rollForwardIncomplete(
    c.req.param('planId'),
    fromDate
  );

  if (!result)
    return c.json({ success: false, error: 'Plan not found.' }, 404);

  return c.json({
    success: true,
    message:
      result.rolledCount > 0
        ? `${result.rolledCount} deliverable(s) rolled from ${result.fromDate} to ${result.toDate}.`
        : `All deliverables for ${result.fromDate} were completed. Nothing to roll forward.`,
    ...result,
  });
});

app.get('/api/orchestrator/progress/:planId', (c) => {
  const overall = planStore.getOverallProgress(c.req.param('planId'));

  if (!overall)
    return c.json({ success: false, error: 'Plan not found.' }, 404);

  const todayProgress = planStore.getDailyProgress(
    c.req.param('planId'),
    planStore.todayKey()
  );

  return c.json({
    success: true,
    overall,
    today: todayProgress,
  });
});

app.get('/api/orchestrator/dashboard/:workspaceId', (c) => {
  const dashboardData = orchestratorService.getDashboardData(
    c.req.param('workspaceId')
  );

  return c.json({
    success: true,
    ...dashboardData,
  });
});

app.post('/api/orchestrator/run', async (c) => {
  const { workspaceId, query } = await c.req.json();

  if (!workspaceId) {
    return c.json({ success: false, error: 'workspaceId is required.' }, 400);
  }
  if (!query || !query.trim()) {
    return c.json({ success: false, error: 'query is required.' }, 400);
  }

  const run = orchestratorBridge.runOrchestration(workspaceId, query.trim());

  if (!run) {
    return c.json(
      {
        success: false,
        error: 'Workspace not found. Cannot run orchestration.',
      },
      404
    );
  }

  return c.json(
    {
      success: true,
      message: 'Orchestration pipeline completed.',
      run,
    },
    201
  );
});

app.get('/api/orchestrator/runs/:workspaceId', (c) => {
  const runs = orchestratorBridge.getOrchestrationHistory(
    c.req.param('workspaceId')
  );

  return c.json({
    success: true,
    workspaceId: c.req.param('workspaceId'),
    totalRuns: runs.length,
    runs,
  });
});

app.get('/api/orchestrator/run/:runId', (c) => {
  const run = orchestratorBridge.getOrchestrationRun(c.req.param('runId'));

  if (!run) {
    return c.json(
      { success: false, error: 'Orchestration run not found.' },
      404
    );
  }

  return c.json({ success: true, run });
});

// ── Default export for Cloudflare Workers ─────────────────────────────────────

export default app;
