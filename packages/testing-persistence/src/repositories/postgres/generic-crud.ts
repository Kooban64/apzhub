import type { DatabaseExecutor } from "@apzhub/config";
import { and, eq, isNull } from "drizzle-orm";
import type { AnyPgColumn, PgTable } from "drizzle-orm/pg-core";

import { assertPermission } from "../../authorization/testing-authorization";
import { notFoundError, revisionConflictError } from "../../errors";
import type { AggregateKind, PersistenceMeta, RepositoryContext } from "../../types";
import type { CrudRepository } from "../interfaces";
import {
  compareValues,
  matchesFilters,
  matchesSearch,
  normalizeListQuery,
  paginateItems,
  type ListQuery,
  type PageResult,
} from "../types";

export type PostgresCrudTable = PgTable & {
  id: AnyPgColumn;
  tenantId: AnyPgColumn;
  organisationId: AnyPgColumn;
  revision: AnyPgColumn;
  archivedAt: AnyPgColumn;
};

export interface PostgresCrudOptions<
  TCreate extends object,
  TUpdate extends object,
  TRecord extends PersistenceMeta,
> {
  readonly kind: AggregateKind;
  readonly db: DatabaseExecutor;
  readonly table: PostgresCrudTable;
  readonly searchFields: readonly string[];
  readonly validateCreate?: (input: TCreate) => void;
  readonly validateUpdate?: (input: TUpdate) => void;
  readonly toRecord: (
    ctx: RepositoryContext,
    input: Record<string, unknown>,
    existing?: TRecord,
  ) => TRecord;
  readonly toRow: (record: TRecord) => Record<string, unknown>;
  readonly rowToRecord: (row: Record<string, unknown>) => TRecord;
  readonly afterWrite?: (
    ctx: RepositoryContext,
    record: TRecord,
    op: "create" | "update",
  ) => Promise<void>;
  readonly enrichOnRead?: (
    ctx: RepositoryContext,
    record: TRecord,
  ) => Promise<TRecord>;
}

function asRecord(value: object): Record<string, unknown> {
  return value as Record<string, unknown>;
}

export function createPostgresCrudRepository<
  TCreate extends object,
  TUpdate extends object,
  TRecord extends PersistenceMeta,
