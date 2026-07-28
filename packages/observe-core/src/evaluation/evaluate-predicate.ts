/**
 * Phase A predicate evaluation against Observe metadata signals (ADR-0070).
 * Unknown / unavailable inputs never evaluate as healthy (clear).
 */

import type {
  ObserveAlertEvaluationOutcome,
  ObserveAlertPredicate,
  ObserveAlertSignalSnapshot,
} from "@apzhub/observe-contracts";

function readField(
  signal: ObserveAlertSignalSnapshot,
  field: string,
): string | number | undefined {
  if (signal.fieldValues && field in signal.fieldValues) {
    return signal.fieldValues[field];
  }
  if (field === "status" || field === "overallStatus") {
    return signal.status;
  }
  if (field === "value" || field === "numericValue") {
    return signal.numericValue;
  }
  return undefined;
}

function compareThreshold(
  left: number,
  op: "gt" | "gte" | "lt" | "lte" | "eq",
  right: number,
): boolean {
  switch (op) {
    case "gt":
      return left > right;
    case "gte":
      return left >= right;
    case "lt":
      return left < right;
    case "lte":
      return left <= right;
    case "eq":
      return left === right;
    default:
      return false;
  }
}

/**
 * Evaluate a predicate against a signal snapshot.
 * - unavailable → unknown
 * - status === "unknown" → unknown (never auto-clear)
 * - match → match
 * - otherwise → clear (only when signal is available and not unknown)
 */
export function evaluateAlertPredicate(
  predicate: ObserveAlertPredicate,
  signal: ObserveAlertSignalSnapshot,
): ObserveAlertEvaluationOutcome {
  if (!signal.available) {
    return "unknown";
  }

  if (predicate.kind === "status_in" || predicate.kind === "status_not_in") {
    const raw = readField(signal, predicate.field);
    if (raw === undefined || raw === null) {
      return "unknown";
    }
    const status = String(raw);
    if (status === "unknown") {
      return "unknown";
    }
    const inSet = predicate.values.includes(status);
    const matched = predicate.kind === "status_in" ? inSet : !inSet;
    return matched ? "match" : "clear";
  }

  const raw = readField(signal, predicate.field);
  if (typeof raw !== "number" || Number.isNaN(raw)) {
    return "unknown";
  }
  return compareThreshold(raw, predicate.op, predicate.value) ? "match" : "clear";
}
