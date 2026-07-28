import { TraceInvariantViolation } from "../../shared/errors";
import { TRACE_SCOPE_KINDS } from "./constants";

export type TraceScopeKind = (typeof TRACE_SCOPE_KINDS)[number];

export type TraceScope = {
  readonly kind: TraceScopeKind;
  readonly referenceId?: string;
};

export function createTraceScope(input: {
  readonly kind: string;
  readonly referenceId?: string;
}): TraceScope {
  const kind = input.kind.trim() as TraceScopeKind;
  if (!(TRACE_SCOPE_KINDS as readonly string[]).includes(kind)) {
    throw new TraceInvariantViolation(
      `Trace scope kind must be one of: ${TRACE_SCOPE_KINDS.join(", ")}`,
    );
  }
  if (kind === "tenant_global") {
    if (input.referenceId !== undefined && input.referenceId.trim() !== "") {
      throw new TraceInvariantViolation("tenant_global scope must not include referenceId");
    }
    return { kind };
  }
  const referenceId = input.referenceId?.trim();
  if (!referenceId) {
    throw new TraceInvariantViolation(`Trace scope ${kind} requires referenceId`);
  }
  if (kind === "baseline" && !/^rbl_[A-Za-z0-9_-]+$/.test(referenceId)) {
    throw new TraceInvariantViolation("Baseline scope referenceId must start with rbl_");
  }
  return { kind, referenceId };
}

export function traceScopeKey(scope: TraceScope): string {
  return `${scope.kind}:${scope.referenceId ?? ""}`;
}
