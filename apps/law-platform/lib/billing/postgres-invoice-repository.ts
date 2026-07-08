import type { PostgresOutboxEventDraft } from "@apzhub/config";
import {
  createDb,
  PostgresInvoiceRepository as ConfigPostgresInvoiceRepository,
} from "@apzhub/config";
import type { DatabaseExecutor } from "@apzhub/config";

import {
  matchesInvoiceCriteria,
  sortInvoicesByIssueDate,
} from "./invoice-repository-filters";
import type { ManagedInvoice } from "./invoice-types";
import type { WritableInvoiceRepository } from "./writable-invoice-repository";
import type { LawPersistenceContext } from "../persistence/law-persistence-context";
import { isOutboxEnabled } from "../persistence/outbox-config";
import { recordOutboxEvent } from "../persistence/outbox-skeleton";
import { runInInvoiceUnitOfWork } from "../persistence/unit-of-work";
import { runSync } from "../persistence/run-sync";

function createOutboxHandler(context: LawPersistenceContext) {
  if (!isOutboxEnabled()) {
    return undefined;
  }

  return async (db: DatabaseExecutor, draft: PostgresOutboxEventDraft) => {
    await recordOutboxEvent(context, db, draft);
  };
}

/** Law-platform wrapper around config PostgreSQL invoice adapter (LAW-012-06). */
export class PostgresInvoiceRepository implements WritableInvoiceRepository {
  private readonly inner: ConfigPostgresInvoiceRepository;

  constructor(context: LawPersistenceContext) {
    const db = context.db ?? createDb();
    this.inner = new ConfigPostgresInvoiceRepository({
      tenantId: context.tenantId,
      db,
      runSync,
      runInTransaction: (operation) =>
        runInInvoiceUnitOfWork(db, context, async (uow) => operation(uow.db)),
      matchesCriteria: matchesInvoiceCriteria,
      sortInvoices: sortInvoicesByIssueDate,
      onOutboxEvent: createOutboxHandler(context),
    });
  }

  list(...args: Parameters<WritableInvoiceRepository["list"]>) {
    return this.inner.list(...args) as readonly ManagedInvoice[];
  }

  getById(...args: Parameters<WritableInvoiceRepository["getById"]>) {
    return this.inner.getById(...args) as ManagedInvoice | undefined;
  }

  create(...args: Parameters<WritableInvoiceRepository["create"]>) {
    return this.inner.create(...args) as ManagedInvoice;
  }

  update(...args: Parameters<WritableInvoiceRepository["update"]>) {
    return this.inner.update(...args) as ManagedInvoice | undefined;
  }

  count(...args: Parameters<WritableInvoiceRepository["count"]>) {
    return this.inner.count(...args);
  }
}
