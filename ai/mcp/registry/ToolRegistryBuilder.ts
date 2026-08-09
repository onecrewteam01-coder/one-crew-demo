import { MCPConnection } from "../client/MCPConnection.js";
import type { MCPServerConfig } from "../contracts/MCPServerConfig.js";
import { ToolRegistry } from "./ToolRegistry.js";

/**
 * Builds a ToolRegistry by connecting to every configured
 * MCP server and discovering its tools.
 */
export class ToolRegistryBuilder {
  /**
   * Build and populate a ToolRegistry.
   */
  public async build(
    configs: MCPServerConfig[]
  ): Promise<ToolRegistry> {
    const registry = new ToolRegistry();

    for (const config of configs) {
      if (config.enabled === false) {
        continue;
      }

      const connection = new MCPConnection(config);

      await connection.connect();

      const tools = await connection.listTools();

      registry.registerMany(tools, connection);
    }

    return registry;
  }
}