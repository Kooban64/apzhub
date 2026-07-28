/**
 * Map Zammad IntegrationSourceEvent → Support catalogue domain events
 * (APZHUB-ENG-0003 / R12-SUP-01). Notify/index path only — no SoR write-back.
 */

import type { IntegrationSourceEvent } from "@apzhub/integration-sdk/events";
import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import {
  publishSupportArticleEvent,
  publishSupportRequestEvent,
  type SupportDomainEventId,
} from "./support-domain-events";
import type { DomainEventPublisher } from "./domain-event-publisher";

function mapEventType(eventType: string): SupportDomainEventId | "article" | undefined {
  switch (eventType) {
    case "support_request.created":
      return "support.request.created";
    case "support_request.updated":
    case "support_request.state_changed":
    case "support_request.priority_changed":
    case "support_request.reopened":
      return "support.request.updated";
    case "support_request.assigned":
    case "support_request.unassigned":
      return "support.request.assigned";
    case "support_request.closed":
      return "support.request.closed";
    case "article.created":
    case "attachment.metadata_recorded":
      return "article";
    default:
      return undefined;
  }
}

function resourceId(event: IntegrationSourceEvent): string {
  return event.safeSourceMetadata?.resourceId ?? event.sourceEventId ?? event.eventId;
}

/**
 * Publish Support domain events for accepted Zammad ingress events.
 * Fail-soft — never throws into the HTTP ingress path.
 */
export function fanOutSupportDomainEventsFromSourceEvents(
  publisher: DomainEventPublisher | undefined,
  events: readonly IntegrationSourceEvent[],
  tenantId: string,
  correlationId: string,
): void {
  if (!publisher || events.length === 0) {
    return;
  }

  const ctx: ServiceRequestContext = {
    correlationId,
    tenantId,
    userId: "system:zammad-webhook-ingress",
    permissions: [],
  };

  for (const event of events) {
    if (event.providerId !== "zammad") {
      continue;
    }
    const mapped = mapEventType(event.eventType);
    if (!mapped) {
      continue;
    }

    const id = resourceId(event);
    try {
      if (mapped === "article") {
        publishSupportArticleEvent(publisher, ctx, {
          articleId: id,
          supportRequestId:
            (typeof event.canonicalPayload?.supportTicketId === "string"
              ? event.canonicalPayload.supportTicketId
              : undefined) ?? id,
        });
        continue;
      }

      publishSupportRequestEvent(publisher, ctx, mapped, {
        supportRequestId: id,
        title:
          typeof event.canonicalPayload?.title === "string"
            ? event.canonicalPayload.title
            : undefined,
      });
    } catch {
      // Fail-soft
    }
  }
}
