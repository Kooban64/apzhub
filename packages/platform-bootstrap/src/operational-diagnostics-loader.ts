import { checkDatabaseHealth } from "@apzhub/config";
import { getSharedAuthorizationService } from "@apzhub/platform-authorization";
import { getSharedGovernanceService } from "@apzhub/platform-governance";
import { getSharedTenantManagementService } from "@apzhub/platform-identity";
import { getSharedPersonalisationService } from "@apzhub/platform-personalisation";
import { getSharedPlatformSecurityService } from "@apzhub/platform-security";

import {
  ensurePlatformRuntimeReady,
  getBootstrapPackageDiagnostics,
} from "./platform-runtime-bootstrap";
import type { OperationalDiagnosticsExtensions } from "./types";

async function loadPostgresTenantDiagnostics(): Promise<Record<string, unknown> | null> {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  try {
    const { getPlatformTenantDiagnostics } = await import(
      "@apzhub/platform-identity/server"
    );
    return await getPlatformTenantDiagnostics();
  } catch {
    return null;
  }
}

export async function loadConsolidatedOperationalDiagnostics(
  workspaceRoot: string,
  extensions: OperationalDiagnosticsExtensions = {},
): Promise<
  Awaited<
    ReturnType<
      ReturnType<
        typeof getSharedPlatformSecurityService
      >["operationalDiagnostics"]["getConsolidatedDiagnostics"]
    >
  >
> {
  const bootstrap = await ensurePlatformRuntimeReady(workspaceRoot).catch(() => null);
  const securityService = getSharedPlatformSecurityService();
  const bootstrapDiagnostics = getBootstrapPackageDiagnostics(workspaceRoot, bootstrap);

  let identityDiagnostics: Record<string, unknown> | null = null;
  let persistenceDiagnostics: Record<string, unknown> | null = null;

  try {
    identityDiagnostics = {
      inMemory: getSharedTenantManagementService().getDiagnostics(),
      postgres: await loadPostgresTenantDiagnostics(),
    };
  } catch {
    identityDiagnostics = null;
  }

  if (process.env.DATABASE_URL) {
    try {
      const dbHealth = await checkDatabaseHealth();
      persistenceDiagnostics = { database: dbHealth };
    } catch {
      persistenceDiagnostics = null;
    }
  }

  const runtimeDiagnostics = bootstrap?.diagnostics
    ? ({
        ...(bootstrap.diagnostics as unknown as Record<string, unknown>),
        bootstrap: bootstrapDiagnostics,
      } as Record<string, unknown>)
    : { bootstrap: bootstrapDiagnostics };

  return securityService.operationalDiagnostics.getConsolidatedDiagnostics({
    runtimeReady: bootstrap?.success ?? false,
    runtimeDiagnostics,
    identityDiagnostics: identityDiagnostics ?? undefined,
    authorizationDiagnostics: {
      inMemory: getSharedAuthorizationService().getDiagnostics(),
    },
    operationsDiagnostics: extensions.operationsDiagnostics ?? {
      consoleSections: 19,
      summaryEndpoint: "/api/platform/v1/operations/summary",
      controlPlaneEndpoint: "/api/platform/v1/operations/control-plane",
      lifecycleEndpoint: "/api/platform/v1/operations/lifecycle",
    },
    personalisationDiagnostics: {
      inMemory: await getSharedPersonalisationService().getDiagnostics(),
    },
    governanceDiagnostics: {
      inMemory: await getSharedGovernanceService().getDiagnostics(),
    },
    apiDiagnostics: extensions.apiDiagnostics ?? {
      version: "v1",
      guardEnforced: true,
      securityEndpoint: "/api/platform/v1/security",
      systemHealthEndpoint: "/api/platform/v1/system/health",
      bootstrapPackage: bootstrapDiagnostics.package,
    },
    workbenchDiagnostics: extensions.workbenchDiagnostics ?? {
      framework: "@apzhub/workbench-framework",
      navigationModel: "platform-administration",
    },
    lawPlatformDiagnostics: extensions.lawPlatformDiagnostics,
    trustAccountingDiagnostics: extensions.trustAccountingDiagnostics,
    persistenceDiagnostics: persistenceDiagnostics ?? undefined,
  });
}
