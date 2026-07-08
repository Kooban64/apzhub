import type { ManagedTimeEntry, TimeEntryListCriteria } from "./time-entry-types";
import {
  matchesTimeEntryCriteria,
  sortTimeEntriesByEntryDate,
} from "./time-entry-repository-filters";
import type { WritableTimeEntryRepository } from "./writable-time-entry-repository";
import { SEED_TIME_ENTRIES } from "./seed-time-entries";

/** In-memory writable time entry repository with soft delete (LAW-006-01). */
export class InMemoryTimeEntryRepository implements WritableTimeEntryRepository {
  private readonly entries: Map<string, ManagedTimeEntry>;
  private readonly softDeletedIds = new Set<string>();

  constructor(seed: readonly ManagedTimeEntry[] = SEED_TIME_ENTRIES) {
    this.entries = new Map(seed.map((entry) => [entry.timeEntryId, entry]));
  }

  list(criteria?: TimeEntryListCriteria): readonly ManagedTimeEntry[] {
    return sortTimeEntriesByEntryDate(
      [...this.entries.values()]
        .filter((entry) => !this.softDeletedIds.has(entry.timeEntryId))
        .filter((entry) => matchesTimeEntryCriteria(entry, criteria)),
    );
  }

  getById(timeEntryId: string): ManagedTimeEntry | undefined {
    if (this.softDeletedIds.has(timeEntryId)) {
      return undefined;
    }

    return this.entries.get(timeEntryId);
  }

  create(entry: ManagedTimeEntry): ManagedTimeEntry {
    this.entries.set(entry.timeEntryId, entry);
    this.softDeletedIds.delete(entry.timeEntryId);
    return entry;
  }

  update(timeEntryId: string, entry: ManagedTimeEntry): ManagedTimeEntry | undefined {
    if (!this.entries.has(timeEntryId) || this.softDeletedIds.has(timeEntryId)) {
      return undefined;
    }

    this.entries.set(timeEntryId, entry);
    return entry;
  }

  softDelete(timeEntryId: string): ManagedTimeEntry | undefined {
    const existing = this.entries.get(timeEntryId);
    if (!existing || this.softDeletedIds.has(timeEntryId)) {
      return undefined;
    }

    this.softDeletedIds.add(timeEntryId);
    return existing;
  }

  count(includeDeleted = false): number {
    if (includeDeleted) {
      return this.entries.size;
    }

    return [...this.entries.keys()].filter(
      (timeEntryId) => !this.softDeletedIds.has(timeEntryId),
    ).length;
  }

  isSoftDeleted(timeEntryId: string): boolean {
    return this.softDeletedIds.has(timeEntryId);
  }
}

export {
  getSharedTimeEntryRepository,
  resetSharedTimeEntryRepository,
} from "../persistence/repository-factory";
