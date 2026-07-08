import type { ActivityCategory } from "../types/activity-category";
import type {
  ActivityDocumentActor,
  ActivityDocumentMetadata,
} from "../types/activity-document";
import type { ActivitySeverity } from "../types/activity-descriptor";
import type { TimelineScopeId } from "../types/timeline-scope";

/** Future Action Framework delegation reference — passthrough only, no execution. */
export interface ActivityActionRef {
  readonly actionId: string;
  readonly handlerContext?: Readonly<Record<string, unknown>>;
}

/** UI-ready activity view model — derived from immutable ActivityDocument only. */
export interface ActivityViewModel {
  readonly activityId: string;
  readonly activityTypeId: string;
  readonly sourceEventId: string;
  readonly title: string;
  readonly description: string;
  readonly timelineScope: TimelineScopeId;
  readonly category: ActivityCategory;
  readonly severity: ActivitySeverity;
  readonly timestamp: string;
  readonly relativeTimestamp: string;
  readonly icon?: string;
  readonly actor: ActivityDocumentActor;
  readonly metadata: ActivityDocumentMetadata;
  readonly correlationId: string;
  readonly actionRef?: ActivityActionRef;
}

export function freezeActivityViewModel(model: ActivityViewModel): ActivityViewModel {
  return Object.freeze({
    ...model,
    actor: Object.freeze({ ...model.actor }),
    metadata: Object.freeze({
      ...model.metadata,
      timelineScopes: Object.freeze([...model.metadata.timelineScopes]),
      ...(model.metadata.payloadSummary
        ? { payloadSummary: Object.freeze({ ...model.metadata.payloadSummary }) }
        : {}),
    }),
    actionRef: model.actionRef
      ? Object.freeze({
          ...model.actionRef,
          handlerContext: model.actionRef.handlerContext
            ? Object.freeze({ ...model.actionRef.handlerContext })
            : undefined,
        })
      : undefined,
  });
}
