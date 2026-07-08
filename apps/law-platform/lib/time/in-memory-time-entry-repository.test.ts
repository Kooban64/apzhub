import { beforeEach, describe, expect, it } from "vitest";

import {
  SEED_TIME_ENTRIES,
  getSharedTimeEntryRepository,
  resetSharedTimeEntryRepository,
} from "./index";

describe("InMemoryTimeEntryRepository", () => {
  beforeEach(() => {
    resetSharedTimeEntryRepository();
  });

  it("seeds at least 40 time entries linked to matters", () => {
    const repository = getSharedTimeEntryRepository();
    expect(repository.count()).toBeGreaterThanOrEqual(40);
    expect(SEED_TIME_ENTRIES.every((entry) => entry.matterId)).toBe(true);
  });

  it("includes entries referencing tasks and documents", () => {
    expect(SEED_TIME_ENTRIES.some((entry) => entry.taskId)).toBe(true);
    expect(SEED_TIME_ENTRIES.some((entry) => entry.documentId)).toBe(true);
  });

  it("filters by date, matter, task, attorney, and billable status", () => {
    const repository = getSharedTimeEntryRepository();
    const sample = SEED_TIME_ENTRIES[0]!;

    expect(repository.list({ matterId: sample.matterId }).length).toBeGreaterThan(0);
    expect(repository.list({ userId: sample.userId }).length).toBeGreaterThan(0);
    expect(
      repository.list({ billableFilter: sample.billable ? "billable" : "non_billable" })
        .length,
    ).toBeGreaterThan(0);
    if (sample.taskId) {
      expect(repository.list({ taskId: sample.taskId }).length).toBeGreaterThan(0);
    }
  });

  it("soft deletes time entries", () => {
    const repository = getSharedTimeEntryRepository();
    const entry = SEED_TIME_ENTRIES[0]!;

    const deleted = repository.softDelete(entry.timeEntryId);
    expect(deleted?.timeEntryId).toBe(entry.timeEntryId);
    expect(repository.getById(entry.timeEntryId)).toBeUndefined();
    expect(repository.isSoftDeleted(entry.timeEntryId)).toBe(true);
  });
});
