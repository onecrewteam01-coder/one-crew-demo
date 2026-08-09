import { ToolArgumentResolver } from "./ToolArgumentResolver";

/**
 * Translates generic orchestration arguments into the parameter structure
 * expected by the PDF Document Generator MCP server (document-generator-mcp).
 *
 * This resolver only performs argument translation and provider-specific
 * preprocessing (filename sanitization, required-field fallbacks). It does not
 * execute tools or contain orchestration logic — the framework
 * (Planner/Executor/ToolExecutor/ToolRegistry/MCPConnection) stays generic.
 *
 * Parameter names below were verified against the LIVE tool schema exposed by
 * document-generator-mcp@1.0.9 (not the upstream README, which does not match):
 *
 *   gerar_documento_pdf(
 *     nome_arquivo:       string (required)   // filename WITHOUT extension
 *     titulo_documento:   string (required)
 *     conteudo_principal: string (required)   // document body (markdown/text)
 *     autor:              string (optional)
 *   )
 *
 * Note: unlike gerar_documento_word, the PDF tool exposes NO `formato` or
 * `template` parameter — do not forward them.
 */
export class PdfDocumentResolver implements ToolArgumentResolver {
  /**
   * PDF generation tool exposed by the document-generator-mcp server.
   * Scoped to PDF only; Word generation is handled by the Office MCP.
   */
  private static readonly SUPPORTED_TOOLS = new Set([
    "gerar_documento_pdf",
  ]);

  supports(toolName: string): boolean {
    return PdfDocumentResolver.SUPPORTED_TOOLS.has(toolName);
  }

  resolve(
    _toolName: string,
    arguments_: Record<string, unknown>
  ): Record<string, unknown> {
    // Accept both the framework's generic names and, defensively, the provider's
    // own names if a caller already used them.
    const content = this.firstString(
      arguments_.content,
      arguments_.conteudo_principal
    );
    const rawFileName = this.firstString(
      arguments_.fileName,
      arguments_.nome_arquivo
    );
    const title = this.firstString(
      arguments_.title,
      arguments_.titulo_documento
    );
    const author = this.firstString(
      arguments_.author,
      arguments_.autor
    );

    // conteudo_principal is required and cannot be fabricated. Fail here with a
    // clear message instead of letting the server return an opaque schema error.
    if (!content || content.trim().length === 0) {
      throw new Error(
        "PdfDocumentResolver: no document content provided (expected `content`)."
      );
    }

    // nome_arquivo is required. Derive a safe base name from fileName, else the
    // title, else a constant default — always sanitized.
    const nome_arquivo = this.sanitizeFilename(
      rawFileName ?? title ?? "document"
    );

    // titulo_documento is required. Fall back to the (raw) file name, else a
    // constant default, so the server never receives an empty required field.
    const titulo_documento =
      title && title.trim().length > 0
        ? title.trim()
        : rawFileName && rawFileName.trim().length > 0
        ? rawFileName.trim()
        : "Document";

    const resolved: Record<string, unknown> = {
      nome_arquivo,
      titulo_documento,
      conteudo_principal: content,
    };

    if (author && author.trim().length > 0) {
      resolved.autor = author.trim();
    }

    return resolved;
  }

  /**
   * Provider-specific preprocessing: the document-generator-mcp server does NOT
   * sanitize `nome_arquivo` (verified in its build; it only strips a trailing
   * extension before path.join). Separators, drive letters, and ".." would
   * otherwise let a filename escape the output directory. Neutralize them here.
   */
  private sanitizeFilename(name: string): string {
    const cleaned = name
      .replace(/\.(docx|pdf)$/i, "") // server strips these anyway
      .replace(/[^a-zA-Z0-9._-]+/g, "-") // separators/colons/spaces -> hyphen
      .replace(/\.{2,}/g, ".") // collapse ".." traversal sequences
      .replace(/^[-.]+|[-.]+$/g, "") // trim leading/trailing dots/hyphens
      .slice(0, 80);

    return cleaned.length > 0 ? cleaned : "document";
  }

  /**
   * Returns the first argument that is a non-empty string, else undefined.
   */
  private firstString(
    ...values: unknown[]
  ): string | undefined {
    for (const value of values) {
      if (typeof value === "string") {
        return value;
      }
    }
    return undefined;
  }
}
