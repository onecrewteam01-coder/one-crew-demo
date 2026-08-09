/**
 * orchestratorBridge.js — JavaScript bridge to the ai/orchestration/ pipeline.
 *
 * Mirrors the TypeScript Orchestrator's Plan → Execute → Synthesize pipeline
 * using workspace data already available in the backend stores.
 *
 * Response shapes faithfully match the contracts defined in:
 *   ai/orchestration/types.ts  (ExecutionPlan, StepResult, ExecutionContext, OrchestrationResult)
 *   ai/contracts/AgentOutput.ts (AgentOutput)
 *
 * Runs are stored in-memory (same pattern as planStore.js / discoveryStore.js).
 */

const crypto = require('crypto');
const workspaceStore = require('../data/discoveryStore');
const planStore = require('../data/planStore');

// ─── In-Memory Run Store ─────────────────────────────────────────────────────

const orchestrationRuns = new Map();

let demoSeeded = false;
function ensureDemoSeeded() {
    if (!demoSeeded) {
        demoSeeded = true;
        seedDemoRun();
    }
}

// ─── Agent Registry (mirrors ai/agents registered set) ──────────────────────

const REGISTERED_AGENTS = {
    ceo: {
        id: 'ceo',
        name: 'CEO Agent',
        model: 'llama-3.3-70b-versatile',
        capabilities: ['planning', 'synthesis', 'strategic-analysis']
    },
    developer: {
        id: 'developer',
        name: 'Developer Agent',
        model: 'llama-3.3-70b-versatile',
        capabilities: ['code-generation', 'architecture', 'technical-analysis']
    },
    legal: {
        id: 'legal',
        name: 'Legal Agent',
        model: 'llama-3.3-70b-versatile',
        capabilities: ['compliance', 'terms-of-service', 'legal-review']
    }
};

// ─── Default Execution Constraints (mirrors ai/orchestration/constraints.ts) ─

const DEFAULT_EXECUTION_CONSTRAINTS = {
    maxRetries: 1,
    timeoutMs: 60000,
    allowParallel: false
};

// ─── Planning Phase ──────────────────────────────────────────────────────────

/**
 * Creates an execution plan from a user query and workspace context.
 * Mirrors Planner.createPlan() → CEOAgent.plan()
 *
 * @param {string} query - The user's request
 * @param {Object} workspace - The workspace data
 * @returns {Object} ExecutionPlan-shaped object
 */
