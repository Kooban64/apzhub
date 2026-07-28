import { VerificationInvariantViolation } from "../../shared/errors";
import type { VerificationStatus } from "./verification-status";

/**
 * Permitted transitions (APZQEP-ENG-040A / ARCH-009):
 *
 * draft        -> requested | cancelled | retired
 * requested    -> assigned | in_progress | cancelled | withdrawn
 * assigned     -> in_progress | cancelled | withdrawn
 * in_progress  -> verified | rejected | cancelled | withdrawn
 * verified     -> expired | superseded | retired | withdrawn
 * rejected     -> superseded | retired | requested (re-open)
 * expired      -> superseded | retired | requested (re-open)
 * withdrawn, cancelled, retired, superseded -> (terminal, no further transitions)
 */
const VERIFICATION_TRANSITIONS: Record<
  VerificationStatus,
  readonly VerificationStatus[]
> = {
  draft: ["requested", "cancelled", "retired"],
  requested: ["assigned", "in_progress", "cancelled", "withdrawn"],
  assigned: ["in_progress", "cancelled", "withdrawn"],
  in_progress: ["verified", "rejected", "cancelled", "withdrawn"],
  verified: ["expired", "superseded", "retired", "withdrawn"],
  rejected: ["superseded", "retired", "requested"],
  expired: ["superseded", "retired", "requested"],
  withdrawn: [],
  cancelled: [],
  retired: [],
  superseded: [],
};

export function assertVerificationLifecycleTransition(
  from: VerificationStatus,
  to: VerificationStatus,
): void {
  const allowed = VERIFICATION_TRANSITIONS[from] ?? [];
  if (!allowed.includes(to)) {
    throw new VerificationInvariantViolation(
      `Verification lifecycle transition ${from} -> ${to} is not allowed`,
    );
  }
}

export function isTerminalVerificationStatus(status: VerificationStatus): boolean {
  return (VERIFICATION_TRANSITIONS[status] ?? []).length === 0;
}

export function canTransitionVerificationStatus(
  from: VerificationStatus,
  to: VerificationStatus,
): boolean {
  return (VERIFICATION_TRANSITIONS[from] ?? []).includes(to);
}
