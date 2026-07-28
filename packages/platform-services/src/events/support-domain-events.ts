import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import {
  createDomainEventEnvelopeId,
  publishDomainEventFailSoft,
  type DomainEventEnvelope,
  type DomainEventPublisher,
  type DomainEventPublishResult,
} from "./domain-event-publisher";

/** Catalogue keys — docs/products/PLATFORM-EVENT-CATALOGUE.md §4.2 */
export const SUPPORT_DOMAIN_EVENT_IDS = {
  requestCreated: "support.request.created",
  requestUpdated: "support.request.updated",
  requestAssigned: "support.request.assigned",
  requestClosed: "support.request.closed",
  articleCreated: "support.article.created",
} as const;

export type SupportDomainEventId =
  (typeof SUPPORT_DOMAIN_EVENT_IDS)[keyof typeof SUPPORT_DOMAIN_EVENT_IDS];

export interface SupportRequestEventPayload {
  readonly supportRequestId: string;
  readonly title?: string;
  readonly status?: string;
  readonly priority?: string;
  readonly assigneeId?: string;
  readonly organizationId?: string;
  readonly groupId?: string;
}

export interface SupportArticleEventPayload {
  readonly articleId: string;
  readonly supportRequestId: string;
  readonly articleType?: string;
}

function buildEnvelope(
  eventId: SupportDomainEventId,
  ctx: ServiceRequestContext,
  payload: Readonly<Record<string, unknown>>,
): DomainEventEnvelope {
  return {
    envelopeId: createDomainEventEnvelopeId(),
    eventId,
    eventVersion: "1.0.0",
    category: "business",
    correlationId: ctx.correlationId || createDomainEventEnvelopeId(),
    timestamp: new Date().toISOString(),
    publisher: "support-service",
    actorId: ctx.userId,
    sourceService: "support-service",
    tenantId: ctx.tenantId,
    payload,
  };
}

export function publishSupportRequestEvent(
  publisher: DomainEventPublisher | undefined,
  ctx: ServiceRequestContext,
  eventId: SupportDomainEventId,
  payload: SupportRequestEventPayload,
): DomainEventPublishResult {
  return publishDomainEventFailSoft(
    publisher,
    buildEnvelope(eventId, ctx, { ...payload }),
  );
}

export function publishSupportArticleEvent(
  publisher: DomainEventPublisher | undefined,
  ctx: ServiceRequestContext,
  payload: SupportArticleEventPayload,
): DomainEventPublishResult {
  return publishDomainEventFailSoft(
    publisher,
    buildEnvelope(SUPPORT_DOMAIN_EVENT_IDS.articleCreated, ctx, { ...payload }),
  );
}
