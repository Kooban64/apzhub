/**
 * QEP Requirements HTTP handler coverage (APZQEP-ENG-020B).
 */

import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { PlatformServiceGateway } from "@apzhub/platform-services";

import {
  assertQepHttpEnabled,
  handleCreateQepRequirement,
  handleListQepRequirements,
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
      requestId: "req-test-qep",
      correlationId: "corr-test-qep",
      timestamp: "2026-07-24T10:00:00.000Z",
    },
    session: buildMockSession() as unknown as PlatformApiRequestContext["session"],
    serviceContext: buildTestServiceContext(),
  };
}

describe("APZQEP-ENG-020B qep handlers", () => {
  afterEach(() => {
    resetPlatformApiGatewayBootstrap();
  });

  it("returns 503 when qep HTTP is disabled", async () => {
    setPlatformApiGatewayBootstrapForTests(
      createTestPlatformApiGatewayBootstrap({} as PlatformServiceGateway, {
        qepEnabled: false,
      }),
    );
    await expect(assertQepHttpEnabled()).rejects.toMatchObject({
      status: 503,
      body: { code: "QEP_SERVICE_UNAVAILABLE" },
    });
  });

  it("lists and creates requirements with standard envelopes", async () => {
    const gateway = {
      qep: {
        requirements: {
          list: vi.fn(async () => ({
            items: [{ id: "req_1", key: "REQ-001", title: "Login", status: "draft", priority: "high" }],
            total: 1,
            limit: 10,
            offset: 0,
          })),
          create: vi.fn(async () => ({
            id: "req_2",
            key: "REQ-002",
            title: "Login",
            status: "draft",
            priority: "high",
          })),
        },
      },
    } as unknown as PlatformServiceGateway;

    setPlatformApiGatewayBootstrapForTests(
      createTestPlatformApiGatewayBootstrap(gateway, { qepEnabled: true }),
    );
    const ctx = makeContext();

    const list = await handleListQepRequirements(
      makeRequest("/api/v1/qep/requirements?limit=10"),
      ctx,
    );
    expect(list.status).toBe(200);
    const listBody = await list.json();
    expect(Array.isArray(listBody.data)).toBe(true);
    expect(listBody.meta.requestId).toBe("req-test-qep");

    const created = await handleCreateQepRequirement(
      makeRequest("/api/v1/qep/requirements", {
        method: "POST",
        body: JSON.stringify({
          projectId: "project_1",
          key: "REQ-001",
          title: "Login",
          type: "functional",
          priority: "high",
        }),
      }),
      ctx,
    );
    expect(created.status).toBe(201);
  });
});
