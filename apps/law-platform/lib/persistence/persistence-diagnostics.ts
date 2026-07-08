import { checkDatabaseHealth } from "@apzhub/config";

import { getActiveLawPersistenceContext } from "./law-persistence-scope";
import { isOutboxEnabled } from "./outbox-config";
import { getLawRepositoryMode } from "./repository-mode";
import { resolveLawTenantBinding } from "./tenant-resolver";
import { verifyLawMigrations } from "@apzhub/config";
import { isPostgresIntegrationAvailable } from "./postgres-test-utils";
import type { LawPersistenceDiagnosticsSummary } from "@apzhub/types";

export type { LawPersistenceDiagnosticsSummary };

export async function loadLawPersistenceDiagnostics(): Promise<LawPersistenceDiagnosticsSummary> {
  const context = getActiveLawPersistenceContext();
  const binding = resolveLawTenantBinding({
    userId: context.actorId,
    explicitTenantId: context.tenantId,
  });

  const postgresAvailable = await isPostgresIntegrationAvailable();
  const databaseHealth = postgresAvailable ? await checkDatabaseHealth() : undefined;
  const migrationVerification = postgresAvailable
    ? await verifyLawMigrations()
    : {
        ok: false,
        missingTags: [] as readonly string[],
      };

  return {
    repositoryMode: getLawRepositoryMode(),
    tenantId: context.tenantId,
    tenantSource: binding.source,
    actorId: context.actorId,
    postgresReady: Boolean(databaseHealth?.ok),
    postgresLatencyMs: databaseHealth?.latencyMs,
    migrationsOk: migrationVerification.ok,
    migrationMissingTags: migrationVerification.missingTags,
    outboxEnabled: isOutboxEnabled(),
  };
}

export function loadLawPersistenceDiagnosticsSync(): Omit<
  LawPersistenceDiagnosticsSummary,
  "postgresReady" | "postgresLatencyMs" | "migrationsOk" | "migrationMissingTags"
> {
  const context = getActiveLawPersistenceContext();
  const binding = resolveLawTenantBinding({
    userId: context.actorId,
    explicitTenantId: context.tenantId,
  });

  return {
    repositoryMode: getLawRepositoryMode(),
    tenantId: context.tenantId,
    tenantSource: binding.source,
    actorId: context.actorId,
    outboxEnabled: isOutboxEnabled(),
  };
}
