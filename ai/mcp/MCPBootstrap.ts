import { MCPConnection } from "./client/MCPConnection.js";

import { ToolRegistry } from "./registry/ToolRegistry.js";
import { ToolExecutor } from "./executors/ToolExecutor.js";

import type { MCPServerConfig } from "./contracts/MCPServerConfig.js";

import { OfficeDocumentResolver } from "./resolvers/OfficeDocumentResolver.js";
import { PdfDocumentResolver } from "./resolvers/PdfDocumentResolver.js";

/**
 * Bootstraps every configured MCP server.
 *
 * Responsibilities:
 *  - Create MCP connections
 *  - Connect to every server
 *  - Discover tools
 *  - Register discovered tools
 *  - Expose a ready ToolExecutor
 *
 * This class performs startup wiring only.
 * It is not an orchestration layer.
 */
export class MCPBootstrap {
  /**
   * Shared registry containing every discovered tool.
   */
  public readonly registry: ToolRegistry;

  /**
   * Executor used by the orchestration framework.
   */
  public readonly executor: ToolExecutor;

  /**
   * Active MCP connections.
   */
  private readonly connections: MCPConnection[] = [];

  constructor(
    private readonly configs: MCPServerConfig[]
  ) {
    this.registry = new ToolRegistry();
    this.executor = new ToolExecutor(this.registry,
      [
        new OfficeDocumentResolver(),
        new PdfDocumentResolver(),
      ]
    );
  }

  /**
   * Initializes every configured MCP server.
   */
  public async initialize(): Promise<void> {
    for (const config of this.configs) {
      try {
        const connection = new MCPConnection(config);

        await connection.connect();

        this.connections.push(connection);

        const tools =
          await connection.listTools();

        this.registry.registerMany(
          tools,
          connection
        );

        console.log(
          `✓ Connected to MCP server "${config.name}" (${tools.length} tools discovered)`
        );
      } catch (error) {
        console.error(
          `Failed to initialize MCP server "${config.name}":`,
          error
        );
      }
    }
  }

  /**
   * Disconnect every MCP server.
   */
  public async shutdown(): Promise<void> {
    await Promise.all(
      this.connections.map((connection) =>
        connection.disconnect()
      )
    );

    this.connections.length = 0;
    this.registry.clear();
  }

  /**
   * Returns every connected server.
   */
  public getConnections(): readonly MCPConnection[] {
    return this.connections;
  }
}