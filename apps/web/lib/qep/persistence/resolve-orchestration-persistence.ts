/**
 * QX-PR-05 — Orchestration persistence provider selection.
 * Production / staging: PostgreSQL mandatory (fail closed).
 */
import { createDb, type DatabaseExecutor } from "@apzhub/config";
import {
  createPostgresOrchestrationDocumentStore,
  InMemoryOrchestrationDocumentStore,
  type OrchestrationDocumentStore,
} from "@apzhub/platform-orchestration";

export type OrchestrationPersistenceMode = "memory" | "postgres";

export type OrchestrationPersistenceResolution = {
  readonly mode: OrchestrationPersistenceMode;
  readonly store: OrchestrationDocumentStore;
  readonly db?: DatabaseExecutor;
  readonly providerLabel: string;
};

function isProductionLike(): boolean {
  const nodeEnv = process.env.NODE_ENV;
  const apzqepEnv = (process.env.APZQEP_ENV ?? "").toLowerCase();
  return (
    nodeEnv === "production" ||
    apzqepEnv === "production" ||
    apzqepEnv === "staging" ||
    process.env.APZQEP_ORCHESTRATION_REQUIRE_POSTGRES === "true" ||
    process.env.APZQEP_CORE_QE_REQUIRE_POSTGRES === "true"
  );
}

export function resolveOrchestrationPersistenceMode(): OrchestrationPersistenceMode {
  const configured = (
    process.env.APZQEP_ORCHESTRATION_PERSISTENCE_MODE ?? ""
  ).toLowerCase();
  if (configured === "postgres" || configured === "memory") {
    return configured;
  }
  const core = (process.env.APZQEP_CORE_QE_PERSISTENCE_MODE ?? "").toLowerCase();
  if (core === "postgres" || core === "memory") {
    return core;
  }
  return isProductionLike() ? "postgres" : "memory";
}

export function resolveOrchestrationPersistence(): OrchestrationPersistenceResolution {
  const mode = resolveOrchestrationPersistenceMode();
  if (mode === "postgres") {
    if (!process.env.DATABASE_URL?.trim()) {
      throw new Error(
        "APZQEP_ORCHESTRATION: PostgreSQL is mandatory but DATABASE_URL is not configured",
      );
    }
    const db = createDb();
    return {
      mode: "postgres",
      db,
      store: createPostgresOrchestrationDocumentStore(db),
      providerLabel: "postgresql",
    };
  }
  if (isProductionLike()) {
    throw new Error(
      "APZQEP_ORCHESTRATION: in-memory persistence is forbidden in production/staging",
    );
  }
  return {
    mode: "memory",
    store: new InMemoryOrchestrationDocumentStore(),
    providerLabel: "memory",
  };
}
