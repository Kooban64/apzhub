import type { OutboxEvent, OutboxHandler, OutboxHandlerResult } from "./types";

/**
 * Acknowledging handler — marks delivery success without side effects.
 * Suitable as MVP default so drain can complete; compose with relay handlers later.
 */
export function createAcknowledgingHandler(name = "acknowledge"): OutboxHandler {
  return {
    name,
    async handle(_event: OutboxEvent): Promise<OutboxHandlerResult> {
      return { ok: true };
    },
  };
}

/**
 * Recording handler — captures events for tests / diagnostics sinks.
 */
export function createRecordingHandler(
  sink: OutboxEvent[],
  name = "record",
): OutboxHandler {
  return {
    name,
    async handle(event: OutboxEvent): Promise<OutboxHandlerResult> {
      sink.push(event);
      return { ok: true };
    },
  };
}

/**
 * Failing handler factory — for retry / DLQ tests.
 */
export function createFailingHandler(options: {
  readonly message: string;
  readonly permanent?: boolean;
  readonly name?: string;
  readonly failUntilAttempt?: number;
}): OutboxHandler {
  return {
    name: options.name ?? "fail",
    async handle(event: OutboxEvent): Promise<OutboxHandlerResult> {
      if (
        options.failUntilAttempt !== undefined &&
        event.attemptCount >= options.failUntilAttempt
      ) {
        return { ok: true };
      }
      return {
        ok: false,
        message: options.message,
        permanent: options.permanent,
      };
    },
  };
}
