export interface MCPServerConfig {
  /**
   * Unique server identifier.
   */
  id: string;

  /**
   * Friendly server name.
   */
  name: string;

  /**
   * Transport used by this MCP server.
   */
  transport: "stdio" | "http";

  /**
   * HTTP endpoint.
   */
  url?: string;

  /**
   * stdio executable.
   */
  command?: string;

  /**
   * stdio arguments.
   */
  args?: string[];

  /**
   * Working directory.
   */
  cwd?: string;

  /**
   * Environment variables.
   */
  env?: Record<string, string>;

  /**
   * Optional request headers.
   */
  headers?: Record<string, string>;
}