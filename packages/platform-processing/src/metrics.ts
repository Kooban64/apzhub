import type { ProcessingAttemptRecord } from "./types";

export type ProcessingMetricsSnapshot = {
  readonly attempts: number;
  readonly acknowledged: number;
  readonly retried: number;
  readonly deadLetter: number;
  readonly terminalFailures: number;
  readonly leaseExpired: number;
  readonly noProcessor: number;
  readonly totalDurationMs: number;
  readonly successRate: number;
  readonly failureRate: number;
};

export type ProcessingObservabilityHooks = {
  readonly onAttempt?: (record: ProcessingAttemptRecord) => void;
  readonly onDeadLetterReady?: (input: {
    readonly workItemId: string;
    readonly reason: string;
    readonly attemptCount: number;
  }) => void;
};

export type InMemoryProcessingAudit = {
  readonly attempts: ProcessingAttemptRecord[];
  readonly deadLetterReady: Array<{
    readonly workItemId: string;
    readonly reason: string;
  }>;
  readonly hooks: ProcessingObservabilityHooks;
  snapshot(): ProcessingMetricsSnapshot;
};

export function createInMemoryProcessingAudit(): InMemoryProcessingAudit {
  const attempts: ProcessingAttemptRecord[] = [];
  const deadLetterReady: InMemoryProcessingAudit["deadLetterReady"] = [];

  return {
    attempts,
    deadLetterReady,
    hooks: {
      onAttempt(record) {
        attempts.push(record);
      },
      onDeadLetterReady(input) {
        deadLetterReady.push({
          workItemId: input.workItemId,
          reason: input.reason,
        });
      },
    },
    snapshot() {
      const acknowledged = attempts.filter((a) => a.outcome === "acknowledged").length;
      const retried = attempts.filter((a) => a.outcome === "retry").length;
      const deadLetter = attempts.filter((a) => a.outcome === "dead_letter").length;
      const terminalFailures = attempts.filter(
        (a) => a.outcome === "terminal_failure",
      ).length;
      const leaseExpired = attempts.filter((a) => a.outcome === "lease_expired").length;
      const noProcessor = attempts.filter((a) => a.outcome === "no_processor").length;
      const totalDurationMs = attempts.reduce((sum, a) => sum + (a.durationMs ?? 0), 0);
      const decided = acknowledged + retried + deadLetter + terminalFailures;
      return {
        attempts: attempts.length,
        acknowledged,
        retried,
        deadLetter,
        terminalFailures,
        leaseExpired,
        noProcessor,
        totalDurationMs,
        successRate: decided === 0 ? 0 : acknowledged / decided,
        failureRate: decided === 0 ? 0 : (deadLetter + terminalFailures) / decided,
      };
    },
  };
}
