import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/platform-admin/build-tenant-users", () => ({
  buildPlatformAdminTenantUsers: vi.fn(),
}));

vi.mock("@/lib/platform-admin/build-user-inspector", () => ({
  buildPlatformAdminUserInspector: vi.fn(),
}));

import { buildPlatformAdminTenantUsers } from "@/lib/platform-admin/build-tenant-users";
import { buildPlatformAdminUserInspector } from "@/lib/platform-admin/build-user-inspector";
import {
  buildOrganisationAdminPeople,
  buildOrganisationAdminPerson,
} from "./build-people";

describe("organisation-admin people builders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("remaps user hrefs onto /organisation-admin/people", async () => {
    vi.mocked(buildPlatformAdminTenantUsers).mockResolvedValue({
      tenant: { tenantId: "t-1", name: "Demo Org" },
      users: [
        {
          userId: "u-1",
          displayName: "Ada",
          email: "ada@example.com",
          status: "active",
          href: "/platform-admin/tenants/t-1/users/u-1",
          department: { availability: "not_configured", message: "n/a" },
          products: { availability: "not_configured", message: "n/a" },
          staffFunction: { availability: "not_configured", message: "n/a" },
        },
      ],
      addUser: { availability: "not_configured", message: "n/a" },
      filters: {
        department: { availability: "not_configured", message: "n/a" },
        product: { availability: "not_configured", message: "n/a" },
      },
    } as never);

    const payload = await buildOrganisationAdminPeople("t-1");
    expect(payload?.users[0]?.href).toBe("/organisation-admin/people/u-1");
    expect(payload?.users[0]?.href).not.toContain("/platform-admin/");
  });

  it("attaches organisation-admin back context on person inspector", async () => {
    vi.mocked(buildPlatformAdminUserInspector).mockResolvedValue({
      user: { userId: "u-1" },
      tenantId: "t-1",
    } as never);

    const person = await buildOrganisationAdminPerson("t-1", "u-1");
    expect(person?.backHref).toBe("/organisation-admin/people");
    expect(person?.contextLabel).toBe("Organisation Admin");
  });
});
