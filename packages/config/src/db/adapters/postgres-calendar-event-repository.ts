import { and, eq, isNull } from "drizzle-orm";

import { createDb, type DatabaseExecutor } from "../client";
import {
  lawCalendarEvent,
  lawClient,
  lawDocument,
  lawMatter,
  lawTask,
} from "../legal-schema";
import {
  calendarEventToRow,
  rowToCalendarEvent,
  type LawCalendarEventPersistenceModel,
} from "../law-mappers/calendar-event-row-mapper";
import {
  createCalendarOutboxDraft,
  type PostgresOutboxEventDraft,
} from "../law-mappers/outbox-drafts";

export interface PostgresCalendarEventListCriteria {
  readonly query?: string;
  readonly dateRangeFilter?:
    "all" | "today" | "this_week" | "this_month" | "next_30_days";
  readonly dateFrom?: string;
  readonly dateTo?: string;
  readonly matterId?: string;
  readonly clientId?: string;
  readonly ownerUserId?: string;
  readonly eventType?: LawCalendarEventPersistenceModel["eventType"] | "all";
  readonly calendarEventStatus?: string | "all";
}

export interface PostgresCalendarEventRepositoryContract {
  list(
    criteria?: PostgresCalendarEventListCriteria,
  ): readonly LawCalendarEventPersistenceModel[];
  getById(calendarEventId: string): LawCalendarEventPersistenceModel | undefined;
  create(event: LawCalendarEventPersistenceModel): LawCalendarEventPersistenceModel;
  update(
    calendarEventId: string,
    event: LawCalendarEventPersistenceModel,
  ): LawCalendarEventPersistenceModel | undefined;
  cancel(calendarEventId: string): LawCalendarEventPersistenceModel | undefined;
  count(): number;
}

export interface PostgresCalendarEventRepositoryOptions {
  readonly tenantId: string;
  readonly db?: DatabaseExecutor;
  readonly runSync: <T>(promise: Promise<T>) => T;
  readonly runInTransaction: <T>(
    operation: (db: DatabaseExecutor) => Promise<T>,
  ) => Promise<T>;
  readonly matchesCriteria: (
    event: LawCalendarEventPersistenceModel,
    criteria?: PostgresCalendarEventListCriteria,
  ) => boolean;
  readonly sortEvents: (
    events: readonly LawCalendarEventPersistenceModel[],
  ) => LawCalendarEventPersistenceModel[];
  readonly onOutboxEvent?: (
    db: DatabaseExecutor,
    draft: PostgresOutboxEventDraft,
  ) => Promise<void>;
}

/** PostgreSQL-backed calendar event repository with tenant isolation (LAW-012-05). */
export class PostgresCalendarEventRepository implements PostgresCalendarEventRepositoryContract {
  constructor(private readonly options: PostgresCalendarEventRepositoryOptions) {}

  private get db() {
    return this.options.db ?? createDb();
  }

  list(
    criteria?: PostgresCalendarEventListCriteria,
  ): readonly LawCalendarEventPersistenceModel[] {
    return this.options.runSync(this.listAsync(criteria));
  }

  getById(calendarEventId: string): LawCalendarEventPersistenceModel | undefined {
    return this.options.runSync(this.getByIdAsync(calendarEventId));
  }

  create(event: LawCalendarEventPersistenceModel): LawCalendarEventPersistenceModel {
    this.options.runSync(
      this.options.runInTransaction(async (tx) => {
        await this.assertCalendarRelationships(tx, event);
        await tx
          .insert(lawCalendarEvent)
          .values(calendarEventToRow(event, this.options.tenantId));
        await this.options.onOutboxEvent?.(
          tx,
          createCalendarOutboxDraft("legal.calendar.created", event),
        );
      }),
    );
    return event;
  }

  update(
    calendarEventId: string,
    event: LawCalendarEventPersistenceModel,
  ): LawCalendarEventPersistenceModel | undefined {
    return this.options.runSync(this.updateAsync(calendarEventId, event));
  }

  cancel(calendarEventId: string): LawCalendarEventPersistenceModel | undefined {
    return this.options.runSync(this.cancelAsync(calendarEventId));
  }

  count(): number {
    return this.options.runSync(this.countAsync());
  }

  private async assertMatterExists(
    db: DatabaseExecutor,
    matterId: string,
  ): Promise<void> {
    const rows = await db
      .select({ matterId: lawMatter.matterId })
      .from(lawMatter)
      .where(
        and(
          eq(lawMatter.tenantId, this.options.tenantId),
          eq(lawMatter.matterId, matterId),
          isNull(lawMatter.archivedAt),
        ),
      )
      .limit(1);

    if (!rows[0]) {
      throw new Error(`Matter not found for tenant: ${matterId}`);
    }
  }

  private async assertClientExists(
    db: DatabaseExecutor,
    clientId: string,
  ): Promise<void> {
    const rows = await db
      .select({ clientId: lawClient.clientId })
      .from(lawClient)
      .where(
        and(
          eq(lawClient.tenantId, this.options.tenantId),
          eq(lawClient.clientId, clientId),
          isNull(lawClient.deletedAt),
        ),
      )
      .limit(1);

    if (!rows[0]) {
      throw new Error(`Client not found for tenant: ${clientId}`);
    }
  }

  private async assertTaskLink(
    db: DatabaseExecutor,
    matterId: string,
    taskId: string,
  ): Promise<void> {
    const rows = await db
      .select({ matterId: lawTask.matterId })
      .from(lawTask)
      .where(
        and(
          eq(lawTask.tenantId, this.options.tenantId),
          eq(lawTask.taskId, taskId),
          isNull(lawTask.archivedAt),
        ),
      )
      .limit(1);

    if (!rows[0]) {
      throw new Error(`Task not found for tenant: ${taskId}`);
    }

    if (rows[0].matterId !== matterId) {
      throw new Error(`Task ${taskId} does not belong to matter ${matterId}`);
    }
  }

