import { headers } from "next/headers";

import { getValidatedSession } from "@apzhub/auth/server";
import { mapPlatformCapabilitiesToActionRecords } from "@apzhub/command-framework/server";
import {
  bootstrapKnowledgeRegistry,
  buildKnowledgeDiscoveryHydrationDiagnostics,
  createEmptyKnowledgeDiscoveryHydrationDiagnostics,
  createEmptyKnowledgeSourceRegistryDto,
  filterKnowledgeSourceRegistryDto,
  mapKnowledgeSourceRegistryDto,
  type KnowledgeCapabilityRecord,
  type KnowledgeDiscoveryHydrationDiagnostics,
  type KnowledgeSourceRegistryDto,
} from "@apzhub/knowledge-discovery-framework/server";
import {
  buildKnowledgeServiceHealthSummary,
  createKnowledgeServiceFromHydration,
  KNOWLEDGE_DISCOVERY_FRAMEWORK_STATUS,
  registerActionRegistryKnowledgeProvider,
  registerWorkbenchNavigationKnowledgeProvider,
  type KnowledgeDiscoveryHealthSummary,
} from "@apzhub/knowledge-discovery-framework";
import { Runtime } from "@apzhub/platform-runtime/server";
import { createWorkbenchPermissionAdapter } from "@apzhub/workbench-framework";
import { createLawPlatformAuthPermissionContext } from "./session-permission-context";

import { loadActionRegistryDto } from "./command-hydration";
import { registerLawClientKnowledge } from "./register-law-client-knowledge";
import { registerLawDocumentKnowledge } from "./register-law-document-knowledge";
import { registerLawMatterKnowledge } from "./register-law-matter-knowledge";
import { registerLawTaskKnowledge } from "./register-law-task-knowledge";
import { registerLawSearchKnowledge } from "./register-law-search-knowledge";
import { registerLawCalendarKnowledge } from "./register-law-calendar-knowledge";
import { registerLawBillingKnowledge } from "./register-law-billing-knowledge";
import { registerLawTrustKnowledge } from "./register-law-trust-knowledge";
import { registerLawTimeKnowledge } from "./register-law-time-knowledge";
import { registerLegalSearchKnowledgeProviders } from "./knowledge/register-legal-search-knowledge";
import { ensurePlatformRuntimeReady } from "./runtime-init";
import { loadWorkbenchRegistryDto } from "./workbench-hydration";

export interface KnowledgeSourceRegistryHydrationResult {
  readonly dto: KnowledgeSourceRegistryDto;
  readonly diagnostics: KnowledgeDiscoveryHydrationDiagnostics;
}

function mapPlatformCapabilitiesToKnowledgeRecords(
  capabilities: ReturnType<ReturnType<typeof Runtime.registry>["findAll"]>,
): KnowledgeCapabilityRecord[] {
  return mapPlatformCapabilitiesToActionRecords(capabilities);
}

async function hydrateKnowledgeRegistry() {
  const bootstrap = await ensurePlatformRuntimeReady();

  if (!bootstrap.success) {
    return null;
  }

  const platformRegistry = Runtime.registry();
  const capabilityRecords = mapPlatformCapabilitiesToKnowledgeRecords(
    platformRegistry.findAll(),
  );
  const population = bootstrapKnowledgeRegistry({ capabilityRecords });

  if (!population.ok) {
    return null;
  }

  const [commandHydration, workbenchHydration] = await Promise.all([
    loadActionRegistryDto(),
    loadWorkbenchRegistryDto(),
  ]);

  const registry = population.registry;
  registerLawClientKnowledge(registry);
  registerLawMatterKnowledge(registry);
  registerLawDocumentKnowledge(registry);
  registerLawTaskKnowledge(registry);
  registerLawCalendarKnowledge(registry);
  registerLawTimeKnowledge(registry);
  registerLawBillingKnowledge(registry);
  registerLawTrustKnowledge(registry);
  registerLawSearchKnowledge(registry);
  registerLegalSearchKnowledgeProviders(registry);
  registerActionRegistryKnowledgeProvider(registry, commandHydration.dto);
  registerWorkbenchNavigationKnowledgeProvider(registry, workbenchHydration);

  return {
    registry,
    commandDto: commandHydration.dto,
    workbenchDto: workbenchHydration,
  };
}

/** Platform-wide Knowledge & Discovery hydration summary for `/api/health`. */
export async function loadKnowledgeHealthSummary(): Promise<
  KnowledgeDiscoveryHealthSummary | undefined
> {
  const hydrated = await hydrateKnowledgeRegistry();

  if (!hydrated) {
    return undefined;
  }

  const unfilteredDto = mapKnowledgeSourceRegistryDto(hydrated.registry);
  const permissionAdapter = createWorkbenchPermissionAdapter({ mode: "allow-all" });
  const filteredDto = filterKnowledgeSourceRegistryDto(
    unfilteredDto,
    permissionAdapter,
  );
  const hydrationDiagnostics = buildKnowledgeDiscoveryHydrationDiagnostics(
    hydrated.registry,
    filteredDto,
  );
  const service = createKnowledgeServiceFromHydration({
    knowledgeDto: filteredDto,
    actionDto: hydrated.commandDto,
    workbenchDto: hydrated.workbenchDto,
  });
  const serviceDiagnostics = service.getDiagnostics();

  return buildKnowledgeServiceHealthSummary({
    frameworkStatus: KNOWLEDGE_DISCOVERY_FRAMEWORK_STATUS,
    serviceDiagnostics,
    registeredCount: hydrationDiagnostics.registeredCount,
    filteredCount: hydrationDiagnostics.filteredCount,
    activeSourceCount: hydrationDiagnostics.activeSourceCount,
    registeredProviderCount: hydrationDiagnostics.registeredProviderCount,
  });
}

export async function loadKnowledgeSourceRegistryDto(): Promise<KnowledgeSourceRegistryHydrationResult> {
  const hydrated = await hydrateKnowledgeRegistry();

  if (!hydrated) {
    return {
      dto: createEmptyKnowledgeSourceRegistryDto(),
      diagnostics: createEmptyKnowledgeDiscoveryHydrationDiagnostics(),
    };
  }

  const unfilteredDto = mapKnowledgeSourceRegistryDto(hydrated.registry);
  const session = await getValidatedSession(await headers());
  const authContext = await createLawPlatformAuthPermissionContext(session);
  const permissionAdapter = createWorkbenchPermissionAdapter({
    mode: "auth",
    authContext,
  });
  const filteredDto = filterKnowledgeSourceRegistryDto(
    unfilteredDto,
    permissionAdapter,
  );
  const diagnostics = buildKnowledgeDiscoveryHydrationDiagnostics(
    hydrated.registry,
    filteredDto,
  );

  return { dto: filteredDto, diagnostics };
}
