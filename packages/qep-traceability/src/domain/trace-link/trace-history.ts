/**
 * Append-only domain history entry for a Trace Link.
 * Never rewritten or deleted.
 */
export type TraceHistoryEntry = {
  readonly at: string;
  readonly by: string;
  readonly kind: string;
  readonly summary: string;
};

export type TraceHistory = {
  readonly entries: readonly TraceHistoryEntry[];
};

export function createEmptyTraceHistory(): TraceHistory {
  return { entries: [] };
}

export function appendTraceHistory(
  history: TraceHistory,
  entry: TraceHistoryEntry,
): TraceHistory {
  return { entries: [...history.entries, entry] };
}
