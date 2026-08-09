/**
 * orchestratorService.js — The Orchestrator Agent's brain.
 * 
 * Generates structured plans from workspace project management data,
 * distributes deliverables across days with load balancing,
 * and enforces daily rollover rules.
 * 
 * In production, this would call an LLM (Gemini/GPT) to intelligently
 * break down tasks and estimate effort. For now, uses deterministic logic.
 */

const planStore = require('../data/planStore');
const workspaceStore = require('../data/discoveryStore');

const PRODUCTIVE_HOURS_PER_DAY = 6;

// ─── Priority → Estimated Hours Mapping ──────────────────────────────────────

const PRIORITY_HOURS = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1
};

const PRIORITY_ORDER = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3
};

// ─── Plan Generation ─────────────────────────────────────────────────────────

/**
 * Generates a plan from a workspace's project management data.
 * 
 * 1. Reads the workspace's task board, sprint plan, milestones, and priorities
 * 2. Converts them into concrete deliverables with hour estimates
 * 3. Distributes deliverables across days using load-balanced scheduling
 * 
 * @param {string} workspaceId
 * @param {'week'|'month'} timeframe
 * @returns {Object} The generated plan
 */
function generatePlan(workspaceId, timeframe) {
    const workspace = workspaceStore.getWorkspace(workspaceId);
    if (!workspace) return null;

    const pm = workspace.projectManagement;
    if (!pm) return null;

    const today = planStore.todayKey();
    const totalDays = timeframe === 'week' ? 7 : 30;
    const endDate = planStore.addDays(today, totalDays - 1);
    const planName = timeframe === 'week'
        ? `Week Plan — ${formatDateShort(today)} to ${formatDateShort(endDate)}`
        : `Monthly Plan — ${formatDateShort(today)} to ${formatDateShort(endDate)}`;

    // Step 1: Extract raw deliverables from workspace data
    const rawDeliverables = extractDeliverablesFromWorkspace(workspace, timeframe);

    // Step 2: Sort by priority (critical first)
    rawDeliverables.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

    // Step 3: Distribute across days using load balancing
    const scheduledDeliverables = distributeAcrossDays(rawDeliverables, today, totalDays);

    // Step 4: Create the plan in the store
    const plan = planStore.createPlan(
        workspaceId,
        timeframe,
        planName,
        today,
        endDate,
        scheduledDeliverables
    );

    return plan;
}

/**
 * Extracts deliverables from workspace project management, product, and engineering data.
 */
function extractDeliverablesFromWorkspace(workspace, timeframe) {
    const deliverables = [];
    const pm = workspace.projectManagement;

    // 1. From task board — todo and inProgress items
    if (pm.initialTaskBoard) {
        const board = pm.initialTaskBoard;

        (board.todo || []).forEach(task => {
            deliverables.push({
                title: task,
                description: `Task from backlog: ${task}`,
                category: categorizeTask(task),
                priority: 'medium',
                estimatedHours: PRIORITY_HOURS.medium
            });
        });

        (board.inProgress || []).forEach(task => {
            deliverables.push({
                title: task,
                description: `In-progress task: ${task}`,
                category: categorizeTask(task),
                priority: 'high',
                estimatedHours: PRIORITY_HOURS.high
            });
        });

        (board.review || []).forEach(task => {
            deliverables.push({
                title: `Review: ${task}`,
                description: `Code review / approval needed: ${task}`,
                category: categorizeTask(task),
                priority: 'high',
                estimatedHours: 1 // Reviews are typically shorter
            });
        });
    }

    // 2. From sprint plan — focus areas for the relevant sprint(s)
    if (pm.sprintPlan) {
        const sprintsToInclude = timeframe === 'week' ? 1 : 2;
        const sprints = pm.sprintPlan.slice(0, sprintsToInclude);

        sprints.forEach(sprint => {
            deliverables.push({
                title: `Sprint Focus: ${sprint.focus}`,
                description: `Key objective from ${sprint.sprint}`,
                category: categorizeTask(sprint.focus),
                priority: 'critical',
                estimatedHours: PRIORITY_HOURS.critical
            });
        });
    }

    // 3. From priorities — make sure critical/high items are represented
    if (pm.priorities) {
        pm.priorities
            .filter(p => p.level === 'Critical' || p.level === 'High')
            .forEach(p => {
                // Avoid duplicates — check if a similar title already exists
                const exists = deliverables.some(d =>
                    d.title.toLowerCase().includes(p.item.toLowerCase()) ||
                    p.item.toLowerCase().includes(d.title.toLowerCase())
                );
                if (!exists) {
                    deliverables.push({
                        title: `Priority: ${p.item}`,
                        description: `High-priority item requiring attention`,
                        category: categorizeTask(p.item),
                        priority: p.level === 'Critical' ? 'critical' : 'high',
                        estimatedHours: PRIORITY_HOURS[p.level === 'Critical' ? 'critical' : 'high']
                    });
                }
            });
    }

    // 4. From suggested next actions
    if (pm.suggestedNextActions) {
        pm.suggestedNextActions.forEach(action => {
            const exists = deliverables.some(d =>
                d.title.toLowerCase().includes(action.toLowerCase().slice(0, 20))
            );
            if (!exists) {
                deliverables.push({
                    title: action,
                    description: `Suggested action from project plan`,
                    category: categorizeTask(action),
                    priority: 'medium',
                    estimatedHours: PRIORITY_HOURS.medium
                });
            }
        });
    }

    // 5. From product feature backlog — high-priority items for month plans
    if (timeframe === 'month' && workspace.product && workspace.product.featureBacklog) {
        workspace.product.featureBacklog
            .filter(f => f.priority === 'High')
            .forEach(feature => {
                deliverables.push({
                    title: `Feature: ${feature.feature}`,
                    description: `Product feature from backlog (${feature.sprint})`,
                    category: 'product',
                    priority: 'high',
                    estimatedHours: PRIORITY_HOURS.high
                });
            });
    }

    // 6. From risk register — add mitigation tasks
    if (pm.riskRegister) {
        pm.riskRegister
            .filter(r => r.impact === 'High')
            .forEach(risk => {
                deliverables.push({
                    title: `Risk Mitigation: ${risk.risk}`,
                    description: `Mitigation strategy: ${risk.mitigation}`,
                    category: 'engineering',
                    priority: 'medium',
                    estimatedHours: PRIORITY_HOURS.medium
                });
            });
    }

    return deliverables;
}

