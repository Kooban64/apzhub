import { createActivityTimelineServiceFromHydration } from "../client/service";
import { createActivityTimelineContextFromDto } from "../client";
import { sampleActivityTimelineHydrationBundle } from "../client/test-fixtures";
import { sampleActivityDocument } from "../client/service/test-fixtures";
import type { ActivityDocument } from "../types/activity-document";

export function seedActivityTimelineService(
  initialActivities?: readonly ActivityDocument[],
) {
  const bundle = sampleActivityTimelineHydrationBundle();
  const context = createActivityTimelineContextFromDto(bundle);

  return createActivityTimelineServiceFromHydration({
    context,
    initialActivities: initialActivities ?? [
      sampleActivityDocument({
        activityId: "env-1:platform.action.executed",
        title: "Bootstrap complete",
        timestamp: "2026-07-04T12:00:00.000Z",
      }),
    ],
  });
}

export function seedActivityTimelineServiceWithAction() {
  return seedActivityTimelineService([
    sampleActivityDocument({
      activityId: "env-1:platform.action.executed",
      title: "Bootstrap complete",
      timestamp: "2026-07-04T12:00:00.000Z",
      metadata: Object.freeze({
        templateRef: "activity.platform.action.executed",
        sourceEnvelopeId: "env-1",
        correlationId: "corr-1",
        publisher: "command-framework",
        timelineScopes: Object.freeze(["timeline.personal" as const]),
        severity: "info" as const,
        payloadSummary: Object.freeze({
          actionRef: Object.freeze({
            actionId: "platform.theme.toggle",
            handlerContext: Object.freeze({ source: "activity" }),
          }),
        }),
      }),
    }),
  ]);
}

export function seedEmptyActivityTimelineService() {
  return seedActivityTimelineService([]);
}
