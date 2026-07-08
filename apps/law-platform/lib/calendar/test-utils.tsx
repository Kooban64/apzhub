import type { ReactElement, ReactNode } from "react";
import { render, type RenderOptions, type RenderResult } from "@testing-library/react";

import { createAppActivityTimelineContext } from "../create-app-activity-timeline-context";
import { createAppEventNotificationContext } from "../create-app-event-notification-context";
import { CalendarEventWorkflowProvider } from "./calendar-event-workflow-context";
import { CalendarEventWorkflowService } from "./calendar-event-workflow-service";
import { getSharedCalendarEventRepository } from "./in-memory-calendar-event-repository";

export function renderWithCalendarEventWorkflow(
  ui: ReactElement,
  options?: RenderOptions,
): RenderResult & { rerender: (element: ReactNode) => void } {
  const eventContext = createAppEventNotificationContext();
  createAppActivityTimelineContext({ eventBus: eventContext.eventBus });
  const workflow = new CalendarEventWorkflowService({
    repository: getSharedCalendarEventRepository(),
    eventBus: eventContext.eventBus,
  });

  const wrap = (element: ReactElement) => (
    <CalendarEventWorkflowProvider service={workflow}>
      {element}
    </CalendarEventWorkflowProvider>
  );

  const result = render(wrap(ui), options);

  return {
    ...result,
    rerender: (element: ReactNode) => result.rerender(wrap(element as ReactElement)),
  };
}
