# PDF Document Generator MCP Provider (`document-generator-mcp`)

Verified integration of **`document-generator-mcp@1.0.9`** as a **Docker-packaged
stdio MCP server** that adds **PDF generation** to the framework. Registers as a
second provider alongside the Office MCP — the orchestration framework
(Planner / Executor / ToolExecutor / ToolRegistry / MCPConnection) stays fully
generic; everything PDF-specific lives in `PdfDocumentResolver`.

**Runtime-verified 2026-07-15** (Docker Desktop, Node 22, SDK 1.29.0): image
built → `docker run -i` MCP handshake → 2 tools discovered → `gerar_documento_pdf`
invoked through the resolver → real `.pdf` on the host mount (valid `%PDF-`) →
filename sanitization confirmed → full framework path (`MCPBootstrap → ToolExecutor
→ resolver → MCPConnection → extractArtifacts`) produces exactly one artifact.

## Execution flow (unchanged from Office MCP)

```
Planner → Executor → ToolExecutor → ToolRegistry
        → ToolArgumentResolver → PdfDocumentResolver
        → MCPConnection → PDF MCP Server (Docker, stdio)
```

## The tool (verified live — do NOT trust the upstream README)

The upstream README does not match the server's real schema. Verified via
`listTools()` against the running server:

| Tool | Params (required\*) |
|------|---------------------|
| `gerar_documento_pdf` | `nome_arquivo`\*, `titulo_documento`\*, `conteudo_principal`\*, `autor` |
| `gerar_documento_word` | + `formato` (`word`/`pdf`/`ambos`), `template` |

**Important:** `gerar_documento_pdf` exposes **no `formato` and no `template`**
parameter (those exist only on the Word tool). `PdfDocumentResolver` is scoped to
`gerar_documento_pdf` only; Word generation stays with the Office MCP.

### Generic → provider argument mapping (in `PdfDocumentResolver`)

| Generic (orchestration) | Provider (`gerar_documento_pdf`) |
|---|---|
| `content` | `conteudo_principal` (required — resolver errors if missing) |
| `fileName` | `nome_arquivo` (required — **sanitized** here; falls back to title, else `document`) |
| `title` | `titulo_documento` (required — falls back to fileName, else `Document`) |
| `author` | `autor` (optional) |

**Filename sanitization is done in the resolver** because the server does NOT
sanitize `nome_arquivo` (verified: it only strips a trailing extension before
`path.join`, so `..`/separators would escape the output dir).

## Setup

### 1. Build the image (pinned to v1.0.9)

```bash
docker build -t one-crew/pdf-docgen:1.0.9 ai/mcp/providers/pdf-docgen/
```

No environment variables, no API keys, no network at runtime.

### 2. Server config (already wired into the bootstrap test configs)

```ts
{
  id: "pdf-docgen",
  name: "PDF Document Generator MCP",
  transport: "stdio",
  command: "docker",
  args: [
    "run", "-i", "--rm",
    "-v", `${HOST_OUTPUT_DIR}:/data/generated_documents`, // absolute host path
    "one-crew/pdf-docgen:1.0.9",
  ],
}
```

The MCP client launches `docker run -i` per connection and speaks MCP over the
container's stdin/stdout. Generated files land in the mounted `output/` dir
(gitignored). The container is removed on disconnect (`--rm`).

## Verification script

[verify-pdf-docgen.ts](verify-pdf-docgen.ts) — standalone (no framework):
connect → discover → generate (via the resolver) → assert a real PDF on the host
mount → prove sanitization.

```bash
npx ts-node ai/mcp/providers/pdf-docgen/verify-pdf-docgen.ts
```

Expected: `✓ PDF MCP provider verified: connect, discover, generate, validate, sanitize.`

## Limitations, notes, and workarounds

1. **Docker required** (per team deployment approach). The daemon must be running.
2. **Returned paths are container paths** (`/data/generated_documents/…`); the file
   exists on the host at the mounted `output/` dir. Surfacing artifacts to the UI
   (cloud storage / download URL) is a separate workstream.
3. **Absolute, forward-slashed mount path** on Windows keeps Docker Desktop happy.
4. **PDF styling is plain** (pdfkit) — good for checklists/drafts; branded,
   template-faithful PDFs would need a different approach (e.g. a LibreOffice
   sidecar rendering the Office MCP's docx).
5. **SDK 1.29.0 typing:** `StreamableHTTP`/stdio transports need one `as any` at
   `client.connect` under our strict tsconfig (same as `MCPConnection`).
6. **`gerar_documento_word` with `formato: "ambos"`** (docx+pdf in one call) is a
   possible future enhancement but intentionally out of scope here — this provider
   does PDF only; Word is the Office MCP's job.
7. **Version pinned exactly** (`1.0.9`); review the changelog before bumping.
   Small single-maintainer project.

## What was deliberately NOT changed

- No new architecture layers (no ProviderManager / ToolManager / ConnectionManager).
- No provider-specific logic in Planner or Executor.
- The only framework file touched: `MCPConnection.extractArtifacts()` — extended
  **generically** (scan for any path ending in a known document extension) so it
  handles the PDF server's `"PDF: <path>"` response format, not just the Office
  server's `"saved to <path>"`. Plus a dedupe guard. Both are provider-agnostic.
