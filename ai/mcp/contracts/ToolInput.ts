export interface ToolInput {
  /**
   * Tool name.
   */
  tool: string;

  /**
   * Tool arguments.
   */
  arguments: Record<string, unknown>;

  /**
   * Optional request tracking.
   */
  requestId?: string;

  /**
   * Additional metadata.
   */
  metadata?: Record<string, unknown>;
}