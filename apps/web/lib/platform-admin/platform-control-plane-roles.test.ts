import { describe, expect, it } from "vitest";

import {
  listPlatformControlPlaneRoles,
  PLATFORM_CONTROL_PLANE_ROLE_IDS,
} from "@/lib/platform-admin/platform-control-plane-roles";

describe("platform-control-plane-roles", () => {
  it("excludes org-admin and invented Owner/Operations rows", () => {
    const roles = listPlatformControlPlaneRoles();
    expect(roles.length).toBeGreaterThan(0);
    expect(roles.some((r) => r.roleId === "role-org-admin")).toBe(false);
    expect(PLATFORM_CONTROL_PLANE_ROLE_IDS).not.toContain("role-org-admin");
    expect(roles.some((r) => /platform owner/i.test(r.name))).toBe(false);
    expect(roles.some((r) => /platform operations/i.test(r.name))).toBe(false);
  });
});
