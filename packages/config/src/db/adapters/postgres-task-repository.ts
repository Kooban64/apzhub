import { and, eq, isNull } from "drizzle-orm";

import { createDb, type DatabaseExecutor } from "../client";
import { lawDocument, lawMatter, lawTask } from "../legal-schema";
import { rowToDocument } from "../law-mappers/document-row-mapper";
import {
  createTaskOutboxDraft,
  type PostgresOutboxEventDraft,
} from "../law-mappers/outbox-drafts";
import {
  rowToTask,
  taskToRow,
  type LawTaskPersistenceModel,
} from "../law-mappers/task-row-mapper";

export interface PostgresTaskListCriteria {
  readonly query?: string;
  readonly taskStatus?: LawTaskPersistenceModel["taskStatus"] | "all";
  readonly taskPriority?: LawTaskPersistenceModel["taskPriority"] | "all";
  readonly assigneeUserId?: string;
  readonly matterId?: string;
  readonly dueDateFilter?: "all" | "overdue" | "today" | "this_week" | "no_due_date";
}

export interface PostgresTaskRepositoryContract {
  list(criteria?: PostgresTaskListCriteria): readonly LawTaskPersistenceModel[];
  getById(taskId: string): LawTaskPersistenceModel | undefined;
  create(task: LawTaskPersistenceModel): LawTaskPersistenceModel;
  update(
    taskId: string,
    task: LawTaskPersistenceModel,
  ): LawTaskPersistenceModel | undefined;
  softArchive(taskId: string): LawTaskPersistenceModel | undefined;
  count(includeArchived?: boolean): number;
  isSoftArchived(taskId: string): boolean;
}

export interface PostgresTaskRepositoryOptions {
  readonly tenantId: string;
  readonly db?: DatabaseExecutor;
  readonly runSync: <T>(promise: Promise<T>) => T;
  readonly runInTransaction: <T>(
    operation: (db: DatabaseExecutor) => Promise<T>,
  ) => Promise<T>;
  readonly matchesCriteria: (
    task: LawTaskPersistenceModel,
    criteria?: PostgresTaskListCriteria,
  ) => boolean;
  readonly sortTasks: (
    tasks: readonly LawTaskPersistenceModel[],
  ) => LawTaskPersistenceModel[];
  readonly onOutboxEvent?: (
    db: DatabaseExecutor,
    draft: PostgresOutboxEventDraft,
  ) => Promise<void>;
}

/** PostgreSQL-backed task repository with tenant isolation (LAW-012-04). */
export class PostgresTaskRepository implements PostgresTaskRepositoryContract {
  constructor(private readonly options: PostgresTaskRepositoryOptions) {}

  private get db() {
    return this.options.db ?? createDb();
  }

  list(criteria?: PostgresTaskListCriteria): readonly LawTaskPersistenceModel[] {
    return this.options.runSync(this.listAsync(criteria));
  }

  getById(taskId: string): LawTaskPersistenceModel | undefined {
    return this.options.runSync(this.getByIdAsync(taskId));
  }

  create(task: LawTaskPersistenceModel): LawTaskPersistenceModel {
    this.options.runSync(
      this.options.runInTransaction(async (tx) => {
        await this.assertTaskRelationships(tx, task);
        await tx.insert(lawTask).values(taskToRow(task, this.options.tenantId));
        await this.options.onOutboxEvent?.(
          tx,
          createTaskOutboxDraft("legal.task.created", task),
        );
      }),
    );
    return task;
  }

  update(
    taskId: string,
    task: LawTaskPersistenceModel,
  ): LawTaskPersistenceModel | undefined {
    return this.options.runSync(this.updateAsync(taskId, task));
  }

  softArchive(taskId: string): LawTaskPersistenceModel | undefined {
    return this.options.runSync(this.softArchiveAsync(taskId));
  }

  count(includeArchived = false): number {
    return this.options.runSync(this.countAsync(includeArchived));
  }

