import type { TraceLink } from "../../domain/trace-link/trace-link";
import type { TraceEdgeFact } from "../../domain/trace-link/trace-policy";
import type {
  StoredTraceLink,
  TraceLinkRepository,
  TraceListQuery,
  TraceTaxonomyRepository,
} from "../../domain/trace-link/trace-link-repository";
import {
  NORMATIVE_TRACE_TAXONOMY,
  type TraceTaxonomyDefinition,
} from "../../domain/trace-link/trace-taxonomy";
import type { TraceType } from "../../domain/trace-link/trace-type";
import {
  TraceConflictError,
  TraceNotFoundError,
  TraceRevisionConflictError,
} from "../../shared/errors";
import {
  computeTraceLinkDuplicateKey,
  toStoredTraceLink,
  traceLinkMatchesListFilters,
} from "../mappers/trace-link-mapper";

export type TraceLinkInMemoryStore = {
  readonly traceLinks: Map<string, StoredTraceLink>;
  readonly taxonomyByTenant: Map<string, Map<string, TraceTaxonomyDefinition>>;
};

export function createEmptyTraceLinkStore(): TraceLinkInMemoryStore {
  return {
    traceLinks: new Map(),
    taxonomyByTenant: new Map(),
  };
}

/** Duplicate-active lifecycle states mirroring the DB partial unique index. */
const ACTIVE_DUPLICATE_STATES = new Set(["draft", "validated", "approved"]);

function assertNoActiveDuplicate(
  store: Map<string, StoredTraceLink>,
  candidate: TraceLink,
  excludeId?: string,
): void {
  if (!ACTIVE_DUPLICATE_STATES.has(candidate.lifecycleState)) {
    return;
  }
  const key = computeTraceLinkDuplicateKey(candidate);
  for (const row of store.values()) {
    if (row.tenantId !== candidate.tenantId) continue;
    if (excludeId && row.id === excludeId) continue;
    if (!ACTIVE_DUPLICATE_STATES.has(row.lifecycleState)) continue;
    if (computeTraceLinkDuplicateKey(row) === key) {
      throw new TraceConflictError(`Duplicate Trace Link already exists: ${row.id}`);
    }
  }
}

export function createInMemoryTraceLinkRepository(
  store: TraceLinkInMemoryStore,
): TraceLinkRepository {
  return {
    async create(trace) {
      if (store.traceLinks.has(trace.id)) {
        throw new TraceConflictError(`Trace Link already exists: ${trace.id}`);
      }
      assertNoActiveDuplicate(store.traceLinks, trace);
      const stored = toStoredTraceLink(trace);
      store.traceLinks.set(trace.id, stored);
      return stored;
    },

    async get(tenantId, id) {
      const row = store.traceLinks.get(id);
      return row && row.tenantId === tenantId ? row : null;
    },

    async save(trace, expectedRevision) {
      const existing = store.traceLinks.get(trace.id);
      if (!existing || existing.tenantId !== trace.tenantId) {
        throw new TraceNotFoundError(`Trace Link not found: ${trace.id}`);
      }
      if (existing.revision !== expectedRevision) {
        throw new TraceRevisionConflictError(
          trace.id,
          expectedRevision,
          existing.revision,
        );
      }
      assertNoActiveDuplicate(store.traceLinks, trace, trace.id);
      const stored = toStoredTraceLink(trace);
      store.traceLinks.set(trace.id, stored);
      return stored;
    },

    async list(tenantId, query: TraceListQuery = {}) {
      const rows = [...store.traceLinks.values()]
        .filter((row) => row.tenantId === tenantId)
        .filter((row) => traceLinkMatchesListFilters(row, query))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      const offset = query.offset ?? 0;
      const limit = query.limit ?? rows.length;
      return rows.slice(offset, offset + limit);
    },

    async listEdgeFacts(tenantId, options = {}) {
      const facts: TraceEdgeFact[] = [];
      for (const row of store.traceLinks.values()) {
        if (row.tenantId !== tenantId) continue;
        if (options.excludeTraceId && row.id === options.excludeTraceId) continue;
        if (options.types && !options.types.includes(row.type)) continue;
        facts.push({
          traceId: row.id,
          type: row.type,
          source: row.source,
          target: row.target,
          scope: row.scope,
          lifecycleState: row.lifecycleState,
        });
      }
      return facts;
    },

    async exists(tenantId, id) {
      const row = store.traceLinks.get(id);
      return Boolean(row && row.tenantId === tenantId);
    },

    async listHistory(tenantId, id) {
      const row = await this.get(tenantId, id);
      return row?.history.entries ?? [];
    },
  };
}

export function createInMemoryTraceTaxonomyRepository(
  store: TraceLinkInMemoryStore,
): TraceTaxonomyRepository {
  async function ensureSeeded(tenantId: string): Promise<void> {
    if (store.taxonomyByTenant.has(tenantId)) return;
    const map = new Map<string, TraceTaxonomyDefinition>();
    for (const definition of NORMATIVE_TRACE_TAXONOMY) {
      map.set(definition.type, definition);
    }
    store.taxonomyByTenant.set(tenantId, map);
  }

  return {
    ensureSeeded,
    async list(tenantId) {
      await ensureSeeded(tenantId);
      return [...(store.taxonomyByTenant.get(tenantId)?.values() ?? [])];
    },
    async get(tenantId, type: TraceType) {
      await ensureSeeded(tenantId);
      return store.taxonomyByTenant.get(tenantId)?.get(type) ?? null;
    },
  };
}
