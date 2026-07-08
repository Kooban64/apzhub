import type { PostgresOutboxEventDraft } from "@apzhub/config";
import {
  createDb,
  PostgresTaskRepository as ConfigPostgresTaskRepository,
} from "@apzhub/config";
import type { DatabaseExecutor } from "@apzhub/config";

import { matchesTaskCriteria, sortTasksByTitle } from "./task-repository-filters";
import type { ManagedTask } from "./task-types";
import type { WritableTaskRepository } from "./writable-task-repository";
import type { LawPersistenceContext } from "../persistence/law-persistence-context";
import { isOutboxEnabled } from "../persistence/outbox-config";
import { recordOutboxEvent } from "../persistence/outbox-skeleton";
import { runInTaskUnitOfWork } from "../persistence/unit-of-work";
import { runSync } from "../persistence/run-sync";

function createOutboxHandler(context: LawPersistenceContext) {
  if (!isOutboxEnabled()) {
    return undefined;
  }

  return async (db: DatabaseExecutor, draft: PostgresOutboxEventDraft) => {
    await recordOutboxEvent(context, db, draft);
  };
}

/** Law-platform wrapper around config PostgreSQL task adapter (LAW-012-04). */
export class PostgresTaskRepository implements WritableTaskRepository {
  private readonly inner: ConfigPostgresTaskRepository;

  constructor(context: LawPersistenceContext) {
    const db = context.db ?? createDb();
    this.inner = new ConfigPostgresTaskRepository({
      tenantId: context.tenantId,
      db,
      runSync,
      runInTransaction: (operation) =>
        runInTaskUnitOfWork(db, context, async (uow) => operation(uow.db)),
      matchesCriteria: matchesTaskCriteria,
      sortTasks: sortTasksByTitle,
      onOutboxEvent: createOutboxHandler(context),
    });
  }

  list(...args: Parameters<WritableTaskRepository["list"]>) {
    return this.inner.list(...args) as readonly ManagedTask[];
  }

  getById(...args: Parameters<WritableTaskRepository["getById"]>) {
    return this.inner.getById(...args) as ManagedTask | undefined;
  }

  create(...args: Parameters<WritableTaskRepository["create"]>) {
    return this.inner.create(...args) as ManagedTask;
  }

  update(...args: Parameters<WritableTaskRepository["update"]>) {
    return this.inner.update(...args) as ManagedTask | undefined;
  }

  softArchive(...args: Parameters<WritableTaskRepository["softArchive"]>) {
    return this.inner.softArchive(...args) as ManagedTask | undefined;
  }

  count(...args: Parameters<WritableTaskRepository["count"]>) {
    return this.inner.count(...args);
  }

  isSoftArchived(...args: Parameters<WritableTaskRepository["isSoftArchived"]>) {
    return this.inner.isSoftArchived(...args);
  }
}
