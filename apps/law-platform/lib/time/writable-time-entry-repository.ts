import type { ManagedTimeEntry } from "./time-entry-types";

/** Writable time entry repository contract for in-memory workflow (LAW-006-01). */
export interface WritableTimeEntryRepository {
  list(
    criteria?: import("./time-entry-types").TimeEntryListCriteria,
  ): readonly ManagedTimeEntry[];
  getById(timeEntryId: string): ManagedTimeEntry | undefined;
  create(entry: ManagedTimeEntry): ManagedTimeEntry;
  update(timeEntryId: string, entry: ManagedTimeEntry): ManagedTimeEntry | undefined;
  softDelete(timeEntryId: string): ManagedTimeEntry | undefined;
  count(includeDeleted?: boolean): number;
  isSoftDeleted(timeEntryId: string): boolean;
}
