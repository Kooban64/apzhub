/**
 * Platform Identity Administration HTTP handler tests (APZIDENTITY-003).
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { NextRequest } from "next/server";
import { afterEach, describe, expect, it } from "vitest";

import "./identity.coverage.test";

import {
  assertIdentityHttpEnabled,
  buildIdentityManagementPlaneDto,
  handleCreateIdentityUser,
  handleCreateIdentityMembership,
  handleCreateIdentityServiceAssignment,
  handleGetIdentityCapabilities,
  handleGetIdentityHealth,
  handleGetIdentityManagementCapabilities,
  handleGetIdentityReadiness,
  handleGetIdentityUser,
  handleListIdentityUsers,
  handleUpdateIdentityUser,
} from "./identity";
import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import {
  createTestPlatformApiGatewayBootstrap,
  resetPlatformApiGatewayBootstrap,
  setPlatformApiGatewayBootstrapForTests,
} from "../gateway/bootstrap";
import {
  buildMockSession,
  buildTestServiceContext,
  createMockPlatformGateway,
  installMockGateway,
} from "../testing/fixtures";
import { loadPlatformOpenApiSpecObject } from "../openapi";

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
      requestId: "req-test-identity",
      correlationId: "corr-test-identity",
      timestamp: "2026-07-16T12:00:00.000Z",
    },
    session: buildMockSession() as unknown as PlatformApiRequestContext["session"],
    serviceContext: buildTestServiceContext(),
  };
}

function walkRoutes(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walkRoutes(full, out);
    else if (entry === "route.ts") out.push(full);
  }
  return out;
}

describe("APZIDENTITY-003 identity handlers", () => {
  afterEach(() => {
    resetPlatformApiGatewayBootstrap();
  });

  it("returns 503 when identity HTTP is disabled", async () => {
    setPlatformApiGatewayBootstrapForTests(
      createTestPlatformApiGatewayBootstrap(createMockPlatformGateway(), {
        identityEnabled: false,
      }),
    );
    await expect(assertIdentityHttpEnabled()).rejects.toMatchObject({
      status: 503,
      body: { code: "IDENTITY_SERVICE_UNAVAILABLE" },
    });
  });

  it("lists, creates, gets, updates users with standard envelopes", async () => {
    installMockGateway();
    const ctx = makeContext();
    const list = await handleListIdentityUsers(
      makeRequest("/api/v1/identity/users"),
      ctx,
    );
    const listBody = await list.json();
    expect(listBody.data).toHaveLength(1);
    expect(listBody.page).toBeDefined();
    expect(listBody.meta.correlationId).toBe("corr-test-identity");

    const created = await handleCreateIdentityUser(
      makeRequest("/api/v1/identity/users", {
        method: "POST",
        body: JSON.stringify({ displayName: "New Person" }),
      }),
      ctx,
    );
    expect((await created.json()).data.displayName).toBe("New Person");

    const got = await handleGetIdentityUser(
      makeRequest("/api/v1/identity/users/user_1"),
      ctx,
      { params: Promise.resolve({ userId: "user_1" }) },
    );
    expect((await got.json()).data.id).toBe("user_1");

    const updated = await handleUpdateIdentityUser(
      makeRequest("/api/v1/identity/users/user_1", {
        method: "PATCH",
        body: JSON.stringify({ displayName: "Updated Person" }),
      }),
      ctx,
      { params: Promise.resolve({ userId: "user_1" }) },
    );
    expect((await updated.json()).data.displayName).toBe("Updated Person");
  });

  it("creates service assignments targeting the workflow-engine capability", async () => {
    installMockGateway();
    const ctx = makeContext();
    const created = await handleCreateIdentityServiceAssignment(
      makeRequest("/api/v1/identity/service-assignments", {
        method: "POST",
        body: JSON.stringify({
          subjectKind: "user",
          subjectId: "user_1",
          serviceCapability: "workflow-engine",
        }),
      }),
      ctx,
    );
    const body = await created.json();
    expect(body.data.serviceCapability).toBe("workflow-engine");
    expect(body.data.subjectId).toBe("user_1");
  });

  it("creates memberships with standard envelopes", async () => {
    installMockGateway();
    const ctx = makeContext();
    const created = await handleCreateIdentityMembership(
      makeRequest("/api/v1/identity/memberships", {
        method: "POST",
        body: JSON.stringify({
          userId: "user_1",
          kind: "group",
          targetId: "group_1",
        }),
      }),
      ctx,
    );
    const body = await created.json();
    expect(body.data.userId).toBe("user_1");
    expect(body.data.kind).toBe("group");
    expect(body.data.targetId).toBe("group_1");
  });

  it("reports diagnostics health/readiness/capabilities/management-capabilities", async () => {
    installMockGateway();
    const ctx = makeContext();

    const health = await handleGetIdentityHealth(
      makeRequest("/api/v1/identity/health"),
      ctx,
    );
    const healthBody = await health.json();
    expect(healthBody.data.httpEnabled).toBe(true);
    expect(healthBody.data.workbenchEnabled).toBe(false);
    expect(healthBody.data.authenticationManaged).toBe(false);

    const readiness = await handleGetIdentityReadiness(
      makeRequest("/api/v1/identity/readiness"),
      ctx,
    );
    expect((await readiness.json()).data.httpEnabled).toBe(true);

    const capabilities = await handleGetIdentityCapabilities(
      makeRequest("/api/v1/identity/capabilities"),
      ctx,
    );
    const capabilitiesBody = await capabilities.json();
    expect(capabilitiesBody.data.http).toBe(true);
    expect(capabilitiesBody.data.workbench).toBe(false);
    expect(capabilitiesBody.data.authentication).toBe(false);

    const caps = await handleGetIdentityManagementCapabilities(
      makeRequest("/api/v1/identity/management-capabilities"),
      ctx,
    );
    const capsBody = await caps.json();
    expect(capsBody.data.httpEnabled).toBe(true);
    expect(capsBody.data.workbenchEnabled).toBe(false);
    expect(capsBody.data.authenticationManaged).toBe(false);
    expect(capsBody.data.provisioningEnabled).toBe(false);
    expect(capsBody.data.directorySyncEnabled).toBe(false);
    expect(capsBody.data.gatewayCapabilities.http).toBe(true);
  });

  it("builds management plane DTO with excluded planes false", () => {
    const dto = buildIdentityManagementPlaneDto({
      identityEnabled: true,
      persistenceMode: "memory",
    });
    expect(dto.httpEnabled).toBe(true);
    expect(dto.workbenchEnabled).toBe(false);
    expect(dto.authenticationManaged).toBe(false);
    expect(dto.provisioningEnabled).toBe(false);
    expect(dto.directorySyncEnabled).toBe(false);
    expect(dto.capabilities.workbench).toBe(false);
    expect(dto.capabilities.authentication).toBe(false);
    expect(dto.capabilities.http).toBe(true);
  });

  it("ships only authenticated identity route entrypoints without forbidden segments", () => {
    const routes = walkRoutes(join(process.cwd(), "apps/web/app/api/v1/identity"));
    expect(routes.length).toBeGreaterThanOrEqual(36);
    for (const route of routes) {
      const content = readFileSync(route, "utf8");
      expect(content).toContain("withPlatformApiAuth");
      expect(content).toContain('runtime = "nodejs"');
    }
    const joined = routes.join("\n");
    for (const bad of [
      "/login/",
      "/password/",
      "/oauth/",
      "/scim/",
      "/workbench/",
      "/sessions/",
    ]) {
      expect(joined.includes(bad)).toBe(false);
    }
  });

  it("documents identity in OpenAPI without forbidden auth surfaces", () => {
    const spec = loadPlatformOpenApiSpecObject() as {
      info?: { version?: string };
      paths?: Record<string, unknown>;
      tags?: Array<{ name?: string }>;
    };
    expect(["1.9.0", "1.10.0"]).toContain(spec.info?.version);

    const expectedPaths = [
      "/identity/users",
      "/identity/users/{userId}",
      "/identity/groups",
      "/identity/groups/{groupId}",
      "/identity/roles",
      "/identity/roles/{roleId}",
      "/identity/organisations",
      "/identity/organisations/{organisationId}",
      "/identity/tenants",
      "/identity/tenants/{tenantId}",
      "/identity/departments",
      "/identity/departments/{departmentId}",
      "/identity/positions",
      "/identity/positions/{positionId}",
      "/identity/memberships",
      "/identity/memberships/{membershipId}",
      "/identity/service-assignments",
      "/identity/service-assignments/{assignmentId}",
      "/identity/invitations",
      "/identity/invitations/{invitationId}",
      "/identity/activation",
      "/identity/activation/{activationId}",
      "/identity/deactivation",
      "/identity/deactivation/{deactivationId}",
      "/identity/policies",
      "/identity/policies/{policyId}",
      "/identity/audit",
      "/identity/audit/{auditId}",
      "/identity/history",
      "/identity/history/{historyId}",
      "/identity/references",
      "/identity/references/{referenceId}",
      "/identity/health",
      "/identity/readiness",
      "/identity/capabilities",
      "/identity/management-capabilities",
    ];
    for (const path of expectedPaths) {
      expect(spec.paths?.[path], path).toBeDefined();
    }

    for (const bad of [
      "/identity/login",
      "/identity/password",
      "/identity/oauth",
      "/identity/scim",
      "/identity/workbench",
    ]) {
      expect(spec.paths?.[bad], bad).toBeUndefined();
    }

    const tags = (spec.tags ?? []).map((t) => t.name);
    expect(tags).toContain("Platform Identity Administration");
  });
});
