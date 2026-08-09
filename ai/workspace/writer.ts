import { supabase } from "../db/supabase";
import { WorkspaceArtifact } from "./types";

export async function saveArtifacts(
  startupId: string,
  artifacts: WorkspaceArtifact[]
): Promise<void> {
  const rows = artifacts.map((artifact) => ({
    startup_id: startupId,
    folder: artifact.folder,
    artifact_id: artifact.artifactId,
    display_name: artifact.displayName,
    content: artifact.content,
    previous_content: null,
  }));

  const { error } = await supabase
    .from("startup_artifacts")
    .upsert(rows, {
      onConflict: "startup_id,artifact_id",
    });

  if (error) {
    throw new Error(`Failed to save workspace artifacts: ${error.message}`);
  }
}