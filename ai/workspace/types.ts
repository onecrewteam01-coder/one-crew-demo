export interface WorkspaceArtifact {
  folder: string;
  artifactId: string;
  displayName: string;
  content: string;
}

export interface WorkspaceGenerationInput {
  startupId: string;
  onboardingData: Record<string, unknown>;
}