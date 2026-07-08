import type { PostgresOutboxEventDraft } from "@apzhub/config";
import {
  createDb,
  PostgresTimeEntryRepository as ConfigPostgresTimeEntryRepository,
} from "@apzhub/config";
import type { DatabaseExecutor } from "@apzhub/config";

import {
  matchesTimeEntryCriteria,
  sortTimeEntriesByEntryDate,
} from "./time-entry-repository-filters";
import type { ManagedTimeEntry } from "./time-entry-types";
import type { WritableTimeEntryRepository } from "./writable-time-entry-repository";
import type { LawPersistenceContext } from "../persistence/law-persistence-context";
import { isOutboxEnabled } from "../persistence/outbox-config";
import { recordOutboxEvent } from "../persistence/outbox-skeleton";
import { runInTimeEntryUnitOfWork } from "../persistence/unit-of-work";
import { runSync } from "../persistence/run-sync";

function createOutboxHandler(context: LawPersistenceContext) {
  if (!isOutboxEnabled()) {
    return undefined;
  }

  return async (db: DatabaseExecutor, draft: PostgresOutboxEventDraft) => {
    await recordOutboxEvent(context, db, draft);
  };
}

/** Law-platform wrapper around config PostgreSQL time entry adapter (LAW-012-05). */
export class PostgresTimeEntryRepository implements WritableTimeEntryRepository {
  private readonly inner: ConfigPostgresTimeEntryRepository;

  constructor(context: LawPersistenceContext) {
    const db = context.db ?? createDb();
    this.inner = new ConfigPostgresTimeEntryRepository({
      tenantId: context.tenantId,
      db,
      runSync,
      runInTransaction: (operation) =>
        runInTimeEntryUnitOfWork(db, context, async (uow) => operation(uow.db)),
      matchesCriteria: matchesTimeEntryCriteria,
      sortEntries: sortTimeEntriesByEntryDate,
      onOutboxEvent: createOutboxHandler(context),
    });
  }

  list(...args: Parameters<WritableTimeEntryRepository["list"]>) {
    return this.inner.list(...args) as readonly ManagedTimeEntry[];
  }

  getById(...args: Parameters<WritableTimeEntryRepository["getById"]>) {
    return this.inner.getById(...args) as ManagedTimeEntry | undefined;
  }

  create(...args: Parameters<WritableTimeEntryRepository["create"]>) {
    return this.inner.create(...args) as ManagedTimeEntry;
  }

  update(...args: Parameters<WritableTimeEntryRepository["update"]>) {
    return this.inner.update(...args) as ManagedTimeEntry | undefined;
  }

  softDelete(...args: Parameters<WritableTimeEntryRepository["softDelete"]>) {
    return this.inner.softDelete(...args) as ManagedTimeEntry | undefined;
  }

  count(...args: Parameters<WritableTimeEntryRepository["count"]>) {
    return this.inner.count(...args);
  }

  isSoftDeleted(...args: Parameters<WritableTimeEntryRepository["isSoftDeleted"]>) {
    return this.inner.isSoftDeleted(...args);
  }
}
