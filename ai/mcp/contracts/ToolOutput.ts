export interface GeneratedArtifact {
  /**
   * Display name of the generated artifact.
   *
   * Example:
   * report.docx
   * pitch_deck.pptx
   */
  name: string;

  /**
   * MIME type if available.
   *
   * Example:
   * application/vnd.openxmlformats-officedocument.wordprocessingml.document
   */
  mimeType?: string;

  /**
   * Local path returned by the MCP server.
   */
  path?: string;

  /**
   * Download URL returned by the MCP server.
   */
  url?: string;
}

export interface ToolOutput {
  /**
   * Whether execution succeeded.
   */
  success: boolean;

  /**
   * Executed tool.
   */
  tool: string;

  /**
   * Raw MCP response returned by the server.
   *
   * Preserved exactly as received so future
   * providers can expose richer information
   * without changing orchestration.
   */
  result: unknown;

  /**
   * Any generated artifacts produced by the tool.
   *
   * Empty when the tool only returns structured
   * data or text.
   */
  artifacts?: GeneratedArtifact[];

  /**
   * Total execution time.
   */
  executionTime: number;

  /**
   * Optional execution error.
   */
  error?: string;
}