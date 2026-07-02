import type { ActionHandlerKind } from "./action-descriptor";

/** Per-execution diagnostics attached to {@link ActionResult}. */
export interface ActionExecutionDiagnostics {
  readonly handlerKind?: ActionHandlerKind;
  readonly phase: "lookup" | "actor" | "permission" | "dispatch" | "gateway";
  readonly invocationSource?: string;
}
