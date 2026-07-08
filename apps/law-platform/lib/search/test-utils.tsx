import type { ReactElement, ReactNode } from "react";
import { KnowledgeDiscoveryProvider } from "@apzhub/knowledge-discovery-framework/react";
import { createEmptyActionRegistryDto } from "@apzhub/command-framework/server";
import {
  bootstrapKnowledgeRegistry,
  createEmptyKnowledgeSourceRegistryDto,
  mapKnowledgeSourceRegistryDto,
} from "@apzhub/knowledge-discovery-framework/server";
import { createEmptyWorkbenchRegistryDto } from "@apzhub/workbench-framework/server";
import { render, type RenderOptions, type RenderResult } from "@testing-library/react";

import { createAppActivityTimelineContext } from "../create-app-activity-timeline-context";
import { createAppEventNotificationContext } from "../create-app-event-notification-context";
import { createAppKnowledgeService } from "../create-app-knowledge-service";
import { registerLegalSearchKnowledgeProviders } from "../knowledge/register-legal-search-knowledge";
import { LegalSearchWorkflowBridge } from "./legal-search-workflow-context";

function createLegalSearchKnowledgeDto() {
  const bootstrap = bootstrapKnowledgeRegistry();
  registerLegalSearchKnowledgeProviders(bootstrap.registry);
  return mapKnowledgeSourceRegistryDto(bootstrap.registry);
}

export function renderWithLegalSearchWorkflow(
  ui: ReactElement,
  options?: RenderOptions,
): RenderResult & { rerender: (element: ReactNode) => void } {
  const eventContext = createAppEventNotificationContext();
  createAppActivityTimelineContext({ eventBus: eventContext.eventBus });
  const knowledgeDto = createLegalSearchKnowledgeDto();
  const knowledgeService = createAppKnowledgeService({
    knowledgeDto,
    actionDto: createEmptyActionRegistryDto(),
    workbenchDto: createEmptyWorkbenchRegistryDto(),
    registryReady: true,
  });

  const wrap = (element: ReactElement) => (
    <KnowledgeDiscoveryProvider dto={knowledgeDto} service={knowledgeService}>
      <LegalSearchWorkflowBridge
        eventBus={eventContext.eventBus}
        knowledgeService={knowledgeService}
      >
        {element}
      </LegalSearchWorkflowBridge>
    </KnowledgeDiscoveryProvider>
  );

  const result = render(wrap(ui), options);

  return {
    ...result,
    rerender: (element: ReactNode) => result.rerender(wrap(element as ReactElement)),
  };
}

export { createEmptyKnowledgeSourceRegistryDto };
