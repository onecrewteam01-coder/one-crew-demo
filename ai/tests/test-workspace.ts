import { generateWorkspace } from "../workspace";

async function main() {
  const workspacePath = await generateWorkspace({
    startupId: "demo-startup",
    onboardingData: {},
  });

  console.log("Workspace created at:", workspacePath);
}

main().catch(console.error);