import type { EventBus } from "@apzhub/event-notification-framework";
import type {
  ActivityMapper,
  ActivityService,
} from "@apzhub/activity-timeline-framework/server";

/**
 * Production Event Bus subscriber — maps platform events into the session Activity Service.
 * Application-owned lifecycle; mirrors wireAppEventNotifications.
 */
export function wireAppActivityTimeline(input: {
  readonly eventBus: EventBus;
  readonly mapper: ActivityMapper;
  readonly service: ActivityService;
}): string {
  return input.eventBus.subscribe({
    eventPattern: "capability.action.*",
    handler: (envelope) => {
      const mapped = input.mapper.map(envelope);
      if (mapped.ok && mapped.documents.length > 0) {
        input.service.addActivities(mapped.documents);
      }
    },
  });
}
