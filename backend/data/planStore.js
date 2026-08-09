/**
 * planStore.js — In-memory data store for Orchestrator Agent plans & deliverables.
 * Mirrors the pattern of discoveryStore.js until a real DB layer is wired up.
 */

const crypto = require('crypto');

// In-memory stores
const plans = new Map();

// ─── Helper: Date Utilities ──────────────────────────────────────────────────

/**
 * Returns a date string in YYYY-MM-DD format.
 */
function toDateKey(date) {
    if (typeof date === 'string') {
        // If already YYYY-MM-DD, return as-is
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
        date = new Date(date);
    }
    return date.toISOString().split('T')[0];
}

/**
 * Advances a date by N days, returning a new YYYY-MM-DD string.
 */
function addDays(dateStr, days) {
    const d = new Date(dateStr + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + days);
    return toDateKey(d);
}

/**
 * Returns today's date as YYYY-MM-DD.
 */
function todayKey() {
    return toDateKey(new Date());
}

// ─── Plan CRUD ───────────────────────────────────────────────────────────────

let demoSeeded = false;
function ensureDemoSeeded() {
    if (!demoSeeded) {
        demoSeeded = true;
        seedDemoPlan();
    }
}

/**
 * Creates a new plan with deliverables.
 * @param {string} workspaceId
 * @param {'week'|'month'} timeframe
 * @param {string} name
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate - YYYY-MM-DD
 * @param {Array} deliverables - Pre-built deliverable objects
 * @returns {Object} The created plan
 */
function createPlan(workspaceId, timeframe, name, startDate, endDate, deliverables) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    // Assign IDs to deliverables if they don't have them
    const hydratedDeliverables = deliverables.map(d => ({
        id: d.id || crypto.randomUUID(),
        title: d.title,
        description: d.description || '',
        category: d.category || 'engineering',
        priority: d.priority || 'medium',
        estimatedHours: d.estimatedHours || 2,
        assignedDay: d.assignedDay,
        deadline: d.deadline || endDate,
        status: d.status || 'pending',
        rolledFromDate: null,
        completedAt: null,
        createdAt: now
    }));

    const totalEstimatedHours = hydratedDeliverables.reduce((sum, d) => sum + d.estimatedHours, 0);

    const plan = {
        id,
        workspaceId,
        timeframe,
        name,
        startDate,
        endDate,
        originalEndDate: endDate,
        status: 'active',
        totalEstimatedHours,
        deliverables: hydratedDeliverables,
        extensions: 0, // How many times the plan was extended due to rollover
        createdAt: now,
        updatedAt: now
    };

    // Deactivate any existing active plan for this workspace
    for (const [, existingPlan] of plans) {
        if (existingPlan.workspaceId === workspaceId && existingPlan.status === 'active') {
            existingPlan.status = 'paused';
            existingPlan.updatedAt = now;
        }
    }

    plans.set(id, plan);
    return plan;
}

/**
 * Returns a plan by ID, or null.
 */
function getPlan(planId) {
    ensureDemoSeeded();
    return plans.get(planId) || null;
}

/**
 * Returns all plans belonging to a workspace.
 */
function getPlansByWorkspace(workspaceId) {
    ensureDemoSeeded();
    return Array.from(plans.values()).filter(p => p.workspaceId === workspaceId);
}

/**
 * Returns the currently active plan for a workspace, or null.
 */
function getActivePlan(workspaceId) {
    ensureDemoSeeded();
    for (const [, plan] of plans) {
        if (plan.workspaceId === workspaceId && plan.status === 'active') {
            return plan;
        }
    }
    return null;
}

// ─── Deliverable Management ──────────────────────────────────────────────────

/**
 * Updates a deliverable within a plan.
 * Supports: status changes, marking complete, updating fields.
 */
function updateDeliverable(planId, deliverableId, updates) {
    const plan = plans.get(planId);
    if (!plan) return null;

    const deliverable = plan.deliverables.find(d => d.id === deliverableId);
    if (!deliverable) return null;

    const now = new Date().toISOString();

    // Apply allowed updates
    if (updates.status) {
        deliverable.status = updates.status;
        if (updates.status === 'completed') {
            deliverable.completedAt = now;
        }
    }
    if (updates.title) deliverable.title = updates.title;
    if (updates.description !== undefined) deliverable.description = updates.description;
    if (updates.estimatedHours) deliverable.estimatedHours = updates.estimatedHours;
    if (updates.priority) deliverable.priority = updates.priority;

    plan.updatedAt = now;
    plans.set(planId, plan);

    return deliverable;
}

// ─── Daily View & Rollover ───────────────────────────────────────────────────

