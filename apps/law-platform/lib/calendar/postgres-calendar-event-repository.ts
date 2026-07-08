import type {
  LawCalendarEventPersistenceModel,
  PostgresCalendarEventListCriteria,
  PostgresOutboxEventDraft,
} from "@apzhub/config";
import {
  createDb,
  PostgresCalendarEventRepository as ConfigPostgresCalendarEventRepository,
} from "@apzhub/config";
import type { DatabaseExecutor } from "@apzhub/config";

import {
  matchesCalendarEventCriteria,
  sortCalendarEventsByStartsAt,
} from "./calendar-event-repository-filters";
import type { WritableCalendarEventRepository } from "./writable-calendar-event-repository";
import type { LawPersistenceContext } from "../persistence/law-persistence-context";
import { isOutboxEnabled } from "../persistence/outbox-config";
import { recordOutboxEvent } from "../persistence/outbox-skeleton";
import { runInCalendarEventUnitOfWork } from "../persistence/unit-of-work";
import { runSync } from "../persistence/run-sync";

function createOutboxHandler(context: LawPersistenceContext) {
  if (!isOutboxEnabled()) {
    return undefined;
  }

  return async (db: DatabaseExecutor, draft: PostgresOutboxEventDraft) => {
    await recordOutboxEvent(context, db, draft);
  };
}

/** Law-platform wrapper around config PostgreSQL calendar adapter (LAW-012-05). */
export class PostgresCalendarEventRepository implements WritableCalendarEventRepository {
  private readonly inner: ConfigPostgresCalendarEventRepository;

  constructor(context: LawPersistenceContext) {
    const db = context.db ?? createDb();
    this.inner = new ConfigPostgresCalendarEventRepository({
      tenantId: context.tenantId,
      db,
      runSync,
      runInTransaction: (operation) =>
        runInCalendarEventUnitOfWork(db, context, async (uow) => operation(uow.db)),
      matchesCriteria: matchesCalendarEventCriteria as (
        event: LawCalendarEventPersistenceModel,
        criteria?: PostgresCalendarEventListCriteria,
      ) => boolean,
      sortEvents: sortCalendarEventsByStartsAt,
      onOutboxEvent: createOutboxHandler(context),
    });
  }

  list(...args: Parameters<WritableCalendarEventRepository["list"]>) {
    return this.inner.list(...args);
  }

  getById(...args: Parameters<WritableCalendarEventRepository["getById"]>) {
    return this.inner.getById(...args);
  }

  create(...args: Parameters<WritableCalendarEventRepository["create"]>) {
    return this.inner.create(...args);
  }

  update(...args: Parameters<WritableCalendarEventRepository["update"]>) {
    return this.inner.update(...args);
  }

  cancel(...args: Parameters<WritableCalendarEventRepository["cancel"]>) {
    return this.inner.cancel(...args);
  }

  count(...args: Parameters<WritableCalendarEventRepository["count"]>) {
    return this.inner.count(...args);
  }
}
