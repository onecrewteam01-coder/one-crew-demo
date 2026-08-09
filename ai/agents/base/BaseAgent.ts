import {
  AgentInput,
  AgentOutput,
  AgentMetadata,
} from "../../contracts";
import {
  logger,
  validateAgentInput,
  validateAgentOutput,
} from "../../core";
import { loadPrompt } from "../../prompts/loadPrompt";
import { buildSystemPrompt } from "../../prompts/buildSystemPrompt";
import { groqGenerate } from "../../llm/groq";

export abstract class BaseAgent {
  abstract readonly metadata: AgentMetadata;

  async execute(input: AgentInput): Promise<AgentOutput> {
    return this.executeWithPrompt(
      input,
      this.metadata.promptFile
    );
  }

  /**
   * Executes the agent using a specific prompt file.
   * Allows specialized workflows (planning, synthesis, review)
   * without modifying the framework execution pipeline.
   */
  protected async executeWithPrompt(
    input: AgentInput,
    promptFile: string
  ): Promise<AgentOutput> {
    const validation = validateAgentInput(input);

    if (!validation.valid) {
      return {
        success: false,
        response: "",
        agent: this.metadata.id,
        executionTime: 0,
        error: validation.error!,
      };
    }

    const startTime = logger.executionStart(
      this.metadata.id,
      input.requestId
    );

    try {
      const systemPrompt =
        await this.loadPrompt(promptFile);

      const response = await this.callLLM(
        systemPrompt,
        input.query
      );

      const output: AgentOutput = {
        success: true,
        response: this.parseResponse(response),
        agent: this.metadata.id,
        executionTime: 0,
      };

      const outputValidation =
        validateAgentOutput(output);

      if (!outputValidation.valid) {
        throw new Error(outputValidation.error);
      }

      output.executionTime = logger.executionEnd(
        this.metadata.id,
        startTime,
        true,
        input.requestId
      );

      return output;
    } catch (error) {
      const duration = logger.executionEnd(
        this.metadata.id,
        startTime,
        false,
        input.requestId
      );

      logger.error(
        `Execution failed for ${this.metadata.id}`,
        error
      );

      return {
        success: false,
        response: "",
        agent: this.metadata.id,
        executionTime: duration,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      };
    }
  }

  protected parseResponse(
    response: string
  ): string {
    return response.trim();
  }

  protected parseJsonResponse<T>(response: string): T {
    let cleaned = response.trim();

    // Remove Markdown code fences if present
    if (cleaned.startsWith("```")) {
      cleaned = cleaned
        .replace(/^```(?:json)?/i, "")
        .replace(/```$/, "")
        .trim();
    }

    try {
      return JSON.parse(cleaned) as T;
    } catch {
      // Try extracting the first JSON object
      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");

      if (start !== -1 && end !== -1 && end > start) {
        return JSON.parse(
          cleaned.slice(start, end + 1)
        ) as T;
      }

      throw new Error(
        "Failed to parse JSON response from LLM."
      );
    }
  }

  protected async loadPrompt(
    promptFile: string
  ): Promise<string> {
    const prompt = loadPrompt(promptFile);

    return buildSystemPrompt(prompt);
  }

  protected async callLLM(
    systemPrompt: string,
    userPrompt: string
  ): Promise<string> {
    return groqGenerate(
      systemPrompt,
      userPrompt,
      this.metadata.model
    );
  }
}