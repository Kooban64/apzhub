import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@apzhub/platform-authorization", async () => {
  const actual = await vi.importActual<typeof import("@apzhub/platform-authorization")>(
    "@apzhub/platform-authorization",
  );
  return actual;
});

vi.mock("@apzhub/platform-authorization/postgres", () => ({
  upsertPostgresRoleAssignment: vi.fn(async () => undefined),
  deactivatePostgresRoleAssignment: vi.fn(async () => true),
  upsertPostgresUserScopedPermissions: vi.fn(async () => ({
    roleId: "role-user-scope-u1",
    permissionKeys: [],
  })),
  listProductRoleAssignmentsForUser: vi.fn(async () => [
    {
      assignmentId: "a1",
      roleId: "role-product-support-agent",
      roleSlug: "product-support-agent",
      roleName: "Support Agent",
      productKey: "support",
      sourceKind: "direct",
      sourceId: "",
    },
  ]),
}));

vi.mock("@apzhub/platform-identity/server", () => ({
  setUserTenantMembershipStatus: vi.fn(async () => true),
}));

vi.mock("@/lib/iam/provision-tenant-user", () => ({
  provisionTenantUserFromStaffFunction: vi.fn(async () => ({
    userId: "u-new",
    created: true,
    temporaryPassword: "Temp-123!",
    member: { membershipId: "m1" },
    staffFunction: { id: "staff-fn-customer-support", name: "Customer Support" },
    productKeys: ["support", "time", "knowledge"],
    productRoleIds: ["role-product-support-agent"],
    effectiveAccessSummary: { orgJobRoleId: "role-support-agent", products: [] },
  })),
}));

vi.mock("@/lib/commercial/product-access-durable", () => ({
  ensureOrgProductSubscriptionsDurable: vi.fn(async () => undefined),
  setUserProductGrantsDurable: vi.fn(async () => []),
}));

vi.mock("@/lib/iam/employment-write", () => ({
  upsertEmploymentMetadata: vi.fn(async () => undefined),
}));

vi.mock("@/lib/iam/provision-overlays", () => ({
  normalizeResourceScopeGrants: vi.fn((keys: string[]) => keys ?? []),
  applyProvisionOverlays: vi.fn(async () => ({
    resourceScopeGrants: ["support.queue:customer-support"],
    scopedRoleId: "role-user-scope-u-new",
    professionalToolIds: [],
  })),
}));

vi.mock("@/lib/iam/better-auth-sessions", () => ({
  revokeAllSessionsForUser: vi.fn(async () => ({ revoked: 2 })),
}));

vi.mock("@/lib/iam/professional-tools", () => ({
  grantProfessionalTool: vi.fn(),
  revokeProfessionalToolGrant: vi.fn(() => ({ id: "g1" })),
  listProfessionalToolGrants: vi.fn(() => []),
}));

describe("iam-write-service Phase 1", () => {
  beforeEach(() => {
    process.env.DATABASE_URL = "postgres://test";
    vi.clearAllMocks();
  });

  it("addTenantUser provisions Support Agent template without professional tools", async () => {
    const { addTenantUser } = await import("@/lib/platform-admin/iam-write-service");
    const { STAFF_FUNCTION_CUSTOMER_SUPPORT_ID } =
      await import("@apzhub/platform-authorization");
    const result = await addTenantUser({
      tenantId: "t-apzor",
      invitedBy: "admin",
      email: "agent@apzor.com",
      displayName: "Support Agent",
      staffFunctionId: STAFF_FUNCTION_CUSTOMER_SUPPORT_ID,
      resourceScopeGrants: [
        "support.queue:customer-support",
        "knowledge.space:support",
      ],
      professionalToolIds: [],
    });
    expect(result.userId).toBe("u-new");
    expect(result.productKeys).toEqual(
      expect.arrayContaining(["support", "time", "knowledge"]),
    );
    expect(result.productKeys).not.toContain("qep");
    expect(result.professionalToolIds).toEqual([]);
    expect(result.inspectorHref).toContain("/users/u-new");
  });

  it("previewProductRoleChange reports GAIN/LOSE independently per product", async () => {
    const { previewProductRoleChange } =
      await import("@/lib/platform-admin/iam-write-service");
    const { DEFAULT_PRODUCT_SUPPORT_REQUESTER_ROLE_ID } =
      await import("@apzhub/platform-authorization");
    const preview = await previewProductRoleChange({
      tenantId: "t-apzor",
      userId: "u1",
      productKey: "support",
      toRoleId: DEFAULT_PRODUCT_SUPPORT_REQUESTER_ROLE_ID,
    });
    expect(preview.productKey).toBe("support");
    expect(preview.toRoleId).toBe(DEFAULT_PRODUCT_SUPPORT_REQUESTER_ROLE_ID);
    expect(Array.isArray(preview.gain)).toBe(true);
    expect(Array.isArray(preview.lose)).toBe(true);
  });

  it("deactivateTenantUser revokes sessions and clears grants", async () => {
    const { deactivateTenantUser } =
      await import("@/lib/platform-admin/iam-write-service");
    const { setUserProductGrantsDurable } =
      await import("@/lib/commercial/product-access-durable");
    const result = await deactivateTenantUser({
      tenantId: "t-apzor",
      userId: "u1",
    });
    expect(result.membershipUpdated).toBe(true);
    expect(result.sessionsRevoked).toBe(2);
    expect(setUserProductGrantsDurable).toHaveBeenCalledWith({
      organisationId: "t-apzor",
      userId: "u1",
      productKeys: [],
    });
  });
});
