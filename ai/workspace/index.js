'use strict';

/**
 * ai/workspace/index.js
 *
 * Called by backend/server.js:
 *   const { generateWorkspace } = require('../ai/workspace/index.js');
 *
 * Architecture:
 *   Registration → startup → onboarding → generateWorkspace()
 *     → CEO Agent (ceo.yaml system prompt, llama-3.3-70b-versatile)
 *       generates every workspace document
 *     → supabaseAdmin.upsert → startup_artifacts
 *
 * ONLY the CEO agent runs. No other agents are invoked.
 */

require('dotenv').config({
  path: require('path').resolve(__dirname, '../../backend/.env'),
});

const fs   = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const Groq = require('groq-sdk');
const { createClient } = require('@supabase/supabase-js');

// ─── Clients ──────────────────────────────────────────────────────────────────

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PROD_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

// ─── CEO Agent System Prompt (loaded from ceo.yaml) ──────────────────────────
//
// Mirrors the TypeScript loadPrompt() + buildSystemPrompt() pipeline so the
// CEO agent's actual prompt file is used — not a hardcoded string.

function loadCeoSystemPrompt() {
  const filePath = path.join(__dirname, '../prompts/ceo.yaml');
  const raw      = fs.readFileSync(filePath, 'utf8');
  const p        = yaml.load(raw);

  const bullets = (items) =>
    (items ?? []).map((i) => `- ${i}`).join('\n');

  const section = (title, body) => `${title}\n${body}`;

  const parts = [];
  parts.push(`You are ${p.agent.name}.`);
  parts.push(`Role: ${p.agent.role}`);

  if (p.objective?.trim())
    parts.push(section('OBJECTIVE', p.objective.trim()));

  if (p.responsibilities?.length)
    parts.push(section('RESPONSIBILITIES', bullets(p.responsibilities)));

  if (p.capabilities?.length)
    parts.push(section('CAPABILITIES', bullets(p.capabilities)));

  if (p.limitations?.length)
    parts.push(section('LIMITATIONS', bullets(p.limitations)));

  if (p.tone?.style || p.tone?.personality) {
    const lines = [
      p.tone.style       ? `Style: ${p.tone.style}`             : '',
      p.tone.personality ? `Personality: ${p.tone.personality}` : '',
    ].filter(Boolean);
    parts.push(section('TONE', lines.join('\n')));
  }

  if (p.response_guidelines?.length)
    parts.push(section('RESPONSE GUIDELINES', bullets(p.response_guidelines)));

  if (p.dos?.length)   parts.push(section('DO',    bullets(p.dos)));
  if (p.donts?.length) parts.push(section("DON'T", bullets(p.donts)));

  // Append workspace-generation override so the CEO knows its current task
  parts.push(
    'WORKSPACE GENERATION MODE\n' +
    'You are initialising a founder\'s workspace. For each document you are asked to write:\n' +
    '- Output ONLY the Markdown content of that document.\n' +
    '- Do NOT include preamble, apologies, or meta-commentary.\n' +
    '- Be specific, practical, and grounded in the Indian startup ecosystem.\n' +
    '- Use the founder\'s onboarding answers as the sole source of truth.'
  );

  return parts.join('\n\n');
}

// Load once at module initialisation — not on every request
const CEO_SYSTEM_PROMPT = loadCeoSystemPrompt();

// ─── Workspace Structure ──────────────────────────────────────────────────────

const WORKSPACE_STRUCTURE = {
  '01_Foundation': [
    'Startup_Overview.md',
    'AI_Context.md',
    'Startup_Goals.md',
  ],
  '02_Business': [
    'Business_Strategy.md',
    'Market_Research.md',
    'Competitor_Analysis.md',
    'Customer_Personas.md',
    'Business_Model.md',
    'Pricing.md',
    'KPIs.md',
  ],
  '03_Product': [
    'Product_Vision.md',
    'PRD.md',
    'MVP.md',
    'Features.md',
    'Roadmap.md',
    'User_Feedback.md',
  ],
  '04_Brand': [
    'Brand_Identity.md',
    'Brand_Guidelines.md',
    'Messaging.md',
    'Assets.md',
  ],
  '05_Marketing': [
    'GTM_Strategy.md',
    'Marketing_Plan.md',
    'Campaigns.md',
    'Content_Calendar.md',
    'SEO.md',
    'Growth_Experiments.md',
  ],
  '06_Sales': [
    'Sales_Strategy.md',
    'Outreach.md',
    'CRM_Notes.md',
    'Partnerships.md',
  ],
  '07_Execution': [
    'OKRs.md',
    'Milestones.md',
    'Tasks.md',
    'Weekly_Progress.md',
    'Meeting_Notes.md',
    'Decisions.md',
    'Risks.md',
    'Workspace_Notes.md',
  ],
  '08_Resources': [
    'Recommended_Tools.md',
    'Learning_Resources.md',
    'Templates.md',
    'External_Links.md',
    'Integrations.md',
  ],
  '09_AI': [
    'AI_Memory.md',
    'Startup_History.md',
    'Prompt_Context.md',
    'AI_Rules.md',
  ],
};

