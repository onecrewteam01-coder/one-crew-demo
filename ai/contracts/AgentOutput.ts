export interface AgentOutput {
  success: boolean;

  response: string;

  agent: string;

  executionTime: number;

  error?: string;
}