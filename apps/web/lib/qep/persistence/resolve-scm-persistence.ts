/**
 * QX-PR-02 — SCM persistence provider selection.
 * Production / staging: PostgreSQL mandatory (fail closed).
 */
import { createDb, type DatabaseExecutor } from "@apzhub/config";

export type ScmPersistenceMode = "memory" | "postgres";

export type ScmPersistenceResolution = {
  readonly mode: ScmPersistenceMode;
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
    process.env.APZQEP_SCM_REQUIRE_POSTGRES === "true" ||
    process.env.APZQEP_CORE_QE_REQUIRE_POSTGRES === "true"
  );
}

export function resolveScmPersistenceMode(): ScmPersistenceMode {
  const configured = (process.env.APZQEP_SCM_PERSISTENCE_MODE ?? "").toLowerCase();
  if (configured === "postgres" || configured === "memory") {
    return configured;
  }
  const core = (process.env.APZQEP_CORE_QE_PERSISTENCE_MODE ?? "").toLowerCase();
  if (core === "postgres" || core === "memory") {
    return core;
  }
  return isProductionLike() ? "postgres" : "memory";
}

export function resolveScmPersistence(): ScmPersistenceResolution {
  const mode = resolveScmPersistenceMode();
  if (mode === "postgres") {
    if (!process.env.DATABASE_URL?.trim()) {
      throw new Error(
        "APZQEP_SCM: PostgreSQL is mandatory but DATABASE_URL is not configured",
      );
    }
    return {
      mode: "postgres",
      db: createDb(),
      providerLabel: "postgresql",
    };
  }
  if (isProductionLike()) {
    throw new Error(
      "APZQEP_SCM: in-memory persistence is forbidden in production/staging",
    );
  }
  return {
    mode: "memory",
    providerLabel: "memory",
  };
}
