import { describe, expect, it } from "vitest";

import {
  filterOrganisationAdminNav,
  ORGANISATION_ADMIN_BASE,
  ORGANISATION_ADMIN_NAV,
  ORGANISATION_ADMIN_PERMISSION,
  organisationAdminNavLabel,
} from "./nav";

describe("organisation-admin nav", () => {
  it("gates on identity.manage, not platform admin permission", () => {
    expect(ORGANISATION_ADMIN_PERMISSION).toBe("identity.manage");
    expect(ORGANISATION_ADMIN_PERMISSION).not.toContain("platform.nav");
  });

  it("marks Home through Provisioning as implemented in block 2", () => {
    const implemented = ORGANISATION_ADMIN_NAV.filter((i) => i.implemented).map(
      (i) => i.id,
    );
    expect(implemented).toEqual([
      "home",
      "people",
      "teams",
      "roles",
      "products",
      "provisioning",
    ]);
  });

  it("shows Home + permission-matched items for org-admin grants", () => {
    const grants = [
      "identity.manage",
      "identity.read",
      "admin.operate",
      "admin.read",
      "team.*",
      "user.*",
      "catalogue.read",
      "entitlement.read",
    ];
    const ids = filterOrganisationAdminNav(grants).map((i) => i.id);
    expect(ids).toContain("home");
    expect(ids).toContain("people");
    expect(ids).toContain("teams");
    expect(ids).toContain("products");
    expect(ids).toContain("audit");
  });

  it("still shows Home when grants are empty (gated shell already passed)", () => {
    const ids = filterOrganisationAdminNav([]).map((i) => i.id);
    expect(ids).toEqual(["home", "help"]);
  });

  it("labels nested people routes", () => {
    expect(organisationAdminNavLabel(ORGANISATION_ADMIN_BASE)).toBe("Home");
    expect(organisationAdminNavLabel(`${ORGANISATION_ADMIN_BASE}/people`)).toBe(
      "People",
    );
    expect(organisationAdminNavLabel(`${ORGANISATION_ADMIN_BASE}/people/u-1`)).toBe(
      "People",
    );
  });
});