>(
  options: PostgresCrudOptions<TCreate, TUpdate, TRecord>,
): CrudRepository<TCreate, TUpdate, TRecord> {
  const { kind, db, table, searchFields } = options;

  async function loadActive(
    ctx: RepositoryContext,
    id: string,
    requireActive: boolean,
  ): Promise<TRecord> {
    const rows = await db
      .select()
      .from(table)
      .where(
        and(
          eq(table.tenantId, ctx.tenantId),
          eq(table.id, id),
          ...(requireActive ? [isNull(table.archivedAt)] : []),
        ),
      )
      .limit(1);
    const row = rows[0] as Record<string, unknown> | undefined;
    if (!row) throw notFoundError(kind, id);
    let record = options.rowToRecord(row);
    if (options.enrichOnRead) {
      record = await options.enrichOnRead(ctx, record);
    }
    return record;
  }

  async function loadById(
    ctx: RepositoryContext,
    id: string,
  ): Promise<TRecord | undefined> {
    const rows = await db
      .select()
      .from(table)
      .where(and(eq(table.tenantId, ctx.tenantId), eq(table.id, id)))
      .limit(1);
    const row = rows[0] as Record<string, unknown> | undefined;
    if (!row) return undefined;
    if (
      ctx.organisationId &&
      typeof row.organisationId === "string" &&
      row.organisationId !== ctx.organisationId
    ) {
      return undefined;
    }
    let record = options.rowToRecord(row);
    if (options.enrichOnRead) {
      record = await options.enrichOnRead(ctx, record);
    }
    return record;
  }

  async function queryPage(
    ctx: RepositoryContext,
    query: ListQuery | undefined,
    applySearch: boolean,
  ): Promise<PageResult<TRecord>> {
    const q = normalizeListQuery(query);
    const rows = (await db
      .select()
      .from(table)
      .where(eq(table.tenantId, ctx.tenantId))) as Record<string, unknown>[];
    let items = rows.map((row) => options.rowToRecord(row));
    if (options.enrichOnRead) {
      items = await Promise.all(items.map((item) => options.enrichOnRead!(ctx, item)));
    }
    items = items.filter((row) => {
      if (!q.includeArchived && row.archivedAt) return false;
      if (
        ctx.organisationId &&
        row.organisationId &&
        row.organisationId !== ctx.organisationId
      ) {
        return false;
      }
      return true;
    });
    if (applySearch) {
      items = items.filter((row) =>
        matchesSearch(asRecord(row), q.search, searchFields),
      );
    }
    items = items.filter((row) => matchesFilters(asRecord(row), q.filters));
    if (q.sort) {
      const field = q.sort.field;
      const direction = q.sort.direction ?? "asc";
      items = [...items].sort((a, b) =>
        compareValues(asRecord(a)[field], asRecord(b)[field], direction),
      );
    }
    return paginateItems(items, q.page, q.pageSize);
  }

  return {
    async create(ctx, input) {
      assertPermission(ctx, kind, "create");
      options.validateCreate?.(input);
      const record = options.toRecord(ctx, input as Record<string, unknown>);
      await db.insert(table).values(options.toRow(record) as never);
      if (options.afterWrite) {
        await options.afterWrite(ctx, record, "create");
      }
      if (options.enrichOnRead) {
        return options.enrichOnRead(ctx, record);
      }
      return record;
    },

    async update(ctx, id, expectedRevision, input) {
      assertPermission(ctx, kind, "update");
      options.validateUpdate?.(input);
      const existing = await loadActive(ctx, id, true);
      if (existing.revision !== expectedRevision) {
        throw revisionConflictError(kind, id, expectedRevision, existing.revision);
      }
      const updated = options.toRecord(ctx, input as Record<string, unknown>, existing);
      await db
        .update(table)
        .set(options.toRow(updated) as never)
        .where(
          and(
            eq(table.tenantId, ctx.tenantId),
            eq(table.id, id),
            eq(table.revision, expectedRevision),
          ),
        );
      if (options.afterWrite) {
        await options.afterWrite(ctx, updated, "update");
      }
      if (options.enrichOnRead) {
        return options.enrichOnRead(ctx, updated);
      }
      return updated;
    },

    async archive(ctx, id, expectedRevision) {
      assertPermission(ctx, kind, "archive");
      const existing = await loadActive(ctx, id, true);
      if (existing.revision !== expectedRevision) {
        throw revisionConflictError(kind, id, expectedRevision, existing.revision);
      }
      const now = new Date().toISOString();
      const archived = {
        ...existing,
        revision: existing.revision + 1,
        archivedAt: now,
        updatedAt: now,
        updatedBy: ctx.actorUserId,
      } as TRecord;
      await db
        .update(table)
        .set(options.toRow(archived) as never)
        .where(and(eq(table.tenantId, ctx.tenantId), eq(table.id, id)));
      return archived;
    },

    async restore(ctx, id, expectedRevision) {
      assertPermission(ctx, kind, "restore");
      const rows = await db
        .select()
        .from(table)
        .where(and(eq(table.tenantId, ctx.tenantId), eq(table.id, id)))
        .limit(1);
      const row = rows[0] as Record<string, unknown> | undefined;
      if (!row || !row.archivedAt) throw notFoundError(kind, id);
      const existing = options.rowToRecord(row);
      if (existing.revision !== expectedRevision) {
        throw revisionConflictError(kind, id, expectedRevision, existing.revision);
      }
      const now = new Date().toISOString();
      const restored = {
        ...existing,
        revision: existing.revision + 1,
        archivedAt: undefined,
        updatedAt: now,
        updatedBy: ctx.actorUserId,
      } as TRecord;
      await db
        .update(table)
        .set({ ...options.toRow(restored), archivedAt: null } as never)
        .where(and(eq(table.tenantId, ctx.tenantId), eq(table.id, id)));
      if (options.enrichOnRead) {
        return options.enrichOnRead(ctx, restored);
      }
      return restored;
    },

    async get(ctx, id) {
      assertPermission(ctx, kind, "get");
      return loadById(ctx, id);
    },

    async list(ctx, query) {
      assertPermission(ctx, kind, "list");
      return queryPage(ctx, query, false);
    },

    async search(ctx, query) {
      assertPermission(ctx, kind, "search");
      return queryPage(ctx, query, true);
    },
  };
}
