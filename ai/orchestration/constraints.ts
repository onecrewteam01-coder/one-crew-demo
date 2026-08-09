import { ExecutionStep } from "./types";

/**
 * Default orchestration execution settings.
 * These values are used whenever an execution step
 * does not explicitly override them.
 */
export const DEFAULT_EXECUTION_CONSTRAINTS = {
  /**
   * Maximum retry attempts per step.
   * (Retries will be implemented later.)
   */
  maxRetries: 1,

  /**
   * Default timeout for an agent execution.
   */
  timeoutMs: 60_000,

  /**
   * Whether steps are allowed to execute in parallel by default.
   * (Parallel execution will be implemented later.)
   */
  allowParallel: false,
} as const;

/**
 * Applies default execution constraints to a step.
 * Any values explicitly defined on the step take precedence.
 */
export function applyExecutionConstraints(
  step: ExecutionStep
): Required<ExecutionStep> {
  return {
    ...step,

    dependsOn: step.dependsOn ?? [],

    allowParallel:
      step.allowParallel ??
      DEFAULT_EXECUTION_CONSTRAINTS.allowParallel,

    maxRetries:
      step.maxRetries ??
      DEFAULT_EXECUTION_CONSTRAINTS.maxRetries,

    timeoutMs:
      step.timeoutMs ??
      DEFAULT_EXECUTION_CONSTRAINTS.timeoutMs,

    constraints: step.constraints ?? [],
  };
}