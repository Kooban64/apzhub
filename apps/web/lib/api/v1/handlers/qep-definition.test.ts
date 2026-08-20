import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { PlatformServiceGateway } from "@apzhub/platform-services";
import { createQepApplicationRegistry } from "@apzhub/qep-applications";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import {
  createTestPlatformApiGatewayBootstrap,
  resetPlatformApiGatewayBootstrap,
  setPlatformApiGatewayBootstrapForTests,
} from "../gateway/bootstrap";
import { buildMockSession, buildTestServiceContext } from "../testing/fixtures";
import { resetDefinitionServiceForTests } from "@/lib/qep/definition-runtime";

vi.mock("@/lib/commercial/require-product-access", () => ({
  requireProductAccess: () => undefined,
}));

vi.mock("@/lib/qep/application-runtime", async () => {
  const { createQepApplicationRegistry } = await import("@apzhub/qep-applications");
  const registry = createQepApplicationRegistry();
  return {
    getApplicationService: () => registry.service,
    __registry: registry,
  };
});

import {
  handleCreateCriterion,
  handleCreateStory,
  handleListStories,
} from "./qep-definition";

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

function makeContext(tenantId = "tenant_a"): PlatformApiRequestContext {
  return {
    tracing: {
      requestId: "req-test-def",
      correlationId: "corr-test-def",
      timestamp: "2026-08-19T10:00:00.000Z",
    },
    session: buildMockSession() as unknown as PlatformApiRequestContext["session"],
    serviceContext: buildTestServiceContext({
      tenantId,
      permissions: [
        "qep.requirements.view",
        "qep.requirements.create",
        "qep.requirements.edit",
      ],
    }),
  };
}

describe("APZQEP Phase 2 definition handlers", () => {
  beforeEach(() => {
    resetDefinitionServiceForTests();
    process.env.APZQEP_CORE_QE_PERSISTENCE_MODE = "memory";
  });

  afterEach(() => {
    resetPlatformApiGatewayBootstrap();
    resetDefinitionServiceForTests();
  });

  it("creates a story for the requirement application and denies other tenants", async () => {
    const appRuntime = await import("@/lib/qep/application-runtime");
    const apps = (
      appRuntime as unknown as {
        getApplicationService: () => ReturnType<
          typeof createQepApplicationRegistry
        >["service"];
      }
    ).getApplicationService();
    const app = await apps.create({
      tenantId: "tenant_a",
      name: "Hub",
      key: "HUB",
      actorId: "user_1",
    });

    const gateway = {
      qep: {
        requirements: {
          get: vi.fn(async () => ({
            id: "req-1",
            tenantId: "tenant_a",
            projectId: app.id,
            key: "REQ-001",
            title: "Login",
          })),
        },
      },
    } as unknown as PlatformServiceGateway;
    setPlatformApiGatewayBootstrapForTests(
      createTestPlatformApiGatewayBootstrap(gateway, { qepEnabled: true }),
    );

    const created = await handleCreateStory(
      makeRequest("/api/v1/qep/user-stories", {
        method: "POST",
        body: JSON.stringify({
          applicationId: app.id,
          requirementId: "req-1",
          title: "User login",
        }),
      }),
      makeContext("tenant_a"),
    );
    expect(created.status).toBe(201);
    const body = await created.json();
    expect(body.data.story.applicationId).toBe(app.id);
    expect(body.data.story.requirementId).toBe("req-1");

    const denied = await handleListStories(
      makeRequest("/api/v1/qep/user-stories?requirementId=req-1"),
      makeContext("tenant_b"),
    );
    const deniedBody = await denied.json();
    expect(deniedBody.data).toEqual([]);
  });

  it("creates an AC under a requirement without inventing a story", async () => {
    const appRuntime = await import("@/lib/qep/application-runtime");
    const apps = (
      appRuntime as unknown as {
        getApplicationService: () => ReturnType<
          typeof createQepApplicationRegistry
        >["service"];
      }
    ).getApplicationService();
    const app = await apps.create({
      tenantId: "tenant_a",
      name: "Hub",
      key: "HUB2",
      actorId: "user_1",
    });
    const gateway = {
      qep: {
        requirements: {
          get: vi.fn(async () => ({
            id: "req-1",
            tenantId: "tenant_a",
            projectId: app.id,
            key: "REQ-001",
            title: "Login",
          })),
        },
      },
    } as unknown as PlatformServiceGateway;
    setPlatformApiGatewayBootstrapForTests(
      createTestPlatformApiGatewayBootstrap(gateway, { qepEnabled: true }),
    );
    const created = await handleCreateCriterion(
      makeRequest("/api/v1/qep/acceptance-criteria", {
        method: "POST",
        body: JSON.stringify({
          applicationId: app.id,
          requirementId: "req-1",
          text: "User must receive reset email",
        }),
      }),
      makeContext("tenant_a"),
    );
    expect(created.status).toBe(201);
    const body = await created.json();
    expect(body.data.criterion.userStoryId).toBeUndefined();
    expect(body.data.criterion.text).toBe("User must receive reset email");
  });
});
