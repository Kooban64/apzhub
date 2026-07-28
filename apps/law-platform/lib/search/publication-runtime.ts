/**
 * Law-platform Search Publication runtime (Platform-1.3-ENG-001).
 * Mirrors apps/web shared runtime — composition-root only.
 */

import { getDb } from "@apzhub/config/db";
import {
  createProductionSearchOrchestration,
  createSearchOrchestrationForTest,
  isSearchOrchestrationEnabled,
  type SearchOrchestrationRuntime,
} from "@apzhub/search-orchestrator";
import {
  createSearchIntegration,
  InMemorySearchPublicationSink,
  type CanonicalSearchEntity,
  type SearchPublicationSink,
} from "@apzhub/search-integration";

let runtimeCache: SearchOrchestrationRuntime | null = null;
let lawRegistered = false;
let drainScheduled = false;

export function resetLawSearchPublicationRuntimeForTests(): void {
  runtimeCache = null;
  lawRegistered = false;
  drainScheduled = false;
}

export function markLawSearchCompositionRegistered(): void {
  lawRegistered = true;
}

export function isLawSearchCompositionRegistered(): boolean {
  return lawRegistered;
}

function createMeilisearchMirroringSink(
  env: NodeJS.ProcessEnv | Record<string, string | undefined>,
): SearchPublicationSink {
  const memory = new InMemorySearchPublicationSink();
  const endpoint = env.SEARCH_MEILISEARCH_ENDPOINT?.trim().replace(/\/$/, "");
  const apiKey = env.SEARCH_MEILISEARCH_API_KEY?.trim();
  const prefix = env.SEARCH_MEILISEARCH_INDEX_PREFIX?.trim() || "apzhub_";

  const mirror = (entity: CanonicalSearchEntity, action: "upsert" | "delete"): void => {
    if (!endpoint) return;
    const indexUid = `${prefix}publication`;
    const url =
      action === "delete"
        ? `${endpoint}/indexes/${encodeURIComponent(indexUid)}/documents/${encodeURIComponent(entity.id)}`
        : `${endpoint}/indexes/${encodeURIComponent(indexUid)}/documents`;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
    void fetch(url, {
      method: action === "delete" ? "DELETE" : "POST",
      headers,
      body:
        action === "delete"
          ? undefined
          : JSON.stringify([
              {
                id: entity.id,
                tenantId: entity.tenantId,
                productId: entity.productId,
                entityType: entity.entityType,
                title: entity.title,
                summary: entity.summary,
                navigationTarget: entity.navigationTarget,
                lifecycleState: entity.lifecycleState,
                organisationId: entity.organisationId,
                updatedAt: entity.updatedAt,
              },
            ]),
    }).catch(() => undefined);
  };

  return {
    kind: "custom",
    get: (id) => memory.get(id),
    list: (filter) => memory.list(filter),
    count: () => memory.count(),
    upsert(entity) {
      const saved = memory.upsert(entity);
      mirror(saved, saved.lifecycleState === "removed" ? "delete" : "upsert");
      return saved;
    },
    remove(entityId) {
      const removed = memory.remove(entityId);
      if (removed) mirror(removed, "delete");
      return removed;
    },
    setLifecycle(entityId, state, reason) {
      const next = memory.setLifecycle(entityId, state, reason);
      if (next) mirror(next, state === "removed" ? "delete" : "upsert");
      return next;
    },
  };
}

function buildIntegration(env: NodeJS.ProcessEnv | Record<string, string | undefined>) {
  return createSearchIntegration({
    sink: env.SEARCH_MEILISEARCH_ENDPOINT?.trim()
      ? createMeilisearchMirroringSink(env)
      : undefined,
  });
}

export function getLawSearchPublicationRuntime(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): SearchOrchestrationRuntime | null {
  if (runtimeCache) return runtimeCache;

  if (process.env.NODE_ENV === "test") {
    runtimeCache = createSearchOrchestrationForTest({
      allowInMemoryJournal: true,
      integration: buildIntegration(env),
      env: { ...env, APZHUB_SEARCH_ORCHESTRATION_ENABLED: "true" },
    });
    return runtimeCache;
  }

  if (!isSearchOrchestrationEnabled(env)) {
    // Still build an in-memory runtime so wrappers can no-op safely via dispatcher.
    runtimeCache = createSearchOrchestrationForTest({
      allowInMemoryJournal: true,
      integration: buildIntegration(env),
      env,
    });
    return runtimeCache;
  }

  if (!process.env.DATABASE_URL) {
    return null;
  }

  runtimeCache = createProductionSearchOrchestration({
    postgresDb: getDb(),
    integration: buildIntegration(env),
    env,
  });
  return runtimeCache;
}

export function scheduleLawSearchPublicationDrain(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): void {
  if (!isSearchOrchestrationEnabled(env)) return;
  const runtime = getLawSearchPublicationRuntime(env);
  if (!runtime || drainScheduled) return;
  drainScheduled = true;
  queueMicrotask(() => {
    drainScheduled = false;
    void runtime.orchestrator.processBatch().catch(() => undefined);
  });
}
