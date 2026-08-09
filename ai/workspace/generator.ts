import { WorkspaceGenerationInput, WorkspaceArtifact } from "./types";
import { buildWorkspaceArtifacts } from "./templates";
import { saveArtifacts } from "./writer";

export async function generateWorkspace(
  input: WorkspaceGenerationInput
): Promise<void> {
  const { startupId, onboardingData } = input;

  // Generate all workspace artifacts from onboarding data
  const artifacts: WorkspaceArtifact[] = buildWorkspaceArtifacts(
    onboardingData
  );

  // Persist them into startup_artifacts
  await saveArtifacts(startupId, artifacts);
}