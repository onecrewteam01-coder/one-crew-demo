/**
 * Supported MCP transport types.
 */
export type MCPTransportType = "stdio" | "http";

/**
 * Common configuration shared by every MCP server.
 */
interface BaseServerConfig {
  /**
   * Unique server identifier.
   *
   * Example:
   *  document
   *  image
   */
  id: string;

  /**
   * Human-readable server name.
   */
  name: string;

  /**
   * Whether the server should be initialized.
   *
   * Defaults to true if omitted.
   */
  enabled?: boolean;
}

/**
 * Configuration for an MCP server accessed over STDIO.
 */
export interface StdioServerConfig extends BaseServerConfig {
  transport: "stdio";

  /**
   * Executable.
   *
   * Examples:
   *  npx
   *  python
   *  docker
   */
  command: string;

  /**
   * Command-line arguments.
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
}

/**
 * Configuration for an MCP server accessed over HTTP.
 */
export interface HttpServerConfig extends BaseServerConfig {
  transport: "http";

  /**
   * MCP endpoint.
   *
   * Example:
   * http://localhost:8958/mcp
   */
  url: string;

  /**
   * Optional HTTP headers.
   */
  headers?: Record<string, string>;
}

/**
 * MCP server configuration.
 *
 * This discriminated union allows TypeScript to infer the
 * correct properties based on the transport type.
 */
export type MCPServerConfig =
  | StdioServerConfig
  | HttpServerConfig;