  private async assertDocumentLink(
    db: DatabaseExecutor,
    matterId: string,
    documentId: string,
  ): Promise<void> {
    const rows = await db
      .select({ matterId: lawDocument.matterId })
      .from(lawDocument)
      .where(
        and(
          eq(lawDocument.tenantId, this.options.tenantId),
          eq(lawDocument.documentId, documentId),
          isNull(lawDocument.archivedAt),
        ),
      )
      .limit(1);

    if (!rows[0]) {
      throw new Error(`Document not found for tenant: ${documentId}`);
    }

    if (rows[0].matterId !== matterId) {
      throw new Error(`Document ${documentId} does not belong to matter ${matterId}`);
    }
  }

  private async assertCalendarRelationships(
    db: DatabaseExecutor,
    event: LawCalendarEventPersistenceModel,
  ): Promise<void> {
    const matterId = event.matterId?.trim();
    if (!matterId) {
      throw new Error("Matter is required for calendar event persistence.");
    }

    await this.assertMatterExists(db, matterId);

    if (event.clientId) {
      await this.assertClientExists(db, event.clientId);
    }

    if (event.taskId) {
      await this.assertTaskLink(db, matterId, event.taskId);
    }

    if (event.documentId) {
      await this.assertDocumentLink(db, matterId, event.documentId);
    }
  }

  private async listAsync(
    criteria?: PostgresCalendarEventListCriteria,
  ): Promise<readonly LawCalendarEventPersistenceModel[]> {
    const rows = await this.db
      .select()
      .from(lawCalendarEvent)
      .where(eq(lawCalendarEvent.tenantId, this.options.tenantId));

    const events = rows
      .map(rowToCalendarEvent)
      .filter((event) => this.options.matchesCriteria(event, criteria));
    return this.options.sortEvents(events);
  }

  private async getByIdAsync(
    calendarEventId: string,
  ): Promise<LawCalendarEventPersistenceModel | undefined> {
    const rows = await this.db
      .select()
      .from(lawCalendarEvent)
      .where(
        and(
          eq(lawCalendarEvent.tenantId, this.options.tenantId),
          eq(lawCalendarEvent.calendarEventId, calendarEventId),
        ),
      )
      .limit(1);

    const row = rows[0];
    return row ? rowToCalendarEvent(row) : undefined;
  }

  private async updateAsync(
    calendarEventId: string,
    event: LawCalendarEventPersistenceModel,
  ): Promise<LawCalendarEventPersistenceModel | undefined> {
    return this.options.runInTransaction(async (tx) => {
      await this.assertCalendarRelationships(tx, event);

      const rows = await tx
        .select()
        .from(lawCalendarEvent)
        .where(
          and(
            eq(lawCalendarEvent.tenantId, this.options.tenantId),
            eq(lawCalendarEvent.calendarEventId, calendarEventId),
          ),
        )
        .limit(1);

      const existing = rows[0];
      if (!existing) {
        return undefined;
      }

      const wasCancelled = existing.calendarEventStatus === "cancelled";
      const nextVersion = (existing.version ?? 1) + 1;
      const result = await tx
        .update(lawCalendarEvent)
        .set({
          ...calendarEventToRow(event, this.options.tenantId),
          version: nextVersion,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(lawCalendarEvent.tenantId, this.options.tenantId),
            eq(lawCalendarEvent.calendarEventId, calendarEventId),
          ),
        )
        .returning();

      const updated = result[0] ? rowToCalendarEvent(result[0]) : undefined;
      if (updated) {
        const isCancelled = updated.calendarEventStatus === "cancelled";
        const eventType =
          isCancelled && !wasCancelled
            ? "legal.calendar.cancelled"
            : "legal.calendar.updated";
        await this.options.onOutboxEvent?.(
          tx,
          createCalendarOutboxDraft(eventType, updated),
        );
      }

      return updated;
    });
  }

  private async cancelAsync(
    calendarEventId: string,
  ): Promise<LawCalendarEventPersistenceModel | undefined> {
    return this.options.runInTransaction(async (tx) => {
      const rows = await tx
        .select()
        .from(lawCalendarEvent)
        .where(
          and(
            eq(lawCalendarEvent.tenantId, this.options.tenantId),
            eq(lawCalendarEvent.calendarEventId, calendarEventId),
          ),
        )
        .limit(1);

      const existing = rows[0];
      if (!existing || existing.calendarEventStatus === "cancelled") {
        return undefined;
      }

      const now = new Date();
      const result = await tx
        .update(lawCalendarEvent)
        .set({
          calendarEventStatus: "cancelled",
          updatedAt: now,
          version: (existing.version ?? 1) + 1,
        })
        .where(
          and(
            eq(lawCalendarEvent.tenantId, this.options.tenantId),
            eq(lawCalendarEvent.calendarEventId, calendarEventId),
          ),
        )
        .returning();

      const cancelled = result[0] ? rowToCalendarEvent(result[0]) : undefined;
      if (cancelled) {
        await this.options.onOutboxEvent?.(
          tx,
          createCalendarOutboxDraft("legal.calendar.cancelled", cancelled),
        );
      }

      return cancelled;
    });
  }

  private async countAsync(): Promise<number> {
    const rows = await this.db
      .select()
      .from(lawCalendarEvent)
      .where(eq(lawCalendarEvent.tenantId, this.options.tenantId));

    return rows.length;
  }
}
