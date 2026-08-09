import { MCPConnection } from "../client/MCPConnection.js";
import type { ToolMetadata } from "../contracts/ToolMetadata.js";

/**
 * A discovered tool together with the MCP connection
 * that owns it.
 */
export interface RegisteredTool {
  metadata: ToolMetadata;
  connection: MCPConnection;
}

/**
 * Central registry of all discovered MCP tools.
 *
 * The registry is the single source of truth for:
 *   - available tools
 *   - owning MCP server
 *   - metadata exposed to the planner
 */
export class ToolRegistry {
  /**
   * tool name -> registered tool
   */
  private readonly tools = new Map<string, RegisteredTool>();

  /**
   * Register a single discovered tool.
   *
   * @throws Error if another server already registered
   *         a tool with the same name.
   */
  public register(
    metadata: ToolMetadata,
    connection: MCPConnection
  ): void {
    if (this.tools.has(metadata.name)) {
      throw new Error(
        `Tool "${metadata.name}" is already registered.`
      );
    }

    this.tools.set(metadata.name, {
      metadata,
      connection,
    });
  }

  /**
   * Register every tool discovered from one MCP server.
   */
  public registerMany(
    tools: ToolMetadata[],
    connection: MCPConnection
  ): void {
    for (const tool of tools) {
      this.register(tool, connection);
    }
  }

  /**
   * Remove a tool.
   */
  public unregister(toolName: string): boolean {
    return this.tools.delete(toolName);
  }

  /**
   * Remove all registered tools.
   */
  public clear(): void {
    this.tools.clear();
  }

  /**
   * Lookup a registered tool.
   */
  public get(toolName: string): RegisteredTool | undefined {
    return this.tools.get(toolName);
  }

  /**
   * Lookup only tool metadata.
   */
  public getMetadata(
    toolName: string
  ): ToolMetadata | undefined {
    return this.tools.get(toolName)?.metadata;
  }

  /**
   * Lookup the owning connection.
   */
  public getConnection(
    toolName: string
  ): MCPConnection | undefined {
    return this.tools.get(toolName)?.connection;
  }

  /**
   * Check if a tool exists.
   */
  public has(toolName: string): boolean {
    return this.tools.has(toolName);
  }

  /**
   * List every registered tool.
   */
  public list(): RegisteredTool[] {
    return [...this.tools.values()];
  }

  /**
   * List only tool metadata.
   *
   * Used by the planner.
   */
  public listMetadata(): ToolMetadata[] {
    return [...this.tools.values()].map(
      ({ metadata }) => metadata
    );
  }

  /**
   * Return every tool belonging to a server.
   */
  public listByServer(
    serverId: string
  ): RegisteredTool[] {
    return [...this.tools.values()].filter(
      ({ metadata }) => metadata.serverId === serverId
    );
  }

  /**
   * Number of registered tools.
   */
  public size(): number {
    return this.tools.size;
  }

  /**
   * Whether the registry is empty.
   */
  public isEmpty(): boolean {
    return this.tools.size === 0;
  }
}