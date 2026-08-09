import { AgentInput } from "../contracts";
import { AgentRegistry } from "../agents/base";
import { CEOAgent } from "../agents/ceo/CEOAgent";
import { ExecutionPlan } from "./types";

export class Planner {
  constructor(
    private readonly registry: AgentRegistry
  ) {}

  async createPlan(
    input: AgentInput
  ): Promise<ExecutionPlan> {
    const agent = this.registry.get("ceo");

    if (!(agent instanceof CEOAgent)) {
      throw new Error(
        "Registered CEO agent does not support planning."
      );
    }

    return agent.plan(input);
  }
}