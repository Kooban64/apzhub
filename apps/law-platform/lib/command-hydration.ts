import { headers } from "next/headers";

import { getValidatedSession } from "@apzhub/auth/server";
import {
  bootstrapActionRegistry,
  buildActionRegistryHydrationDiagnostics,
  createEmptyActionRegistryDto,
  createEmptyActionRegistryHydrationDiagnostics,
  filterActionRegistryDto,
  mapPlatformCapabilitiesToActionRecords,
  type ActionRegistryDto,
  type ActionRegistryHydrationDiagnostics,
} from "@apzhub/command-framework/server";
import { Runtime } from "@apzhub/platform-runtime/server";
import type { ActionFrameworkHealthSummary } from "@apzhub/types";
import { createWorkbenchPermissionAdapter } from "@apzhub/workbench-framework";
import { createLawPlatformAuthPermissionContext } from "./session-permission-context";

import { ensurePlatformRuntimeReady } from "./runtime-init";

export interface ActionRegistryHydrationResult {
  readonly dto: ActionRegistryDto;
  readonly diagnostics: ActionRegistryHydrationDiagnostics;
}

function mapHydrationDiagnosticsToHealthStatus(
  diagnostics: ActionRegistryHydrationDiagnostics,
): ActionFrameworkHealthSummary["status"] {
  if (diagnostics.registeredCount === 0) {
    return "unhealthy";
  }

  if (diagnostics.filteredCount === 0 && diagnostics.registeredCount > 0) {
    return "degraded";
  }

  return "healthy";
}

/** Platform-wide Action Framework hydration summary for `/api/health` (allow-all visibility). */
export async function loadActionRegistryHealthSummary(): Promise<
  ActionFrameworkHealthSummary | undefined
> {
  const bootstrap = await ensurePlatformRuntimeReady();

  if (!bootstrap.success) {
    return undefined;
  }

  const platformRegistry = Runtime.registry();
  const records = mapPlatformCapabilitiesToActionRecords(platformRegistry.findAll());
  const population = bootstrapActionRegistry({ capabilityRecords: records });

  if (!population.ok) {
    return undefined;
  }

  const permissionAdapter = createWorkbenchPermissionAdapter({ mode: "allow-all" });
  const filtered = filterActionRegistryDto(population.dto, permissionAdapter);
  const diagnostics = buildActionRegistryHydrationDiagnostics(
    population.registry,
    filtered,
  );

  return {
    status: mapHydrationDiagnosticsToHealthStatus(diagnostics),
    registeredCount: diagnostics.registeredCount,
    filteredCount: diagnostics.filteredCount,
    platformActionCount: diagnostics.platformActionCount,
    capabilityActionCount: diagnostics.capabilityActionCount,
    toolbarRegionCount: diagnostics.toolbarRegionCount,
    toolbarItemCount: diagnostics.toolbarItemCount,
    registeredShortcutCount: diagnostics.registeredShortcutCount,
  };
}

/**
 * Bootstrap platform catalogue and manifest actions from the platform registry,
 * populate the action registry, and permission-filter the DTO for the current session.
 */
export async function loadActionRegistryDto(): Promise<ActionRegistryHydrationResult> {
  const bootstrap = await ensurePlatformRuntimeReady();

  if (!bootstrap.success) {
    return {
      dto: createEmptyActionRegistryDto(),
      diagnostics: createEmptyActionRegistryHydrationDiagnostics(),
    };
  }

  const platformRegistry = Runtime.registry();
  const records = mapPlatformCapabilitiesToActionRecords(platformRegistry.findAll());
  const population = bootstrapActionRegistry({ capabilityRecords: records });

  if (!population.ok) {
    return {
      dto: createEmptyActionRegistryDto(),
      diagnostics: createEmptyActionRegistryHydrationDiagnostics(),
    };
  }

  const session = await getValidatedSession(await headers());
  const authContext = await createLawPlatformAuthPermissionContext(session);
  const permissionAdapter = createWorkbenchPermissionAdapter({
    mode: "auth",
    authContext,
  });

  const filtered = filterActionRegistryDto(population.dto, permissionAdapter);
  const diagnostics = buildActionRegistryHydrationDiagnostics(
    population.registry,
    filtered,
  );

  return { dto: filtered, diagnostics };
}
