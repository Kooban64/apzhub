/**
 * QEP Evidence HTTP handler coverage (APZQEP-ENG-110F).
 */

import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { PlatformServiceGateway } from "@apzhub/platform-services";

import {
  handleCaptureQepEvidence,
  handleGetQepEvidence,
  handleListQepEvidence,
  handlePerformQepEvidenceAction,
} from "./qep-evidence";
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
      requestId: "req-test-qep-evidence",
      correlationId: "corr-test-qep-evidence",
      timestamp: "2026-07-30T10:00:00.000Z",
    },
    session: buildMockSession() as unknown as PlatformApiRequestContext["session"],
    serviceContext: buildTestServiceContext(),
  };
}

function routeContext(params: Record<string, string>) {
  return { params: Promise.resolve(params) };
}

const SAMPLE_EVIDENCE = {
  id: "ev_1",
  tenantId: "tenant_1",
  projectId: "proj_1",
  status: "captured",
  revision: 1,
  sealed: false,
  legalHold: false,
  retentionClass: "standard",
  tags: [],
  version: 1,
  ownerId: "user_1",
  createdAt: "2026-07-30T10:00:00.000Z",
  updatedAt: "2026-07-30T10:00:00.000Z",
  availableActions: ["validateEvidence"],
};

function bootstrap(overrides: Record<string, unknown>) {
  const gateway = {
    qep: {
      evidence: overrides,
    },
  } as unknown as PlatformServiceGateway;
  setPlatformApiGatewayBootstrapForTests(
    createTestPlatformApiGatewayBootstrap(gateway, { qepEnabled: true }),
  );
  return gateway;
}

describe("APZQEP-ENG-110F qep evidence handlers", () => {
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
      handleListQepEvidence(makeRequest("/api/v1/qep/evidence"), makeContext()),
    ).rejects.toMatchObject({
      status: 503,
      body: { code: "QEP_SERVICE_UNAVAILABLE" },
    });
  });

  it("lists and captures evidence with standard envelopes", async () => {
    const gateway = bootstrap({
      list: vi.fn(async () => ({
        items: [SAMPLE_EVIDENCE],
        total: 1,
        limit: 25,
        offset: 0,
      })),
      capture: vi.fn(async () => SAMPLE_EVIDENCE),
      get: vi.fn(async () => SAMPLE_EVIDENCE),
      performAction: vi.fn(async () => ({
        ...SAMPLE_EVIDENCE,
        status: "validated",
        revision: 2,
      })),
    });
    const ctx = makeContext();

    const list = await handleListQepEvidence(
      makeRequest("/api/v1/qep/evidence?limit=10"),
      ctx,
    );
    expect(list.status).toBe(200);
    const listBody = await list.json();
    expect(Array.isArray(listBody.data)).toBe(true);
    expect(listBody.data).toHaveLength(1);

    const created = await handleCaptureQepEvidence(
      makeRequest("/api/v1/qep/evidence", {
        method: "POST",
        body: JSON.stringify({
          projectId: "proj_1",
          mediaType: "text/plain",
          contentBase64: "aGVsbG8=",
          contentHash: "hash_1",
          sourceKind: "manual_upload",
        }),
      }),
      ctx,
    );
    expect(created.status).toBe(201);
    expect(gateway.qep.evidence.capture).toHaveBeenCalled();

    const detail = await handleGetQepEvidence(
      makeRequest("/api/v1/qep/evidence/ev_1"),
      ctx,
      routeContext({ evidenceId: "ev_1" }),
    );
    expect(detail.status).toBe(200);

    const action = await handlePerformQepEvidenceAction(
      makeRequest("/api/v1/qep/evidence/ev_1/actions/validate", {
        method: "POST",
        body: JSON.stringify({ expectedRevision: 1 }),
      }),
      ctx,
      routeContext({ evidenceId: "ev_1", action: "validate" }),
    );
    expect(action.status).toBe(200);
    expect(gateway.qep.evidence.performAction).toHaveBeenCalled();
  });
});