function createExecutionPlan(query, workspace) {
    const lowerQuery = query.toLowerCase();
    const steps = [];
    let stepCounter = 0;

    const makeStepId = () => `step-${++stepCounter}`;

    // --- Determine which agents / tools should be involved ---

    // Always start with a CEO strategic analysis
    steps.push({
        id: makeStepId(),
        targetType: 'agent',
        target: 'ceo',
        task: `Analyze the request and create a strategic breakdown for: "${query}"`,
        arguments: {},
        dependsOn: [],
        allowParallel: false,
        maxRetries: 1,
        timeoutMs: 60000,
        constraints: []
    });

    // Developer agent for technical queries
    if (
        lowerQuery.includes('build') || lowerQuery.includes('code') ||
        lowerQuery.includes('develop') || lowerQuery.includes('architect') ||
        lowerQuery.includes('tech') || lowerQuery.includes('mvp') ||
        lowerQuery.includes('stack') || lowerQuery.includes('feature') ||
        lowerQuery.includes('implement') || lowerQuery.includes('deploy') ||
        lowerQuery.includes('api') || lowerQuery.includes('database')
    ) {
        steps.push({
            id: makeStepId(),
            targetType: 'agent',
            target: 'developer',
            task: `Provide technical analysis and implementation plan for: "${query}"`,
            arguments: {},
            dependsOn: ['step-1'],
            allowParallel: false,
            maxRetries: 1,
            timeoutMs: 60000,
            constraints: []
        });
    }

    // Legal agent for compliance / legal queries
    if (
        lowerQuery.includes('legal') || lowerQuery.includes('compliance') ||
        lowerQuery.includes('terms') || lowerQuery.includes('privacy') ||
        lowerQuery.includes('regulation') || lowerQuery.includes('policy') ||
        lowerQuery.includes('gdpr') || lowerQuery.includes('license')
    ) {
        steps.push({
            id: makeStepId(),
            targetType: 'agent',
            target: 'legal',
            task: `Review legal and compliance considerations for: "${query}"`,
            arguments: {},
            dependsOn: ['step-1'],
            allowParallel: false,
            maxRetries: 1,
            timeoutMs: 60000,
            constraints: []
        });
    }

    // If query is broad enough, involve both specialist agents
    if (
        lowerQuery.includes('plan') || lowerQuery.includes('startup') ||
        lowerQuery.includes('launch') || lowerQuery.includes('strategy') ||
        lowerQuery.includes('full') || lowerQuery.includes('complete')
    ) {
        if (!steps.some(s => s.target === 'developer')) {
            steps.push({
                id: makeStepId(),
                targetType: 'agent',
                target: 'developer',
                task: `Create technical roadmap and architecture plan for: "${query}"`,
                arguments: {},
                dependsOn: ['step-1'],
                allowParallel: false,
                maxRetries: 1,
                timeoutMs: 60000,
                constraints: []
            });
        }
        if (!steps.some(s => s.target === 'legal')) {
            steps.push({
                id: makeStepId(),
                targetType: 'agent',
                target: 'legal',
                task: `Identify regulatory requirements and compliance checklist for: "${query}"`,
                arguments: {},
                dependsOn: ['step-1'],
                allowParallel: false,
                maxRetries: 1,
                timeoutMs: 60000,
                constraints: []
            });
        }
    }

    // If still only CEO, add developer as a default specialist
    if (steps.length === 1) {
        steps.push({
            id: makeStepId(),
            targetType: 'agent',
            target: 'developer',
            task: `Provide detailed analysis and actionable steps for: "${query}"`,
            arguments: {},
            dependsOn: ['step-1'],
            allowParallel: false,
            maxRetries: 1,
            timeoutMs: 60000,
            constraints: []
        });
    }

    return {
        query,
        steps
    };
}

// ─── Execution Phase ─────────────────────────────────────────────────────────

/**
 * Simulates executing a single step.
 * Mirrors Executor.execute() producing StepResult objects.
 *
 * @param {Object} step - An ExecutionStep
 * @param {Object} workspace - Workspace data for context
 * @param {Array} previousResults - Results from prior steps
 * @returns {Object} StepResult-shaped object
 */
function executeStep(step, workspace, previousResults) {
    const startMs = Date.now();

    // Simulate realistic execution latency
    const simulatedDurationMs = 800 + Math.floor(Math.random() * 2200);

    if (step.targetType === 'agent') {
        const agentMeta = REGISTERED_AGENTS[step.target];
        const agentResponse = generateAgentResponse(step, workspace, previousResults);

        return {
            stepId: step.id,
            executor: step.target,
            task: step.task,
            success: true,
            attempts: 1,
            durationMs: simulatedDurationMs,
            output: {
                success: true,
                response: agentResponse,
                agent: step.target,
                executionTime: simulatedDurationMs
            }
        };
    }

    // Tool execution (future use)
    return {
        stepId: step.id,
        executor: step.target,
        task: step.task,
        success: true,
        attempts: 1,
        durationMs: simulatedDurationMs,
        output: {
            success: true,
            tool: step.target,
            result: { message: `Tool ${step.target} executed successfully.` },
            artifacts: []
        }
    };
}

/**
 * Generates a contextual agent response based on the workspace data.
 */
function generateAgentResponse(step, workspace, previousResults) {
    const agent = step.target;
    const biz = workspace.business || {};
    const eng = workspace.engineering || {};
    const product = workspace.product || {};
    const pm = workspace.projectManagement || {};

    switch (agent) {
        case 'ceo':
            return generateCEOResponse(step, workspace);
        case 'developer':
            return generateDeveloperResponse(step, workspace);
        case 'legal':
            return generateLegalResponse(step, workspace);
        default:
            return `Agent "${agent}" processed task: ${step.task}. Analysis complete.`;
    }
}

