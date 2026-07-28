/**
 * QEP Requirement Baselines HTTP handler coverage (APZQEP-ENG-020E Part 3).
 */

import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { PlatformServiceGateway } from "@apzhub/platform-services";
import { PlatformServiceError } from "@apzhub/platform-service-contracts";

import {
  handleAddQepBaselineItem,
  handleArchiveQepBaseline,
  handleCompareQepBaselines,
  handleCreateQepBaseline,
  handleGetQepBaseline,
  handleGetQepRequirementBaselineHistory,
  handleListQepBaselineItems,
  handleListQepBaselines,
  handleLockQepBaseline,
  handleRemoveQepBaselineItem,
  handleUpdateQepBaselineDraft,
  handleVerifyQepBaselineIntegrity,
} from "./qep";
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
      requestId: "req-test-qep-baselines",
      correlationId: "corr-test-qep-baselines",
      timestamp: "2026-07-25T10:00:00.000Z",
    },
    session: buildMockSession() as unknown as PlatformApiRequestContext["session"],
    serviceContext: buildTestServiceContext(),
  };
}

function routeContext(params: Record<string, string>) {
  return { params: Promise.resolve(params) };
}

const SAMPLE_BASELINE = {
  id: "rbl_1",
  tenantId: "tenant_1",
  number: 1,
  name: "Release 1.0",
  status: "draft",
  itemCount: 0,
  createdAt: "2026-07-25T10:00:00.000Z",
  createdBy: "user_1",
  updatedAt: "2026-07-25T10:00:00.000Z",
  updatedBy: "user_1",
  correlationId: "corr_1",
  availableActions: ["edit", "addItem", "removeItem", "lock", "compare"],
};

