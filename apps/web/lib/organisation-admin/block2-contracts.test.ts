import { describe, expect, it } from "vitest";

import { listProductRoles } from "@apzhub/platform-authorization";

import {
  assertNoProviderLeak,
  FORBIDDEN_PROVIDER_LEAKS,
  orgAdminProductLabel,
} from "./product-labels";
import {
  ORG_ADMIN_PERMISSION_GAPS,
  ORG_ADMIN_SURFACE_PERMISSIONS,
} from "./permissions";
import { filterOrganisationAdminNav, ORGANISATION_ADMIN_NAV } from "./nav";

describe("organisation-admin block 2 contracts", () => {
  it("marks Teams, Roles, Products, Provisioning implemented", () => {
    const implemented = ORGANISATION_ADMIN_NAV.filter((i) => i.implemented).map(
      (i) => i.id,
    );
    expect(implemented).toEqual(
      expect.arrayContaining([
        "home",
        "people",
        "teams",
        "roles",
        "products",
        "provisioning",
      ]),
    );
  });

  it("does not use identity.manage as the only key for Products or Teams", () => {
    expect([...ORG_ADMIN_SURFACE_PERMISSIONS.teams]).not.toContain("identity.manage");
    expect([...ORG_ADMIN_SURFACE_PERMISSIONS.products]).not.toContain(
      "identity.manage",
    );
    expect([...ORG_ADMIN_SURFACE_PERMISSIONS.provisioning]).not.toContain(
      "identity.manage",
    );
  });

  it("records permission gaps instead of inventing grants", () => {
    expect(ORG_ADMIN_PERMISSION_GAPS.length).toBeGreaterThan(0);
  });

  it("exposes independent product roles from the repository catalogue", () => {
    const roles = listProductRoles();
    const byProduct = new Map<string, string[]>();
    for (const r of roles) {
      if (!r.productKey) continue;
      const list = byProduct.get(r.productKey) ?? [];
      byProduct.set(r.productKey, [...list, r.name]);
    }
    expect(byProduct.get("projects")?.length).toBeGreaterThan(0);
    expect(byProduct.get("support")?.length).toBeGreaterThan(0);
    expect(byProduct.get("qep")?.length).toBeGreaterThan(0);
    expect(byProduct.get("pentest")?.length).toBeGreaterThan(0);
    // APZPRD must not collapse into one synthetic role name
    const allNames = roles.map((r) => r.name.toLowerCase());
    expect(allNames.some((n) => n === "apzprd" || n === "productivity")).toBe(false);
  });

  it("uses APZ product labels without provider brands", () => {
    for (const key of ["projects", "support", "time", "qep", "pentest"] as const) {
      const label = orgAdminProductLabel(key);
      expect(assertNoProviderLeak(label)).toBe(true);
    }
    for (const leak of FORBIDDEN_PROVIDER_LEAKS) {
      expect(assertNoProviderLeak(`failed via ${leak}`)).toBe(false);
    }
  });

  it("hides Products when only identity.manage is granted (permission separation)", () => {
    const ids = filterOrganisationAdminNav(["identity.manage"]).map((i) => i.id);
    expect(ids).toContain("home");
    expect(ids).toContain("people");
    expect(ids).toContain("roles");
    expect(ids).not.toContain("teams");
    expect(ids).not.toContain("products");
    expect(ids).not.toContain("provisioning");
  });

  it("shows Products with entitlement.read and Teams with team.*", () => {
    const ids = filterOrganisationAdminNav([
      "identity.manage",
      "team.*",
      "entitlement.read",
      "admin.operate",
    ]).map((i) => i.id);
    expect(ids).toContain("teams");
    expect(ids).toContain("products");
    expect(ids).toContain("provisioning");
  });
});
