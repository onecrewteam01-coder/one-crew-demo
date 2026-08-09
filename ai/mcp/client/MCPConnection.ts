import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";

import type { MCPServerConfig } from "../contracts/MCPServerConfig.js";
import type { ToolInput } from "../contracts/ToolInput.js";
import type {
  GeneratedArtifact,
  ToolOutput,
} from "../contracts/ToolOutput.js";
import type { ToolMetadata } from "../contracts/ToolMetadata.js";

/**
 * Represents a single connected MCP server.
 *
 * This class is the only place in the framework that directly
 * interacts with the MCP SDK.
 */
export class MCPConnection {
  private readonly client: Client;
  private transport: Transport | null = null;
  private connected = false;

  constructor(private readonly config: MCPServerConfig) {
    this.client = new Client({
      name: "one-crew-orchestrator",
      version: "1.0.0",
    });
  }

  /**
   * Returns the server configuration.
   */
  public getConfig(): MCPServerConfig {
    return this.config;
  }

  /**
   * Whether the connection is active.
   */
  public isConnected(): boolean {
    return this.connected;
  }

  /**
   * Establish the MCP connection.
   */
  public async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    this.transport = this.createTransport();

    // SDK 1.29.0 typing workaround.
    await this.client.connect(this.transport as any);

    this.connected = true;
  }

  /**
   * Disconnect from the MCP server.
   */
  public async disconnect(): Promise<void> {
    if (!this.connected) {
      return;
    }

    try {
      await this.client.close();

      if (this.transport instanceof StreamableHTTPClientTransport) {
        try {
          await this.transport.terminateSession();
        } catch {
          // Ignore if unsupported.
        }
      }
    } finally {
      this.transport = null;
      this.connected = false;
    }
  }

  /**
   * Discover every tool exposed by this server.
   */
  public async listTools(): Promise<ToolMetadata[]> {
    this.ensureConnected();

    const { tools } = await this.client.listTools();

    return tools.map((tool) => ({
      serverId: this.config.id,
      name: tool.name,
      title: tool.title,
      description: tool.description,
      inputSchema: tool.inputSchema,
      outputSchema: tool.outputSchema,
      annotations: tool.annotations,
    }));
  }

  /**
   * Execute a tool on this MCP server.
   */
  public async execute(
    input: ToolInput
  ): Promise<ToolOutput> {
    this.ensureConnected();

    const start = Date.now();

    try {
      const result = await this.client.callTool(
        {
          name: input.tool,
          arguments: input.arguments,
        },
        undefined,
        {
          timeout: 60_000,
        }
      );

      return {
        success: !(result.isError ?? false),
        tool: input.tool,
        result,
        artifacts: this.extractArtifacts(result),
        executionTime: Date.now() - start,
        error: result.isError
          ? "Tool execution failed."
          : undefined,
      };
    } catch (error) {
      return {
        success: false,
        tool: input.tool,
        result: null,
        artifacts: [],
        executionTime: Date.now() - start,
        error:
          error instanceof Error
            ? error.message
            : String(error),
      };
    }
  }

  /**
   * Attempts to discover generated artifacts from
   * the raw MCP response.
   *
   * This is intentionally provider-agnostic.
   */
  private extractArtifacts(
    response: unknown
  ): GeneratedArtifact[] {
    const artifacts: GeneratedArtifact[] = [];

    const visit = (value: unknown): void => {
      if (Array.isArray(value)) {
        value.forEach(visit);
        return;
      }

      if (
        value === null ||
        typeof value !== "object"
      ) {
        return;
      }

      const record = value as Record<
        string,
        unknown
      >;

      // ----------------------------------------------------
      // Plain-text file locations (provider-agnostic)
      //
      // Several MCP servers return generated file paths inside
      // plain text messages rather than structured fields, e.g.:
      //
      //   "Document saved to /app/output/report.docx"   (Office MCP)
      //   'Documento "X" gerado:\nPDF: /data/gen/x.pdf'  (PDF MCP)
      //   "Word: C:\\out\\x.docx"
      //
      // Instead of matching any one server's phrasing, scan for
      // absolute path tokens (drive-letter, UNC, or leading slash)
      // that end in a known document extension. This handles both
      // the Office and PDF providers without provider-specific code.
      // ----------------------------------------------------
      if (
        record.type === "text" &&
        typeof record.text === "string"
      ) {
        const pathPattern =
          /(?:[A-Za-z]:[\\/]|\\\\|\/)[^\r\n"'<>|*?]*?\.(?:docx|pdf|xlsx|pptx|eml|xml)/gi;

        const found = record.text.match(pathPattern) ?? [];

        for (const rawPath of found) {
          const path = rawPath.trim();

          artifacts.push({
            name:
              path.split(/[\\/]/).pop() ??
              "generated-artifact",
            path,
          });
        }
      }

      const path =
        typeof record.path === "string"
          ? record.path
          : undefined;

      const url =
        typeof record.url === "string"
          ? record.url
          : typeof record.downloadUrl ===
            "string"
          ? (record.downloadUrl as string)
          : undefined;

      const name =
        typeof record.name === "string"
          ? record.name
          : typeof record.filename ===
            "string"
          ? (record.filename as string)
          : path
          ? path.split(/[\\/]/).pop()
          : url
          ? url.split("/").pop()
          : undefined;

      if (name || path || url) {
        artifacts.push({
          name:
            name ??
            "generated-artifact",
          path,
          url,
          mimeType:
            typeof record.mimeType ===
            "string"
              ? record.mimeType
              : undefined,
        });
      }

      for (const child of Object.values(
        record
      )) {
        visit(child);
      }
    };

    visit(response);

    // Dedupe: the same file can surface via both a text message and a
    // structured field. Key on path/url/name so each artifact appears once.
    const seen = new Set<string>();
    return artifacts.filter((artifact) => {
      const key =
        artifact.path ?? artifact.url ?? artifact.name;

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
  }

  /**
   * Create the correct transport.
   */
  private createTransport(): Transport {
    if (this.config.transport === "stdio") {
      return new StdioClientTransport({
        command: this.config.command,
        args: this.config.args,
        cwd: this.config.cwd,
        env: this.config.env,
      });
    }

    return new StreamableHTTPClientTransport(
      new URL(this.config.url),
      {
        requestInit: {
          headers: this.config.headers,
        },
      }
    );
  }

  /**
   * Ensures the client is connected.
   */
  private ensureConnected(): void {
    if (!this.connected) {
      throw new Error(
        `MCP server "${this.config.name}" is not connected.`
      );
    }
  }
}