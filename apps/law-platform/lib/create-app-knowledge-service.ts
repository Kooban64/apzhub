import { createKnowledgeDiscoveryOrchestrator } from "@apzhub/knowledge-discovery-framework";
import { bootstrapKnowledgeRegistry } from "@apzhub/knowledge-discovery-framework/server";
import { registerActionRegistryKnowledgeProvider } from "@apzhub/knowledge-discovery-framework";
import { registerWorkbenchNavigationKnowledgeProvider } from "@apzhub/knowledge-discovery-framework";
import { createKnowledgeQueryClientFromOrchestrator } from "@apzhub/knowledge-discovery-framework";
import { createKnowledgeService } from "@apzhub/knowledge-discovery-framework";
import type { EventBus } from "@apzhub/event-notification-framework";
import type { ActionRegistryDto } from "@apzhub/command-framework/server";
import type { KnowledgeService } from "@apzhub/knowledge-discovery-framework";
import type { KnowledgeSourceRegistryDto } from "@apzhub/knowledge-discovery-framework/server";
import type { WorkbenchRegistryDto } from "@apzhub/workbench-framework/server";

import { registerLegalSearchKnowledgeProviders } from "./knowledge/register-legal-search-knowledge";
import { wrapKnowledgeServiceForLegalSearchTracking } from "./search/legal-search-knowledge-tracking";

export interface CreateAppKnowledgeServiceOptions {
  readonly knowledgeDto: KnowledgeSourceRegistryDto;
  readonly actionDto: ActionRegistryDto;
  readonly workbenchDto: WorkbenchRegistryDto;
  readonly registryReady?: boolean;
  readonly eventBus?: EventBus;
  readonly actorId?: string;
}

/** Law Platform Knowledge Service — platform providers plus legal entity search providers (LAW-007-01). */
export function createAppKnowledgeService(
  options: CreateAppKnowledgeServiceOptions,
): KnowledgeService {
  const bootstrap = bootstrapKnowledgeRegistry();
  const registry = bootstrap.registry;

  registerActionRegistryKnowledgeProvider(registry, options.actionDto);
  registerWorkbenchNavigationKnowledgeProvider(registry, options.workbenchDto);
  registerLegalSearchKnowledgeProviders(registry);

  const orchestrator = createKnowledgeDiscoveryOrchestrator({
    registry,
    sourcesDto: options.knowledgeDto,
  });
  const queryClient = createKnowledgeQueryClientFromOrchestrator(orchestrator);
  const baseService = createKnowledgeService({
    queryClient,
    registryReady: options.registryReady ?? options.knowledgeDto.sources.length > 0,
  });

  return wrapKnowledgeServiceForLegalSearchTracking(baseService, {
    eventBus: options.eventBus,
    actorId: options.actorId,
  });
}
