// Standalone verification script for the ForLegalAI/mcp-ms-office-documents
// MCP server (the team's Document Generation provider).
//
// Deliberately self-contained: no agent layer, no framework abstractions —
// the generic MCP infrastructure (ToolRegistry / MCPClient) is built by
// another workstream. This script proves, over the official MCP protocol:
//   1. connect     — streamable-HTTP handshake with the running server
//   2. discover    — list the tools the server exposes
//   3. invoke      — call create_word_from_markdown (a real doc-gen tool)
//   4. result      — print what came back (and where the .docx landed)
//
// Prerequisite: the server is running (see ai/mcp/README.md), i.e.
//   http://localhost:8958/mcp is up  (health probes: /healthz, /readyz)
//
// Run:  npx ts-node ai/mcp/verify-office-docs.ts
// Env:  MCP_OFFICE_URL to override the endpoint (default http://localhost:8958/mcp)
//       MCP_OFFICE_API_KEY if the server was started with API_KEY set
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const SERVER_URL = process.env.MCP_OFFICE_URL ?? "http://localhost:8958/mcp";
const API_KEY = process.env.MCP_OFFICE_API_KEY;

const SAMPLE_MARKDOWN = [
  "# GST Registration Checklist",
  "",
  "Proof-of-concept document generated over MCP.",
  "",
  "## Steps",
  "1. Track aggregate turnover monthly.",
  "2. Register on the GSTN portal (Form GST REG-01) before crossing the threshold.",
  "3. Consider voluntary registration if B2B customers need input tax credit.",
  "",
  "| Item | Portal |",
  "| --- | --- |",
  "| GST registration | gst.gov.in |",
  "| DPIIT recognition | startupindia.gov.in |",
].join("\n");

async function main() {
  // 1. CONNECT
  const transport = new StreamableHTTPClientTransport(new URL(SERVER_URL), {
    requestInit: API_KEY
      ? { headers: { Authorization: `Bearer ${API_KEY}` } }
      : {},
  });
  const client = new Client({ name: "one-crew-docgen-verify", version: "1.0.0" });
  // WORKAROUND (documented in README): under this repo's exactOptionalPropertyTypes,
  // SDK 1.29.0's own StreamableHTTPClientTransport type does not satisfy
  // Client.connect's Transport param (sessionId: string|undefined vs sessionId?:).
  // Type-level only — runtime is unaffected.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await client.connect(transport as any);
  console.log(`\n[1/3] connected to ${SERVER_URL}`);
  console.log("      server:", JSON.stringify(client.getServerVersion()));

  try {
    // 2. DISCOVER
    const { tools } = await client.listTools();
    console.log(`\n[2/3] discovered ${tools.length} tools:`);
    for (const t of tools) {
      console.log(`      - ${t.name}: ${(t.description ?? "").split("\n")[0]?.slice(0, 90)}`);
    }

    const docTool = tools.find((t) => t.name === "create_word_from_markdown");
    if (!docTool) {
      throw new Error(
        "create_word_from_markdown not found in tool list — server version mismatch?"
      );
    }

    // 3. INVOKE
    const result = await client.callTool(
      {
        name: "create_word_from_markdown",
        arguments: {
          markdown_content: SAMPLE_MARKDOWN,
          file_name: "mcp-office-poc",
        },
      },
      undefined,
      { timeout: 60_000 }
    );

    // 4. PRINT RESULT
    console.log(`\n[3/3] create_word_from_markdown returned (isError=${result.isError ?? false}):`);
    const content = (result.content ?? []) as Array<{ type: string; text?: string }>;
    for (const c of content) {
      console.log("      ", c.type === "text" ? c.text : JSON.stringify(c));
    }
    if (result.structuredContent) {
      console.log("      structured:", JSON.stringify(result.structuredContent, null, 2));
    }

    if (result.isError) process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error("\nVERIFICATION FAILED:", err instanceof Error ? err.message : err);
  console.error("Is the server running? Check http://localhost:8958/healthz");
  process.exit(1);
});
