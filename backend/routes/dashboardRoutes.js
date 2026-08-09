/**
 * dashboardRoutes.js — API routes serving the generated startup workspace data
 * for the dashboard frontend.
 */

const express = require('express');
const router = express.Router();
const store = require('../data/discoveryStore');

// ── Full Workspace ────────────────────────────────────────────────────────────
// Returns the complete generated workspace with all 5 sections.
router.get('/workspace/:id', (req, res) => {
    const workspace = store.getWorkspace(req.params.id);
    if (!workspace) {
        return res.status(404).json({ success: false, error: 'Workspace not found.' });
    }

    res.status(200).json({ success: true, data: workspace });
});

// ── System Overview ───────────────────────────────────────────────────────────
router.get('/overview', (req, res) => {
    const allWorkspaces = store.getAllWorkspaces();
    res.json({
        success: true,
        status: "ONLINE",
        activeAgents: 3,
        pipelineStatus: "Nominal Stream",
        databaseStatus: "Connected to Supabase",
        totalWorkspaces: allWorkspaces.length,
        recentWorkspace: allWorkspaces.length > 0 ? allWorkspaces[allWorkspaces.length - 1].id : null
    });
});

// ── Business Section ──────────────────────────────────────────────────────────
router.get('/business/:id', (req, res) => {
    const workspace = store.getWorkspace(req.params.id);
    if (!workspace) return res.status(404).json({ success: false, error: 'Workspace not found.' });

    res.status(200).json({ success: true, section: 'business', data: workspace.business });
});

// ── Branding Section ──────────────────────────────────────────────────────────
router.get('/branding/:id', (req, res) => {
    const workspace = store.getWorkspace(req.params.id);
    if (!workspace) return res.status(404).json({ success: false, error: 'Workspace not found.' });

    res.status(200).json({ success: true, section: 'branding', data: workspace.branding });
});

// ── Product Section ───────────────────────────────────────────────────────────
router.get('/product/:id', (req, res) => {
    const workspace = store.getWorkspace(req.params.id);
    if (!workspace) return res.status(404).json({ success: false, error: 'Workspace not found.' });

    res.status(200).json({ success: true, section: 'product', data: workspace.product });
});

// ── Engineering Section ───────────────────────────────────────────────────────
router.get('/engineering/:id', (req, res) => {
    const workspace = store.getWorkspace(req.params.id);
    if (!workspace) return res.status(404).json({ success: false, error: 'Workspace not found.' });

    res.status(200).json({ success: true, section: 'engineering', data: workspace.engineering });
});

// ── Project Management Section ────────────────────────────────────────────────
router.get('/project-management/:id', (req, res) => {
    const workspace = store.getWorkspace(req.params.id);
    if (!workspace) return res.status(404).json({ success: false, error: 'Workspace not found.' });

    res.status(200).json({ success: true, section: 'projectManagement', data: workspace.projectManagement });
});

module.exports = router;