/**
 * Returns all deliverables assigned to a specific day.
 */
function getDailyView(planId, date) {
    const plan = plans.get(planId);
    if (!plan) return null;

    const dateKey = toDateKey(date || new Date());
    const dayDeliverables = plan.deliverables.filter(d => d.assignedDay === dateKey);

    const completed = dayDeliverables.filter(d => d.status === 'completed').length;
    const total = dayDeliverables.length;
    const totalHours = dayDeliverables.reduce((sum, d) => sum + d.estimatedHours, 0);
    const completedHours = dayDeliverables
        .filter(d => d.status === 'completed')
        .reduce((sum, d) => sum + d.estimatedHours, 0);

    return {
        date: dateKey,
        deliverables: dayDeliverables,
        summary: {
            total,
            completed,
            remaining: total - completed,
            completionPercent: total > 0 ? Math.round((completed / total) * 100) : 100,
            totalHours,
            completedHours,
            remainingHours: totalHours - completedHours
        }
    };
}

/**
 * Rolls forward all incomplete deliverables from `fromDate` to the next day.
 * If rollover extends past plan.endDate, the plan end date is pushed forward.
 * Returns an object with the rolled items and any plan extensions.
 */
function rollForwardIncomplete(planId, fromDate) {
    const plan = plans.get(planId);
    if (!plan) return null;

    const fromKey = toDateKey(fromDate || addDays(todayKey(), -1));
    const toKey = addDays(fromKey, 1);
    const now = new Date().toISOString();

    const rolledItems = [];

    for (const d of plan.deliverables) {
        if (d.assignedDay === fromKey && d.status !== 'completed') {
            d.status = 'rolled-over';
            d.rolledFromDate = fromKey;
            d.assignedDay = toKey;
            rolledItems.push(d);
        }
    }

    // Check if we need to extend the plan
    let extended = false;
    if (toKey > plan.endDate && rolledItems.length > 0) {
        plan.endDate = toKey;
        plan.extensions += 1;
        extended = true;
    }

    plan.updatedAt = now;
    plans.set(planId, plan);

    return {
        fromDate: fromKey,
        toDate: toKey,
        rolledCount: rolledItems.length,
        rolledItems,
        planExtended: extended,
        newEndDate: plan.endDate
    };
}

// ─── Progress Calculation ────────────────────────────────────────────────────

/**
 * Calculates daily progress for a given date.
 */
function getDailyProgress(planId, date) {
    const view = getDailyView(planId, date);
    if (!view) return null;
    return view.summary;
}

/**
 * Calculates overall plan progress across all deliverables.
 */
function getOverallProgress(planId) {
    const plan = plans.get(planId);
    if (!plan) return null;

    const total = plan.deliverables.length;
    const completed = plan.deliverables.filter(d => d.status === 'completed').length;
    const inProgress = plan.deliverables.filter(d => d.status === 'in-progress').length;
    const rolledOver = plan.deliverables.filter(d => d.status === 'rolled-over').length;
    const pending = plan.deliverables.filter(d => d.status === 'pending').length;

    const totalHours = plan.deliverables.reduce((sum, d) => sum + d.estimatedHours, 0);
    const completedHours = plan.deliverables
        .filter(d => d.status === 'completed')
        .reduce((sum, d) => sum + d.estimatedHours, 0);

    // Days tracking
    const today = todayKey();
    const daysElapsed = Math.max(0, Math.ceil(
        (new Date(today + 'T00:00:00Z') - new Date(plan.startDate + 'T00:00:00Z')) / (1000 * 60 * 60 * 24)
    ));
    const totalDays = Math.ceil(
        (new Date(plan.endDate + 'T00:00:00Z') - new Date(plan.startDate + 'T00:00:00Z')) / (1000 * 60 * 60 * 24)
    ) + 1;

    return {
        planId: plan.id,
        planName: plan.name,
        status: plan.status,
        timeframe: plan.timeframe,
        startDate: plan.startDate,
        endDate: plan.endDate,
        originalEndDate: plan.originalEndDate,
        extensions: plan.extensions,
        deliverables: {
            total,
            completed,
            inProgress,
            rolledOver,
            pending,
            completionPercent: total > 0 ? Math.round((completed / total) * 100) : 100
        },
        hours: {
            total: totalHours,
            completed: completedHours,
            remaining: totalHours - completedHours,
            completionPercent: totalHours > 0 ? Math.round((completedHours / totalHours) * 100) : 100
        },
        days: {
            elapsed: daysElapsed,
            total: totalDays,
            remaining: Math.max(0, totalDays - daysElapsed)
        }
    };
}

