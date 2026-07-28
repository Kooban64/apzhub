import { TraceInvariantViolation } from "../../shared/errors";

export type TraceAuthorityKind = "user" | "system" | "role";

/**
 * Who/what may assert or approve the Trace Link (ARCH-007).
 * Required on every Trace Link.
 */
export type TraceAuthority = {
  readonly kind: TraceAuthorityKind;
  readonly actorId: string;
};

export function createTraceAuthority(input: {
  readonly kind: string;
  readonly actorId: string;
}): TraceAuthority {
  const kind = input.kind.trim() as TraceAuthorityKind;
  if (kind !== "user" && kind !== "system" && kind !== "role") {
    throw new TraceInvariantViolation(
      "Trace authority kind must be user, system, or role",
    );
  }
  const actorId = input.actorId.trim();
  if (!actorId) {
    throw new TraceInvariantViolation("Trace authority requires actorId");
  }
  return { kind, actorId };
}
