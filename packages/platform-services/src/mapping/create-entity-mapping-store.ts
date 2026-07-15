import { checkDatabaseHealth, getDb } from "@apzhub/config/db";
import { PlatformServiceError } from "@apzhub/platform-service-contracts";

import type { EntityMappingStore } from "./entity-mapping-store";
import { InMemoryEntityMappingStore } from "./in-memory-entity-mapping-store";
import type {
  MappingStoreLogger,
  MappingStoreMetrics,
} from "./mapping-store-observability";
import { PostgresEntityMappingStore } from "./postgres-entity-mapping-store";

export type EntityMappingStoreMode = "memory" | "postgres";

export interface EntityMappingStoreBootstrapEnv {
  readonly NODE_ENV?: string;
  readonly ENTITY_MAPPING_STORE_MODE?: string;
  readonly ENTITY_MAPPING_ALLOW_MEMORY_IN_PRODUCTION?: string;
  readonly DATABASE_URL?: string;
}

export interface ResolveEntityMappingStoreModeResult {
  readonly mode: EntityMappingStoreMode;
  readonly source: "explicit" | "default";
}

export interface CreateEntityMappingStoreOptions {
  readonly env?: EntityMappingStoreBootstrapEnv;
  readonly logger?: MappingStoreLogger;
  readonly metrics?: MappingStoreMetrics;
  /** Injected store — skips mode resolution (tests). */
  readonly store?: EntityMappingStore;
}

/**
 * Validates and resolves ENTITY_MAPPING_STORE_MODE.
 *
 * Defaults to `memory` (tests / local isolation).
 * Production requires `postgres` unless ENTITY_MAPPING_ALLOW_MEMORY_IN_PRODUCTION=true.
 * Never silently falls back from postgres to memory.
 */
export function resolveEntityMappingStoreMode(
  env: EntityMappingStoreBootstrapEnv = process.env,
): ResolveEntityMappingStoreModeResult {
  const raw = env.ENTITY_MAPPING_STORE_MODE?.trim().toLowerCase();
  if (raw === undefined || raw === "") {
    const mode: EntityMappingStoreMode =
      env.NODE_ENV === "production" ? "postgres" : "memory";
    return { mode, source: "default" };
  }

  if (raw !== "memory" && raw !== "postgres") {
    throw new PlatformServiceError({
      category: "configuration",
      code: "CONFIGURATION_ERROR",
      message:
        "ENTITY_MAPPING_STORE_MODE must be 'memory' or 'postgres'",
      correlationId: "mapping-store-bootstrap",
      retryable: false,
      details: { value: raw },
    });
  }

  return { mode: raw, source: "explicit" };
}

export function assertEntityMappingStoreModeAllowed(
  mode: EntityMappingStoreMode,
  env: EntityMappingStoreBootstrapEnv = process.env,
): void {
  if (env.NODE_ENV !== "production") {
    return;
  }

  if (mode === "memory") {
    const allow = env.ENTITY_MAPPING_ALLOW_MEMORY_IN_PRODUCTION === "true";
    if (!allow) {
      throw new PlatformServiceError({
        category: "configuration",
        code: "CONFIGURATION_ERROR",
        message:
          "In-memory entity mapping store is not permitted in production without ENTITY_MAPPING_ALLOW_MEMORY_IN_PRODUCTION=true",
        correlationId: "mapping-store-bootstrap",
        retryable: false,
        details: { mode },
      });
    }
  }
}

/**
 * Creates an EntityMappingStore from environment configuration.
 * PostgreSQL mode fails clearly when the database is unavailable — no silent memory fallback.
 */
export async function createEntityMappingStore(
  options: CreateEntityMappingStoreOptions = {},
): Promise<EntityMappingStore> {
  if (options.store) {
    return options.store;
  }

  const env = options.env ?? process.env;
  const { mode } = resolveEntityMappingStoreMode(env);
  assertEntityMappingStoreModeAllowed(mode, env);

  if (mode === "memory") {
    return new InMemoryEntityMappingStore();
  }

  if (!env.DATABASE_URL || env.DATABASE_URL.trim() === "") {
    throw new PlatformServiceError({
      category: "configuration",
      code: "CONFIGURATION_ERROR",
      message:
        "ENTITY_MAPPING_STORE_MODE=postgres requires DATABASE_URL",
      correlationId: "mapping-store-bootstrap",
      retryable: false,
      details: { mode },
    });
  }

  const health = await checkDatabaseHealth();
  if (!health.ok) {
    throw new PlatformServiceError({
      category: "temporary_failure",
      code: "PERSISTENCE_UNAVAILABLE",
      message:
        "PostgreSQL entity mapping store is required but the database is unavailable",
      correlationId: "mapping-store-bootstrap",
      retryable: true,
      details: {
        mode,
        classification: "database_unavailable",
      },
    });
  }

  return new PostgresEntityMappingStore({
    db: getDb(),
    logger: options.logger,
    metrics: options.metrics,
  });
}
