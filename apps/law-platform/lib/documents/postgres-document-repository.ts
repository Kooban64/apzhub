import type { PostgresOutboxEventDraft } from "@apzhub/config";
import {
  createDb,
  PostgresDocumentRepository as ConfigPostgresDocumentRepository,
} from "@apzhub/config";
import type { DatabaseExecutor } from "@apzhub/config";

import {
  matchesDocumentCriteria,
  sortDocumentsByTitle,
} from "./document-repository-filters";
import type { WritableDocumentRepository } from "./writable-document-repository";
import type { LawPersistenceContext } from "../persistence/law-persistence-context";
import { isOutboxEnabled } from "../persistence/outbox-config";
import { recordOutboxEvent } from "../persistence/outbox-skeleton";
import { runInDocumentUnitOfWork } from "../persistence/unit-of-work";
import { runSync } from "../persistence/run-sync";

function createOutboxHandler(context: LawPersistenceContext) {
  if (!isOutboxEnabled()) {
    return undefined;
  }

  return async (db: DatabaseExecutor, draft: PostgresOutboxEventDraft) => {
    await recordOutboxEvent(context, db, draft);
  };
}

/** Law-platform wrapper around config PostgreSQL document adapter (LAW-012-04). */
export class PostgresDocumentRepository implements WritableDocumentRepository {
  private readonly inner: ConfigPostgresDocumentRepository;

  constructor(context: LawPersistenceContext) {
    const db = context.db ?? createDb();
    this.inner = new ConfigPostgresDocumentRepository({
      tenantId: context.tenantId,
      db,
      runSync,
      runInTransaction: (operation) =>
        runInDocumentUnitOfWork(db, context, async (uow) => operation(uow.db)),
      matchesCriteria: matchesDocumentCriteria,
      sortDocuments: sortDocumentsByTitle,
      onOutboxEvent: createOutboxHandler(context),
    });
  }

  list(...args: Parameters<WritableDocumentRepository["list"]>) {
    return this.inner.list(...args);
  }

  getById(...args: Parameters<WritableDocumentRepository["getById"]>) {
    return this.inner.getById(...args);
  }

  create(...args: Parameters<WritableDocumentRepository["create"]>) {
    return this.inner.create(...args);
  }

  update(...args: Parameters<WritableDocumentRepository["update"]>) {
    return this.inner.update(...args);
  }

  softArchive(...args: Parameters<WritableDocumentRepository["softArchive"]>) {
    return this.inner.softArchive(...args);
  }

  count(...args: Parameters<WritableDocumentRepository["count"]>) {
    return this.inner.count(...args);
  }

  isSoftArchived(...args: Parameters<WritableDocumentRepository["isSoftArchived"]>) {
    return this.inner.isSoftArchived(...args);
  }
}
