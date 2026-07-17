/**
 * Membership helpers (APZIDENTITY-001) — metadata rules only.
 */

import type {
  IdentityMembership,
  IdentityMembershipKind,
} from "@apzhub/identity-contracts";

import { IdentityDomainError } from "../ports/repository-ports";
import { validateIdentityMembership } from "../validation/validate-identity";

export function assertMembershipKindCompatible(
  kind: IdentityMembershipKind,
  targetId: string,
): void {
  if (!targetId.trim()) {
    throw new IdentityDomainError(
      "invalid_membership_target",
      `Membership kind ${kind} requires a non-empty targetId`,
      { kind },
    );
  }
}

export function summarizeMembership(membership: IdentityMembership): string {
  validateIdentityMembership(membership);
  return `${membership.kind}:${membership.targetId}:${membership.status}`;
}

export function isActiveMembership(membership: IdentityMembership): boolean {
  return membership.status === "active";
}