  isSoftArchived(taskId: string): boolean {
    return this.options.runSync(this.isSoftArchivedAsync(taskId));
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

  private async assertDocumentLink(
    db: DatabaseExecutor,
    matterId: string,
    documentId: string,
  ): Promise<void> {
    const rows = await db
      .select()
      .from(lawDocument)
      .where(
        and(
          eq(lawDocument.tenantId, this.options.tenantId),
          eq(lawDocument.documentId, documentId),
          isNull(lawDocument.archivedAt),
        ),
      )
      .limit(1);

    const document = rows[0] ? rowToDocument(rows[0]) : undefined;
    if (!document) {
      throw new Error(`Document not found for tenant: ${documentId}`);
    }

    if (document.matterId !== matterId) {
      throw new Error(`Document ${documentId} does not belong to matter ${matterId}`);
    }
  }

  private async assertTaskRelationships(
    db: DatabaseExecutor,
    task: LawTaskPersistenceModel,
  ): Promise<void> {
    const matterId = task.matterId?.trim();
    if (!matterId) {
      throw new Error("Matter is required for task persistence.");
    }

    await this.assertMatterExists(db, matterId);

    if (task.documentId) {
      await this.assertDocumentLink(db, matterId, task.documentId);
    }
  }

  private async listAsync(
    criteria?: PostgresTaskListCriteria,
  ): Promise<readonly LawTaskPersistenceModel[]> {
    const rows = await this.db
      .select()
      .from(lawTask)
      .where(
        and(eq(lawTask.tenantId, this.options.tenantId), isNull(lawTask.archivedAt)),
      );

    const tasks = rows
      .map(rowToTask)
      .filter((task) => this.options.matchesCriteria(task, criteria));
    return this.options.sortTasks(tasks);
  }

  private async getByIdAsync(
    taskId: string,
  ): Promise<LawTaskPersistenceModel | undefined> {
    const rows = await this.db
      .select()
      .from(lawTask)
      .where(
        and(
          eq(lawTask.tenantId, this.options.tenantId),
          eq(lawTask.taskId, taskId),
          isNull(lawTask.archivedAt),
        ),
      )
      .limit(1);

    const row = rows[0];
    return row ? rowToTask(row) : undefined;
  }

  private async updateAsync(
    taskId: string,
    task: LawTaskPersistenceModel,
  ): Promise<LawTaskPersistenceModel | undefined> {
    return this.options.runInTransaction(async (tx) => {
      await this.assertTaskRelationships(tx, task);

      const rows = await tx
        .select()
        .from(lawTask)
        .where(
          and(
            eq(lawTask.tenantId, this.options.tenantId),
            eq(lawTask.taskId, taskId),
            isNull(lawTask.archivedAt),
          ),
        )
        .limit(1);

      const existing = rows[0];
      if (!existing) {
        return undefined;
      }

      const wasCompleted = existing.taskStatus === "completed";
      const nextVersion = (existing.version ?? 1) + 1;
      const result = await tx
        .update(lawTask)
        .set({
          ...taskToRow(task, this.options.tenantId),
          version: nextVersion,
          updatedAt: new Date(),
        })
        .where(
          and(eq(lawTask.tenantId, this.options.tenantId), eq(lawTask.taskId, taskId)),
        )
        .returning();

      const updated = result[0] ? rowToTask(result[0]) : undefined;
      if (updated) {
        const isCompleted = updated.taskStatus === "completed";
        const eventType =
          isCompleted && !wasCompleted ? "legal.task.completed" : "legal.task.updated";
        await this.options.onOutboxEvent?.(
          tx,
          createTaskOutboxDraft(eventType, updated),
        );
      }

      return updated;
    });
  }

  private async softArchiveAsync(
    taskId: string,
  ): Promise<LawTaskPersistenceModel | undefined> {
    return this.options.runInTransaction(async (tx) => {
      const rows = await tx
        .select()
        .from(lawTask)
        .where(
          and(
            eq(lawTask.tenantId, this.options.tenantId),
            eq(lawTask.taskId, taskId),
            isNull(lawTask.archivedAt),
          ),
        )
        .limit(1);

      const existing = rows[0];
      if (!existing) {
        return undefined;
      }

      const now = new Date();
      const result = await tx
        .update(lawTask)
        .set({
          taskStatus: "cancelled",
          archivedAt: now,
          updatedAt: now,
          version: (existing.version ?? 1) + 1,
        })
        .where(
          and(eq(lawTask.tenantId, this.options.tenantId), eq(lawTask.taskId, taskId)),
        )
        .returning();

      const archived = result[0] ? rowToTask(result[0]) : undefined;
      if (archived) {
        await this.options.onOutboxEvent?.(
          tx,
          createTaskOutboxDraft("legal.task.archived", archived),
        );
      }

      return archived;
    });
  }

  private async countAsync(includeArchived: boolean): Promise<number> {
    const rows = await this.db
      .select()
      .from(lawTask)
      .where(eq(lawTask.tenantId, this.options.tenantId));

    if (includeArchived) {
      return rows.length;
    }

    return rows.filter((row) => row.archivedAt === null).length;
  }

  private async isSoftArchivedAsync(taskId: string): Promise<boolean> {
    const rows = await this.db
      .select({ archivedAt: lawTask.archivedAt })
      .from(lawTask)
      .where(
        and(eq(lawTask.tenantId, this.options.tenantId), eq(lawTask.taskId, taskId)),
      )
      .limit(1);

    return Boolean(rows[0]?.archivedAt);
  }
}