/**
 * Distributes deliverables across N days, capping at PRODUCTIVE_HOURS_PER_DAY per day.
 * Excess items overflow to subsequent days.
 */
function distributeAcrossDays(deliverables, startDate, totalDays) {
    const dayBuckets = [];
    for (let i = 0; i < totalDays; i++) {
        dayBuckets.push({ date: planStore.addDays(startDate, i), hoursUsed: 0, items: [] });
    }

    for (const d of deliverables) {
        // Find the first day that has capacity
        let placed = false;
        for (const bucket of dayBuckets) {
            if (bucket.hoursUsed + d.estimatedHours <= PRODUCTIVE_HOURS_PER_DAY) {
                bucket.items.push({ ...d, assignedDay: bucket.date, deadline: planStore.addDays(startDate, totalDays - 1) });
                bucket.hoursUsed += d.estimatedHours;
                placed = true;
                break;
            }
        }

        // If no day has full capacity, find the day with the least hours
        if (!placed) {
            const leastLoadedDay = dayBuckets.reduce((min, b) => b.hoursUsed < min.hoursUsed ? b : min, dayBuckets[0]);
            leastLoadedDay.items.push({ ...d, assignedDay: leastLoadedDay.date, deadline: planStore.addDays(startDate, totalDays - 1) });
            leastLoadedDay.hoursUsed += d.estimatedHours;
        }
    }

    // Flatten all items from all buckets
    return dayBuckets.flatMap(b => b.items);
}

// ─── Rollover Enforcement ────────────────────────────────────────────────────

/**
 * Checks yesterday's work and rolls incomplete items forward.
 * Called on-demand (when daily view or rollforward endpoint is hit).
 */
function enforceRollover(planId) {
    const plan = planStore.getPlan(planId);
    if (!plan || plan.status !== 'active') return null;

    const yesterday = planStore.addDays(planStore.todayKey(), -1);

    // Only rollover if yesterday is within the plan date range
    if (yesterday < plan.startDate) return { rolledCount: 0, message: 'Plan has not started yet.' };

    return planStore.rollForwardIncomplete(planId, yesterday);
}

// ─── Dashboard Aggregation ───────────────────────────────────────────────────

/**
 * Builds the unified dashboard view for a workspace.
 * Returns: active plan summary, today's tasks, overall progress, upcoming deadlines.
 */
