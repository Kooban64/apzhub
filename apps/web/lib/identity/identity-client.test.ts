/**
 * Identity typed client coverage (APZIDENTITY-003).
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createHttpIdentityClient,
  createMockIdentityClient,
  getIdentityClient,
  identityQueryKeys,
  IdentityClientError,
  listUsers,
  resetIdentityClient,
  setIdentityClient,
  toIdentityUserMessage,
  assertIdentityApiPath,
} from "./index";

afterEach(() => {
  resetIdentityClient();
  vi.unstubAllGlobals();
});

describe("mock identity client", () => {
  it("supports user lifecycle without auth/provisioning methods", async () => {
    const client = createMockIdentityClient();
    const listed = await client.listUsers();
    expect(listed.items[0]?.id).toBe("usr_mock_1");
    const created = await client.createUser({ displayName: "New User" });
    expect(created.displayName).toBe("New User");
    const updated = await client.updateUser(created.id, { status: "active" });
    expect(updated.status).toBe("active");
    expect(
      "login" in client || "provisionUser" in client || "authenticate" in client,
    ).toBe(false);
  });

  it("supports service assignments", async () => {
    const client = createMockIdentityClient();
    const listed = await client.listServiceAssignments();
    expect(listed.items[0]?.serviceCapability).toBe("projects");
    const created = await client.createServiceAssignment({
      subjectKind: "user",
      subjectId: "usr_1",
      serviceCapability: "support",
    });
    expect(created.serviceCapability).toBe("support");
  });
});

describe("HTTP identity client", () => {
  it("builds routes and maps envelopes for core facets, all under /api/v1/identity", async () => {
    const calls: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        calls.push(`${init?.method ?? "GET"} ${url}`);
        const path = url.split("?")[0] ?? url;
        const item = {
          id: "x",
          tenantId: "tenant_a",
          organisationId: "org_1",
          key: "engineering",
          name: "Engineering",
          displayName: "Mock User",
          status: "active",
          createdAt: "2026-07-16T00:00:00.000Z",
          updatedAt: "2026-07-16T00:00:00.000Z",
          createdBy: "u",
          updatedBy: "u",
          revision: 1,
          userId: "usr_1",
          kind: "group",
          targetId: "grp_1",
          subjectKind: "user",
          subjectId: "usr_1",
          serviceCapability: "projects",
          email: "a@example.com",
          action: "created",
          actorUserId: "u",
          summary: "s",
          target: "/docs/x.md",
          activatedAt: "2026-07-16T00:00:00.000Z",
          deactivatedAt: "2026-07-16T00:00:00.000Z",
          identityEnabled: true,
          managementPlaneReady: true,
          httpEnabled: true,
          workbenchEnabled: false,
          authenticationManaged: false,
        };
        const method = init?.method ?? "GET";
        const isCollectionGet =
          method === "GET" &&
          (path.endsWith("/users") ||
            path.endsWith("/groups") ||
            path.endsWith("/roles") ||
            path.endsWith("/organisations") ||
            path.endsWith("/tenants") ||
            path.endsWith("/departments") ||
            path.endsWith("/positions") ||
            path.endsWith("/memberships") ||
            path.endsWith("/service-assignments") ||
            path.endsWith("/invitations") ||
            path.endsWith("/activation") ||
            path.endsWith("/deactivation") ||
            path.endsWith("/policies") ||
            path.endsWith("/audit") ||
            path.endsWith("/history") ||
            path.endsWith("/references"));
        if (isCollectionGet) {
          return new Response(
            JSON.stringify({
              data: [{ ...item, id: path.includes("users") ? "usr_1" : "x" }],
              page: { limit: 1, hasMore: false },
            }),
            { status: 200, headers: { "content-type": "application/json" } },
          );
        }
        return new Response(JSON.stringify({ data: item }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }),
    );

    const client = createHttpIdentityClient();
    const users = await client.listUsers();
    expect(users.items[0]?.id).toBe("usr_1");
    await client.getUser("usr_1");
    await client.createUser({ displayName: "New User" });
    await client.updateUser("usr_1", { displayName: "Updated" });

    await client.listGroups();
    await client.getGroup("grp_1");
    await client.createGroup({ key: "eng", name: "Engineering" });
    await client.updateGroup("grp_1", { name: "Eng2" });

    await client.listRoles();
    await client.getRole("role_1");
    await client.createRole({ key: "member", name: "Member" });
    await client.updateRole("role_1", { name: "Member2" });

    await client.listOrganisations();
    await client.getOrganisation("org_1");
    await client.createOrganisation({ key: "acme", name: "Acme" });
    await client.updateOrganisation("org_1", { name: "Acme2" });

    await client.listTenants();
    await client.getTenant("tenant_1");
    await client.createTenant({ key: "default", name: "Default" });
    await client.updateTenant("tenant_1", { name: "Default2" });

    await client.listDepartments();
    await client.getDepartment("dept_1");
    await client.createDepartment({
      organisationId: "org_1",
      key: "platform",
      name: "Platform",
    });
    await client.updateDepartment("dept_1", { name: "Platform2" });

    await client.listPositions();
    await client.getPosition("pos_1");
    await client.createPosition({ key: "engineer", name: "Engineer" });
    await client.updatePosition("pos_1", { name: "Engineer2" });

    await client.listMemberships();
    await client.getMembership("mem_1");
    await client.createMembership({
      userId: "usr_1",
      kind: "group",
      targetId: "grp_1",
    });
    await client.updateMembership("mem_1", { status: "active" });

    const assignments = await client.listServiceAssignments();
    expect(assignments.items[0]?.serviceCapability).toBe("projects");
    await client.getServiceAssignment("svcasg_1");
    const createdAssignment = await client.createServiceAssignment({
      subjectKind: "user",
      subjectId: "usr_1",
      serviceCapability: "projects",
    });
    expect(createdAssignment.serviceCapability).toBe("projects");
    await client.updateServiceAssignment("svcasg_1", { status: "active" });

    await client.listInvitations();
    await client.getInvitation("inv_1");
    await client.createInvitation({ email: "invitee@example.com" });
    await client.updateInvitation("inv_1", { status: "sent" });

    await client.listActivations();
    await client.getActivation("act_1");
    await client.createActivation({ userId: "usr_1" });

    await client.listDeactivations();
    await client.getDeactivation("deact_1");
    await client.createDeactivation({ userId: "usr_1" });

    await client.listPolicies();
    await client.getPolicy("pol_1");
    await client.createPolicy({ key: "k", name: "N", kind: "access" });
    await client.updatePolicy("pol_1", { name: "N2" });

    await client.listAudit();
    await client.getAudit("aud_1");

    await client.listHistory();
    await client.listHistory({ userId: "usr_1" });
    await client.getHistory("hist_1");

    await client.listReferences();
    await client.listReferences({ userId: "usr_1" });
    await client.getReference("ref_1");
    await client.createReference({ kind: "documentation", target: "/docs/x.md" });
    await client.updateReference("ref_1", { target: "/docs/y.md" });

    await client.getHealth();
    await client.getReadiness();
    await client.getCapabilities();
    await client.getManagementCapabilities();

    expect(calls.some((c) => c.includes("/api/v1/identity/users"))).toBe(true);
    expect(calls.some((c) => c.includes("/api/v1/identity/service-assignments"))).toBe(
      true,
    );
    expect(calls.some((c) => c.includes("/management-capabilities"))).toBe(true);
    expect(calls.every((c) => c.includes("/api/v1/identity"))).toBe(true);
  });

  it("maps error envelopes including a 503 service-unavailable path", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              error: {
                message: "Identity Administration Platform HTTP API is not enabled.",
                code: "IDENTITY_SERVICE_UNAVAILABLE",
              },
              meta: { correlationId: "c1", requestId: "r1" },
            }),
            { status: 503, headers: { "content-type": "application/json" } },
          ),
      ),
    );
    const client = createHttpIdentityClient();
    await expect(client.getUser("usr_1")).rejects.toMatchObject({
      message: "Identity Administration Platform HTTP API is not enabled.",
      code: "IDENTITY_SERVICE_UNAVAILABLE",
      status: 503,
      correlationId: "c1",
    });
  });

  it("maps 403 error envelopes", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              error: { message: "Nope", code: "FORBIDDEN" },
              meta: { correlationId: "c1", requestId: "r1" },
            }),
            { status: 403, headers: { "content-type": "application/json" } },
          ),
      ),
    );
    const client = createHttpIdentityClient();
    await expect(client.getUser("usr_1")).rejects.toBeInstanceOf(IdentityClientError);
  });

  it("rejects forbidden path segments via assert", () => {
    expect(() => assertIdentityApiPath("/api/v1/identity/login")).toThrow();
    expect(() => assertIdentityApiPath("/api/v1/identity/users")).not.toThrow();
  });
});

describe("identity API facade and query keys", () => {
  it("uses injectable client and query key roots", async () => {
    const mock = createMockIdentityClient();
    setIdentityClient(mock);
    expect(getIdentityClient()).toBe(mock);
    const listed = await listUsers();
    expect(listed.items[0]?.id).toBe("usr_mock_1");
    expect(identityQueryKeys.all).toEqual(["identity"]);
    expect(identityQueryKeys.users.detail("usr_1")).toEqual([
      "identity",
      "users",
      "detail",
      "usr_1",
    ]);
    expect(identityQueryKeys.diagnostics.health()).toEqual([
      "identity",
      "diagnostics",
      "health",
    ]);
  });

  it("formats user messages", () => {
    expect(toIdentityUserMessage(new IdentityClientError({ message: "x" }))).toBe("x");
    expect(toIdentityUserMessage(new Error("y"))).toBe("y");
    expect(toIdentityUserMessage("z")).toBe("Identity request failed");
  });
});
