import type { ReactElement, ReactNode } from "react";
import { render, type RenderOptions, type RenderResult } from "@testing-library/react";

import { createAppActivityTimelineContext } from "../create-app-activity-timeline-context";
import { createAppEventNotificationContext } from "../create-app-event-notification-context";
import { TimeEntryWorkflowProvider } from "./time-entry-workflow-context";
import { TimeEntryWorkflowService } from "./time-entry-workflow-service";
import { getSharedTimeEntryRepository } from "./in-memory-time-entry-repository";

export function renderWithTimeEntryWorkflow(
  ui: ReactElement,
  options?: RenderOptions,
): RenderResult & { rerender: (element: ReactNode) => void } {
  const eventContext = createAppEventNotificationContext();
  createAppActivityTimelineContext({ eventBus: eventContext.eventBus });
  const workflow = new TimeEntryWorkflowService({
    repository: getSharedTimeEntryRepository(),
    eventBus: eventContext.eventBus,
  });

  const wrap = (element: ReactElement) => (
    <TimeEntryWorkflowProvider service={workflow}>{element}</TimeEntryWorkflowProvider>
  );

  const result = render(wrap(ui), options);

  return {
    ...result,
    rerender: (element: ReactNode) => result.rerender(wrap(element as ReactElement)),
  };
}