function getDashboardData(workspaceId) {
    const activePlan = planStore.getActivePlan(workspaceId);

    if (!activePlan) {
        return {
            hasPlan: false,
            message: 'No active plan found. Generate one to get started.',
            workspaceId
        };
    }

    // Auto-enforce rollover when dashboard is viewed
    enforceRollover(activePlan.id);

    const today = planStore.todayKey();
    const dailyView = planStore.getDailyView(activePlan.id, today);
    const overallProgress = planStore.getOverallProgress(activePlan.id);

    // Upcoming deadlines — deliverables due in the next 3 days that aren't completed
    const threeDaysOut = planStore.addDays(today, 3);
    const upcomingDeadlines = activePlan.deliverables
        .filter(d => d.status !== 'completed' && d.deadline >= today && d.deadline <= threeDaysOut)
        .sort((a, b) => a.deadline.localeCompare(b.deadline))
        .slice(0, 5);

    // Recently completed
    const recentlyCompleted = activePlan.deliverables
        .filter(d => d.status === 'completed')
        .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''))
        .slice(0, 5);

    // Items that were rolled over (showing user what slipped)
    const rolledOverItems = activePlan.deliverables
        .filter(d => d.rolledFromDate !== null && d.status !== 'completed');

    return {
        hasPlan: true,
        workspaceId,
        plan: {
            id: activePlan.id,
            name: activePlan.name,
            timeframe: activePlan.timeframe,
            startDate: activePlan.startDate,
            endDate: activePlan.endDate,
            status: activePlan.status,
            wasExtended: activePlan.extensions > 0,
            extensions: activePlan.extensions,
            originalEndDate: activePlan.originalEndDate
        },
        today: dailyView,
        overallProgress,
        upcomingDeadlines,
        recentlyCompleted,
        rolledOverItems,
        orchestratorMessage: generateOrchestratorMessage(dailyView, overallProgress, rolledOverItems)
    };
}

/**
 * Generates a contextual message from the orchestrator based on current state.
 * In production this would be an LLM-generated insight.
 */
function generateOrchestratorMessage(dailyView, overallProgress, rolledOverItems) {
    if (!dailyView || !overallProgress) {
        return "Your orchestrator is ready. Generate a plan to get started.";
    }

    const { completionPercent } = dailyView.summary;
    const rolledCount = rolledOverItems.length;

    if (rolledCount > 3) {
        return `⚠️ You have ${rolledCount} rolled-over items from previous days. Focus on clearing your backlog before taking on new work. You've completed ${overallProgress.deliverables.completionPercent}% of the overall plan.`;
    }

    if (rolledCount > 0) {
        return `📋 ${rolledCount} item${rolledCount > 1 ? 's' : ''} rolled over from previous days. Today you have ${dailyView.summary.total} tasks totaling ${dailyView.summary.totalHours}h. Overall plan is ${overallProgress.deliverables.completionPercent}% complete.`;
    }

    if (completionPercent === 100) {
        return `🎉 All tasks for today are completed! Overall plan progress: ${overallProgress.deliverables.completionPercent}%. Great work — you're on track!`;
    }

    if (completionPercent >= 50) {
        return `💪 Good progress — ${completionPercent}% of today's tasks done. ${dailyView.summary.remaining} task${dailyView.summary.remaining > 1 ? 's' : ''} remaining (${dailyView.summary.remainingHours}h). Keep going!`;
    }

    return `📅 Today's plan: ${dailyView.summary.total} deliverables totaling ${dailyView.summary.totalHours}h. Let's make progress — overall plan is ${overallProgress.deliverables.completionPercent}% complete.`;
}

// ─── Utilities ───────────────────────────────────────────────────────────────

/**
 * Simple heuristic to categorize a task string into a category.
 */
function categorizeTask(taskTitle) {
    const lower = taskTitle.toLowerCase();
    if (lower.includes('design') || lower.includes('ui') || lower.includes('ux') || lower.includes('figma')) return 'design';
    if (lower.includes('business') || lower.includes('revenue') || lower.includes('canvas') || lower.includes('market')) return 'business';
    if (lower.includes('product') || lower.includes('feature') || lower.includes('user stor') || lower.includes('roadmap')) return 'product';
    return 'engineering';
}

/**
 * Formats a YYYY-MM-DD date as "Jul 22" style.
 */
function formatDateShort(dateStr) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const [, m, d] = dateStr.split('-');
    return `${months[parseInt(m, 10) - 1]} ${parseInt(d, 10)}`;
}

// ─── Exports ─────────────────────────────────────────────────────────────────

module.exports = {
    generatePlan,
    enforceRollover,
    getDashboardData,
    PRODUCTIVE_HOURS_PER_DAY
};
