import { beforeEach, describe, expect, it } from "vitest";

import {
  createInMemoryAuthorizationService,
  resetSharedAuthorizationService,
} from "./index";
import { permissionPatternMatches } from "./permission-model";

describe("AuthorizationService", () => {
  beforeEach(() => {
    resetSharedAuthorizationService();
  });

  it("allows wildcard platform admin permissions", () => {
    const { service } = createInMemoryAuthorizationService();

    service.assignRole({
      userId: "user-1",
      roleId: "role-platform-admin",
    });

    const result = service.evaluatePermission(
      { userId: "user-1" },
      "legal.client.manage",
    );

    expect(result.outcome).toBe("allow");
  });

  it("grants Tenant Member governance entry without practice inheritance (N-02)", () => {
    const { service } = createInMemoryAuthorizationService();

    service.assignRole({
      userId: "user-2",
      roleId: "role-tenant-member",
      tenantId: "t0000001-0000-4000-8000-000000000001",
      productKey: "law-platform",
    });

    const effective = service.getEffectivePermissions({
      userId: "user-2",
      tenantId: "t0000001-0000-4000-8000-000000000001",
      productKey: "law-platform",
    });

    expect(effective.roleSlugs).toContain("tenant-member");
    expect(effective.roleSlugs).not.toContain("law-operator");
    const ctx = {
      userId: "user-2",
      tenantId: "t0000001-0000-4000-8000-000000000001",
      productKey: "law-platform",
    };
    expect(service.can(ctx, "law.view")).toBe(true);
    expect(service.can(ctx, "legal.client.view")).toBe(false);
    expect(service.can(ctx, "legal.trust.view")).toBe(false);
    expect(service.can(ctx, "law.admin")).toBe(false);
  });

  it("inherits permissions from parent roles when configured", () => {
    const { service } = createInMemoryAuthorizationService();
    service.createRole(
      {
        roleId: "role-child",
        slug: "child-role",
        name: "Child",
        scope: "tenant",
        parentRoleId: "role-law-operator",
      },
      ["workspace.read"],
    );
    service.assignRole({ userId: "user-child", roleId: "role-child" });
    expect(
      service.can(
        { userId: "user-child", productKey: "law-platform" },
        "legal.client.view",
      ),
    ).toBe(true);
  });

  it("denies unknown grants for users without assignments", () => {
    const { service } = createInMemoryAuthorizationService();

    const result = service.evaluatePermission(
      { userId: "missing-user" },
      "legal.client.manage",
    );

    expect(result.outcome).toBe("deny");
  });

  it("returns not_applicable for empty permission keys", () => {
    const { service } = createInMemoryAuthorizationService();

    expect(service.evaluatePermission({ userId: "user-1" }, "").outcome).toBe(
      "not_applicable",
    );
  });

  it("emits platform authorization events", () => {
    const { service, events } = createInMemoryAuthorizationService();

    service.createRole({
      slug: "custom-role",
      name: "Custom Role",
      scope: "platform",
    });

    expect(
      events
        .listEvents()
        .some((event) => event.eventId === "platform.authorization.role.created"),
    ).toBe(true);
  });

  it("reports diagnostics counters", () => {
    const { service } = createInMemoryAuthorizationService();

    service.evaluatePermission({ userId: "none" }, "legal.client.view");
    const diagnostics = service.getDiagnostics();

    expect(diagnostics.evaluationCount).toBeGreaterThan(0);
    expect(diagnostics.roleCount).toBeGreaterThan(0);
    expect(diagnostics.permissionCount).toBeGreaterThan(0);
  });
});

describe("permissionPatternMatches", () => {
  it("matches namespace wildcards", () => {
    expect(permissionPatternMatches("legal.*", "legal.client.view")).toBe(true);
    expect(permissionPatternMatches("legal.*", "platform.home")).toBe(false);
  });
});
