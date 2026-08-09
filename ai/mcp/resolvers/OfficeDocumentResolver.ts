import { ToolArgumentResolver } from "./ToolArgumentResolver";

/**
 * Translates generic orchestration arguments into the parameter
 * structure expected by the Office Documents MCP server.
 *
 * This resolver only performs argument translation. It does not
 * execute tools or contain any provider-specific orchestration logic.
 */
export class OfficeDocumentResolver implements ToolArgumentResolver {
  /**
   * Office document generation tools currently exposed by the
   * mcp-ms-office-documents server.
   */
  private static readonly SUPPORTED_TOOLS = new Set([
    "create_word_from_markdown",
    "create_powerpoint_presentation",
    "create_excel_from_markdown",
    "create_email_draft",
    "create_xml_file",
  ]);

  supports(toolName: string): boolean {
    return OfficeDocumentResolver.SUPPORTED_TOOLS.has(toolName);
  }

  resolve(
    toolName: string,
    arguments_: Record<string, unknown>
  ): Record<string, unknown> {
    // Preserve all incoming arguments so newly-added Office MCP
    // parameters continue to work without requiring resolver changes.
    const resolved = {
      ...arguments_,
    };

    // Our orchestration layer uses generic names.
    // Translate them into the Office MCP parameter names.
    if (
      resolved.content !== undefined &&
      resolved.markdown_content === undefined
    ) {
      resolved.markdown_content = resolved.content;
      delete resolved.content;
    }

    if (
      resolved.fileName !== undefined &&
      resolved.file_name === undefined
    ) {
      resolved.file_name = resolved.fileName;
      delete resolved.fileName;
    }

    // Currently every supported Office document tool accepts file_name,
    // while markdown-based generators additionally require
    // markdown_content. Any remaining parameters are passed through
    // unchanged (title, author, subject, include_toc, etc.).
    return resolved;
  }
}