import * as path from "path";

import { MCPBootstrap } from "../mcp/MCPBootstrap.js";
import type { MCPServerConfig } from "../mcp/contracts/MCPServerConfig.js";

// Host dir mounted into the PDF container's /data/generated_documents.
const PDF_OUTPUT_DIR = path
  .resolve(__dirname, "../mcp/providers/pdf-docgen/output")
  .replace(/\\/g, "/");

const configs: MCPServerConfig[] = [
  {
    id: "office",
    name: "Office MCP",
    transport: "http",

    // Change this if your Office MCP uses another port.
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
  console.log("================================");
  console.log("Starting MCP Bootstrap...");
  console.log("================================");

  const bootstrap = new MCPBootstrap(configs);

  try {
    await bootstrap.initialize();

    console.log("\nDiscovered tools:");

    for (const tool of bootstrap.registry.listMetadata()) {
      console.log(`- ${tool.name}`);
    }

    console.log("\nExecuting Office Tool...\n");

    const result =
      await bootstrap.executor.execute({
        tool: "create_word_from_markdown",
        arguments: {
          content: "# Hello MCP\n\nThis file was generated from One-Crew.",
          fileName: "test.docx",
        },
      });

    console.log("Execution Result:");
    console.dir(result, { depth: null });

    console.log("\nGenerated Artifacts:");
    console.dir(result.artifacts, { depth: null });
  } catch (err) {
    console.error(err);
  } finally {
    await bootstrap.shutdown();
  }
}

main();