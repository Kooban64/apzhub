/**
 * APZQEP-151 — Core QE persistence provider selection.
 * Production / staging certification: PostgreSQL mandatory (fail closed).
 * Development / unit tests: explicit memory allowed when configured.
 */
import { createDb, type DatabaseExecutor } from "@apzhub/config";

export type CoreQePersistenceMode = "memory" | "postgres";

export type CoreQePersistenceResolution = {
  readonly mode: CoreQePersistenceMode;
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
    process.env.APZQEP_CORE_QE_REQUIRE_POSTGRES === "true"
  );
}

export function resolveCoreQePersistenceMode(): CoreQePersistenceMode {
  const configured = (process.env.APZQEP_CORE_QE_PERSISTENCE_MODE ?? "").toLowerCase();
  if (configured === "postgres" || configured === "memory") {
    return configured;
  }
  return isProductionLike() ? "postgres" : "memory";
}

/**
 * Resolve Cap A–F persistence. Throws in production-like environments when
 * postgres is required but DATABASE_URL / db is unavailable.
 */
export function resolveCoreQePersistence(): CoreQePersistenceResolution {
  const mode = resolveCoreQePersistenceMode();
  if (mode === "postgres") {
    if (!process.env.DATABASE_URL?.trim()) {
      throw new Error(
        "APZQEP_CORE_QE: PostgreSQL is mandatory but DATABASE_URL is not configured",
      );
    }
    const db = createDb();
    return {
      mode: "postgres",
      db,
      providerLabel: "postgresql",
    };
  }
  if (isProductionLike()) {
    throw new Error(
      "APZQEP_CORE_QE: in-memory persistence is forbidden in production/staging",
    );
  }
  return {
    mode: "memory",
    providerLabel: "memory",
  };
}

export function getCoreQePersistenceHealth(): {
  readonly provider: string;
  readonly mode: CoreQePersistenceMode;
  readonly productionLike: boolean;
} {
  const mode = resolveCoreQePersistenceMode();
  return {
    provider: mode === "postgres" ? "postgresql" : "memory",
    mode,
    productionLike: isProductionLike(),
  };
}
