import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@apzhub/platform-identity/server", () => ({
  listMembershipsForTenant: vi.fn(async (tenantId: string) => {
    if (tenantId !== "t-apzor") return [];
    return [
      {
        membershipId: "m1",
        userId: "u-mary",
        tenantId: "t-apzor",
        isPrimary: true,
        status: "active",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ];
  }),
}));

vi.mock("@apzhub/config/db", () => ({
  getDb: vi.fn(() => ({
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => [
            { id: "u-mary", name: "Mary Smith", email: "mary@apzor.com" },
          ],
        }),
      }),
    }),
  })),
  user: { id: "id", name: "name", email: "email" },
  platformIamDepartment: { id: "id" },
  platformIamGroup: {},
  platformIamMembership: {},
}));

vi.mock("@apzhub/platform-authorization", () => ({
  resolveStaffFunctionTemplateForOrgJob: vi.fn(() => null),
  parseResourceScopesFromPermissions: vi.fn(() => []),
}));

vi.mock("@apzhub/platform-authorization/server", () => ({
  resolveSessionAuthorization: vi.fn(async () => ({
    roles: ["org-member", "product-projects-member"],
    permissions: ["projects.task.view", "projects.task.manage"],
  })),
}));

vi.mock("@apzhub/platform-authorization/postgres", () => ({
  listProductRoleAssignmentsForUser: vi.fn(async () => [
    {
      assignmentId: "a1",
      roleId: "role-product-projects-member",
      roleSlug: "product-projects-member",
      roleName: "Projects Member",
      productKey: "projects",
      sourceKind: "direct",
      sourceId: "",
    },
  ]),
  explainPostgresPermission: vi.fn(
    async ({ permissionKey }: { permissionKey: string }) => {
      if (permissionKey === "qep.release.approve") {
        return {
          outcome: "deny",
          permissionKey,
          reason: "No matching allow grant.",
          provenance: {
            decision: "DENIED",
            permissionKey,
            requiredPermission: permissionKey,
            currentRoles: [
              {
                roleId: "role-product-projects-member",
                roleSlug: "product-projects-member",
                roleName: "Projects Member",
                productKey: "projects",
                sourceKind: "direct",
              },
            ],
            reason: "No matching allow grant.",
          },
        };
      }
      return {
        outcome: "allow",
        permissionKey,
        matchedRoleIds: ["role-product-projects-member"],
        provenance: {
          decision: "ALLOWED",
          permissionKey,
          grantedBy: {
            roleId: "role-product-projects-member",
            roleSlug: "product-projects-member",
            roleName: "Projects Member",
            productKey: "projects",
            sourceKind: "direct",
          },
          productKey: "projects",
        },
      };
    },
  ),
}));

vi.mock("@/lib/iam/bridge-org-member-employment", () => ({
  bridgeOrgMembersToEmployment: vi.fn(async () => ({ upserted: 0 })),
  loadEmploymentForUser: vi.fn(async () => ({
    staffFunctionKey: "persona-developer",
    jobTitle: "Senior Backend Developer",
  })),
}));

vi.mock("@/lib/commercial/product-access-durable", () => ({
  bridgeProductAccessFileToPostgres: vi.fn(async () => ({
    subscriptions: 0,
    grants: 0,
  })),
  listOrgProductSubscriptionsDurable: vi.fn(async () => [
    { productKey: "projects", status: "active" },
    { productKey: "support", status: "active" },
  ]),
  listUserProductGrantsDurable: vi.fn(async () => [{ productKey: "projects" }]),
}));

vi.mock("@/lib/commercial/catalogue", () => ({
  getProduct: vi.fn((key: string) => ({
    key,
    name: key === "projects" ? "Projects" : key === "support" ? "Support" : key,
  })),
}));

vi.mock("@/lib/iam/professional-tools", () => ({
  listProfessionalToolsCatalogue: vi.fn(() => [
    { id: "workflow-designer", label: "Workflow designer", description: "" },
    { id: "analytics-models", label: "Analytics models", description: "" },
  ]),
  listProfessionalToolGrants: vi.fn(() => []),
}));

vi.mock("@/lib/iam/better-auth-sessions", () => ({
  listSessionsForUser: vi.fn(async () => [
    {
      sessionId: "s1",
      expiresAt: "2099-01-01T00:00:00.000Z",
      ipAddress: "127.0.0.1",
      userAgent: "test",
      status: "active",
    },
  ]),
}));

vi.mock("@/lib/iam/effective-access-timeline", () => ({
  loadInspectionTimelineTabs: vi.fn(async () => ({
    activity: [],
    audit: [],
    sessions: [],
  })),
}));

describe("buildPlatformAdminUserInspector (IAM completion)", () => {
  beforeEach(() => {
    process.env.DATABASE_URL = "postgres://test";
  });

  it("requires real tenant membership (isolation)", async () => {
    const { buildPlatformAdminUserInspector } =
      await import("@/lib/platform-admin/build-user-inspector");
    expect(
      await buildPlatformAdminUserInspector({
        tenantId: "t-other",
        userId: "u-mary",
        tenantName: "Other",
      }),
    ).toBeNull();
  });

  it("shows independent product roles, negative access, provenance and sessions", async () => {
    const { buildPlatformAdminUserInspector } =
      await import("@/lib/platform-admin/build-user-inspector");
    const payload = await buildPlatformAdminUserInspector({
      tenantId: "t-apzor",
      userId: "u-mary",
      tenantName: "APZOR (Pty) Ltd",
    });
    expect(payload).not.toBeNull();
    expect(payload!.organisational.jobTitle.value).toBe("Senior Backend Developer");

    const projects = payload!.products.find((p) => p.productKey === "projects");
    const support = payload!.products.find((p) => p.productKey === "support");
    expect(projects?.status).toBe("granted");
    expect(projects?.roleLabel).toContain("Projects Member");
    expect(support?.status).toBe("org_subscribed_user_denied");

    expect(payload!.platformAccess.platformRole.value).toBe("None");
    expect(payload!.professionalTools.every((t) => t.status === "not_granted")).toBe(
      true,
    );
    expect(payload!.sessions.availability).toBe("ok");
    expect(payload!.manageAccess.availability).toBe("ok");
    expect(
      payload!.permissions.lines.some((l) => l.allowed && l.provenance.grantedBy),
    ).toBe(true);
    expect(payload!.permissions.lines.some((l) => !l.allowed)).toBe(true);
  });

  it("keeps professional tools separate from product grants", async () => {
    const { buildPlatformAdminUserInspector } =
      await import("@/lib/platform-admin/build-user-inspector");
    const payload = await buildPlatformAdminUserInspector({
      tenantId: "t-apzor",
      userId: "u-mary",
      tenantName: "APZOR (Pty) Ltd",
    });
    expect(payload!.accessSummary.products).toBe(1);
    expect(payload!.accessSummary.professionalTools).toBe(0);
  });
});
