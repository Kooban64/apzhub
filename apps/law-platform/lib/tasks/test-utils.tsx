import type { ReactElement, ReactNode } from "react";
import { render, type RenderOptions, type RenderResult } from "@testing-library/react";

import { createAppActivityTimelineContext } from "../create-app-activity-timeline-context";
import { createAppEventNotificationContext } from "../create-app-event-notification-context";
import { TaskWorkflowProvider } from "./task-workflow-context";
import { TaskWorkflowService } from "./task-workflow-service";
import { getSharedTaskRepository } from "./in-memory-task-repository";

export function renderWithTaskWorkflow(
  ui: ReactElement,
  options?: RenderOptions,
): RenderResult & { rerender: (element: ReactNode) => void } {
  const eventContext = createAppEventNotificationContext();
  createAppActivityTimelineContext({ eventBus: eventContext.eventBus });
  const workflow = new TaskWorkflowService({
    repository: getSharedTaskRepository(),
    eventBus: eventContext.eventBus,
  });

  const wrap = (element: ReactElement) => (
    <TaskWorkflowProvider service={workflow}>{element}</TaskWorkflowProvider>
  );

  const result = render(wrap(ui), options);

  return {
    ...result,
    rerender: (element: ReactNode) => result.rerender(wrap(element as ReactElement)),
  };
}
