/**
 * QEP Test Plan HTTP handler coverage (APZQEP-ENG-060B Part 2).
 */

import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { PlatformServiceGateway } from "@apzhub/platform-services";

import {
  handleAddQepTestPlanItem,
  handleApproveQepTestPlan,
  handleCreateQepTestPlan,
  handleGetQepTestPlan,
  handleGetQepTestPlanHistory,
  handleListQepTestPlans,
  handleSubmitQepTestPlanReview,
  handleUpdateQepTestPlanContent,
} from "./qep-test-plan";
import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import {
  createTestPlatformApiGatewayBootstrap,
  resetPlatformApiGatewayBootstrap,
  setPlatformApiGatewayBootstrapForTests,
} from "../gateway/bootstrap";
import { buildMockSession, buildTestServiceContext } from "../testing/fixtures";

function makeRequest(url: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  if (!headers.has("content-type") && init?.body) {
    headers.set("content-type", "application/json");
  }
  return new NextRequest(new URL(url, "http://localhost"), {
    ...init,
    headers,
  } as ConstructorParameters<typeof NextRequest>[1]);
}

function makeContext(): PlatformApiRequestContext {
  return {
    tracing: {
      requestId: "req-test-qep-plans",
      correlationId: "corr-test-qep-plans",
      timestamp: "2026-07-27T10:00:00.000Z",
    },
    session: buildMockSession() as unknown as PlatformApiRequestContext["session"],
    serviceContext: buildTestServiceContext(),
  };
}

function routeContext(params: Record<string, string>) {
  return { params: Promise.resolve(params) };
}

const SAMPLE_PLAN = {
  id: "tpl_1",
  tenantId: "tenant_1",
  number: "TP-001",
  title: "Release 1 regression plan",
  status: "draft",
  revision: 1,
  availableActions: ["updateContent", "submitForReview"],
};

function bootstrap(overrides: Record<string, unknown>) {
  const gateway = {
    qep: {
      plans: overrides,
    },
  } as unknown as PlatformServiceGateway;
  setPlatformApiGatewayBootstrapForTests(
    createTestPlatformApiGatewayBootstrap(gateway, { qepEnabled: true }),
  );
  return gateway;
}

