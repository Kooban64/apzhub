import type { EventError } from "../errors";
import type { IntegrationSourceEvent } from "../source-event";
import type { PollingCheckpoint } from "./checkpoint";
import type { PollingCursor } from "./cursor";
import type { PollingMode, PollingRunDiagnostics } from "./types";

export type PollingExecutionOutcome =
  "completed" | "partial" | "cancelled" | "stalled" | "limit_exceeded" | "failed";

export interface PollingExecutionResult {
  readonly outcome: PollingExecutionOutcome;
  readonly ok: boolean;
  readonly mode: PollingMode;
  readonly records: readonly unknown[];
  readonly events: readonly IntegrationSourceEvent[];
  readonly cursor?: PollingCursor;
  /** Proposed checkpoint — not committed until caller acks. */
  readonly proposedCheckpoint?: PollingCheckpoint;
  readonly diagnostics: PollingRunDiagnostics;
  readonly error?: EventError;
}

export function pollingCompleted(
  partial: Omit<PollingExecutionResult, "outcome" | "ok"> & {
    readonly outcome?: PollingExecutionOutcome;
  },
): PollingExecutionResult {
  return {
    ...partial,
    outcome: partial.outcome ?? "completed",
    ok: true,
  };
}

export function pollingFailed(
  partial: Omit<PollingExecutionResult, "ok">,
): PollingExecutionResult {
  return {
    ...partial,
    ok: false,
  };
}
