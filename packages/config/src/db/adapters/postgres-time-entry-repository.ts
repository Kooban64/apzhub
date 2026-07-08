import { and, eq, isNull } from "drizzle-orm";

import { createDb, type DatabaseExecutor } from "../client";
import { lawDocument, lawMatter, lawTask, lawTimeEntry } from "../legal-schema";
import {
  createTimeOutboxDraft,
  type PostgresOutboxEventDraft,
} from "../law-mappers/outbox-drafts";
import {
  rowToTimeEntry,
  timeEntryToRow,
  type LawTimeEntryPersistenceModel,
} from "../law-mappers/time-entry-row-mapper";

export interface PostgresTimeEntryListCriteria {
  readonly query?: string;
  readonly entryDateFilter?:
    "all" | "today" | "this_week" | "this_month" | "last_30_days";
  readonly matterId?: string;
  readonly taskId?: string;
  readonly userId?: string;
  readonly billableFilter?: "all" | "billable" | "non_billable";
}

export interface PostgresTimeEntryRepositoryContract {
  list(
    criteria?: PostgresTimeEntryListCriteria,
  ): readonly LawTimeEntryPersistenceModel[];
  getById(timeEntryId: string): LawTimeEntryPersistenceModel | undefined;
  create(entry: LawTimeEntryPersistenceModel): LawTimeEntryPersistenceModel;
  update(
    timeEntryId: string,
    entry: LawTimeEntryPersistenceModel,
  ): LawTimeEntryPersistenceModel | undefined;
  softDelete(timeEntryId: string): LawTimeEntryPersistenceModel | undefined;
  count(includeDeleted?: boolean): number;
  isSoftDeleted(timeEntryId: string): boolean;
}

export interface PostgresTimeEntryRepositoryOptions {
  readonly tenantId: string;
  readonly db?: DatabaseExecutor;
  readonly runSync: <T>(promise: Promise<T>) => T;
  readonly runInTransaction: <T>(
    operation: (db: DatabaseExecutor) => Promise<T>,
  ) => Promise<T>;
  readonly matchesCriteria: (
    entry: LawTimeEntryPersistenceModel,
    criteria?: PostgresTimeEntryListCriteria,
  ) => boolean;
  readonly sortEntries: (
    entries: readonly LawTimeEntryPersistenceModel[],
  ) => LawTimeEntryPersistenceModel[];
  readonly onOutboxEvent?: (
    db: DatabaseExecutor,
    draft: PostgresOutboxEventDraft,
  ) => Promise<void>;
}

/** PostgreSQL-backed time entry repository with tenant isolation (LAW-012-05). */
export class PostgresTimeEntryRepository implements PostgresTimeEntryRepositoryContract {
  constructor(private readonly options: PostgresTimeEntryRepositoryOptions) {}

  private get db() {
    return this.options.db ?? createDb();
  }

  list(
    criteria?: PostgresTimeEntryListCriteria,
  ): readonly LawTimeEntryPersistenceModel[] {
    return this.options.runSync(this.listAsync(criteria));
  }

  getById(timeEntryId: string): LawTimeEntryPersistenceModel | undefined {
    return this.options.runSync(this.getByIdAsync(timeEntryId));
  }

  create(entry: LawTimeEntryPersistenceModel): LawTimeEntryPersistenceModel {
    this.options.runSync(
      this.options.runInTransaction(async (tx) => {
        await this.assertTimeEntryRelationships(tx, entry);
        await tx
          .insert(lawTimeEntry)
          .values(timeEntryToRow(entry, this.options.tenantId));
        await this.options.onOutboxEvent?.(
          tx,
          createTimeOutboxDraft("legal.time.created", entry),
        );
      }),
    );
    return entry;
  }

  update(
    timeEntryId: string,
    entry: LawTimeEntryPersistenceModel,
  ): LawTimeEntryPersistenceModel | undefined {
    return this.options.runSync(this.updateAsync(timeEntryId, entry));
  }

  softDelete(timeEntryId: string): LawTimeEntryPersistenceModel | undefined {
    return this.options.runSync(this.softDeleteAsync(timeEntryId));
  }

  count(includeDeleted = false): number {
    return this.options.runSync(this.countAsync(includeDeleted));
  }

