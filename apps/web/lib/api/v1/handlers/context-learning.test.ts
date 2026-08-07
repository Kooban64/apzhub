import { beforeEach, describe, expect, it } from "vitest";

import {
  resetMemoryProductLearningStoreForTests,
  setProductLearningStoreForTests,
  getMemoryProductLearningStore,
} from "@apzhub/platform-services";

import {
  handleGetContextLearningSummary,
  handlePostContextLearningEvent,
} from "./context-learning";

function request(url: string, init?: RequestInit) {
  return new Request(url, init) as unknown as import("next/server").NextRequest;
}

const context = {
  serviceContext: {
    userId: "u1",
    tenantId: "tenant_1",
    correlationId: "c1",
    requestId: "r1",
    permissions: [],
  },
  session: { user: { id: "u1" } },
  tracing: {
    requestId: "r1",
    correlationId: "c1",
    timestamp: "2026-08-06T12:00:00.000Z",
  },
} as never;

describe("context learning handlers", () => {
  beforeEach(() => {
    resetMemoryProductLearningStoreForTests();
    setProductLearningStoreForTests(getMemoryProductLearningStore());
  });

  it("records anonymous events and summarizes for Product Board", async () => {
    const post = await handlePostContextLearningEvent(
      request("http://localhost/api/v1/context/learning/events", {
        method: "POST",
        body: JSON.stringify({
          eventName: "context.section_viewed",
          properties: { sectionId: "support", userId: "nope", title: "secret" },
        }),
      }),
      context,
    );
    expect(post.status).toBe(202);

    await handlePostContextLearningEvent(
      request("http://localhost/api/v1/context/learning/events", {
        method: "POST",
        body: JSON.stringify({
          eventName: "context.feedback",
          properties: { rating: "helpful" },
        }),
      }),
      context,
    );

    const summaryResponse = await handleGetContextLearningSummary(
      request("http://localhost/api/v1/context/learning/summary"),
      context,
    );
    expect(summaryResponse.status).toBe(200);
    const body = await summaryResponse.json();
    expect(body.data.sectionViews.support).toBe(1);
    expect(body.data.helpful).toBe(1);
    expect(body.data.featureKey).toBe("enterprise-context");
  });

  it("rejects unsupported event names", async () => {
    const response = await handlePostContextLearningEvent(
      request("http://localhost/api/v1/context/learning/events", {
        method: "POST",
        body: JSON.stringify({ eventName: "context.hacked" }),
      }),
      context,
    );
    expect(response.status).toBe(400);
  });
});
