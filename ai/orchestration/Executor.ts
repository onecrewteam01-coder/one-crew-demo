import { AgentInput, AgentOutput } from "../contracts";
import { AgentRegistry } from "../agents/base";
import { ToolExecutor } from "../mcp";

import { applyExecutionConstraints } from "./constraints";

import {
  ExecutionContext,
  ExecutionPlan,
  StepResult,
} from "./types";

export class Executor {
  constructor(
    private readonly registry: AgentRegistry,
    private readonly toolExecutor: ToolExecutor
  ) {}

  /**
   * Returns the latest successful Agent response.
   * This is used as the default content for tool
   * executions when the planner does not explicitly
   * provide one.
   */
  private getLatestAgentResponse(
    context: ExecutionContext
  ): string | undefined {
    for (
      let i = context.results.length - 1;
      i >= 0;
      i--
    ) {
      const output = context.results[i].output;

      if (
        "response" in output &&
        output.success
      ) {
        return output.response;
      }
    }

    return undefined;
  }

  /**
   * Executes an execution plan sequentially.
   *
   * The Planner decides whether a step targets an
   * Agent or an MCP Tool.
   *
   * The Executor simply performs the requested step.
   *
   * Future versions can extend this with retries,
   * conditional execution and parallel execution
   * without changing the Planner.
   */
  async execute(
    plan: ExecutionPlan,
    input: AgentInput
  ): Promise<ExecutionContext> {
    const context: ExecutionContext = {
      query: input.query,
      plan,
      results: [],
    };

    for (const step of plan.steps) {
      const executionStep =
        applyExecutionConstraints(step);

      const start = Date.now();

      // --------------------------------------------------
      // Agent execution
      // --------------------------------------------------
      if (executionStep.targetType === "agent") {
        const agent = this.registry.get(
          executionStep.target
        );

        const agentInput: AgentInput = {
          ...input,
          query: `
Original User Request:
${input.query}

Current Task:
${executionStep.task}

Previous Step Results:
${JSON.stringify(
  context.results,
  null,
  2
)}
          `.trim(),
        };

        const output =
          await agent.execute(agentInput);

        const result: StepResult = {
          stepId: executionStep.id,
          executor: executionStep.target,
          task: executionStep.task,
          success: output.success,
          attempts: 1,
          durationMs: Date.now() - start,
          output,
        };

        if (output.error) {
          result.error = output.error;
        }

        context.results.push(result);

        continue;
      }

      // --------------------------------------------------
      // Tool execution
      // --------------------------------------------------
      const latestContent =
        this.getLatestAgentResponse(context);

      const toolArguments: Record<
        string,
        unknown
      > = {
        ...(executionStep.arguments ?? {}),
      };

      if (
        latestContent &&
        toolArguments.content === undefined
      ) {
        toolArguments.content =
          latestContent;
      }

      const toolOutput =
        await this.toolExecutor.execute({
          tool: executionStep.target,
          arguments: toolArguments,
        });

      const toolResult: StepResult = {
        stepId: executionStep.id,
        executor: executionStep.target,
        task: executionStep.task,
        success: toolOutput.success,
        attempts: 1,
        durationMs: Date.now() - start,
        output: toolOutput,
      };

      if (toolOutput.error) {
        toolResult.error =
          toolOutput.error;
      }

      context.results.push(toolResult);
    }

    return context;
  }
}