  isSoftDeleted(timeEntryId: string): boolean {
    return this.options.runSync(this.isSoftDeletedAsync(timeEntryId));
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

  private async assertTimeEntryRelationships(
    db: DatabaseExecutor,
    entry: LawTimeEntryPersistenceModel,
  ): Promise<void> {
    const matterId = entry.matterId.trim();
    if (!matterId) {
      throw new Error("Matter is required for time entry persistence.");
    }

    await this.assertMatterExists(db, matterId);

    if (entry.taskId) {
      await this.assertTaskLink(db, matterId, entry.taskId);
    }

    if (entry.documentId) {
      await this.assertDocumentLink(db, matterId, entry.documentId);
    }
  }

  private async listAsync(
    criteria?: PostgresTimeEntryListCriteria,
  ): Promise<readonly LawTimeEntryPersistenceModel[]> {
    const rows = await this.db
      .select()
      .from(lawTimeEntry)
      .where(
        and(
          eq(lawTimeEntry.tenantId, this.options.tenantId),
          isNull(lawTimeEntry.deletedAt),
        ),
      );

    const entries = rows
      .map(rowToTimeEntry)
      .filter((entry) => this.options.matchesCriteria(entry, criteria));
    return this.options.sortEntries(entries);
  }

  private async getByIdAsync(
    timeEntryId: string,
  ): Promise<LawTimeEntryPersistenceModel | undefined> {
    const rows = await this.db
      .select()
      .from(lawTimeEntry)
      .where(
        and(
          eq(lawTimeEntry.tenantId, this.options.tenantId),
          eq(lawTimeEntry.timeEntryId, timeEntryId),
          isNull(lawTimeEntry.deletedAt),
        ),
      )
      .limit(1);

    const row = rows[0];
    return row ? rowToTimeEntry(row) : undefined;
  }

  private async updateAsync(
    timeEntryId: string,
    entry: LawTimeEntryPersistenceModel,
  ): Promise<LawTimeEntryPersistenceModel | undefined> {
    return this.options.runInTransaction(async (tx) => {
      await this.assertTimeEntryRelationships(tx, entry);

      const rows = await tx
        .select()
        .from(lawTimeEntry)
        .where(
          and(
            eq(lawTimeEntry.tenantId, this.options.tenantId),
            eq(lawTimeEntry.timeEntryId, timeEntryId),
            isNull(lawTimeEntry.deletedAt),
          ),
        )
        .limit(1);

      const existing = rows[0];
      if (!existing) {
        return undefined;
      }

      const nextVersion = (existing.version ?? 1) + 1;
      const result = await tx
        .update(lawTimeEntry)
        .set({
          ...timeEntryToRow(entry, this.options.tenantId),
          version: nextVersion,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(lawTimeEntry.tenantId, this.options.tenantId),
            eq(lawTimeEntry.timeEntryId, timeEntryId),
          ),
        )
        .returning();

      const updated = result[0] ? rowToTimeEntry(result[0]) : undefined;
      if (updated) {
        await this.options.onOutboxEvent?.(
          tx,
          createTimeOutboxDraft("legal.time.updated", updated),
        );
      }

      return updated;
    });
  }

  private async softDeleteAsync(
    timeEntryId: string,
  ): Promise<LawTimeEntryPersistenceModel | undefined> {
    return this.options.runInTransaction(async (tx) => {
      const rows = await tx
        .select()
        .from(lawTimeEntry)
        .where(
          and(
            eq(lawTimeEntry.tenantId, this.options.tenantId),
            eq(lawTimeEntry.timeEntryId, timeEntryId),
            isNull(lawTimeEntry.deletedAt),
          ),
        )
        .limit(1);

      const existing = rows[0];
      if (!existing) {
        return undefined;
      }

      const deleted = rowToTimeEntry(existing);
      const now = new Date();
      await tx
        .update(lawTimeEntry)
        .set({
          deletedAt: now,
          updatedAt: now,
          version: (existing.version ?? 1) + 1,
        })
        .where(
          and(
            eq(lawTimeEntry.tenantId, this.options.tenantId),
            eq(lawTimeEntry.timeEntryId, timeEntryId),
          ),
        );

      await this.options.onOutboxEvent?.(
        tx,
        createTimeOutboxDraft("legal.time.deleted", deleted),
      );

      return deleted;
    });
  }

  private async countAsync(includeDeleted: boolean): Promise<number> {
    const rows = await this.db
      .select()
      .from(lawTimeEntry)
      .where(eq(lawTimeEntry.tenantId, this.options.tenantId));

    if (includeDeleted) {
      return rows.length;
    }

    return rows.filter((row) => row.deletedAt === null).length;
  }

  private async isSoftDeletedAsync(timeEntryId: string): Promise<boolean> {
    const rows = await this.db
      .select({ deletedAt: lawTimeEntry.deletedAt })
      .from(lawTimeEntry)
      .where(
        and(
          eq(lawTimeEntry.tenantId, this.options.tenantId),
          eq(lawTimeEntry.timeEntryId, timeEntryId),
        ),
      )
      .limit(1);

    return Boolean(rows[0]?.deletedAt);
  }
}
