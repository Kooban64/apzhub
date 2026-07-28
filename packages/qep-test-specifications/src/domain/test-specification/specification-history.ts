/**
 * Append-only domain history for a Test Specification.
 * Never rewritten or deleted.
 */
export type SpecificationHistoryEntry = {
  readonly at: string;
  readonly by: string;
  readonly kind: string;
  readonly summary: string;
};

export type SpecificationHistory = {
  readonly entries: readonly SpecificationHistoryEntry[];
};

export function createEmptySpecificationHistory(): SpecificationHistory {
  return { entries: [] };
}

export function appendSpecificationHistory(
  history: SpecificationHistory,
  entry: SpecificationHistoryEntry,
): SpecificationHistory {
  return { entries: [...history.entries, entry] };
}