// ─── Per-document user prompt ─────────────────────────────────────────────────
//
// The CEO agent receives a short, directive task for each document.
// The onboarding data is embedded as context so the CEO can ground every
// recommendation in the founder's actual answers.

function buildUserPrompt(fileName, onboardingData) {
  const docName = fileName.replace(/\.md$/i, '').replace(/_/g, ' ');
  const ctx     = JSON.stringify(onboardingData, null, 2);

  return (
    `Generate the "${docName}" workspace document for this startup.\n\n` +
    `Founder onboarding data:\n${ctx}\n\n` +
    `Write the complete Markdown content for "${docName}" now.`
  );
}

// ─── CEO Agent call ───────────────────────────────────────────────────────────

function getErrorDetails(err) {
  const status = err?.status ?? err?.response?.status ?? null;
  let errorBody = null;

  if (err?.body) {
    errorBody = err.body;
  } else if (err?.response?.body) {
    errorBody = err.response.body;
  } else if (err?.error) {
    errorBody = err.error;
  }

  return { status, errorBody };
}

function isRetryableError(err) {
  const status = err?.status ?? err?.response?.status;
  const code = err?.code ?? err?.cause?.code ?? '';
  const message = `${err?.message ?? ''} ${err?.body?.message ?? ''}`.toLowerCase();

  return (
    status === 429 ||
    (status >= 500 && status < 600) ||
    code === 'ECONNRESET' ||
    code === 'ETIMEDOUT' ||
    code === 'ENOTFOUND' ||
    message.includes('rate limit') ||
    message.includes('timed out') ||
    message.includes('network') ||
    message.includes('econnreset') ||
    message.includes('socket')
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function serializeErrorBody(errorBody) {
  if (!errorBody) return 'none';
  if (typeof errorBody === 'string') return errorBody;
  try {
    return JSON.stringify(errorBody);
  } catch (jsonErr) {
    return String(errorBody);
  }
}

function logDocumentOutcome({ artifactId, displayName, startedAt, endedAt, promptTokens, completionTokens, responseLength, status, errorBody, error, attempts, success }) {
  const errorMessage = error ? String(error.message || error) : 'none';
  console.log(
    `[CEO Agent][Document] artifact_id=${artifactId} display_name=${displayName} started_at=${startedAt} ended_at=${endedAt} attempts=${attempts} prompt_tokens=${promptTokens ?? 'n/a'} completion_tokens=${completionTokens ?? 'n/a'} response_length=${responseLength ?? 'n/a'} status=${status ?? 'n/a'} success=${success} error=${errorMessage} error_body=${serializeErrorBody(errorBody)}`
  );
}

async function ceoGenerate(fileName, onboardingData) {
  const userPrompt = buildUserPrompt(fileName, onboardingData);
  const maxAttempts = 3;
  let lastFailure = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const requestStart = new Date().toISOString();

    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',   // CEO agent model (matches CEOAgent.ts)
        messages: [
          { role: 'system', content: CEO_SYSTEM_PROMPT },
          { role: 'user',   content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens:  1024,
      });

      const content = completion.choices[0]?.message?.content ?? '';
      if (!content.trim()) {
        throw new Error('CEO agent returned empty content');
      }

      return {
        content,
        requestStart,
        requestEnd: new Date().toISOString(),
        promptTokens: completion.usage?.prompt_tokens ?? null,
        completionTokens: completion.usage?.completion_tokens ?? null,
        responseLength: content.length,
        status: 200,
        errorBody: null,
        error: null,
        attempts: attempt,
      };
    } catch (err) {
      const { status, errorBody } = getErrorDetails(err);
      const requestEnd = new Date().toISOString();
      const shouldRetry = attempt < maxAttempts && isRetryableError(err);

      lastFailure = {
        error: err,
        requestStart,
        requestEnd,
        promptTokens: null,
        completionTokens: null,
        responseLength: 0,
        status,
        errorBody,
        attempts: attempt,
      };

      console.error(
        `[CEO Agent][Attempt] file=${fileName} attempt=${attempt}/${maxAttempts} status=${status ?? 'n/a'} error=${err.message || String(err)}`
      );

      if (shouldRetry) {
        const backoffMs = 500 * (2 ** (attempt - 1));
        console.warn(`[CEO Agent][Retry] file=${fileName} retrying in ${backoffMs}ms`);
        await sleep(backoffMs);
      }
    }
  }

  throw lastFailure;
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * generateWorkspace({ startupId, onboardingData })
 *
 * Invoked by backend/server.js immediately after the startup_onboarding row
 * is created. Routes every document through the CEO agent and upserts the
 * results into startup_artifacts.
 */
async function generateWorkspace({ startupId, onboardingData }) {
  console.log(`[CEO Agent] Starting workspace generation for startup ${startupId}`);

  const rows = [];
  let succeeded = 0;
  let failed = 0;
  let totalLatencyMs = 0;
  let totalOutputLength = 0;

  for (const [folder, files] of Object.entries(WORKSPACE_STRUCTURE)) {
    for (const fileName of files) {
      const artifactId = `${folder}/${fileName.replace(/\.[^/.]+$/, '').toLowerCase()}`;
      const docStartedAt = Date.now();
      const displayName = fileName;

      let content;
      let result;
      try {
        result = await ceoGenerate(fileName, onboardingData);
        content = result.content;
        succeeded += 1;
        console.log(`[CEO Agent] ✓ ${folder}/${fileName}`);
      } catch (err) {
        failed += 1;
        console.error(`[CEO Agent] ✗ ${folder}/${fileName}:`, err?.error?.message || err?.message || 'Unknown error');
        content =
          `# ${fileName.replace(/\.md$/i, '').replace(/_/g, ' ')}\n\n` +
          `_CEO agent failed to generate this document. Please regenerate._\n`;
        result = {
          requestStart: new Date(docStartedAt).toISOString(),
          requestEnd: new Date().toISOString(),
          promptTokens: null,
          completionTokens: null,
          responseLength: content.length,
          status: err?.status ?? null,
          errorBody: err?.errorBody ?? null,
          error: err?.error ?? err,
          attempts: err?.attempts ?? 1,
        };
      }

      const latencyMs = Date.now() - docStartedAt;
      totalLatencyMs += latencyMs;
      totalOutputLength += content.length;

      logDocumentOutcome({
        artifactId,
        displayName,
        startedAt: result?.requestStart ?? new Date(docStartedAt).toISOString(),
        endedAt: result?.requestEnd ?? new Date().toISOString(),
        promptTokens: result?.promptTokens ?? null,
        completionTokens: result?.completionTokens ?? null,
        responseLength: result?.responseLength ?? content.length,
        status: result?.status ?? null,
        errorBody: result?.errorBody ?? null,
        error: result?.error ?? null,
        attempts: result?.attempts ?? 1,
        success: Boolean(result?.content),
      });

      rows.push({
        startup_id:       startupId,
        folder,
        artifact_id:      artifactId,
        display_name:     displayName,
        content,
        previous_content: null,
      });
    }
  }

  // Persist — reuses the existing upsert logic from writer.ts
  const { error } = await supabaseAdmin
    .from('startup_artifacts')
    .upsert(rows, { onConflict: 'startup_id,artifact_id' });

  if (error) {
    throw new Error(`[CEO Agent] Failed to save artifacts: ${error.message}`);
  }

  const averageLatencyMs = rows.length ? Math.round(totalLatencyMs / rows.length) : 0;
  const averageOutputLength = rows.length ? Math.round(totalOutputLength / rows.length) : 0;

  console.log(`[CEO Agent] Documents attempted: ${rows.length}`);
  console.log(`[CEO Agent] Succeeded: ${succeeded}`);
  console.log(`[CEO Agent] Failed: ${failed}`);
  console.log(`[CEO Agent] Average latency: ${averageLatencyMs}ms`);
  console.log(`[CEO Agent] Average output length: ${averageOutputLength}`);

  console.log(
    `[CEO Agent] ✓ Done — ${rows.length} artifacts saved for startup ${startupId}`
  );
}

module.exports = { generateWorkspace };
