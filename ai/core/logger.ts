export class Logger {
  info(message: string, metadata?: Record<string, unknown>): void {
    console.log(`[INFO] ${message}`, metadata ?? "");
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    console.warn(`[WARN] ${message}`, metadata ?? "");
  }

  error(
    message: string,
    error?: unknown,
    metadata?: Record<string, unknown>
  ): void {
    console.error(`[ERROR] ${message}`, {
      error,
      ...metadata,
    });
  }

  executionStart(agent: string, requestId?: string): number {
    const start = Date.now();

    this.info("Agent execution started", {
      agent,
      requestId,
      startTime: new Date(start).toISOString(),
    });

    return start;
  }

  executionEnd(
    agent: string,
    startTime: number,
    success: boolean,
    requestId?: string
  ): number {
    const duration = Date.now() - startTime;

    this.info("Agent execution finished", {
      agent,
      requestId,
      success,
      duration,
    });

    return duration;
  }
}

export const logger = new Logger();