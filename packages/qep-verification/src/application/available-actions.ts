import {
  computeQepVerificationAvailableActions,
  type QepVerificationAction,
} from "@apzhub/qep-contracts";

import type { StoredVerification } from "../domain/verification/verification-repository";

/**
 * Computes the Verification commands a caller may perform for a persisted
 * Verification, delegating to the canonical `@apzhub/qep-contracts` rules so
 * callers and the application layer never diverge. The server-side command
 * handlers in `VerificationApplicationService` remain authoritative.
 */
export function computeVerificationAvailableActions(
  verification: Pick<StoredVerification, "status">,
  permissions?: readonly string[],
): readonly QepVerificationAction[] {
  return computeQepVerificationAvailableActions(verification.status, permissions);
}

export { type QepVerificationAction };
