import { describe, expect, it } from "vitest";

import { evaluatePermissionAgainstEffective } from "./authorization-evaluation";
import { createEmptyEffectivePermissions } from "./authorization-evaluation";
import type { PlatformRole, RoleAssignment } from "./authorization-types";

describe("authorization tenant mismatch", () => {
  it("returns tenant_mismatch when assignments do not match request tenant", () => {
    const roles: PlatformRole[] = [
      {
        roleId: "role-tenant-a",
        slug: "tenant-a-admin",
        name: "Tenant A Admin",
        scope: "tenant",
        tenantId: "t0000001-0000-4000-8000-000000000001",
        productKey: "law-platform",
        status: "active",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ];

    const assignments: RoleAssignment[] = [
      {
        assignmentId: "asg-1",
        userId: "user-1",
        roleId: "role-tenant-a",
        tenantId: "t0000001-0000-4000-8000-000000000001",
        productKey: "law-platform",
        status: "active",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ];

    const effective = {
      ...createEmptyEffectivePermissions({
        userId: "user-1",
        tenantId: "t0000002-0000-4000-8000-000000000002",
        productKey: "law-platform",
      }),
      roleIds: ["role-tenant-a"],
      effectivePermissions: [],
      allowPermissions: [],
      denyPermissions: [],
      roleSlugs: ["tenant-a-admin"],
    };

    const result = evaluatePermissionAgainstEffective("legal.client.view", effective, {
      permissionExists: () => true,
      roleExists: (roleId) => roleId === "role-tenant-a",
      assignments,
      roles,
      context: {
        userId: "user-1",
        tenantId: "t0000002-0000-4000-8000-000000000002",
        productKey: "law-platform",
      },
    });

    expect(result.outcome).toBe("tenant_mismatch");
  });
});
