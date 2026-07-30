export type EvidenceHistoryEntry = {
  readonly sequence: number;
  readonly command: string;
  readonly actorId: string;
  readonly occurredAt: string;
  readonly summary: string;
  readonly fromStatus?: string;
  readonly toStatus?: string;
};

export type EvidenceHistory = {
  readonly entries: readonly EvidenceHistoryEntry[];
};

export function createEmptyEvidenceHistory(): EvidenceHistory {
  return { entries: [] };
}

export function appendEvidenceHistory(
  history: EvidenceHistory,
  entry: Omit<EvidenceHistoryEntry, "sequence">,
): EvidenceHistory {
  const sequence = history.entries.length + 1;
  return {
    entries: [...history.entries, { ...entry, sequence }],
  };
}
