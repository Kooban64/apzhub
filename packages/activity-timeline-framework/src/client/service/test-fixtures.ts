import type { ActivityDocument } from "../../types/activity-document";
import { TIMELINE_SCOPE_PERSONAL } from "../../types/timeline-scope";

export function sampleActivityDocument(
  overrides: Partial<ActivityDocument> & Pick<ActivityDocument, "activityId">,
): ActivityDocument {
  return Object.freeze({
    activityTypeId: "platform.action.executed",
    sourceEventId: "capability.action.executed",
    title: "Action executed",
    description: "Action executed description",
    timelineScope: TIMELINE_SCOPE_PERSONAL,
    category: "capability",
    timestamp: "2026-07-04T12:00:00.000Z",
    actor: Object.freeze({ id: "user-1" }),
    metadata: Object.freeze({
      templateRef: "activity.platform.action.executed",
      sourceEnvelopeId: "env-1",
      correlationId: "corr-1",
      publisher: "command-framework",
      timelineScopes: Object.freeze([TIMELINE_SCOPE_PERSONAL]),
      severity: "info" as const,
    }),
    diagnostics: Object.freeze({
      renderedAt: "2026-07-04T12:00:01.000Z",
      matchedActivityTypeId: "platform.action.executed",
      eventPattern: "capability.action.executed",
      typeStatus: "active" as const,
      templateStatus: "ok" as const,
      message: "Activity document mapped",
    }),
    ...overrides,
  });
}
