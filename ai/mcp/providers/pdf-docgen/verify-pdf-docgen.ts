// Standalone verification script for the PDF Document Generator MCP provider
// (document-generator-mcp), packaged as a Docker image.
//
// Self-contained: no agent layer, no framework orchestration. It proves, over
// the official MCP protocol, that:
//   1. connect       — Docker stdio handshake with the pinned image
//   2. discover       — the server exposes gerar_documento_pdf with the schema
//                       our PdfDocumentResolver targets
//   3. invoke         — generate a PDF from sample content
//   4. artifact       — the file exists on the host mount AND is a real PDF
//   5. sanitization   — a malicious file name cannot escape the output dir
//
// Prerequisite: build the image first (see README.md):
//   docker build -t one-crew/pdf-docgen:1.0.9 ai/mcp/providers/pdf-docgen/
//
// Run:  npx ts-node ai/mcp/providers/pdf-docgen/verify-pdf-docgen.ts
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import * as path from "path";
import * as fs from "fs";

import { PdfDocumentResolver } from "../../resolvers/PdfDocumentResolver";

const IMAGE = "one-crew/pdf-docgen:1.0.9";

// Host directory mounted into the container's /data/generated_documents.
// Using an absolute, forward-slashed path keeps Docker Desktop happy on Windows.
const HOST_OUTPUT_DIR = path.resolve(__dirname, "output");
const CONTAINER_OUTPUT_DIR = "/data/generated_documents";

const SAMPLE_MARKDOWN = [
  "# GST Registration Checklist",
  "",
  "Proof-of-concept PDF generated over MCP.",
  "",
  "## Steps",
  "1. Track aggregate turnover monthly.",
  "2. Register on the GSTN portal before crossing the threshold.",
  "3. Consider voluntary registration if B2B customers need input tax credit.",
].join("\n");

/** Map a container output path back to its host mount location. */
function toHostPath(containerPath: string): string {
  const base = containerPath.split(/[\\/]/).pop() ?? "";
  return path.join(HOST_OUTPUT_DIR, base);
}

function dockerArgs(): string[] {
  const mount = `${HOST_OUTPUT_DIR.replace(/\\/g, "/")}:${CONTAINER_OUTPUT_DIR}`;
  return ["run", "-i", "--rm", "-v", mount, IMAGE];
}

async function main() {
  fs.mkdirSync(HOST_OUTPUT_DIR, { recursive: true });

  // 1. CONNECT (Docker stdio)
  const transport = new StdioClientTransport({
    command: "docker",
    args: dockerArgs(),
  });
  const client = new Client({ name: "one-crew-pdf-verify", version: "1.0.0" });
  // SDK 1.29.0 typing workaround (same as MCPConnection).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await client.connect(transport as any);
  console.log(`\n[1/4] connected to ${IMAGE} via Docker stdio`);

  try {
    // 2. DISCOVER
    const { tools } = await client.listTools();
    console.log(`\n[2/4] discovered ${tools.length} tools: ${tools.map((t) => t.name).join(", ")}`);

    const pdfTool = tools.find((t) => t.name === "gerar_documento_pdf");
    if (!pdfTool) {
      throw new Error("gerar_documento_pdf not found — image/schema mismatch?");
    }
    console.log("      gerar_documento_pdf params:", Object.keys((pdfTool.inputSchema as any)?.properties ?? {}).join(", "));

    // 3. INVOKE — arguments produced by the SAME resolver the framework uses,
    //    from GENERIC orchestration arguments (content/title/fileName).
    const resolver = new PdfDocumentResolver();
    const args = resolver.resolve("gerar_documento_pdf", {
      content: SAMPLE_MARKDOWN,
      title: "GST Registration Checklist",
      fileName: "gst-checklist",
    });

    const result = await client.callTool(
      { name: "gerar_documento_pdf", arguments: args },
      undefined,
      { timeout: 60_000 }
    );

    const text = ((result.content ?? []) as Array<{ type: string; text?: string }>)
      .filter((c) => c.type === "text" && typeof c.text === "string")
      .map((c) => c.text as string)
      .join("\n");
    console.log(`\n[3/4] gerar_documento_pdf returned (isError=${result.isError ?? false}):`);
    console.log("     ", text.replace(/\n/g, "\n      "));

    // 4. VALIDATE — real PDF on the host mount (magic bytes), not just a path.
    const containerPath = (text.match(/(?:[A-Za-z]:[\\/]|\/)[^\r\n]*?\.pdf/i) ?? [])[0];
    if (!containerPath) throw new Error("No .pdf path in server response.");
    const hostPath = toHostPath(containerPath.trim());

    if (!fs.existsSync(hostPath)) {
      throw new Error(`PDF not found on host mount at ${hostPath}`);
    }
    const head = fs.readFileSync(hostPath).subarray(0, 5).toString("latin1");
    const isPdf = head.startsWith("%PDF-");
    console.log(`\n[4/4] host file: ${hostPath}`);
    console.log(`      size: ${fs.statSync(hostPath).size} bytes | magic: ${JSON.stringify(head)} | valid PDF: ${isPdf}`);
    if (!isPdf) throw new Error("Generated file is not a valid PDF (bad magic bytes).");

    // 5. SANITIZATION — a traversal filename must stay inside the output dir.
    const evilArgs = resolver.resolve("gerar_documento_pdf", {
      content: "# Sanitization Probe\n\nMust stay inside the mount.",
      title: "Probe",
      fileName: "../../evil-escape",
    });
    console.log(`\n[sanitize] '../../evil-escape' -> nome_arquivo='${evilArgs.nome_arquivo}'`);
    const evil = await client.callTool(
      { name: "gerar_documento_pdf", arguments: evilArgs },
      undefined,
      { timeout: 60_000 }
    );
    const evilText = ((evil.content ?? []) as Array<{ type: string; text?: string }>)
      .map((c) => c.text ?? "")
      .join("\n");
    const evilPath = (evilText.match(/(?:[A-Za-z]:[\\/]|\/)[^\r\n]*?\.pdf/i) ?? [])[0];
    const evilHost = evilPath ? toHostPath(evilPath.trim()) : "";
    const contained =
      !!evilHost &&
      path.resolve(evilHost).startsWith(path.resolve(HOST_OUTPUT_DIR) + path.sep);
    console.log(`[sanitize] file confined to output dir: ${contained}`);
    if (!contained) throw new Error("Sanitization FAILED — file escaped the output dir.");

    console.log("\n✓ PDF MCP provider verified: connect, discover, generate, validate, sanitize.");
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error("\nVERIFICATION FAILED:", err instanceof Error ? err.message : err);
  console.error(`Is the image built? -> docker build -t ${IMAGE} ai/mcp/providers/pdf-docgen/`);
  process.exit(1);
});
