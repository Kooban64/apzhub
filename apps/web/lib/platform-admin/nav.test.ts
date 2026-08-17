import { describe, expect, it } from "vitest";

import {
  PLATFORM_ADMIN_NAV,
  PLATFORM_ADMIN_PERMISSION,
  isPlatformAdminPath,
  platformAdminNavLabel,
} from "@/lib/platform-admin/nav";

describe("platform-admin nav", () => {
  it("keeps Overview and Tenants as implemented primary items", () => {
    const implemented = PLATFORM_ADMIN_NAV.filter((item) => item.implemented).map(
      (i) => i.id,
    );
    expect(implemented).toEqual(["overview", "tenants"]);
  });

  it("exposes compact sidebar groups without exploding children", () => {
    expect(PLATFORM_ADMIN_NAV.some((i) => i.id === "tenants")).toBe(true);
    expect(PLATFORM_ADMIN_NAV.some((i) => i.label === "All Tenants")).toBe(false);
    expect(PLATFORM_ADMIN_PERMISSION).toBe("platform.nav.administration.view");
  });

  it("recognises platform-admin paths", () => {
    expect(isPlatformAdminPath("/platform-admin")).toBe(true);
    expect(isPlatformAdminPath("/platform-admin/tenants")).toBe(true);
    expect(isPlatformAdminPath("/ops")).toBe(false);
    expect(platformAdminNavLabel("/platform-admin")).toBe("Overview");
    expect(platformAdminNavLabel("/platform-admin/tenants")).toBe("Tenants");
  });
});
