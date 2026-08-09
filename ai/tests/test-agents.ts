import "dotenv/config";

import { randomUUID } from "crypto";

import { agentRegistry } from "../agents/base";

import { CEOAgent } from "../agents/ceo/CEOAgent";
import { DEVAgent } from "../agents/developer/DEVAgent";
import { LegalAgent } from "../agents/legal/LegalAgent";

import { MCPBootstrap } from "../mcp/MCPBootstrap";

import type { AgentInput } from "../contracts";
import type { MCPServerConfig } from "../mcp";

import { Orchestrator } from "../orchestration";

// -----------------------------------------------------------------------------
// Office MCP Configuration
// -----------------------------------------------------------------------------

const configs: MCPServerConfig[] = [
  {
    id: "office",
    name: "Office MCP",
    transport: "http",
    url: "http://localhost:8958/mcp",
  },
];

async function main() {
  console.clear();

  console.log("=".repeat(80));
  console.log("           AGENT ORCHESTRATION TEST");
  console.log("=".repeat(80));

  // ---------------------------------------------------------------------------
  // Register Agents
  // ---------------------------------------------------------------------------

  console.log("\nRegistering agents...\n");

  agentRegistry.clear();

  const ceo = new CEOAgent();
  const developer = new DEVAgent();
  const legal = new LegalAgent();

  agentRegistry.register(ceo);
  agentRegistry.register(developer);
  agentRegistry.register(legal);

  console.table(agentRegistry.list());

  // ---------------------------------------------------------------------------
  // Bootstrap MCP
  // ---------------------------------------------------------------------------

  console.log("\nBootstrapping MCP...\n");

  const bootstrap = new MCPBootstrap(configs);

  await bootstrap.initialize();

  console.log(
    `✓ ${bootstrap.registry.size()} tools discovered`
  );

  // ---------------------------------------------------------------------------
  // Create Orchestrator
  // ---------------------------------------------------------------------------

  const orchestrator = new Orchestrator(
    agentRegistry,
    bootstrap.executor
  );

  // ---------------------------------------------------------------------------
  // Agent-only request
  // ---------------------------------------------------------------------------

  const input: AgentInput = {
    requestId: randomUUID(),
    query:
      "Explain the OWASP Top 10 and recommend secure coding practices for a Node.js backend. Do not generate any document.",
  };

  console.log("\n");
  console.log("=".repeat(80));
  console.log("USER REQUEST");
  console.log("=".repeat(80));

  console.log(input.query);

  console.log("\nExecuting...\n");

  const start = Date.now();

  const result =
    await orchestrator.execute(input);

  const totalTime =
    Date.now() - start;

  // ---------------------------------------------------------------------------
  // Plan
  // ---------------------------------------------------------------------------

  console.log("\n");
  console.log("=".repeat(80));
  console.log("EXECUTION PLAN");
  console.log("=".repeat(80));

  console.dir(result.context.plan, {
    depth: null,
  });

  // ---------------------------------------------------------------------------
  // Step Results
  // ---------------------------------------------------------------------------

  console.log("\n");
  console.log("=".repeat(80));
  console.log("STEP RESULTS");
  console.log("=".repeat(80));

  for (const step of result.context.results) {
    console.log("\n----------------------------------------");

    console.log("Executor :", step.executor);
    console.log("Task     :", step.task);
    console.log("Success  :", step.success);
    console.log("Duration :", `${step.durationMs} ms`);

    if ("response" in step.output) {
      console.log("\nResponse:\n");
      console.log(step.output.response);
    }

    if ("artifacts" in step.output) {
      console.log("\nArtifacts:");
      console.dir(step.output.artifacts, {
        depth: null,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Final Response
  // ---------------------------------------------------------------------------

  console.log("\n");
  console.log("=".repeat(80));
  console.log("FINAL CEO RESPONSE");
  console.log("=".repeat(80));

  console.log(result.finalOutput.response);

  // ---------------------------------------------------------------------------
  // Attachments
  // ---------------------------------------------------------------------------

  console.log("\n");
  console.log("=".repeat(80));
  console.log("ATTACHMENTS");
  console.log("=".repeat(80));

  console.dir(result.attachments, {
    depth: null,
  });

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------

  console.log("\n");
  console.log("=".repeat(80));
  console.log("SUMMARY");
  console.log("=".repeat(80));

  console.table({
    Success: result.finalOutput.success,
    Steps: result.context.results.length,
    Attachments: result.attachments.length,
    "Total Time (ms)": totalTime,
  });

  await bootstrap.shutdown();

  console.log("\n✓ Agent orchestration test completed.");
}

main().catch(async (error) => {
  console.error(error);
  process.exit(1);
});