/// <reference types="node" />
import * as path from "path";

import { WORKSPACE_STRUCTURE } from "./constants";
import { WorkspaceArtifact } from "./types";

const PLACEHOLDER = `> **Status:** Pending generation.

This document will be populated when the corresponding AI agent or workflow is executed.
`;

export function getInitialContent(fileName: string): string {
  const baseName = path.parse(fileName).name.replace(/_/g, " ");

  switch (fileName) {
    // ---------- Foundation ----------
    case "Startup_Overview.md":
      return `# Startup Overview

${PLACEHOLDER}
`;

    case "Startup_Profile.json":
      return JSON.stringify({}, null, 2);

    case "AI_Context.md":
      return `# AI Context

${PLACEHOLDER}
`;

    case "Startup_Goals.md":
      return `# Startup Goals

${PLACEHOLDER}
`;

    // ---------- Business ----------
    case "Business_Strategy.md":
    case "Market_Research.md":
    case "Competitor_Analysis.md":
    case "Customer_Personas.md":
    case "Business_Model.md":
    case "Pricing.md":
    case "KPIs.md":

    // ---------- Product ----------
    case "Product_Vision.md":
    case "PRD.md":
    case "MVP.md":
    case "Features.md":
    case "Roadmap.md":
    case "User_Feedback.md":

    // ---------- Brand ----------
    case "Brand_Identity.md":
    case "Brand_Guidelines.md":
    case "Messaging.md":
    case "Assets.md":

    // ---------- Marketing ----------
    case "GTM_Strategy.md":
    case "Marketing_Plan.md":
    case "Campaigns.md":
    case "Content_Calendar.md":
    case "SEO.md":
    case "Growth_Experiments.md":

    // ---------- Sales ----------
    case "Sales_Strategy.md":
    case "Outreach.md":
    case "CRM_Notes.md":
    case "Partnerships.md":

    // ---------- Execution ----------
    case "OKRs.md":
    case "Milestones.md":
    case "Tasks.md":
    case "Weekly_Progress.md":
    case "Meeting_Notes.md":
    case "Decisions.md":
    case "Risks.md":
    case "Workspace_Notes.md":

    // ---------- Resources ----------
    case "Recommended_Tools.md":
    case "Learning_Resources.md":
    case "Templates.md":
    case "External_Links.md":
    case "Integrations.md":

    // ---------- AI ----------
    case "AI_Memory.md":
    case "Startup_History.md":
    case "Prompt_Context.md":
    case "AI_Rules.md":
      return `# ${baseName}

${PLACEHOLDER}
`;

    default:
      return `# ${baseName}\n`;
  }
}


export function buildWorkspaceArtifacts(
  onboardingData: Record<string, unknown>
): WorkspaceArtifact[] {
  const artifacts: WorkspaceArtifact[] = [];

  for (const [folder, files] of Object.entries(WORKSPACE_STRUCTURE)) {
    for (const file of files) {
      artifacts.push({
        folder,
        artifactId: `${folder}/${file.replace(/\.[^/.]+$/, "").toLowerCase()}`,
        displayName: file,
        content: getInitialContent(file),
      });
    }
  }

  return artifacts;
}