import { randomUUID } from "node:crypto";

import { assertPermission } from "../../authorization/testing-authorization";
import { notFoundError, revisionConflictError, validationError } from "../../errors";
import type { AggregateKind, RepositoryContext } from "../../types";
import type { PersistenceMeta } from "../../types";
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

export type MutableRecord = PersistenceMeta;

export interface InMemoryCrudOptions<TRecord extends MutableRecord> {
  readonly kind: AggregateKind;
  readonly store: Map<string, TRecord>;
  readonly searchFields: readonly string[];
  readonly validateCreate?: (input: Record<string, unknown>) => void;
  readonly validateUpdate?: (input: Record<string, unknown>) => void;
  readonly toRecord: (
    ctx: RepositoryContext,
    input: Record<string, unknown>,
    existing?: TRecord,
  ) => TRecord;
}

function nowIso(): string {
  return new Date().toISOString();
}

function asRecord(value: object): Record<string, unknown> {
  return value as Record<string, unknown>;
}

function scoped<TRecord extends MutableRecord>(
  store: Map<string, TRecord>,
  ctx: RepositoryContext,
  includeArchived: boolean,
): TRecord[] {
  return [...store.values()].filter((row) => {
    if (row.tenantId !== ctx.tenantId) return false;
    if (
      ctx.organisationId &&
      row.organisationId &&
      row.organisationId !== ctx.organisationId
    ) {
      return false;
    }
    if (!includeArchived && row.archivedAt) return false;
    return true;
  });
}

export function createInMemoryCrudRepository<
  TCreate extends Record<string, unknown>,
  TUpdate extends Record<string, unknown>,
  TRecord extends MutableRecord,
>(options: InMemoryCrudOptions<TRecord>): CrudRepository<TCreate, TUpdate, TRecord> {
  const { kind, store, searchFields } = options;

  return {
    async create(ctx, input) {
      assertPermission(ctx, kind, "create");
      options.validateCreate?.(input as Record<string, unknown>);
      const id =
        typeof input.id === "string" && input.id.length > 0 ? input.id : randomUUID();
      if (store.has(id)) {
        throw validationError(`Duplicate id for ${kind}`, { id });
      }
      const created = options.toRecord(ctx, { ...input, id });
      store.set(id, created);
      return created;
    },

    async update(ctx, id, expectedRevision, input) {
      assertPermission(ctx, kind, "update");
      options.validateUpdate?.(input as Record<string, unknown>);
      const existing = store.get(id);
      if (!existing || existing.tenantId !== ctx.tenantId || existing.archivedAt) {
        throw notFoundError(kind, id);
      }
      if (existing.revision !== expectedRevision) {
        throw revisionConflictError(kind, id, expectedRevision, existing.revision);
      }
      const updated = options.toRecord(ctx, { ...input, id }, existing);
      store.set(id, updated);
      return updated;
    },

    async archive(ctx, id, expectedRevision) {
      assertPermission(ctx, kind, "archive");
      const existing = store.get(id);
      if (!existing || existing.tenantId !== ctx.tenantId || existing.archivedAt) {
        throw notFoundError(kind, id);
      }
      if (existing.revision !== expectedRevision) {
        throw revisionConflictError(kind, id, expectedRevision, existing.revision);
      }
      const archived = {
        ...existing,
        revision: existing.revision + 1,
        archivedAt: nowIso(),
        updatedAt: nowIso(),
        updatedBy: ctx.actorUserId,
      } as TRecord;
      store.set(id, archived);
      return archived;
    },

    async restore(ctx, id, expectedRevision) {
      assertPermission(ctx, kind, "restore");
      const existing = store.get(id);
      if (!existing || existing.tenantId !== ctx.tenantId || !existing.archivedAt) {
        throw notFoundError(kind, id);
      }
      if (existing.revision !== expectedRevision) {
        throw revisionConflictError(kind, id, expectedRevision, existing.revision);
      }
      const restored = {
        ...existing,
        revision: existing.revision + 1,
        archivedAt: undefined,
        updatedAt: nowIso(),
        updatedBy: ctx.actorUserId,
      } as TRecord;
      store.set(id, restored);
      return restored;
    },

    async get(ctx, id) {
      assertPermission(ctx, kind, "get");
      const existing = store.get(id);
      if (!existing || existing.tenantId !== ctx.tenantId) return undefined;
      if (
        ctx.organisationId &&
        existing.organisationId &&
        existing.organisationId !== ctx.organisationId
      ) {
        return undefined;
      }
      return existing;
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

  function queryPage(
    ctx: RepositoryContext,
    query: ListQuery | undefined,
    applySearch: boolean,
  ): PageResult<TRecord> {
    const q = normalizeListQuery(query);
    let items = scoped(store, ctx, q.includeArchived);
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
}

export function baseMeta(
  ctx: RepositoryContext,
  input: { id?: string; organisationId?: string },
  existing?: PersistenceMeta,
): PersistenceMeta {
  const stamp = nowIso();
  if (existing) {
    return {
      id: existing.id,
      tenantId: existing.tenantId,
      organisationId:
        input.organisationId !== undefined
          ? input.organisationId
          : (existing.organisationId ?? ctx.organisationId),
      revision: existing.revision + 1,
      createdAt: existing.createdAt,
      updatedAt: stamp,
      createdBy: existing.createdBy,
      updatedBy: ctx.actorUserId,
      archivedAt: existing.archivedAt,
    };
  }
  return {
    id: input.id ?? randomUUID(),
    tenantId: ctx.tenantId,
    organisationId: input.organisationId ?? ctx.organisationId,
    revision: 1,
    createdAt: stamp,
    updatedAt: stamp,
    createdBy: ctx.actorUserId,
    updatedBy: ctx.actorUserId,
  };
}

export function cloneStoreMap<T>(source: Map<string, T>): Map<string, T> {
  return new Map(
    [...source.entries()].map(([key, value]) => [key, structuredClone(value)]),
  );
}
