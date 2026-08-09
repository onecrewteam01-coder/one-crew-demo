export interface ToolMetadata {
  /**
   * Provider identifier.
   *
   * Example:
   * document
   * image
   */
  serverId: string;

  /**
   * Tool name.
   *
   * Example:
   * create_word_from_markdown
   */
  name: string;

  /**
   * Optional display title.
   */
  title?: string;

  /**
   * Tool description.
   */
  description?: string;

  /**
   * MCP JSON schema.
   */
  inputSchema: Record<string, unknown>;

  /**
   * Optional output schema.
   */
  outputSchema?: Record<string, unknown>;

  /**
   * Tool annotations.
   */
  annotations?: {
    title?: string;

    readOnlyHint?: boolean;

    destructiveHint?: boolean;

    idempotentHint?: boolean;

    openWorldHint?: boolean;
  };
}