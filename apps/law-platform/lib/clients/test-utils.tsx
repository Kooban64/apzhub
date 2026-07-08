import type { ReactElement, ReactNode } from "react";
import { render, type RenderOptions, type RenderResult } from "@testing-library/react";
import {
  ActivityTimelineServiceProvider,
  createActivityTimelineContextFromDto,
  createActivityTimelineServiceFromHydration,
  sampleActivityTimelineHydrationBundle,
} from "@apzhub/activity-timeline-framework/react";
import { NotificationServiceProvider } from "@apzhub/event-notification-framework/react";

import { createAppActivityTimelineContext } from "../create-app-activity-timeline-context";
import { createAppEventNotificationContext } from "../create-app-event-notification-context";
import { ClientWorkflowProvider } from "./client-workflow-context";
import { ClientWorkflowService } from "./client-workflow-service";
import { getSharedClientRepository } from "../persistence/repository-factory";

const activityTimelineBundle = sampleActivityTimelineHydrationBundle();
const activityTimelineContext =
  createActivityTimelineContextFromDto(activityTimelineBundle);
const activityTimelineService = createActivityTimelineServiceFromHydration({
  context: activityTimelineContext,
});

export function renderWithClientWorkflow(
  ui: ReactElement,
  options?: RenderOptions,
): RenderResult & { rerender: (element: ReactNode) => void } {
  const eventContext = createAppEventNotificationContext();
  createAppActivityTimelineContext({ eventBus: eventContext.eventBus });
  const workflow = new ClientWorkflowService({
    repository: getSharedClientRepository(),
    eventBus: eventContext.eventBus,
  });

  const wrap = (element: ReactElement) => (
    <NotificationServiceProvider service={eventContext.notificationService}>
      <ActivityTimelineServiceProvider service={activityTimelineService}>
        <ClientWorkflowProvider service={workflow}>{element}</ClientWorkflowProvider>
      </ActivityTimelineServiceProvider>
    </NotificationServiceProvider>
  );

  const result = render(wrap(ui), options);

  return {
    ...result,
    rerender: (element: ReactNode) => result.rerender(wrap(element as ReactElement)),
  };
}
