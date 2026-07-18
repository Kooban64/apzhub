/**
 * APZIDENTITY-003 — full identity handler surface coverage.
 */
import { NextRequest } from "next/server";
import { afterEach, describe, expect, it } from "vitest";

import * as handlers from "./identity";
import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { resetPlatformApiGatewayBootstrap } from "../gateway/bootstrap";
import {
  buildMockSession,
  buildTestServiceContext,
  installMockGateway,
} from "../testing/fixtures";

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
      requestId: "req-identity-cov",
      correlationId: "corr-identity-cov",
      timestamp: "2026-07-16T12:00:00.000Z",
    },
    session: buildMockSession() as unknown as PlatformApiRequestContext["session"],
    serviceContext: buildTestServiceContext(),
  };
}

const p = (params: Record<string, string>) => ({
  params: Promise.resolve(params),
});

describe("APZIDENTITY-003 identity handler full surface", () => {
  afterEach(() => {
    resetPlatformApiGatewayBootstrap();
  });

  it("exercises every facet handler", async () => {
    installMockGateway();
    const ctx = makeContext();
    const get = (path: string) => makeRequest(path);
    const post = (path: string, body: unknown) =>
      makeRequest(path, { method: "POST", body: JSON.stringify(body) });
    const patch = (path: string, body: unknown) =>
      makeRequest(path, { method: "PATCH", body: JSON.stringify(body) });

    expect(
      (await (await handlers.handleListIdentityUsers(get("/u"), ctx)).json()).data
        .length,
    ).toBeGreaterThan(0);
    await handlers.handleCreateIdentityUser(
      post("/u", { displayName: "Jane Doe", email: "jane@example.com" }),
      ctx,
    );
    await handlers.handleGetIdentityUser(get("/u"), ctx, p({ userId: "user_1" }));
    await handlers.handleUpdateIdentityUser(
      patch("/u", {
        displayName: "Jane D.",
        email: null,
        authSubjectRef: null,
        organisationId: null,
      }),
      ctx,
      p({ userId: "user_1" }),
    );

    await handlers.handleListIdentityGroups(get("/g"), ctx);
    await handlers.handleCreateIdentityGroup(
      post("/g", { key: "ops", name: "Operations", organisationId: "org_1" }),
      ctx,
    );
    await handlers.handleGetIdentityGroup(get("/g"), ctx, p({ groupId: "group_1" }));
    await handlers.handleUpdateIdentityGroup(
      patch("/g", { name: "Operations Team", description: null, status: "active" }),
      ctx,
      p({ groupId: "group_1" }),
    );

    await handlers.handleListIdentityRoles(get("/r"), ctx);
    await handlers.handleCreateIdentityRole(
      post("/r", { key: "viewer", name: "Viewer" }),
      ctx,
    );
    await handlers.handleGetIdentityRole(get("/r"), ctx, p({ roleId: "role_1" }));
    await handlers.handleUpdateIdentityRole(
      patch("/r", { name: "Viewer Role", description: null, status: "active" }),
      ctx,
      p({ roleId: "role_1" }),
    );

    await handlers.handleListIdentityOrganisations(get("/o"), ctx);
    await handlers.handleCreateIdentityOrganisation(
      post("/o", { key: "globex", name: "Globex" }),
      ctx,
    );
    await handlers.handleGetIdentityOrganisation(
      get("/o"),
      ctx,
      p({ organisationId: "org_1" }),
    );
    await handlers.handleUpdateIdentityOrganisation(
      patch("/o", { name: "Globex Corp", description: null, status: "active" }),
      ctx,
      p({ organisationId: "org_1" }),
    );

    await handlers.handleListIdentityTenants(get("/t"), ctx);
    await handlers.handleCreateIdentityTenant(
      post("/t", { key: "tenant-b", name: "Tenant B" }),
      ctx,
    );
    await handlers.handleGetIdentityTenant(get("/t"), ctx, p({ tenantId: "tenant_1" }));
    await handlers.handleUpdateIdentityTenant(
      patch("/t", { name: "Tenant B2", description: null, status: "active" }),
      ctx,
      p({ tenantId: "tenant_1" }),
    );

    await handlers.handleListIdentityDepartments(get("/dep"), ctx);
    await handlers.handleCreateIdentityDepartment(
      post("/dep", { organisationId: "org_1", key: "eng", name: "Engineering" }),
      ctx,
    );
    await handlers.handleGetIdentityDepartment(
      get("/dep"),
      ctx,
      p({ departmentId: "department_1" }),
    );
    await handlers.handleUpdateIdentityDepartment(
      patch("/dep", { name: "Engineering Dept", description: null, status: "active" }),
      ctx,
      p({ departmentId: "department_1" }),
    );

    await handlers.handleListIdentityPositions(get("/pos"), ctx);
    await handlers.handleCreateIdentityPosition(
      post("/pos", { key: "swe", name: "Software Engineer", organisationId: "org_1" }),
      ctx,
    );
    await handlers.handleCreateIdentityPosition(
      post("/pos", { key: "swe2", name: "Software Engineer II" }),
      ctx,
    );
    await handlers.handleGetIdentityPosition(
      get("/pos"),
      ctx,
      p({ positionId: "position_1" }),
    );
    await handlers.handleUpdateIdentityPosition(
      patch("/pos", {
        name: "Senior Software Engineer",
        description: null,
        status: "active",
      }),
      ctx,
      p({ positionId: "position_1" }),
    );

    await handlers.handleListIdentityMemberships(get("/mem"), ctx);
    await handlers.handleCreateIdentityMembership(
      post("/mem", { userId: "user_1", kind: "group", targetId: "group_1" }),
      ctx,
    );
    await handlers.handleGetIdentityMembership(
      get("/mem"),
      ctx,
      p({ membershipId: "membership_1" }),
    );
    await handlers.handleUpdateIdentityMembership(
      patch("/mem", { status: "suspended" }),
      ctx,
      p({ membershipId: "membership_1" }),
    );

    await handlers.handleListIdentityServiceAssignments(get("/sa"), ctx);
    await handlers.handleCreateIdentityServiceAssignment(
      post("/sa", {
        subjectKind: "user",
        subjectId: "user_1",
        serviceCapability: "workflow-engine",
      }),
      ctx,
    );
    await handlers.handleGetIdentityServiceAssignment(
      get("/sa"),
      ctx,
      p({ assignmentId: "assignment_1" }),
    );
    await handlers.handleUpdateIdentityServiceAssignment(
      patch("/sa", { status: "suspended" }),
      ctx,
      p({ assignmentId: "assignment_1" }),
    );

    await handlers.handleListIdentityInvitations(get("/inv"), ctx);
    await handlers.handleCreateIdentityInvitation(
      post("/inv", { email: "invitee2@example.com", invitedUserId: "user_1" }),
      ctx,
    );
    await handlers.handleCreateIdentityInvitation(
      post("/inv", { email: "invitee3@example.com" }),
      ctx,
    );
    await handlers.handleGetIdentityInvitation(
      get("/inv"),
      ctx,
      p({ invitationId: "invitation_1" }),
    );
    await handlers.handleUpdateIdentityInvitation(
      patch("/inv", { status: "revoked", expiresAt: null }),
      ctx,
      p({ invitationId: "invitation_1" }),
    );

    await handlers.handleListIdentityActivations(get("/act"), ctx);
    await handlers.handleCreateIdentityActivation(
      post("/act", { userId: "user_1", reason: "onboarding" }),
      ctx,
    );
    await handlers.handleGetIdentityActivation(
      get("/act"),
      ctx,
      p({ activationId: "activation_1" }),
    );

    await handlers.handleListIdentityDeactivations(get("/deact"), ctx);
    await handlers.handleCreateIdentityDeactivation(
      post("/deact", { userId: "user_1", reason: "offboarding" }),
      ctx,
    );
    await handlers.handleGetIdentityDeactivation(
      get("/deact"),
      ctx,
      p({ deactivationId: "deactivation_1" }),
    );

    await handlers.handleListIdentityPolicies(get("/pol"), ctx);
    await handlers.handleCreateIdentityPolicy(
      post("/pol", { key: "retention", name: "Retention", kind: "retention" }),
      ctx,
    );
    await handlers.handleGetIdentityPolicy(
      get("/pol"),
      ctx,
      p({ policyId: "policy_1" }),
    );
    await handlers.handleUpdateIdentityPolicy(
      patch("/pol", { name: "Retention Policy", description: null }),
      ctx,
      p({ policyId: "policy_1" }),
    );

    await handlers.handleListIdentityAudit(get("/aud"), ctx);
    await handlers.handleGetIdentityAuditEntry(
      get("/aud"),
      ctx,
      p({ auditId: "identity_audit_1" }),
    );

    await handlers.handleListIdentityHistory(get("/hist?userId=user_1"), ctx);
    await handlers.handleListIdentityHistory(get("/hist"), ctx);
    await handlers.handleGetIdentityHistoryEntry(
      get("/hist"),
      ctx,
      p({ historyId: "identity_history_1" }),
    );

    await handlers.handleListIdentityReferences(get("/ref?userId=user_1"), ctx);
    await handlers.handleListIdentityReferences(get("/ref"), ctx);
    await handlers.handleCreateIdentityReference(
      post("/ref", {
        kind: "external",
        target: "https://example.com",
        userId: "user_1",
      }),
      ctx,
    );
    await handlers.handleGetIdentityReference(
      get("/ref"),
      ctx,
      p({ referenceId: "identity_reference_1" }),
    );
    await handlers.handleUpdateIdentityReference(
      patch("/ref", { target: "https://example.com/updated", label: null }),
      ctx,
      p({ referenceId: "identity_reference_1" }),
    );

    await handlers.handleGetIdentityHealth(get("/health"), ctx);
    await handlers.handleGetIdentityReadiness(get("/ready"), ctx);
    await handlers.handleGetIdentityCapabilities(get("/caps"), ctx);
    await handlers.handleGetIdentityManagementCapabilities(get("/mgmt-caps"), ctx);

    const dto = handlers.buildIdentityManagementPlaneDto({
      identityEnabled: false,
    });
    expect(dto.httpEnabled).toBe(true);
    expect(dto.workbenchEnabled).toBe(false);
    expect(dto.authenticationManaged).toBe(false);
  });
});