describe("APZQEP-ENG-060B qep test plan handlers", () => {
  afterEach(() => {
    resetPlatformApiGatewayBootstrap();
  });

  it("throws a 503 error when qep HTTP is disabled", async () => {
    setPlatformApiGatewayBootstrapForTests(
      createTestPlatformApiGatewayBootstrap({} as PlatformServiceGateway, {
        qepEnabled: false,
      }),
    );
    await expect(
      handleListQepTestPlans(makeRequest("/api/v1/qep/plans"), makeContext()),
    ).rejects.toMatchObject({
      status: 503,
      body: { code: "QEP_SERVICE_UNAVAILABLE" },
    });
  });

  it("lists and creates test plans with standard envelopes", async () => {
    const gateway = bootstrap({
      list: vi.fn(async () => ({
        items: [SAMPLE_PLAN],
        total: 1,
        limit: 10,
        offset: 0,
      })),
      createPlan: vi.fn(async () => SAMPLE_PLAN),
    });
    const ctx = makeContext();

    const list = await handleListQepTestPlans(
      makeRequest("/api/v1/qep/plans?limit=10"),
      ctx,
    );
    expect(list.status).toBe(200);
    const listBody = await list.json();
    expect(Array.isArray(listBody.data)).toBe(true);
    expect(listBody.data).toHaveLength(1);
    expect(listBody.page.total).toBe(1);
    expect(listBody.meta.requestId).toBe("req-test-qep-plans");

    const created = await handleCreateQepTestPlan(
      makeRequest("/api/v1/qep/plans", {
        method: "POST",
        body: JSON.stringify({
          title: "Release 1 regression plan",
          objective: "Validate release scope",
          scope: { class: "release", label: "Release 1" },
        }),
      }),
      ctx,
    );
    expect(created.status).toBe(201);
    expect(gateway.qep.plans.createPlan).toHaveBeenCalledOnce();
  });

  it("gets a test plan by id and returns 404 when missing", async () => {
    bootstrap({
      get: vi.fn(async (_ctx: unknown, id: string) =>
        id === "tpl_1" ? SAMPLE_PLAN : null,
      ),
    });
    const ctx = makeContext();

    const found = await handleGetQepTestPlan(
      makeRequest("/api/v1/qep/plans/tpl_1"),
      ctx,
      routeContext({ planId: "tpl_1" }),
    );
    expect(found.status).toBe(200);

    await expect(
      handleGetQepTestPlan(
        makeRequest("/api/v1/qep/plans/tpl_missing"),
        ctx,
        routeContext({ planId: "tpl_missing" }),
      ),
    ).rejects.toMatchObject({ status: 404, body: { code: "NOT_FOUND" } });
  });

  it("updates plan content with expectedRevision", async () => {
    const gateway = bootstrap({
      updateContent: vi.fn(async () => ({
        ...SAMPLE_PLAN,
        title: "Updated title",
        revision: 2,
      })),
    });
    const ctx = makeContext();

    const updated = await handleUpdateQepTestPlanContent(
      makeRequest("/api/v1/qep/plans/tpl_1", {
        method: "PATCH",
        body: JSON.stringify({ title: "Updated title", expectedRevision: 1 }),
      }),
      ctx,
      routeContext({ planId: "tpl_1" }),
    );
    expect(updated.status).toBe(200);
    expect(gateway.qep.plans.updateContent).toHaveBeenCalledWith(
      ctx.serviceContext,
      "tpl_1",
      expect.objectContaining({ title: "Updated title", expectedRevision: 1 }),
    );
  });

  it("adds a plan item, submits for review, and approves through the lifecycle", async () => {
    const gateway = bootstrap({
      addItem: vi.fn(async () => ({ ...SAMPLE_PLAN, revision: 2 })),
      submitForReview: vi.fn(async () => ({
        ...SAMPLE_PLAN,
        status: "review",
        revision: 3,
      })),
      approve: vi.fn(async () => ({ ...SAMPLE_PLAN, status: "approved", revision: 4 })),
      listHistory: vi.fn(async () => [
        {
          sequence: 1,
          at: "2026-07-27T10:00:00.000Z",
          actorId: "user_1",
          action: "created",
          summary: "Created",
        },
      ]),
    });
    const ctx = makeContext();

    const withItem = await handleAddQepTestPlanItem(
      makeRequest("/api/v1/qep/plans/tpl_1/items", {
        method: "POST",
        body: JSON.stringify({ specificationId: "tsp_1", expectedRevision: 1 }),
      }),
      ctx,
      routeContext({ planId: "tpl_1" }),
    );
    expect(withItem.status).toBe(201);

    const submitted = await handleSubmitQepTestPlanReview(
      makeRequest("/api/v1/qep/plans/tpl_1/submit", {
        method: "POST",
        body: JSON.stringify({ expectedRevision: 2 }),
      }),
      ctx,
      routeContext({ planId: "tpl_1" }),
    );
    expect(submitted.status).toBe(200);

    const approved = await handleApproveQepTestPlan(
      makeRequest("/api/v1/qep/plans/tpl_1/approve", {
        method: "POST",
        body: JSON.stringify({ allowSelfApproval: true, expectedRevision: 3 }),
      }),
      ctx,
      routeContext({ planId: "tpl_1" }),
    );
    expect(approved.status).toBe(200);
    const approvedBody = await approved.json();
    expect(approvedBody.data.status).toBe("approved");

    const history = await handleGetQepTestPlanHistory(
      makeRequest("/api/v1/qep/plans/tpl_1/history"),
      ctx,
      routeContext({ planId: "tpl_1" }),
    );
    expect(history.status).toBe(200);
    const historyBody = await history.json();
    expect(historyBody.data).toHaveLength(1);

    expect(gateway.qep.plans.addItem).toHaveBeenCalledOnce();
    expect(gateway.qep.plans.submitForReview).toHaveBeenCalledOnce();
    expect(gateway.qep.plans.approve).toHaveBeenCalledOnce();
  });
});
