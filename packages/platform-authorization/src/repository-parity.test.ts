import { describe, expect, it } from "vitest";

import { createInMemoryAuthorizationService } from "./index";

describe("Authorization repository parity (in-memory contract)", () => {
  it("creates roles, permissions, and assignments consistently", () => {
    const { service, repositories } = createInMemoryAuthorizationService();

    service.registerPermission({ permissionKey: "legal.test.view" });
    const role = service.createRole(
      {
        slug: "test-role",
        name: "Test Role",
        scope: "product",
        productKey: "law-platform",
      },
      ["legal.test.view"],
    );

    const assignment = service.assignRole({
      userId: "user-parity",
      roleId: role.roleId,
      productKey: "law-platform",
    });

    expect(repositories.permissions.get("legal.test.view")?.permissionKey).toBe("legal.test.view");
    expect(repositories.roles.get(role.roleId)?.slug).toBe("test-role");
    expect(repositories.assignments.get(assignment.assignmentId)?.userId).toBe("user-parity");
    expect(
      service.can({ userId: "user-parity", productKey: "law-platform" }, "legal.test.view"),
    ).toBe(true);
  });
});