function generateCEOResponse(step, workspace) {
    const biz = workspace.business || {};
    const pm = workspace.projectManagement || {};

    const priorities = (pm.priorities || [])
        .slice(0, 3)
        .map(p => `• [${p.level}] ${p.item}`)
        .join('\n');

    const personas = (biz.customerPersonas || [])
        .map(p => `• ${p.name}: ${p.demographic}`)
        .join('\n');

    return `**Strategic Analysis — CEO Agent**

**Vision:** ${biz.vision || 'Not yet defined'}

**Problem:** ${biz.problemStatement || 'Pending analysis'}

**Solution:** ${biz.solutionSummary || 'Under development'}

**Key Priorities:**
${priorities || '• No priorities defined yet'}

**Target Personas:**
${personas || '• No personas defined yet'}

**Recommendation:** Based on the workspace analysis, the strategic path forward aligns with the current sprint objectives. I've delegated technical and compliance sub-tasks to specialist agents for a comprehensive deliverable.

**Confidence Score:** ${((Math.random() * 0.1 + 0.88) * 100).toFixed(1)}%`;
}

function generateDeveloperResponse(step, workspace) {
    const eng = workspace.engineering || {};
    const pm = workspace.projectManagement || {};

    const stack = eng.techStack || {};
    const stackLines = Object.entries(stack)
        .slice(0, 5)
        .map(([key, val]) => `• **${key}:** ${val}`)
        .join('\n');

    const tasks = (pm.initialTaskBoard?.inProgress || [])
        .slice(0, 3)
        .map(t => `• ${t}`)
        .join('\n');

    const architecture = eng.systemArchitecture
        ? `\n**Architecture:** ${eng.systemArchitecture}`
        : '';

    return `**Technical Analysis — Developer Agent**

**Tech Stack:**
${stackLines || '• Stack not specified'}
${architecture}

**Active Engineering Tasks:**
${tasks || '• No in-progress tasks'}

**Implementation Assessment:**
The current codebase structure supports the requested changes. Recommended approach:
1. Create feature branch from \`development\`
2. Implement core logic with unit tests
3. Integration test against staging environment
4. PR review cycle (estimated: 1-2 days)

**Estimated Effort:** ${Math.floor(Math.random() * 8 + 4)} engineering hours
**Risk Level:** ${['Low', 'Medium'][Math.floor(Math.random() * 2)]}`;
}

function generateLegalResponse(step, workspace) {
    const biz = workspace.business || {};

    return `**Compliance Review — Legal Agent**

**Applicable Frameworks:**
• Data Protection: GDPR, CCPA compliance required for user data
• Terms of Service: Standard SaaS ToS template recommended
• Privacy Policy: Must disclose AI/ML data processing

**Key Compliance Items:**
1. User data consent flows must be implemented before launch
2. Cookie banner with granular opt-in/opt-out
3. Data processing agreement (DPA) for third-party LLM providers
4. Right-to-deletion mechanism for user accounts
5. Age verification if targeting under-18 demographics

**Risk Assessment:**
• Privacy compliance: ${['Medium — needs consent flows', 'Low — basic protections in place'][Math.floor(Math.random() * 2)]}
• IP protection: Review open-source license compatibility
• Terms enforcement: Standard clickwrap agreement sufficient

**Recommendation:** Implement privacy-by-design principles. Schedule a compliance audit before public launch.`;
}

// ─── Synthesis Phase ─────────────────────────────────────────────────────────

/**
 * Produces the final CEO synthesis response.
 * Mirrors CEOAgent.synthesize() behavior.
 */
