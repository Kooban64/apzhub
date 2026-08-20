/**
 * Shared Search Publication orchestration runtime (Platform-1.3-ENG-001).
 * Composition-root only — does not modify frozen platform-services or Search packages.
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

import type { EnvVars } from "@/lib/env-vars";
export type SearchPublicationCompositionRegistration = {
  readonly time: boolean;
  readonly law: boolean;
  readonly projects: boolean;
  readonly qep: boolean;
};

let runtimeCache: SearchOrchestrationRuntime | null = null;
let registration: SearchPublicationCompositionRegistration = {
  time: false,
  law: false,
  projects: false,
  qep: false,
};
let drainScheduled = false;

export function resetSearchPublicationRuntimeForTests(): void {
  runtimeCache = null;
  registration = { time: false, law: false, projects: false, qep: false };
  drainScheduled = false;
}

export function setSearchPublicationRuntimeForTests(
  runtime: SearchOrchestrationRuntime,
): void {
  runtimeCache = runtime;
}

export function markSearchCompositionRegistered(
  product: keyof SearchPublicationCompositionRegistration,
): void {
  registration = { ...registration, [product]: true };
}

export function getSearchCompositionRegistration(): SearchPublicationCompositionRegistration {
  return registration;
}

export function isSearchCompositionFullyRegisteredForLiveDrain(): boolean {
  return registration.time && registration.law;
}

/**
 * Optional Meilisearch mirror — memory SoR for integration sink + best-effort engine upsert.
 * Never throws into product / drain paths.
 */
export function createMeilisearchMirroringSink(
  env: EnvVars | Record<string, string | undefined> = process.env,
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
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
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
    }).catch(() => {
      /* best-effort mirror — journal / integration remain authoritative for drain success */
    });
  };

  return {
    kind: "custom",
    get: (id) => memory.get(id),
    list: (filter) => memory.list(filter),
    count: () => memory.count(),
    upsert(entity) {
      const saved = memory.upsert(entity);
      if (saved.lifecycleState !== "removed") {
        mirror(saved, "upsert");
      } else {
        mirror(saved, "delete");
      }
      return saved;
    },
    remove(entityId) {
      const removed = memory.remove(entityId);
      if (removed) mirror(removed, "delete");
      return removed;
    },
    setLifecycle(entityId, state, reason) {
      const next = memory.setLifecycle(entityId, state, reason);
      if (next) {
        if (state === "removed") mirror(next, "delete");
        else mirror(next, "upsert");
      }
      return next;
    },
  };
}

function buildIntegration(env: EnvVars | Record<string, string | undefined>) {
  const meiliConfigured = Boolean(env.SEARCH_MEILISEARCH_ENDPOINT?.trim());
  return createSearchIntegration({
    sink: meiliConfigured ? createMeilisearchMirroringSink(env) : undefined,
  });
}

/**
 * Process-level orchestration runtime shared by product wrappers and publication admin.
 */
export function getSearchPublicationRuntime(
  env: EnvVars | Record<string, string | undefined> = process.env,
): SearchOrchestrationRuntime {
  if (runtimeCache) return runtimeCache;

  if (process.env.NODE_ENV === "test") {
    runtimeCache = createSearchOrchestrationForTest({
      allowInMemoryJournal: true,
      integration: buildIntegration({
        ...env,
        APZHUB_SEARCH_ORCHESTRATION_ENABLED: "true",
      }),
      env: { ...env, APZHUB_SEARCH_ORCHESTRATION_ENABLED: "true" },
    });
    return runtimeCache;
  }

  if (!process.env.DATABASE_URL) {
    throw new Error(
      "Search publication orchestration requires DATABASE_URL (PostgreSQL journal)",
    );
  }

  runtimeCache = createProductionSearchOrchestration({
    postgresDb: getDb(),
    integration: buildIntegration(env),
    env,
  });
  return runtimeCache;
}

/** Schedule a non-blocking drain when orchestration is enabled (live drain). */
export function scheduleSearchPublicationDrain(
  env: EnvVars | Record<string, string | undefined> = process.env,
): void {
  if (!isSearchOrchestrationEnabled(env)) return;
  if (drainScheduled) return;
  drainScheduled = true;
  queueMicrotask(() => {
    drainScheduled = false;
    const runtime = getSearchPublicationRuntime(env);
    void runtime.orchestrator.processBatch().catch(() => {
      /* drain failures stay in journal for admin retry */
    });
  });
}
