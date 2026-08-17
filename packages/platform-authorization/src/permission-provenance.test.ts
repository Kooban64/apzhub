import { describe, expect, it } from "vitest";

import {
  buildPermissionProvenance,
  findMatchingGrantRoles,
  parseResourceScopesFromPermissions,
} from "./index";
import { createEmptyEffectivePermissions } from "./authorization-evaluation";

describe("permission provenance", () => {
  const roles = [
    {
      roleId: "role-product-qep-engineer",
      slug: "product-qep-engineer",
      name: "QEP Engineer",
      scope: "product" as const,
      productKey: "qep",
      status: "active" as const,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
  ];
  const grants = [
    {
      roleId: "role-product-qep-engineer",
      permissionKey: "qep.plan.*",
      grantType: "allow" as const,
    },
  ];
  const assignments = [
    {
      assignmentId: "a1",
      userId: "u1",
      roleId: "role-product-qep-engineer",
      tenantId: "t1",
      productKey: "qep",
      sourceKind: "direct" as const,
      status: "active" as const,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
  ];

  it("attributes allow to the matching product role", () => {
    const matched = findMatchingGrantRoles({
      permissionKey: "qep.plan.create",
      grantType: "allow",
      roleIds: ["role-product-qep-engineer"],
      roles,
      grants,
      assignments,
    });
    expect(matched[0]?.roleName).toBe("QEP Engineer");
    expect(matched[0]?.productKey).toBe("qep");
  });

  it("explains deny with current roles and required permission", () => {
    const effective = {
      ...createEmptyEffectivePermissions({ userId: "u1", tenantId: "t1" }),
      roleIds: ["role-product-qep-engineer"],
      roleSlugs: ["product-qep-engineer"],
      effectivePermissions: ["qep.plan.*"],
      allowPermissions: ["qep.plan.*"],
      denyPermissions: [] as string[],
    };
    const provenance = buildPermissionProvenance({
      permissionKey: "qep.release.approve",
      outcome: "deny",
      effective,
      roles,
      grants,
      assignments,
      context: { userId: "u1", tenantId: "t1" },
    });
    expect(provenance.decision).toBe("DENIED");
    expect(provenance.requiredPermission).toBe("qep.release.approve");
    expect(provenance.currentRoles?.[0]?.roleName).toBe("QEP Engineer");
  });
});

describe("resource scope catalogue", () => {
  it("parses independent product scopes", () => {
    const scopes = parseResourceScopesFromPermissions([
      "projects.project:apzhub",
      "support.queue:vip",
      "qep.repository:apzsign",
      "source.repo:apzsign",
    ]);
    expect(scopes.map((s) => s.kind)).toEqual([
      "projects.project",
      "support.queue",
      "qep.repository",
      "source.repo",
    ]);
  });
});
