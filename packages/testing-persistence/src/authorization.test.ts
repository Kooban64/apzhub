import { describe, expect, it } from "vitest";

import {
  assertPermission,
  hasAnyMatchingPermission,
  permissionsForOperation,
} from "./authorization/testing-authorization";
import {
  listTestingPermissionSeedKeys,
  seedTestingPermissions,
} from "./authorization/permission-seed";
import { PersistenceError, unauthorizedError } from "./errors";
import type { RepositoryContext } from "./types";

const adminCtx: RepositoryContext = {
  tenantId: "tenant-a",
  actorUserId: "user-1",
  permissions: ["testing.*"],
};

const viewerCtx: RepositoryContext = {
  tenantId: "tenant-a",
  actorUserId: "user-2",
  permissions: ["testing.view"],
};

describe("testing authorization", () => {
  it("matches namespace wildcards on granted side", () => {
    expect(hasAnyMatchingPermission(["testing.*"], ["testing.plans.create"])).toBe(
      true,
    );
    expect(hasAnyMatchingPermission(["*"], ["testing.admin"])).toBe(true);
    expect(hasAnyMatchingPermission(["evidence.*"], ["testing.plans.create"])).toBe(
      false,
    );
  });

  it("assertPermission denies without matching grant", () => {
    expect(() => assertPermission(viewerCtx, "test_plan", "create")).toThrow(
      PersistenceError,
    );
    try {
      assertPermission(viewerCtx, "test_plan", "create");
    } catch (error) {
      expect(error).toBeInstanceOf(PersistenceError);
      expect((error as PersistenceError).code).toBe("UNAUTHORIZED");
    }
  });

  it("assertPermission allows namespace grant", () => {
    expect(() => assertPermission(adminCtx, "test_plan", "create")).not.toThrow();
    expect(() => assertPermission(viewerCtx, "test_plan", "list")).not.toThrow();
  });

  it("maps operations to specific permission keys", () => {
    expect(permissionsForOperation("evidence", "create")).toContain(
      "evidence.register",
    );
    expect(permissionsForOperation("approval", "update")).toEqual(
      expect.arrayContaining(["approval.decide", "approval.sign"]),
    );
  });

  it("accepts administration.testing via administration.*", () => {
    const ctx: RepositoryContext = {
      tenantId: "t1",
      actorUserId: "u1",
      permissions: ["administration.*"],
    };
    expect(() => assertPermission(ctx, "configuration", "update")).not.toThrow();
  });

  it("unauthorizedError includes actor", () => {
    const err = unauthorizedError("testing.admin", "actor-9");
    expect(err.message).toContain("actor-9");
    expect(err.code).toBe("UNAUTHORIZED");
  });

  it("seed catalogue includes wildcards and APZ keys", () => {
    const keys = listTestingPermissionSeedKeys();
    expect(keys).toContain("testing.*");
    expect(keys).toContain("testing.view");
    expect(keys).toContain("certification.*");
  });

  it("seedTestingPermissions registers keys", () => {
    const registered: string[] = [];
    seedTestingPermissions({
      registerPermission: ({ permissionKey }) => {
        registered.push(permissionKey);
      },
    });
    expect(registered.length).toBeGreaterThan(20);
    expect(registered).toContain("testing.*");
  });
});
