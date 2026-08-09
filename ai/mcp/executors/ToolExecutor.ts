import { ToolRegistry } from "../registry/ToolRegistry.js";

import type { ToolInput } from "../contracts/ToolInput.js";
import type { ToolOutput } from "../contracts/ToolOutput.js";

import {
  ToolArgumentResolver,
} from "../resolvers/ToolArgumentResolver.js";

/**
 * Executes MCP tools by routing requests to the
 * appropriate MCPConnection.
 *
 * Existing execute() behaviour is preserved.
 */
export class ToolExecutor {
  constructor(
    private readonly registry: ToolRegistry,
    private readonly resolvers: ToolArgumentResolver[] = []
  ) {}

  /**
   * Execute any registered MCP tool.
   */
  public async execute(
    input: ToolInput
  ): Promise<ToolOutput> {
    const registeredTool = this.registry.get(input.tool);

    if (!registeredTool) {
      throw new Error(
        `Unknown MCP tool "${input.tool}".`
      );
    }

    const resolver =
    this.resolvers.find((resolver) =>
      resolver.supports(input.tool)
    );

  const resolvedInput: ToolInput = {
    ...input,
    arguments: resolver
      ? resolver.resolve(
          input.tool,
          input.arguments
        )
      : input.arguments,
  };
  console.log("\n=== TOOL INPUT ===");
  console.dir(resolvedInput, { depth: null });
  return registeredTool.connection.execute(
    resolvedInput
  );
  }

  /**
   * MVP helper.
   *
   * Generates a Word document using the Office MCP.
   *
   * This is intentionally isolated so the CEO never
   * needs to know how the Office MCP works internally.
   */
  public async executeWordDocument(
    markdown: string,
    fileName: string
  ): Promise<ToolOutput> {
    return this.execute({
      tool: "create_word_from_markdown",
      arguments: {
        content: markdown,
        fileName,
      },
    });
  }

  /**
   * Returns whether a tool can be executed.
   */
  public canExecute(
    toolName: string
  ): boolean {
    return this.registry.has(toolName);
  }

  /**
   * Returns metadata for a tool.
   */
  public getToolMetadata(
    toolName: string
  ) {
    return this.registry.getMetadata(toolName);
  }

  /**
   * Returns every discovered tool.
   */
  public listTools() {
    return this.registry.listMetadata();
  }
}