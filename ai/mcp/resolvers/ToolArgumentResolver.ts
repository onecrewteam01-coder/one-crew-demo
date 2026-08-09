/**
 * Resolves orchestration-level tool arguments into the
 * argument structure expected by a specific MCP tool.
 *
 * Implementations should remain provider-specific while
 * keeping the orchestration framework provider-agnostic.
 */
export interface ToolArgumentResolver {
  /**
   * Returns whether this resolver can translate arguments
   * for the specified MCP tool.
   */
  supports(toolName: string): boolean;

  /**
   * Translates orchestration arguments into the exact
   * argument structure expected by the MCP tool.
   *
   * Implementations should return a new object and must
   * not mutate the supplied arguments.
   */
  resolve(
    toolName: string,
    arguments_: Record<string, unknown>
  ): Record<string, unknown>;
}