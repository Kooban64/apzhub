/**
 * Table-driven gate status transitions (QO-007).
 */

import { OrchestrationError } from "../contracts/errors";
import type { GateStatus } from "../contracts/governance";

const ALLOWED: Readonly<Record<GateStatus, readonly GateStatus[]>> = {
  pending: [
    "satisfied",
    "failed",
    "waived",
    "deferred",
    "not_applicable",
    "expired",
    "cancelled",
  ],
  satisfied: ["expired", "cancelled"],
  failed: ["waived", "pending", "cancelled"],
  waived: ["expired", "cancelled"],
  deferred: ["pending", "satisfied", "failed", "cancelled"],
  not_applicable: ["cancelled"],
  expired: ["pending", "cancelled"],
  cancelled: [],
};

export function canTransitionGateStatus(from: GateStatus, to: GateStatus): boolean {
  return ALLOWED[from].includes(to);
}

export function assertGateStatusTransition(from: GateStatus, to: GateStatus): void {
  if (!canTransitionGateStatus(from, to)) {
    throw new OrchestrationError(
      "lifecycle",
      "INVALID_GATE_STATUS_TRANSITION",
      `Invalid gate status transition: ${from} → ${to}`,
      { from, to },
    );
  }
}

export function listAllowedGateStatusTransitions(
  from: GateStatus,
): readonly GateStatus[] {
  return ALLOWED[from];
}
