/**
 * Explicit Baseline / Content Version viewing context for a Verification.
 * Distinct from the subject pin — describes the analytical/binding context
 * under which the verification decision is made.
 */
export type VerificationContext = {
  readonly baselineId?: string;
  readonly contentVersionId?: string;
  readonly immutable: boolean;
};

export function createVerificationContext(input?: {
  readonly baselineId?: string;
  readonly contentVersionId?: string;
  readonly immutable?: boolean;
}): VerificationContext {
  const baselineId = input?.baselineId?.trim() || undefined;
  const contentVersionId = input?.contentVersionId?.trim() || undefined;
  const immutable = input?.immutable === true || Boolean(baselineId);
  return { baselineId, contentVersionId, immutable };
}
