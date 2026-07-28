/**
 * Append-only domain history entry for a Verification.
 * Never rewritten or deleted.
 */
export type VerificationHistoryEntry = {
  readonly at: string;
  readonly by: string;
  readonly kind: string;
  readonly summary: string;
};

export type VerificationHistory = {
  readonly entries: readonly VerificationHistoryEntry[];
};

export function createEmptyVerificationHistory(): VerificationHistory {
  return { entries: [] };
}

export function appendVerificationHistory(
  history: VerificationHistory,
  entry: VerificationHistoryEntry,
): VerificationHistory {
  return { entries: [...history.entries, entry] };
}
