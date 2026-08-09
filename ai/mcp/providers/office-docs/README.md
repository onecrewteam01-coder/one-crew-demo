# Document Generation MCP Provider — `mcp-ms-office-documents`

Verified integration of **ForLegalAI/mcp-ms-office-documents v3.20** as an
external MCP server, per the MCP integration proposal (primary pick). Scope is
deliberately **provider-only**: no agent changes, no framework MCP client, no
storage/memory/RAG — the generic MCP infrastructure (ToolRegistry / MCPClient)
registers this server later without changing anything here.

**Runtime-verified 2026-07-09** (Windows, Python 3.13, SDK 1.29.0): server
starts → `/healthz` ok → MCP handshake → 8 tools discovered →
`create_word_from_markdown` invoked → valid `.docx` produced.

## What this server is

- **Python 3** / FastMCP — **there is NO npm/npx option** (the "prefer npm"
  instruction is not satisfiable; see Limitations).
- Transport: **streamable HTTP** at `http://localhost:8958/mcp`
  (NOT stdio — the framework's MCPClient must use
  `StreamableHTTPClientTransport`).
- Health probes: `GET /healthz` → `ok`, `GET /readyz` → `ready`
  (the upstream README says `/health`/`readiness` — that is WRONG for v3.20).
- **Zero mandatory env vars**: defaults to LOCAL output (`output/` dir under
  the server), no auth. All options in [office-docs/.env.example](office-docs/.env.example).

### Tools exposed (verified via `listTools`)

| Tool | Output |
|---|---|
| `create_word_from_markdown` | `.docx` from Markdown (headings, lists, tables, TOC, header/footer) |
| `create_excel_from_markdown` | `.xlsx` from Markdown tables (`## Sheet:` per sheet, formulas) |
| `create_powerpoint_presentation` | `.pptx` from structured slides (4:3 / 16:9) |
| `create_email_draft` | `.eml` HTML email |
| `create_xml_file` | `.xml` |
| *dynamic* (`formal_letter`, …) | One typed tool **per template** in `custom_templates/` + `config/*.yaml` — the "templates become tools" feature from the proposal |

`create_word_from_markdown` args: `markdown_content` (required), optional
`title`, `author`, `subject`, `header_text`, `footer_text`, `include_toc`,
`file_name`. Result: text + `structuredContent.result` containing the saved
file path (LOCAL) or signed URL (cloud strategies).

## Setup

### Option A — Docker (recommended for deployment)

```bash
cd ai/mcp/office-docs
docker compose up -d          # image pinned to georgx22/mcp-office-docs:v3.20
curl http://localhost:8958/healthz    # -> ok
```

Files land in `ai/mcp/office-docs/output/` (gitignored). Optional config:
copy `.env.example` → `.env` (not required to start).

### Option B — from source (no Docker; how we verified it)

```bash
git clone --depth 1 --branch v3.20 https://github.com/ForLegalAI/mcp-ms-office-documents.git
cd mcp-ms-office-documents
python -m venv .venv
.venv/Scripts/pip install -r requirements.txt     # Linux/mac: .venv/bin/pip
.venv/Scripts/python main.py                      # serves 0.0.0.0:8958
```

Confirmed working on Python 3.13. Files land in `<clone>/output/`.

### Client-side dependency (already in root package.json)

```bash
npm install        # provides @modelcontextprotocol/sdk ^1.29.0
```

## Verification script (the PoC deliverable)

[verify-office-docs.ts](verify-office-docs.ts) — standalone, no framework
imports. Connects → lists tools → invokes `create_word_from_markdown` →
prints the result (including the output file path).

```bash
# with the server running (either option above):
npx ts-node ai/mcp/verify-office-docs.ts

# overrides:
#   MCP_OFFICE_URL      (default http://localhost:8958/mcp)
#   MCP_OFFICE_API_KEY  (only if the server was started with API_KEY)
```

Expected output: server version banner, the 8-tool list, and
`Document saved to ...\output\<id>_mcp-office-poc.docx` with `isError=false`.

## Limitations, bugs, and workarounds (read before integrating)

1. **No npm/npx distribution exists.** The server is Python-only; the
   alternatives are Docker (pinned image verified to exist for v3.20) or
   running from source. This was a hard constraint, not a choice.
2. **Upstream docs drift.** The upstream README documents `/health` and
   `/readiness`; v3.20 actually serves **`/healthz`** and **`/readyz`**
   (verified). Trust this file over upstream docs.
3. **Upstream compose file is unpinned** (`georgx22/mcp-office-docs:latest`).
   Ours ([office-docs/docker-compose.yml](office-docs/docker-compose.yml))
   pins `v3.20` per the security policy — review the changelog before bumping.
4. **SDK type friction under our tsconfig.** With
   `exactOptionalPropertyTypes: true`, SDK 1.29.0's
   `StreamableHTTPClientTransport` doesn't type-check against
   `Client.connect` (its `sessionId: string | undefined` vs the interface's
   optional `sessionId?`). Runtime is fine; the script uses one documented
   `as any` cast. The framework MCPClient will hit the same thing.
5. **Startup phones home**: FastMCP checks PyPI for updates on boot (one GET
   to pypi.org). Harmless, but relevant for locked-down deploys.
6. **LOCAL strategy returns server-local paths**, not URLs — fine for the PoC;
   production wants `UPLOAD_STRATEGY=S3|GCS|…` + `SIGNED_URL_EXPIRES_IN`
   (storage integration is explicitly out of this task's scope).
7. **No auth by default.** Set `API_KEY` the moment the server is reachable
   beyond localhost; the client then sends `Authorization: Bearer <key>`
   (the verify script supports `MCP_OFFICE_API_KEY`).
8. **DPDP note for the storage/infra owners:** generated documents contain
   founder data; whichever storage strategy is chosen must be included in the
   user-erasure path.

## History

An earlier iteration of this task integrated the proposal's npm-native
alternate server (`document-generator-mcp@1.0.9`, stdio) end-to-end, including
agent-layer composition. Removed 2026-07-09 when the scope was narrowed to
provider-only for the primary pick (this file's git history has the details;
notable finding preserved for the record: that alternate server does NOT
sanitize `nome_arquivo` — filenames must be sanitized client-side if it is
ever revisited).
