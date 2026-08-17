import { describe, expect, it } from "vitest";

import { FORBIDDEN_PROVIDER_LEAKS } from "./product-labels";
import { ORG_ADMIN_SURFACE_PERMISSIONS } from "./permissions";
import { filterOrganisationAdminNav, ORGANISATION_ADMIN_NAV } from "./nav";
import { TENANT_BUSINESS_INTEGRATION_CATALOGUE } from "./build-integrations";

describe("organisation-admin block 3 contracts", () => {
  it("marks all Tenant Admin nav items implemented", () => {
    const deferred = ORGANISATION_ADMIN_NAV.filter((i) => !i.implemented);
    expect(deferred).toEqual([]);
    expect(ORGANISATION_ADMIN_NAV.map((i) => i.id)).toEqual([
      "home",
      "people",
      "teams",
      "roles",
      "products",
      "provisioning",
      "workspace-settings",
      "integrations",
      "security",
      "audit",
      "help",
      "settings",
    ]);
  });

  it("uses surface-specific permissions for Block 3 (not identity.manage-only)", () => {
    expect([...ORG_ADMIN_SURFACE_PERMISSIONS.workspaceSettings]).toContain(
      "admin.operate",
    );
    expect([...ORG_ADMIN_SURFACE_PERMISSIONS.workspaceSettings]).not.toContain(
      "workspace.*",
    );
    expect([...ORG_ADMIN_SURFACE_PERMISSIONS.integrations]).toContain("admin.operate");
    expect([...ORG_ADMIN_SURFACE_PERMISSIONS.security]).toContain("admin.read");
    expect([...ORG_ADMIN_SURFACE_PERMISSIONS.audit]).toContain("admin.read");
    expect([...ORG_ADMIN_SURFACE_PERMISSIONS.settings]).toContain("admin.operate");
  });

  it("help is visible to all gated org-admin users", () => {
    expect([...ORG_ADMIN_SURFACE_PERMISSIONS.help]).toEqual([]);
    const ids = filterOrganisationAdminNav(["identity.manage"]).map((i) => i.id);
    expect(ids).toContain("help");
  });

  it("business integrations catalogue excludes engine providers", () => {
    const blob = TENANT_BUSINESS_INTEGRATION_CATALOGUE.map(
      (i) => `${i.name} ${i.description} ${i.id}`,
    ).join(" ");
    for (const leak of FORBIDDEN_PROVIDER_LEAKS) {
      expect(blob.toLowerCase().includes(leak.toLowerCase())).toBe(false);
    }
    expect(
      TENANT_BUSINESS_INTEGRATION_CATALOGUE.every((i) => i.status === "not_configured"),
    ).toBe(true);
  });

  it("nav display merge is not authority — APIs still require surface keys", () => {
    // Documented contract: truncated home-context may omit surface keys;
    // gate may restore them for menu only. Products still need entitlement.read.
    const displayOnly = filterOrganisationAdminNav([
      "identity.manage",
      "entitlement.read",
      "team.*",
      "admin.operate",
      "admin.read",
      "workspace.*",
    ]).map((i) => i.id);
    expect(displayOnly).toContain("workspace-settings");
    expect(displayOnly).toContain("integrations");
    expect(displayOnly).toContain("security");
    expect(displayOnly).toContain("audit");
    expect(displayOnly).toContain("settings");
  });

  it("documents that APIs require identity.manage gate before surface keys", () => {
    // Ordinary users may hold workspace.* / tenant.* for product work.
    // Organisation Admin APIs must not treat those as Tenant Admin authority.
    expect(ORG_ADMIN_SURFACE_PERMISSIONS.workspaceSettings).not.toContain(
      "workspace.*",
    );
  });
});
