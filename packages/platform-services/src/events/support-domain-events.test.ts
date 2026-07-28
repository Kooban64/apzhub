import { describe, expect, it, beforeEach } from "vitest";

import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import {
  resetDomainEventEnvelopeCounter,
  type DomainEventEnvelope,
  type DomainEventPublisher,
} from "./domain-event-publisher";
import {
  SUPPORT_DOMAIN_EVENT_IDS,
  publishSupportArticleEvent,
  publishSupportRequestEvent,
} from "./support-domain-events";

function ctx(): ServiceRequestContext {
  return {
    tenantId: "tenant-1",
    userId: "user-1",
    correlationId: "corr-1",
    permissions: [],
  };
}

describe("Support domain event publish (APZHUB-1.1-003)", () => {
  beforeEach(() => {
    resetDomainEventEnvelopeCounter();
  });

  it("publishes support.request.created fail-soft when no publisher", () => {
    const result = publishSupportRequestEvent(
      undefined,
      ctx(),
      SUPPORT_DOMAIN_EVENT_IDS.requestCreated,
      { supportRequestId: "sr-1", title: "Help" },
    );
    expect(result.ok).toBe(false);
    expect(result.errorMessage).toBe("NO_PUBLISHER");
  });

  it("publishes catalogue events through DomainEventPublisher", () => {
    const published: DomainEventEnvelope[] = [];
    const publisher: DomainEventPublisher = {
      publish(envelope) {
        published.push(envelope);
        return { ok: true, envelopeId: envelope.envelopeId };
      },
    };

    const created = publishSupportRequestEvent(
      publisher,
      ctx(),
      SUPPORT_DOMAIN_EVENT_IDS.requestCreated,
      { supportRequestId: "sr-1", title: "Help", status: "new", priority: "normal" },
    );
    expect(created.ok).toBe(true);
    expect(published[0]?.eventId).toBe("support.request.created");
    expect(published[0]?.publisher).toBe("support-service");
    expect(published[0]?.tenantId).toBe("tenant-1");

    publishSupportRequestEvent(
      publisher,
      ctx(),
      SUPPORT_DOMAIN_EVENT_IDS.requestAssigned,
      { supportRequestId: "sr-1", assigneeId: "agent-1" },
    );
    publishSupportRequestEvent(
      publisher,
      ctx(),
      SUPPORT_DOMAIN_EVENT_IDS.requestClosed,
      { supportRequestId: "sr-1" },
    );
    publishSupportArticleEvent(publisher, ctx(), {
      articleId: "art-1",
      supportRequestId: "sr-1",
      articleType: "note",
    });

    expect(published.map((e) => e.eventId)).toEqual([
      "support.request.created",
      "support.request.assigned",
      "support.request.closed",
      "support.article.created",
    ]);
  });

  it("swallows publisher exceptions (fail-soft)", () => {
    const publisher: DomainEventPublisher = {
      publish() {
        throw new Error("bus down");
      },
    };

    const result = publishSupportRequestEvent(
      publisher,
      ctx(),
      SUPPORT_DOMAIN_EVENT_IDS.requestUpdated,
      { supportRequestId: "sr-1" },
    );
    expect(result.ok).toBe(false);
    expect(result.errorMessage).toBe("bus down");
  });
});
