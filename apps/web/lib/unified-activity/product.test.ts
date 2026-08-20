import { describe, expect, it } from "vitest";

import type { ActivityDocument } from "@apzhub/activity-timeline-framework/server";

import {
  activityProductLabel,
  deriveActivityProduct,
  resolveActivityDeepLink,
} from "./product";

function doc(partial: {
  activityTypeId: string;
  publisher?: string;
  payloadSummary?: Record<string, unknown>;
}): ActivityDocument {
  return {
    activityId: "a1",
    activityTypeId: partial.activityTypeId,
    sourceEventId: "e1",
    title: "Test",
    description: "Desc",
    timelineScope: "timeline.personal",
    category: "system",
    timestamp: new Date().toISOString(),
    actor: {},
    metadata: {
      templateRef: "t",
      sourceEnvelopeId: "env",
      correlationId: "c",
      publisher: partial.publisher ?? "platform-runtime",
      timelineScopes: ["timeline.personal"],
      severity: "info",
      payloadSummary: partial.payloadSummary,
    },
    diagnostics: {
      renderedAt: new Date().toISOString(),
      matchedActivityTypeId: partial.activityTypeId,
      eventPattern: partial.activityTypeId,
      typeStatus: "active",
      templateStatus: "ok",
      message: "ok",
    },
  };
}

describe("Unified Activity product mapping", () => {
  it("derives product from type prefix and payload", () => {
    expect(
      deriveActivityProduct(doc({ activityTypeId: "platform.lifecycle.started" })),
    ).toBe("platform");
    expect(
      deriveActivityProduct(
        doc({
          activityTypeId: "capability.x",
          payloadSummary: { productId: "support" },
        }),
      ),
    ).toBe("support");
  });

  it("resolves deep links without provider URLs", () => {
    expect(
      resolveActivityDeepLink(
        doc({
          activityTypeId: "support.ticket.updated",
          payloadSummary: { href: "https://zammad.example/1" },
        }),
      ),
    ).toBe("/workspace/support");
    expect(activityProductLabel("support")).toBe("Support");
  });
});
