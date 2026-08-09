import { AgentInput } from "../contracts";

import { AgentRegistry } from "../agents/base";
import { CEOAgent } from "../agents/ceo/CEOAgent";

import {
  ToolExecutor,
  ToolOutput,
  GeneratedArtifact,
} from "../mcp";

import { Planner } from "./Planner";
import { Executor } from "./Executor";

import {
  ExecutionContext,
  OrchestrationResult,
} from "./types";

export class Orchestrator {
  private readonly planner: Planner;
  private readonly executor: Executor;

  constructor(
    private readonly registry: AgentRegistry,
    toolExecutor: ToolExecutor
  ) {
    this.planner = new Planner(registry);

    this.executor = new Executor(
      registry,
      toolExecutor
    );
  }

  /**
   * Executes the complete orchestration pipeline.
   *
   * User
   *   ↓
   * Planner
   *   ↓
   * Executor
   *   ↓
   * CEO Synthesizer
   */
  async execute(
    input: AgentInput
  ): Promise<OrchestrationResult> {
    // ------------------------------------------------------------------
    // Planning
    // ------------------------------------------------------------------

    const plan =
      await this.planner.createPlan(input);

    // ------------------------------------------------------------------
    // Execution
    // ------------------------------------------------------------------

    const context: ExecutionContext =
      await this.executor.execute(
        plan,
        input
      );

    // ------------------------------------------------------------------
    // Final synthesis
    // ------------------------------------------------------------------

    const ceo =
      this.registry.get("ceo");

    if (!(ceo instanceof CEOAgent)) {
      throw new Error(
        "Registered CEO agent does not support synthesis."
      );
    }

    const finalOutput =
      await ceo.synthesize(
        input,
        context
      );

    // ------------------------------------------------------------------
    // Collect generated artifacts
    // ------------------------------------------------------------------

    const attachments: GeneratedArtifact[] =
      context.results.flatMap((result) => {
        const output = result.output;

        if (
          output &&
          typeof output === "object" &&
          "artifacts" in output
        ) {
          return (
            (output as ToolOutput)
              .artifacts ?? []
          );
        }

        return [];
      });

    return {
      context,
      finalOutput,
      attachments,
    };
  }
}