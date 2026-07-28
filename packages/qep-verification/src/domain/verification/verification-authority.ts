import { VerificationInvariantViolation } from "../../shared/errors";
import { VERIFICATION_AUTHORITY_KINDS } from "./constants";

export type VerificationAuthorityKind = (typeof VERIFICATION_AUTHORITY_KINDS)[number];

/**
 * Who/what may assert or decide the Verification outcome (ARCH-009).
 * Required on every Verification.
 */
export type VerificationAuthority = {
  readonly kind: VerificationAuthorityKind;
  readonly actorId: string;
};

export function createVerificationAuthority(input: {
  readonly kind: string;
  readonly actorId: string;
}): VerificationAuthority {
  const kind = input.kind.trim() as VerificationAuthorityKind;
  if (!(VERIFICATION_AUTHORITY_KINDS as readonly string[]).includes(kind)) {
    throw new VerificationInvariantViolation(
      `Verification authority kind must be one of: ${VERIFICATION_AUTHORITY_KINDS.join(", ")}`,
    );
  }
  const actorId = input.actorId.trim();
  if (!actorId) {
    throw new VerificationInvariantViolation("Verification authority requires actorId");
  }
  return { kind, actorId };
}
