import { describe, expect, it } from "vitest";
import { TimeEntryFactory } from "@apzhub/legal-business-core";

import type { WritableTimeEntryRepository } from "./writable-time-entry-repository";
import type { ManagedTimeEntry } from "./time-entry-types";
import { InMemoryTimeEntryRepository } from "./in-memory-time-entry-repository";
import { SEED_TIME_ENTRIES } from "./seed-time-entries";
import { SEED_MATTERS } from "../matters/seed-matters";
import { getAttorneyDefaultRate, SEED_TIME_ATTORNEYS } from "./seed-attorneys";

export function registerWritableTimeEntryRepositoryContract(
  label: string,
  createRepository: () => WritableTimeEntryRepository,
  options?: { readonly seedCount?: number },
): void {
  describe(`${label} — writable time entry repository contract`, () => {
    it("lists and retrieves seeded time entries", () => {
      const repository = createRepository();
      const expectedCount = options?.seedCount ?? 42;

      expect(repository.count()).toBe(expectedCount);
      expect(repository.list()).toHaveLength(expectedCount);
      expect(repository.getById(SEED_TIME_ENTRIES[0]!.timeEntryId)).toEqual(
        SEED_TIME_ENTRIES[0],
      );
    });

    it("filters time entries by query, matter, and billable status", () => {
      const repository = createRepository();

      expect(repository.list({ query: "Harbourview" }).length).toBeGreaterThan(0);
      expect(
        repository.list({ matterId: SEED_MATTERS[0]!.matterId }).length,
      ).toBeGreaterThan(0);
      expect(repository.list({ billableFilter: "billable" }).length).toBeGreaterThan(0);
      expect(repository.list({ query: "zzzz-not-found" })).toHaveLength(0);
    });

    it("creates, updates, and soft deletes time entries", () => {
      const repository = createRepository();
      const matter = SEED_MATTERS[0]!;
      const attorney = SEED_TIME_ATTORNEYS[0]!;
      const createdBase = TimeEntryFactory.create({
        matterId: matter.matterId,
        userId: attorney.userId,
        entryDate: new Date().toISOString().slice(0, 10),
        durationMinutes: 60,
        narrative: "Contract test time entry",
        rate: getAttorneyDefaultRate(attorney.userId),
      });

      const created: ManagedTimeEntry = {
        ...createdBase,
        createdAt: new Date().toISOString(),
      };

      repository.create(created);
      expect(repository.getById(created.timeEntryId)?.narrative).toBe(
        "Contract test time entry",
      );

      const updated = repository.update(created.timeEntryId, {
        ...created,
        narrative: "Updated contract time entry",
      });
      expect(updated?.narrative).toBe("Updated contract time entry");

      const deleted = repository.softDelete(created.timeEntryId);
      expect(deleted?.timeEntryId).toBe(created.timeEntryId);
      expect(repository.getById(created.timeEntryId)).toBeUndefined();
      expect(repository.isSoftDeleted(created.timeEntryId)).toBe(true);
    });
  });
}

registerWritableTimeEntryRepositoryContract(
  "InMemoryTimeEntryRepository",
  () => new InMemoryTimeEntryRepository(),
);
