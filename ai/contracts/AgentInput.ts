export interface AgentInput {
  query: string;

  requestId?: string;

  metadata?: Record<string, unknown>;
}