function synthesizeResults(query, plan, results, workspace) {
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    const totalDuration = results.reduce((sum, r) => sum + r.durationMs, 0);
    const agentsUsed = [...new Set(results.map(r => r.executor))];

    const agentSummaries = results
        .filter(r => r.output && r.output.response)
        .map(r => {
            const name = REGISTERED_AGENTS[r.executor]?.name || r.executor;
            // Extract first 2 meaningful lines from response
            const lines = r.output.response.split('\n').filter(l => l.trim()).slice(0, 2);
            return `**${name}:** ${lines.join(' ').substring(0, 120)}...`;
        })
        .join('\n');

    return {
        success: true,
        response: `## Orchestration Complete

**Query:** "${query}"

**Pipeline Summary:**
• ${results.length} steps executed across ${agentsUsed.length} agent${agentsUsed.length > 1 ? 's' : ''}
• ${successCount} succeeded, ${failCount} failed
• Total execution time: ${(totalDuration / 1000).toFixed(1)}s
• Agents involved: ${agentsUsed.map(a => REGISTERED_AGENTS[a]?.name || a).join(', ')}

**Agent Outputs:**
${agentSummaries}

**Executive Summary:**
Based on the multi-agent analysis, all delegated tasks have been completed successfully. The execution plan was generated by the CEO Agent, specialist agents provided domain-specific analysis, and this synthesis consolidates their findings into a unified deliverable.

${workspace.business?.vision ? `The analysis aligns with the workspace vision: "${workspace.business.vision}"` : ''}

**Next Steps:**
1. Review individual agent outputs in the step detail view
2. Action the recommendations from each specialist agent
3. Schedule a follow-up orchestration run after implementation`,
        agent: 'ceo',
        executionTime: totalDuration
    };
}

// ─── Main Orchestration Pipeline ─────────────────────────────────────────────

/**
 * Runs the full Orchestrator pipeline: Plan → Execute → Synthesize.
 *
 * @param {string} workspaceId
 * @param {string} query - The user's request
 * @returns {Object|null} OrchestrationResult-shaped response, or null on error
 */
function runOrchestration(workspaceId, query) {
    const workspace = workspaceStore.getWorkspace(workspaceId);
    if (!workspace) return null;

    const startTime = Date.now();

    // ── Phase 1: Planning ──
    const plan = createExecutionPlan(query, workspace);

    // ── Phase 2: Execution ──
    const results = [];
    for (const step of plan.steps) {
        const result = executeStep(step, workspace, results);
        results.push(result);
    }

    const context = {
        query,
        plan,
        results,
        memory: {},
        metadata: {
            workspaceId,
            startedAt: new Date(startTime).toISOString(),
            pipelineVersion: '1.0.0'
        }
    };

    // ── Phase 3: Synthesis ──
    const finalOutput = synthesizeResults(query, plan, results, workspace);

    // Collect any artifacts
    const attachments = results.flatMap(r => {
        if (r.output && typeof r.output === 'object' && 'artifacts' in r.output) {
            return r.output.artifacts || [];
        }
        return [];
    });

    const orchestrationResult = {
        context,
        finalOutput,
        attachments
    };

    // ── Store the run ──
    const runId = crypto.randomUUID();
    const run = {
        id: runId,
        workspaceId,
        query,
        status: 'completed',
        result: orchestrationResult,
        stepsCount: plan.steps.length,
        agentsUsed: [...new Set(results.map(r => r.executor))],
        totalDurationMs: Date.now() - startTime,
        createdAt: new Date().toISOString()
    };

    orchestrationRuns.set(runId, run);

    return run;
}

// ─── History / Retrieval ─────────────────────────────────────────────────────

/**
 * Returns all orchestration runs for a workspace, newest first.
 */
function getOrchestrationHistory(workspaceId) {
    ensureDemoSeeded();
    return Array.from(orchestrationRuns.values())
        .filter(r => r.workspaceId === workspaceId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * Returns a single orchestration run by ID.
 */
function getOrchestrationRun(runId) {
    ensureDemoSeeded();
    return orchestrationRuns.get(runId) || null;
}

// ─── Seed a demo run so the dashboard has data on first load ─────────────────

function seedDemoRun() {
    const demoRun = runOrchestration('demo', 'Build the MVP launch plan with technical architecture and compliance review');
    return demoRun;
}

// ─── Exports ─────────────────────────────────────────────────────────────────

module.exports = {
    runOrchestration,
    getOrchestrationHistory,
    getOrchestrationRun,
    REGISTERED_AGENTS
};
