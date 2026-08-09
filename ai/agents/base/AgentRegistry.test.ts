import { agentRegistry } from "./AgentRegistry";
import { CEOAgent } from "../ceo/CEOAgent";

async function main() {
  console.log("===== Agent Registry Test =====\n");

  // Ensure a clean registry for every test run
  agentRegistry.clear();

  // Register CEO Agent
  const ceo = new CEOAgent();
  agentRegistry.register(ceo);

  console.log("Registered Agents:");
  console.log(agentRegistry.list());

  console.log("\nHas CEO?");
  console.log(agentRegistry.has("ceo"));

  console.log("\nRetrieved Agent Metadata:");
  const retrievedAgent = agentRegistry.get("ceo");
  console.log(retrievedAgent.metadata);

  console.log("\nExecuting CEO Agent...\n");

  const result = await retrievedAgent.execute({
    query: "Who are you?",
    requestId: "registry-test-001",
  });

  console.log("Execution Result:");
  console.log(result);

  // Duplicate registration test
  console.log("\n===== Duplicate Registration Test =====");

  try {
    agentRegistry.register(new CEOAgent());
    console.log("❌ Duplicate registration should have failed.");
  } catch (err) {
    console.log("✅ Duplicate registration prevented.");
    console.log(
      err instanceof Error ? err.message : err
    );
  }

  // Unregister test
  console.log("\n===== Unregister Test =====");

  const removed = agentRegistry.unregister("ceo");
  console.log("Removed:", removed);

  console.log("Registry Contents:");
  console.log(agentRegistry.list());

  console.log("\nHas CEO?");
  console.log(agentRegistry.has("ceo"));

  // Retrieval after unregister
  console.log("\n===== Missing Agent Test =====");

  try {
    agentRegistry.get("ceo");
    console.log("❌ Retrieval should have failed.");
  } catch (err) {
    console.log("✅ Missing agent handled correctly.");
    console.log(
      err instanceof Error ? err.message : err
    );
  }

  console.log("\n===== Registry Test Complete =====");
}

main().catch((err) => {
  console.error("Unexpected Test Failure:");
  console.error(err);
});