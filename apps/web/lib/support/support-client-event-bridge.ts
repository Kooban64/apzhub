import { getPlatformDomainEventBus } from "@/lib/platform-domain-event-bus";

import type { SupportArticle, SupportRequest } from "./types";

let envelopeCounter = 0;

function createEnvelopeId(): string {
  envelopeCounter += 1;
  return `b2222222-2222-4222-8222-${String(envelopeCounter).padStart(12, "0")}`;
}

/**
 * Mirrors Support Platform Service domain events onto the client ENF Event Bus
 * so Attention-path notifications appear in the Workbench shell (APZHUB-1.1-003).
 * Fail-soft — never breaks Support API client semantics.
 */
export function publishSupportRequestClientEvent(
  eventId:
    | "support.request.created"
    | "support.request.updated"
    | "support.request.assigned"
    | "support.request.closed",
  request: SupportRequest,
  correlationId?: string,
): void {
  const bus = getPlatformDomainEventBus();
  if (!bus) {
    return;
  }

  try {
    bus.publish({
      envelopeId: createEnvelopeId(),
      eventId,
      eventVersion: "1.0.0",
      category: "business",
      correlationId: correlationId ?? createEnvelopeId(),
      timestamp: new Date().toISOString(),
      publisher: "support-service",
      sourceService: "support-client",
      payload: {
        supportRequestId: request.id,
        title: request.title,
        status: request.status,
        priority: request.priority,
        assigneeId: request.assigneeId,
      },
    });
  } catch {
    // fail-soft
  }
}

export function publishSupportArticleClientEvent(
  article: SupportArticle,
  supportRequestId: string,
  correlationId?: string,
): void {
  const bus = getPlatformDomainEventBus();
  if (!bus) {
    return;
  }

  try {
    bus.publish({
      envelopeId: createEnvelopeId(),
      eventId: "support.article.created",
      eventVersion: "1.0.0",
      category: "business",
      correlationId: correlationId ?? createEnvelopeId(),
      timestamp: new Date().toISOString(),
      publisher: "support-service",
      sourceService: "support-client",
      payload: {
        articleId: article.id,
        supportRequestId,
        articleType: article.channel,
      },
    });
  } catch {
    // fail-soft
  }
}
