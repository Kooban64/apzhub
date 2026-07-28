import type { ExecutionStatus } from "./value-objects";

export type ExecutionHistoryEntry = {
  readonly sequence: number;
  readonly at: string;
  readonly actorId: string;
  readonly action: string;
  readonly summary: string;
  readonly fromStatus?: ExecutionStatus;
  readonly toStatus?: ExecutionStatus;
  readonly correlationId?: string;
  readonly metadata?: Readonly<Record<string, string>>;
};

export type ExecutionHistory = {
  readonly entries: readonly ExecutionHistoryEntry[];
};

export function createEmptyExecutionHistory(): ExecutionHistory {
  return { entries: [] };
}

export function appendExecutionHistory(
  history: ExecutionHistory,
  entry: Omit<ExecutionHistoryEntry, "sequence">,
): ExecutionHistory {
  const sequence = history.entries.length + 1;
  return {
    entries: [...history.entries, { ...entry, sequence }],
  };
}

export type HistoryEntryInput = Omit<ExecutionHistoryEntry, "sequence">;

export const ExecutionHistoryRecorder = {
  append(history: ExecutionHistory, entry: HistoryEntryInput): ExecutionHistory {
    return appendExecutionHistory(history, entry);
  },
};
