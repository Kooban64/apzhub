import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

/** Structured log levels for the platform execution pipeline. */
export type PipelineLogLevel = "debug" | "info" | "warn" | "error";

/** Structured log event emitted by the execution pipeline. */
export interface PipelineLogEvent {
  readonly level: PipelineLogLevel;
  readonly message: string;
  readonly correlationId: string;
  readonly requestId: string;
  readonly service: string;
  readonly operation: string;
  readonly tenantId?: string;
  readonly durationMs?: number;
  readonly errorCode?: string;
  readonly details?: Readonly<Record<string, string>>;
}

/** Logging hook — replaceable; default is a no-op collector for tests. */
export interface PipelineLogger {
  log(event: PipelineLogEvent): void;
}

/** In-memory logger for development and tests. */
export class InMemoryPipelineLogger implements PipelineLogger {
  readonly events: PipelineLogEvent[] = [];

  log(event: PipelineLogEvent): void {
    this.events.push(event);
  }

  clear(): void {
    this.events.length = 0;
  }
}

/** Silent default logger. */
export const noopPipelineLogger: PipelineLogger = {
  log() {
    // intentionally empty
  },
};

export function createRequestId(ctx: ServiceRequestContext): string {
  return ctx.requestId ?? `req_${ctx.correlationId}`;
}
