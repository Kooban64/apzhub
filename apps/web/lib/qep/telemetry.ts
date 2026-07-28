/** Lightweight QEP Workbench telemetry — no sensitive content logged. */

export type QepWorkbenchTelemetryEvent =
  | "relationships.list.load"
  | "relationships.detail.load"
  | "relationships.create"
  | "relationships.activate"
  | "relationships.deprecate"
  | "relationships.retire"
  | "relationships.update"
  | "traceability.list.load"
  | "traceability.detail.load"
  | "traceability.history.load"
  | "traceability.matrix.load"
  | "traceability.taxonomy.load"
  | "traceability.create"
  | "traceability.validate"
  | "traceability.approve"
  | "traceability.retire"
  | "traceability.supersede"
  | "traceability.update"
  | "verification.create"
  | "verification.lifecycle"
  | "verification.supersede"
  | "specification.create"
  | "specification.lifecycle"
  | "plan.create"
  | "plan.lifecycle";

export type QepWorkbenchTelemetryOutcome = "success" | "error";

export function emitQepWorkbenchTelemetry(input: {
  readonly event: QepWorkbenchTelemetryEvent;
  readonly outcome: QepWorkbenchTelemetryOutcome;
  readonly durationMs?: number;
}): void {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(
    new CustomEvent("qep:workbench-telemetry", {
      detail: {
        event: input.event,
        outcome: input.outcome,
        ...(input.durationMs !== undefined ? { durationMs: input.durationMs } : {}),
      },
    }),
  );
}
