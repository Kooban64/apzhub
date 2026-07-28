import { TestSpecificationInvariantViolation } from "../../shared/errors";
import type { SpecificationStatus } from "./specification-status";

/**
 * Permitted transitions (APZQEP-ENG-050A / ARCH-011):
 *
 * draft         -> under_review | cancelled | withdrawn
 * under_review  -> approved | rejected | draft | cancelled | withdrawn
 * approved      -> superseded | withdrawn | retired
 * rejected      -> draft | withdrawn | cancelled   (NOT approved)
 * withdrawn / superseded / cancelled / retired -> (terminal)
 */
const SPECIFICATION_TRANSITIONS: Record<
  SpecificationStatus,
  readonly SpecificationStatus[]
> = {
  draft: ["under_review", "cancelled", "withdrawn"],
  under_review: ["approved", "rejected", "draft", "cancelled", "withdrawn"],
  approved: ["superseded", "withdrawn", "retired"],
  rejected: ["draft", "withdrawn", "cancelled"],
  withdrawn: [],
  superseded: [],
  cancelled: [],
  retired: [],
};

export function assertSpecificationLifecycleTransition(
  from: SpecificationStatus,
  to: SpecificationStatus,
): void {
  const allowed = SPECIFICATION_TRANSITIONS[from] ?? [];
  if (!allowed.includes(to)) {
    throw new TestSpecificationInvariantViolation(
      `Specification lifecycle transition ${from} -> ${to} is not allowed`,
    );
  }
}

export function isTerminalSpecificationStatus(status: SpecificationStatus): boolean {
  return (SPECIFICATION_TRANSITIONS[status] ?? []).length === 0;
}

export function canTransitionSpecificationStatus(
  from: SpecificationStatus,
  to: SpecificationStatus,
): boolean {
  return (SPECIFICATION_TRANSITIONS[from] ?? []).includes(to);
}

export function getAllowedSpecificationTransitions(
  from: SpecificationStatus,
): readonly SpecificationStatus[] {
  return SPECIFICATION_TRANSITIONS[from] ?? [];
}
