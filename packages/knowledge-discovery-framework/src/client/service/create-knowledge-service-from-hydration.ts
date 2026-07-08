import type { ActionRegistryDto } from "@apzhub/command-framework/server";
import type { WorkbenchRegistryDto } from "@apzhub/workbench-framework/server";

import { createKnowledgeDiscoveryOrchestrator } from "../../orchestrator/knowledge-discovery-orchestrator";
import { registerActionRegistryKnowledgeProvider } from "../../provider/action-registry/test-fixtures";
import { registerWorkbenchNavigationKnowledgeProvider } from "../../provider/workbench-navigation/test-fixtures";
import { bootstrapKnowledgeRegistry } from "../../server/bootstrap-knowledge-registry";
import type { KnowledgeSourceRegistryDto } from "../../server/map-knowledge-source-registry-dto";
import { buildClientKnowledgeRegistryDiagnostics } from "../client-knowledge-registry-diagnostics";
import { mapKnowledgeSourceRegistryDtoToSources } from "../map-dto-to-knowledge-sources";
import { createKnowledgeQueryClientFromOrchestrator } from "../query/create-knowledge-query-client-from-orchestrator";
import { createKnowledgeService } from "./create-knowledge-service";
import type { KnowledgeService } from "./knowledge-service";

export interface CreateKnowledgeServiceFromHydrationOptions {
  readonly knowledgeDto: KnowledgeSourceRegistryDto;
  readonly actionDto: ActionRegistryDto;
  readonly workbenchDto: WorkbenchRegistryDto;
  readonly registryReady?: boolean;
}

/**
 * Wires orchestrator-backed query execution behind the public Knowledge Service.
 *
 * KnowledgeQueryClient remains an internal implementation detail.
 */
export function createKnowledgeServiceFromHydration(
  options: CreateKnowledgeServiceFromHydrationOptions,
): KnowledgeService {
  const bootstrap = bootstrapKnowledgeRegistry();
  const registry = bootstrap.registry;

  registerActionRegistryKnowledgeProvider(registry, options.actionDto);
  registerWorkbenchNavigationKnowledgeProvider(registry, options.workbenchDto);

  const orchestrator = createKnowledgeDiscoveryOrchestrator({
    registry,
    sourcesDto: options.knowledgeDto,
  });
  const queryClient = createKnowledgeQueryClientFromOrchestrator(orchestrator);
  const registryDiagnostics = buildClientKnowledgeRegistryDiagnostics(
    mapKnowledgeSourceRegistryDtoToSources(options.knowledgeDto.sources),
    {
      schemaVersion: options.knowledgeDto.schemaVersion,
      frameworkVersion: options.knowledgeDto.frameworkVersion,
    },
  );

  return createKnowledgeService({
    queryClient,
    registryReady: options.registryReady ?? registryDiagnostics.status === "hydrated",
    registryDiagnostics,
  });
}
