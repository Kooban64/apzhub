import type { ReactElement, ReactNode } from "react";
import { render, type RenderOptions, type RenderResult } from "@testing-library/react";

import { createAppActivityTimelineContext } from "../create-app-activity-timeline-context";
import { createAppEventNotificationContext } from "../create-app-event-notification-context";
import { DocumentWorkflowProvider } from "./document-workflow-context";
import { DocumentWorkflowService } from "./document-workflow-service";
import { getSharedDocumentRepository } from "./in-memory-document-repository";

export function renderWithDocumentWorkflow(
  ui: ReactElement,
  options?: RenderOptions,
): RenderResult & { rerender: (element: ReactNode) => void } {
  const eventContext = createAppEventNotificationContext();
  createAppActivityTimelineContext({ eventBus: eventContext.eventBus });
  const workflow = new DocumentWorkflowService({
    repository: getSharedDocumentRepository(),
    eventBus: eventContext.eventBus,
  });

  const wrap = (element: ReactElement) => (
    <DocumentWorkflowProvider service={workflow}>{element}</DocumentWorkflowProvider>
  );

  const result = render(wrap(ui), options);

  return {
    ...result,
    rerender: (element: ReactNode) => result.rerender(wrap(element as ReactElement)),
  };
}