describe("APZQEP-ENG-020E requirement baseline handlers", () => {
  afterEach(() => {
    resetPlatformApiGatewayBootstrap();
  });

  function bootstrap(overrides: Record<string, unknown>) {
    const gateway = {
      qep: {
        requirements: overrides,
      },
    } as unknown as PlatformServiceGateway;
    setPlatformApiGatewayBootstrapForTests(
      createTestPlatformApiGatewayBootstrap(gateway, { qepEnabled: true }),
    );
    return gateway;
  }

  it("lists and creates baselines with standard envelopes", async () => {
    bootstrap({
      listBaselines: vi.fn(async () => ({
        items: [SAMPLE_BASELINE],
        total: 1,
        limit: 10,
        offset: 0,
      })),
      createBaseline: vi.fn(async () => SAMPLE_BASELINE),
    });
    const ctx = makeContext();

    const list = await handleListQepBaselines(
      makeRequest("/api/v1/qep/requirements/baselines?limit=10"),
      ctx,
    );
    expect(list.status).toBe(200);
    const listBody = await list.json();
    expect(Array.isArray(listBody.data)).toBe(true);
    expect(listBody.data).toHaveLength(1);

    const created = await handleCreateQepBaseline(
      makeRequest("/api/v1/qep/requirements/baselines", {
        method: "POST",
        body: JSON.stringify({ name: "Release 1.0" }),
      }),
      ctx,
    );
    expect(created.status).toBe(201);
  });

  it("reads, updates a draft, and returns 404 for a missing baseline", async () => {
    const getBaseline = vi.fn(
      async (): Promise<typeof SAMPLE_BASELINE | null> => SAMPLE_BASELINE,
    );
    bootstrap({
      getBaseline,
      updateDraftBaseline: vi.fn(async () => ({ ...SAMPLE_BASELINE, name: "Renamed" })),
    });
    const ctx = makeContext();

    const found = await handleGetQepBaseline(
      makeRequest("/api/v1/qep/requirements/baselines/rbl_1"),
      ctx,
      routeContext({ baselineId: "rbl_1" }),
    );
    expect(found.status).toBe(200);

    const updated = await handleUpdateQepBaselineDraft(
      makeRequest("/api/v1/qep/requirements/baselines/rbl_1", {
        method: "PATCH",
        body: JSON.stringify({ name: "Renamed" }),
      }),
      ctx,
      routeContext({ baselineId: "rbl_1" }),
    );
    expect(updated.status).toBe(200);

    getBaseline.mockResolvedValueOnce(null);
    const notFound = handleGetQepBaseline(
      makeRequest("/api/v1/qep/requirements/baselines/rbl_missing"),
      ctx,
      routeContext({ baselineId: "rbl_missing" }),
    );
    await expect(notFound).rejects.toMatchObject({ status: 404 });
  });

  it("adds and removes membership items", async () => {
    bootstrap({
      addBaselineItem: vi.fn(async () => ({ ...SAMPLE_BASELINE, itemCount: 1 })),
      removeBaselineItem: vi.fn(async () => SAMPLE_BASELINE),
      listBaselineItems: vi.fn(async () => [
        {
          requirementId: "req_1",
          contentVersionId: "rcv_1",
          contentVersionNumber: 1,
          includedAt: "2026-07-25T10:00:00.000Z",
          includedBy: "user_1",
        },
      ]),
    });
    const ctx = makeContext();

    const added = await handleAddQepBaselineItem(
      makeRequest("/api/v1/qep/requirements/baselines/rbl_1/items", {
        method: "POST",
        body: JSON.stringify({ contentVersionId: "rcv_1" }),
      }),
      ctx,
      routeContext({ baselineId: "rbl_1" }),
    );
    expect(added.status).toBe(201);

    const items = await handleListQepBaselineItems(
      makeRequest("/api/v1/qep/requirements/baselines/rbl_1/items"),
      ctx,
      routeContext({ baselineId: "rbl_1" }),
    );
    expect(items.status).toBe(200);

    const removed = await handleRemoveQepBaselineItem(
      makeRequest("/api/v1/qep/requirements/baselines/rbl_1/items/rcv_1", {
        method: "DELETE",
      }),
      ctx,
      routeContext({ baselineId: "rbl_1", contentVersionId: "rcv_1" }),
    );
    expect(removed.status).toBe(200);
  });

  it("locks, archives, and verifies integrity", async () => {
    bootstrap({
      lockBaseline: vi.fn(async () => ({
        ...SAMPLE_BASELINE,
        status: "locked",
        integrityFingerprint: "abc123",
        integrityVerificationStatus: "verified",
        availableActions: ["archive", "verifyIntegrity", "compare"],
      })),
      archiveBaseline: vi.fn(async () => ({ ...SAMPLE_BASELINE, status: "archived" })),
      verifyBaselineIntegrity: vi.fn(async () => ({
        ...SAMPLE_BASELINE,
        status: "locked",
        integrityVerificationStatus: "verified",
      })),
    });
    const ctx = makeContext();

    const locked = await handleLockQepBaseline(
      makeRequest("/api/v1/qep/requirements/baselines/rbl_1/lock", { method: "POST" }),
      ctx,
      routeContext({ baselineId: "rbl_1" }),
    );
    expect(locked.status).toBe(200);
    const lockedBody = await locked.json();
    expect(lockedBody.data.integrityVerificationStatus).toBe("verified");

    const archived = await handleArchiveQepBaseline(
      makeRequest("/api/v1/qep/requirements/baselines/rbl_1/archive", {
        method: "POST",
      }),
      ctx,
      routeContext({ baselineId: "rbl_1" }),
    );
    expect(archived.status).toBe(200);

    const verified = await handleVerifyQepBaselineIntegrity(
      makeRequest("/api/v1/qep/requirements/baselines/rbl_1/verify", {
        method: "POST",
      }),
      ctx,
      routeContext({ baselineId: "rbl_1" }),
    );
    expect(verified.status).toBe(200);
  });

  it("maps a forbidden integrity verification to a 403 response", async () => {
    bootstrap({
      verifyBaselineIntegrity: vi.fn(async () => {
        throw new PlatformServiceError({
          category: "authorization",
          code: "FORBIDDEN",
          message: "Missing permission",
          correlationId: "corr-test-qep-baselines",
          retryable: false,
        });
      }),
    });
    const ctx = makeContext();

    await expect(
      handleVerifyQepBaselineIntegrity(
        makeRequest("/api/v1/qep/requirements/baselines/rbl_1/verify", {
          method: "POST",
        }),
        ctx,
        routeContext({ baselineId: "rbl_1" }),
      ),
    ).rejects.toMatchObject({ status: 403 });
  });

  it("maps a failed integrity verification to a mapped error, not a 500", async () => {
    bootstrap({
      verifyBaselineIntegrity: vi.fn(async () => {
        throw new PlatformServiceError({
          category: "validation",
          code: "VALIDATION_FAILED",
          message: "Integrity fingerprint mismatch",
          correlationId: "corr-test-qep-baselines",
          retryable: false,
        });
      }),
    });
    const ctx = makeContext();

    await expect(
      handleVerifyQepBaselineIntegrity(
        makeRequest("/api/v1/qep/requirements/baselines/rbl_1/verify", {
          method: "POST",
        }),
        ctx,
        routeContext({ baselineId: "rbl_1" }),
      ),
    ).rejects.toMatchObject({ status: 400 });
  });

  it("compares baselines and returns requirement baseline history", async () => {
    bootstrap({
      compareBaselines: vi.fn(async () => ({
        baseBaselineId: "rbl_1",
        targetBaselineId: "rbl_2",
        added: [],
        removed: [],
        unchanged: [],
        versionChanged: [],
        summary: {
          addedCount: 0,
          removedCount: 0,
          unchangedCount: 0,
          versionChangedCount: 0,
        },
      })),
      requirementBaselineHistory: vi.fn(async () => [SAMPLE_BASELINE]),
    });
    const ctx = makeContext();

    const compared = await handleCompareQepBaselines(
      makeRequest("/api/v1/qep/requirements/baselines/compare", {
        method: "POST",
        body: JSON.stringify({ baseBaselineId: "rbl_1", targetBaselineId: "rbl_2" }),
      }),
      ctx,
    );
    expect(compared.status).toBe(200);

    const history = await handleGetQepRequirementBaselineHistory(
      makeRequest("/api/v1/qep/requirements/req_1/baselines"),
      ctx,
      routeContext({ requirementId: "req_1" }),
    );
    expect(history.status).toBe(200);
  });
});
