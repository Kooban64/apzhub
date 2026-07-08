import type { EventEnvelope } from "@apzhub/event-notification-framework";

import { DEFAULT_TIMELINE_SCOPE_ID } from "../constants";
import type { ActivityDescriptor } from "../types/activity-descriptor";
import type {
  ActivityDocument,
  ActivityDocumentDiagnostics,
  ActivityDocumentMetadata,
} from "../types/activity-document";
import type { ActivityTypeTemplate } from "./activity-mapper-registry";
import {
  assertRenderableActivityTemplate,
  renderActivityTemplate,
} from "./render-activity-template";

export interface CreateActivityDocumentInput {
  readonly envelope: EventEnvelope;
  readonly descriptor: ActivityDescriptor;
  readonly title: string;
  readonly description: string;
  readonly renderedAt: string;
}

export function buildActivityDocumentId(
  envelopeId: string,
  activityTypeId: string,
): string {
  return `${envelopeId}:${activityTypeId}`;
}

export function freezeActivityDocument(document: ActivityDocument): ActivityDocument {
  return Object.freeze({
    ...document,
    actor: Object.freeze({ ...document.actor }),
    metadata: Object.freeze({
      ...document.metadata,
      timelineScopes: Object.freeze([...document.metadata.timelineScopes]),
      ...(document.metadata.payloadSummary
        ? { payloadSummary: Object.freeze({ ...document.metadata.payloadSummary }) }
        : {}),
    }),
    diagnostics: Object.freeze({ ...document.diagnostics }),
  });
}

export function createActivityDocument(
  input: CreateActivityDocumentInput,
): ActivityDocument {
  const timelineScope = input.descriptor.timelineScopes[0] ?? DEFAULT_TIMELINE_SCOPE_ID;

  const metadata: ActivityDocumentMetadata = Object.freeze({
    templateRef: input.descriptor.templateRef,
    sourceEnvelopeId: input.envelope.envelopeId,
    correlationId: input.envelope.correlationId,
    causationId: input.envelope.causationId,
    publisher: input.envelope.publisher,
    timelineScopes: Object.freeze([...input.descriptor.timelineScopes]),
    severity: input.descriptor.severity ?? "info",
  });

  const diagnostics: ActivityDocumentDiagnostics = Object.freeze({
    renderedAt: input.renderedAt,
    matchedActivityTypeId: input.descriptor.activityTypeId,
    eventPattern: input.descriptor.sourceEventPattern,
    typeStatus: input.descriptor.status ?? "active",
    templateStatus: "ok",
    message: "Activity document mapped — not stored",
  });

  return freezeActivityDocument({
    activityId: buildActivityDocumentId(
      input.envelope.envelopeId,
      input.descriptor.activityTypeId,
    ),
    activityTypeId: input.descriptor.activityTypeId,
    sourceEventId: input.envelope.eventId,
    title: input.title,
    description: input.description,
    timelineScope,
    category: input.descriptor.category,
    timestamp: input.envelope.timestamp,
    actor: Object.freeze({
      id: input.envelope.actorId,
    }),
    metadata,
    diagnostics,
  });
}

export function renderActivityTypeDocument(
  envelope: EventEnvelope,
  descriptor: ActivityDescriptor,
  template: ActivityTypeTemplate | undefined,
  renderedAt: string,
): ActivityDocument {
  const titleTemplate =
    template?.titleTemplate ?? descriptor.label ?? descriptor.activityTypeId;
  const descriptionTemplate =
    template?.descriptionTemplate ??
    descriptor.description ??
    descriptor.activityTypeId;

  assertRenderableActivityTemplate(titleTemplate, "titleTemplate");
  assertRenderableActivityTemplate(descriptionTemplate, "descriptionTemplate");

  const title = renderActivityTemplate(titleTemplate, envelope);
  const description = renderActivityTemplate(descriptionTemplate, envelope);

  return createActivityDocument({
    envelope,
    descriptor,
    title,
    description,
    renderedAt,
  });
}
