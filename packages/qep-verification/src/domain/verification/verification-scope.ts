import { VerificationInvariantViolation } from "../../shared/errors";
import { VERIFICATION_SCOPE_KINDS } from "./constants";

export type VerificationScopeKind = (typeof VERIFICATION_SCOPE_KINDS)[number];

export type VerificationScope = {
  readonly kind: VerificationScopeKind;
  readonly referenceId?: string;
};

export function createVerificationScope(input: {
  readonly kind: string;
  readonly referenceId?: string;
}): VerificationScope {
  const kind = input.kind.trim() as VerificationScopeKind;
  if (!(VERIFICATION_SCOPE_KINDS as readonly string[]).includes(kind)) {
    throw new VerificationInvariantViolation(
      `Verification scope kind must be one of: ${VERIFICATION_SCOPE_KINDS.join(", ")}`,
    );
  }
  if (kind === "tenant_global") {
    if (input.referenceId !== undefined && input.referenceId.trim() !== "") {
      throw new VerificationInvariantViolation(
        "tenant_global scope must not include referenceId",
      );
    }
    return { kind };
  }
  const referenceId = input.referenceId?.trim();
  if (!referenceId) {
    throw new VerificationInvariantViolation(`Verification scope ${kind} requires referenceId`);
  }
  if (kind === "baseline" && !/^rbl_[A-Za-z0-9_-]+$/.test(referenceId)) {
    throw new VerificationInvariantViolation("Baseline scope referenceId must start with rbl_");
  }
  return { kind, referenceId };
}

export function verificationScopeKey(scope: VerificationScope): string {
  return `${scope.kind}:${scope.referenceId ?? ""}`;
}
