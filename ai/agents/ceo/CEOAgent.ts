import { BaseAgent } from "../base";

import {
  AgentInput,
  AgentMetadata,
  AgentOutput,
} from "../../contracts";

import {
  ExecutionPlan,
  ExecutionContext,
} from "../../orchestration";

import { ToolOutput } from "../../mcp";

export class CEOAgent extends BaseAgent {
  readonly metadata: AgentMetadata = {
    id: "ceo",
    name: "CEO Agent",
    promptFile: "ceo",
    model: "llama-3.3-70b-versatile",
  };

  /**
   * Standard CEO response.
   */
  override async execute(
    input: AgentInput
  ): Promise<AgentOutput> {
    return super.execute(input);
  }

  /**
   * Generates an execution plan.
   */
  async plan(
    input: AgentInput
  ): Promise<ExecutionPlan> {
    const result = await this.executeWithPrompt(
      input,
      "ceo_planner"
    );

    if (!result.success) {
      throw new Error(
        result.error ??
          "Planner execution failed."
      );
    }

    return this.parseJsonResponse<ExecutionPlan>(
      result.response
    );
  }

  /**
   * Produces the final user-facing response.
   *
   * The CEO only synthesizes.
   * It never invokes MCP tools and never regenerates
   * previously generated artifacts.
   */
  async synthesize(
    input: AgentInput,
    context: ExecutionContext
  ): Promise<AgentOutput> {
    const generatedArtifacts =
      context.results.flatMap((result) => {
        const output = result.output;

        if (
          output &&
          typeof output === "object" &&
          "artifacts" in output
        ) {
          return (
            (output as ToolOutput).artifacts ?? []
          );
        }

        return [];
      });

    const executionSummary =
      context.results
        .map((result) => {
          const output = result.output;

          if (
            output &&
            typeof output === "object" &&
            "tool" in output
          ) {
            const toolOutput =
              output as ToolOutput;

            return `
Executor: ${result.executor}
Type: Tool

Task:
${result.task}

Success:
${toolOutput.success}

Tool:
${toolOutput.tool}

Result:
${JSON.stringify(
  toolOutput.result,
  null,
  2
)}
`;
          }

          const agentOutput =
            output as AgentOutput;

          return `
Executor: ${result.executor}
Type: Agent

Task:
${result.task}

Response:
${agentOutput.response}
`;
        })
        .join(
          "\n----------------------------------------\n"
        );

    const artifactSection =
      generatedArtifacts.length === 0
        ? "No downloadable artifacts were generated."
        : generatedArtifacts
            .map(
              (artifact) =>
                `- ${artifact.name}`
            )
            .join("\n");

    const synthesisPrompt = `
Original User Request:
${context.query}

Execution Plan:
${JSON.stringify(
      context.plan,
      null,
      2
    )}

Execution Results:

${executionSummary}

Generated Artifacts:

${artifactSection}

Instructions:

- Produce the final answer for the user.
- If artifacts were generated, naturally mention them.
- Do NOT recreate documents.
- Do NOT regenerate files.
- Assume the generated artifacts will be attached by the orchestration layer.
`;

    return this.executeWithPrompt(
      {
        ...input,
        query: synthesisPrompt,
      },
      "ceo_synthesizer"
    );
  }
}