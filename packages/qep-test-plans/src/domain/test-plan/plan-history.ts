import type { PlanStatus } from "./value-objects";

export type TestPlanHistoryEntry = {
  readonly sequence: number;
  readonly at: string;
  readonly actorId: string;
  readonly action: string;
  readonly summary: string;
  readonly fromStatus?: PlanStatus;
  readonly toStatus?: PlanStatus;
  readonly correlationId?: string;
};

export type TestPlanHistory = {
  readonly entries: readonly TestPlanHistoryEntry[];
};

export function createEmptyTestPlanHistory(): TestPlanHistory {
  return { entries: [] };
}

export function appendTestPlanHistory(
  history: TestPlanHistory,
  entry: Omit<TestPlanHistoryEntry, "sequence">,
): TestPlanHistory {
  const sequence = history.entries.length + 1;
  return {
    entries: [...history.entries, { ...entry, sequence }],
  };
}
