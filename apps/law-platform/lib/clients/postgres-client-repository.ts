import type { PostgresOutboxEventDraft } from "@apzhub/config";
import {
  createDb,
  PostgresClientRepository as ConfigPostgresClientRepository,
} from "@apzhub/config";
import type { DatabaseExecutor } from "@apzhub/config";

import {
  matchesClientCriteria,
  sortClientsByDisplayName,
} from "./client-repository-filters";
import type { WritableClientRepository } from "./writable-client-repository";
import type { LawPersistenceContext } from "../persistence/law-persistence-context";
import { isOutboxEnabled } from "../persistence/outbox-config";
import { recordOutboxEvent } from "../persistence/outbox-skeleton";
import { runInClientUnitOfWork } from "../persistence/unit-of-work";
import { runSync } from "../persistence/run-sync";

function createOutboxHandler(context: LawPersistenceContext) {
  if (!isOutboxEnabled()) {
    return undefined;
  }

  return async (db: DatabaseExecutor, draft: PostgresOutboxEventDraft) => {
    await recordOutboxEvent(context, db, draft);
  };
}

/** Law-platform wrapper around config PostgreSQL client adapter (LAW-012-02/03). */
export class PostgresClientRepository implements WritableClientRepository {
  private readonly inner: ConfigPostgresClientRepository;

  constructor(context: LawPersistenceContext) {
    const db = context.db ?? createDb();
    this.inner = new ConfigPostgresClientRepository({
      tenantId: context.tenantId,
      db,
      runSync,
      runInTransaction: (operation) =>
        runInClientUnitOfWork(db, context, async (uow) => operation(uow.db)),
      matchesCriteria: matchesClientCriteria,
      sortClients: sortClientsByDisplayName,
      onOutboxEvent: createOutboxHandler(context),
    });
  }

  list(...args: Parameters<WritableClientRepository["list"]>) {
    return this.inner.list(...args);
  }

  getById(...args: Parameters<WritableClientRepository["getById"]>) {
    return this.inner.getById(...args);
  }

  create(...args: Parameters<WritableClientRepository["create"]>) {
    return this.inner.create(...args);
  }

  update(...args: Parameters<WritableClientRepository["update"]>) {
    return this.inner.update(...args);
  }

  softDelete(...args: Parameters<WritableClientRepository["softDelete"]>) {
    return this.inner.softDelete(...args);
  }

  count(...args: Parameters<WritableClientRepository["count"]>) {
    return this.inner.count(...args);
  }

  isSoftDeleted(...args: Parameters<WritableClientRepository["isSoftDeleted"]>) {
    return this.inner.isSoftDeleted(...args);
  }
}
