import { BaseAgent } from "./BaseAgent";

export class AgentRegistry {
  private readonly agents = new Map<string, BaseAgent>();

  register(agent: BaseAgent): void {
    const id = agent.metadata.id;

    if (this.agents.has(id)) {
      throw new Error(`Agent '${id}' is already registered.`);
    }

    this.agents.set(id, agent);
  }

  get(id: string): BaseAgent {
    const agent = this.agents.get(id);

    if (!agent) {
      throw new Error(`Agent '${id}' is not registered.`);
    }

    return agent;
  }

  has(id: string): boolean {
    return this.agents.has(id);
  }

  unregister(id: string): boolean {
    return this.agents.delete(id);
  }

  list(): string[] {
    return [...this.agents.keys()];
  }

  clear(): void {
    this.agents.clear();
  }
}

export const agentRegistry = new AgentRegistry();