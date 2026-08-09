import { AgentInput, AgentOutput } from "../contracts";

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateAgentInput(
  input: AgentInput
): ValidationResult {
  if (!input) {
    return {
      valid: false,
      error: "Input is required.",
    };
  }

  if (typeof input.query !== "string") {
    return {
      valid: false,
      error: "Query must be a string.",
    };
  }

  if (!input.query.trim()) {
    return {
      valid: false,
      error: "Query cannot be empty.",
    };
  }

  return {
    valid: true,
  };
}

export function validateAgentOutput(
  output: AgentOutput
): ValidationResult {
  if (!output) {
    return {
      valid: false,
      error: "Output is required.",
    };
  }

  if (typeof output.success !== "boolean") {
    return {
      valid: false,
      error: "Invalid success field.",
    };
  }

  if (typeof output.response !== "string") {
    return {
      valid: false,
      error: "Invalid response field.",
    };
  }

  if (typeof output.agent !== "string") {
    return {
      valid: false,
      error: "Invalid agent field.",
    };
  }

  if (typeof output.executionTime !== "number") {
    return {
      valid: false,
      error: "Invalid executionTime field.",
    };
  }

  return {
    valid: true,
  };
}