// ─── Seed Demo Plan ──────────────────────────────────────────────────────────

function seedDemoPlan() {
    const today = todayKey();
    const startDate = today;

    // Build a realistic 7-day plan based on the demo workspace's project management data
    const deliverables = [
        // Day 1 — today
        { title: 'Setup CI/CD pipeline', description: 'Configure GitHub Actions for automated testing and deployment', category: 'engineering', priority: 'high', estimatedHours: 3, assignedDay: today, deadline: addDays(today, 6) },
        { title: 'Design system components', description: 'Create reusable UI component library with brand tokens', category: 'design', priority: 'high', estimatedHours: 3, assignedDay: today, deadline: addDays(today, 6) },

        // Day 2
        { title: 'Core AI feedback engine — Phase 1', description: 'Implement the base LLM integration for interview feedback generation', category: 'engineering', priority: 'critical', estimatedHours: 4, assignedDay: addDays(today, 1), deadline: addDays(today, 6) },
        { title: 'User authentication flow — Frontend', description: 'Build the login/signup UI with email and Google OAuth', category: 'engineering', priority: 'high', estimatedHours: 2, assignedDay: addDays(today, 1), deadline: addDays(today, 3) },

        // Day 3
        { title: 'Core AI feedback engine — Phase 2', description: 'Add prompt engineering for behavioral and technical interviews', category: 'engineering', priority: 'critical', estimatedHours: 4, assignedDay: addDays(today, 2), deadline: addDays(today, 6) },
        { title: 'Database schema migration', description: 'Review and finalize the Supabase migration for interviews and feedback tables', category: 'engineering', priority: 'high', estimatedHours: 2, assignedDay: addDays(today, 2), deadline: addDays(today, 4) },

        // Day 4
        { title: 'Interview question bank — initial set', description: 'Write the first 10 interview question prompts (5 technical, 5 behavioral)', category: 'product', priority: 'high', estimatedHours: 3, assignedDay: addDays(today, 3), deadline: addDays(today, 5) },
        { title: 'User progress dashboard', description: 'Build the progress tracking UI showing completed interviews and improvement trends', category: 'engineering', priority: 'medium', estimatedHours: 3, assignedDay: addDays(today, 3), deadline: addDays(today, 6) },

        // Day 5
        { title: 'API endpoint testing', description: 'Write and run integration tests for all interview and feedback endpoints', category: 'engineering', priority: 'high', estimatedHours: 3, assignedDay: addDays(today, 4), deadline: addDays(today, 5) },
        { title: 'Lean Canvas review', description: 'Review and refine the business model with updated market research', category: 'business', priority: 'medium', estimatedHours: 2, assignedDay: addDays(today, 4), deadline: addDays(today, 6) },
        { title: 'Performance optimization audit', description: 'Profile API response times and optimize bottlenecks for <2s target', category: 'engineering', priority: 'medium', estimatedHours: 1, assignedDay: addDays(today, 4), deadline: addDays(today, 6) },

        // Day 6
        { title: 'Private Alpha preparation', description: 'Prepare deployment checklist, staging environment, and test accounts', category: 'engineering', priority: 'high', estimatedHours: 3, assignedDay: addDays(today, 5), deadline: addDays(today, 5) },
        { title: 'Customer persona validation', description: 'Reach out to 5 target users for feedback on MVP feature set', category: 'product', priority: 'medium', estimatedHours: 2, assignedDay: addDays(today, 5), deadline: addDays(today, 6) },

        // Day 7
        { title: 'Sprint retrospective & planning', description: 'Review Sprint 1 outcomes and plan Sprint 2 deliverables', category: 'product', priority: 'high', estimatedHours: 2, assignedDay: addDays(today, 6), deadline: addDays(today, 6) },
        { title: 'Documentation update', description: 'Update API docs, README, and technical architecture document', category: 'engineering', priority: 'medium', estimatedHours: 2, assignedDay: addDays(today, 6), deadline: addDays(today, 6) },
        { title: 'Risk register review', description: 'Reassess project risks and update mitigation strategies', category: 'business', priority: 'low', estimatedHours: 1, assignedDay: addDays(today, 6), deadline: addDays(today, 6) }
    ];

    return createPlan('demo', 'week', 'Sprint 1 — Week Plan', startDate, addDays(today, 6), deliverables);
}

// ─── Exports ─────────────────────────────────────────────────────────────────

module.exports = {
    createPlan,
    getPlan,
    getPlansByWorkspace,
    getActivePlan,
    updateDeliverable,
    getDailyView,
    rollForwardIncomplete,
    getDailyProgress,
    getOverallProgress,
    todayKey,
    addDays,
    toDateKey
};
