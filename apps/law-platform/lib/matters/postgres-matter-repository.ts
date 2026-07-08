import type { DatabaseExecutor, PostgresOutboxEventDraft } from "@apzhub/config";
import {
  createDb,
  PostgresMatterRepository as ConfigPostgresMatterRepository,
} from "@apzhub/config";

import { matchesMatterCriteria, sortMattersByTitle } from "./matter-repository-filters";
import type { WritableMatterRepository } from "./writable-matter-repository";
import type { LawPersistenceContext } from "../persistence/law-persistence-context";
import { isOutboxEnabled } from "../persistence/outbox-config";
import { recordOutboxEvent } from "../persistence/outbox-skeleton";
import { runInMatterUnitOfWork } from "../persistence/unit-of-work";
import { runSync } from "../persistence/run-sync";

function createOutboxHandler(context: LawPersistenceContext) {
  if (!isOutboxEnabled()) {
    return undefined;
  }

  return async (db: DatabaseExecutor, draft: PostgresOutboxEventDraft) => {
    await recordOutboxEvent(context, db, draft);
  };
}

/** Law-platform wrapper around config PostgreSQL matter adapter (LAW-012-02/03). */
export class PostgresMatterRepository implements WritableMatterRepository {
  private readonly inner: ConfigPostgresMatterRepository;

  constructor(context: LawPersistenceContext) {
    const db = context.db ?? createDb();
    this.inner = new ConfigPostgresMatterRepository({
      tenantId: context.tenantId,
      db,
      runSync,
      runInTransaction: (operation) =>
        runInMatterUnitOfWork(db, context, async (uow) => operation(uow.db)),
      matchesCriteria: matchesMatterCriteria,
      sortMatters: sortMattersByTitle,
      onOutboxEvent: createOutboxHandler(context),
    });
  }

  list(...args: Parameters<WritableMatterRepository["list"]>) {
    return this.inner.list(...args);
  }

  getById(...args: Parameters<WritableMatterRepository["getById"]>) {
    return this.inner.getById(...args);
  }

  create(...args: Parameters<WritableMatterRepository["create"]>) {
    return this.inner.create(...args);
  }

  update(...args: Parameters<WritableMatterRepository["update"]>) {
    return this.inner.update(...args);
  }

  softArchive(...args: Parameters<WritableMatterRepository["softArchive"]>) {
    return this.inner.softArchive(...args);
  }

  count(...args: Parameters<WritableMatterRepository["count"]>) {
    return this.inner.count(...args);
  }

  isSoftArchived(...args: Parameters<WritableMatterRepository["isSoftArchived"]>) {
    return this.inner.isSoftArchived(...args);
  }
}
