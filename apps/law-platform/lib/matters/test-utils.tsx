import type { ReactElement, ReactNode } from "react";
import { render, type RenderOptions, type RenderResult } from "@testing-library/react";

import { createAppActivityTimelineContext } from "../create-app-activity-timeline-context";
import { createAppEventNotificationContext } from "../create-app-event-notification-context";
import { MatterWorkflowProvider } from "./matter-workflow-context";
import { MatterWorkflowService } from "./matter-workflow-service";
import { getSharedMatterRepository } from "./in-memory-matter-repository";

export function renderWithMatterWorkflow(
  ui: ReactElement,
  options?: RenderOptions,
): RenderResult & { rerender: (element: ReactNode) => void } {
  const eventContext = createAppEventNotificationContext();
  createAppActivityTimelineContext({ eventBus: eventContext.eventBus });
  const workflow = new MatterWorkflowService({
    repository: getSharedMatterRepository(),
    eventBus: eventContext.eventBus,
  });

  const wrap = (element: ReactElement) => (
    <MatterWorkflowProvider service={workflow}>{element}</MatterWorkflowProvider>
  );

  const result = render(wrap(ui), options);

  return {
    ...result,
    rerender: (element: ReactNode) => result.rerender(wrap(element as ReactElement)),
  };
}
