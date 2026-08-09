import "dotenv/config";

import * as path from "path";
import { randomUUID } from "crypto";

import { agentRegistry } from "../agents/base";

import { CEOAgent } from "../agents/ceo/CEOAgent";
import { DEVAgent } from "../agents/developer/DEVAgent";
import { LegalAgent } from "../agents/legal/LegalAgent";

import { MCPBootstrap } from "../mcp/MCPBootstrap";

import type {
  AgentInput,
} from "../contracts";

import type {
  MCPServerConfig,
} from "../mcp";

import { Orchestrator } from "../orchestration";

// -----------------------------------------------------------------------------
// MCP Configuration
// -----------------------------------------------------------------------------

const PDF_OUTPUT_DIR = path
  .resolve(__dirname, "../mcp/providers/pdf-docgen/output")
  .replace(/\\/g, "/");

const configs: MCPServerConfig[] = [
  {
    id: "office",
    name: "Office MCP",
    transport: "http",
    url: "http://localhost:8958/mcp",
  },
  {
    id: "pdf-docgen",
    name: "PDF Document Generator MCP",
    transport: "stdio",

    // Docker-packaged stdio server. Build first:
    //   docker build -t one-crew/pdf-docgen:1.0.9 ai/mcp/providers/pdf-docgen/
    command: "docker",
    args: [
      "run",
      "-i",
      "--rm",
      "-v",
      `${PDF_OUTPUT_DIR}:/data/generated_documents`,
      "one-crew/pdf-docgen:1.0.9",
    ],
  },
];

async function main() {
  console.clear();

  console.log("=".repeat(90));
  console.log("         FULL AI ORCHESTRATION INTEGRATION TEST");
  console.log("=".repeat(90));

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
    `✓ ${bootstrap.registry.size()} MCP tools discovered`
  );

  // ---------------------------------------------------------------------------
  // Create Orchestrator
  // ---------------------------------------------------------------------------

  const orchestrator = new Orchestrator(
    agentRegistry,
    bootstrap.executor
  );

  console.log("✓ Orchestrator ready");

  // ---------------------------------------------------------------------------
  // User Request
  // ---------------------------------------------------------------------------

  const input: AgentInput = {
    requestId: randomUUID(),

    query: `
Create a GDPR compliant login system using Express.js.

Explain the architecture.

Finally generate the complete response as a Microsoft Word document called:

GDPR_Login_System.docx
`.trim(),
  };

  console.log("\n");
  console.log("=".repeat(90));
  console.log("USER REQUEST");
  console.log("=".repeat(90));

  console.log(input.query);

  // ---------------------------------------------------------------------------
  // Execute
  // ---------------------------------------------------------------------------

  console.log("\nExecuting orchestration...\n");

  const start = Date.now();

  const result =
    await orchestrator.execute(input);

  const totalTime =
    Date.now() - start;

  // ---------------------------------------------------------------------------
  // Execution Plan
  // ---------------------------------------------------------------------------

  console.log("\n");
  console.log("=".repeat(90));
  console.log("EXECUTION PLAN");
  console.log("=".repeat(90));

  console.dir(
    result.context.plan,
    {
      depth: null,
    }
  );

  // ---------------------------------------------------------------------------
  // Step Results
  // ---------------------------------------------------------------------------

  console.log("\n");
  console.log("=".repeat(90));
  console.log("STEP RESULTS");
  console.log("=".repeat(90));

  for (const step of result.context.results) {
    console.log("\n------------------------------------------");

    console.log("Executor :", step.executor);
    console.log("Task     :", step.task);
    console.log("Success  :", step.success);
    console.log("Duration :", `${step.durationMs} ms`);

    if (step.error) {
      console.log("Error    :", step.error);
    }

    if ("response" in step.output) {
      console.log("\nAgent Response:\n");

      console.log(step.output.response);
    }

    if ("artifacts" in step.output) {
      console.log("\nGenerated Artifacts:");

      console.dir(
        step.output.artifacts,
        {
          depth: null,
        }
      );

      console.log("\nRaw MCP Result:");

      console.dir(
        step.output.result,
        {
          depth: null,
        }
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Final CEO Response
  // ---------------------------------------------------------------------------

  console.log("\n");
  console.log("=".repeat(90));
  console.log("FINAL CEO RESPONSE");
  console.log("=".repeat(90));

  console.log(result.finalOutput.response);

  // ---------------------------------------------------------------------------
  // Attachments
  // ---------------------------------------------------------------------------

  console.log("\n");
  console.log("=".repeat(90));
  console.log("GENERATED ATTACHMENTS");
  console.log("=".repeat(90));

  if (result.attachments.length === 0) {
    console.log("No generated attachments.");
  } else {
    console.table(result.attachments);
  }

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------

  console.log("\n");
  console.log("=".repeat(90));
  console.log("SUMMARY");
  console.log("=".repeat(90));

  console.table({
    Success: result.finalOutput.success,
    "Execution Steps": result.context.results.length,
    "Generated Files": result.attachments.length,
    "Registered Agents": agentRegistry.list().length,
    "Registered Tools": bootstrap.registry.size(),
    "Total Time (ms)": totalTime,
  });

  await bootstrap.shutdown();

  console.log("\n✓ Full orchestration integration completed.");
}

main().catch(async (error) => {
  console.error("\nIntegration test failed:\n");
  console.error(error);

  process.exit(1);
});