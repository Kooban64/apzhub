import { describe, expect, it } from "vitest";

import {
  ADMIN_CONTRACTS_VERSION,
  ADMINISTRATION_ACTION_KINDS,
  ADMINISTRATION_AUDIT_ACTIONS,
  ADMINISTRATION_DIAGNOSTIC_SEVERITY,
  ADMINISTRATION_LIFECYCLE_STATUSES,
  ADMINISTRATION_MODULE_KEYS,
  ADMINISTRATION_NAVIGATION_VISIBILITY,
  ADMINISTRATION_POLICY_KINDS,
  ADMINISTRATION_REFERENCE_KINDS,
  ADMINISTRATION_WIDGET_KINDS,
  CANONICAL_ADMINISTRATION_MODULE_REGISTRATIONS,
  PLATFORM_ADMIN_PERMISSIONS,
  asAdministrationModuleId,
  hasAdminPermission,
  isAdministrationActionKind,
  isAdministrationAuditAction,
  isAdministrationDiagnosticSeverity,
  isAdministrationLifecycleStatus,
  isAdministrationModuleKey,
  isAdministrationNavigationVisibility,
  isAdministrationPolicyKind,
  isAdministrationReferenceKind,
  isAdministrationWidgetKind,
  isPlatformAdminIdShape,
  isPlatformAdminPermission,
} from "./index";

describe("admin-contracts", () => {
  it("exports version 0.2.0", () => {
    expect(ADMIN_CONTRACTS_VERSION).toBe("0.2.0");
  });

  it("exposes full permission catalogue", () => {
    expect(PLATFORM_ADMIN_PERMISSIONS).toEqual([
      "admin.*",
      "admin.read",
      "admin.manage",
      "admin.audit",
      "admin.policy",
      "admin.diagnostics",
      "admin.navigation",
      "admin.registration",
    ]);
    expect(isPlatformAdminPermission("admin.read")).toBe(true);
    expect(isPlatformAdminPermission("admin.secret")).toBe(false);
  });

  it("evaluates permission wildcards", () => {
    expect(hasAdminPermission(["admin.*"], "audit")).toBe(true);
    expect(hasAdminPermission(["admin.read"], "manage")).toBe(false);
    expect(hasAdminPermission(["admin.manage"], "manage")).toBe(true);
  });

  it("validates enum catalogues and type guards", () => {
    expect(ADMINISTRATION_MODULE_KEYS).toHaveLength(12);
    expect(isAdministrationModuleKey("identity")).toBe(true);
    expect(isAdministrationModuleKey("unknown")).toBe(false);
    expect(ADMINISTRATION_LIFECYCLE_STATUSES).toContain("registered");
    expect(isAdministrationLifecycleStatus("draft")).toBe(true);
    expect(isAdministrationLifecycleStatus("live")).toBe(false);
    expect(ADMINISTRATION_ACTION_KINDS).toContain("diagnose");
    expect(isAdministrationActionKind("view")).toBe(true);
    expect(isAdministrationActionKind("run")).toBe(false);
    expect(ADMINISTRATION_NAVIGATION_VISIBILITY).toContain("permission-gated");
    expect(isAdministrationNavigationVisibility("hidden")).toBe(true);
    expect(isAdministrationNavigationVisibility("public")).toBe(false);
    expect(ADMINISTRATION_DIAGNOSTIC_SEVERITY).toContain("critical");
    expect(isAdministrationDiagnosticSeverity("warning")).toBe(true);
    expect(isAdministrationDiagnosticSeverity("fatal")).toBe(false);
    expect(ADMINISTRATION_REFERENCE_KINDS).toContain("documentation");
    expect(isAdministrationReferenceKind("module")).toBe(true);
    expect(isAdministrationReferenceKind("engine")).toBe(false);
    expect(ADMINISTRATION_POLICY_KINDS).toContain("retention");
    expect(isAdministrationPolicyKind("access")).toBe(true);
    expect(isAdministrationPolicyKind("quota")).toBe(false);
    expect(ADMINISTRATION_WIDGET_KINDS).toContain("metric");
    expect(isAdministrationWidgetKind("card")).toBe(true);
    expect(isAdministrationWidgetKind("iframe")).toBe(false);
    expect(ADMINISTRATION_AUDIT_ACTIONS).toContain("policy_attached");
    expect(isAdministrationAuditAction("created")).toBe(true);
    expect(isAdministrationAuditAction("deleted")).toBe(false);
  });

  it("brands valid identifiers and rejects invalid shapes", () => {
    expect(isPlatformAdminIdShape("adm_1")).toBe(true);
    expect(asAdministrationModuleId("adm_1")).toBe("adm_1");
    expect(() => asAdministrationModuleId("!")).toThrow(/Invalid/);
  });

  it("covers remaining identifier helpers", async () => {
    const {
      asAdministrationCategoryId,
      asAdministrationSectionId,
      asAdministrationActionId,
      asAdministrationPermissionId,
      asAdministrationAuditId,
      asAdministrationHistoryId,
      asAdministrationDiagnosticId,
      asAdministrationRegistrationId,
      asAdministrationMetadataId,
      asAdministrationPolicyId,
      asAdministrationReferenceId,
      asAdministrationCapabilityId,
      asAdministrationNavigationId,
      asAdministrationShortcutId,
      asAdministrationDashboardId,
      asAdministrationWidgetId,
    } = await import("./index");
    expect(asAdministrationCategoryId("c1")).toBe("c1");
    expect(asAdministrationSectionId("s1")).toBe("s1");
    expect(asAdministrationActionId("a1")).toBe("a1");
    expect(asAdministrationPermissionId("p1")).toBe("p1");
    expect(asAdministrationAuditId("aud1")).toBe("aud1");
    expect(asAdministrationHistoryId("h1")).toBe("h1");
    expect(asAdministrationDiagnosticId("d1")).toBe("d1");
    expect(asAdministrationRegistrationId("r1")).toBe("r1");
    expect(asAdministrationMetadataId("m1")).toBe("m1");
    expect(asAdministrationPolicyId("pol1")).toBe("pol1");
    expect(asAdministrationReferenceId("ref1")).toBe("ref1");
    expect(asAdministrationCapabilityId("cap1")).toBe("cap1");
    expect(asAdministrationNavigationId("nav1")).toBe("nav1");
    expect(asAdministrationShortcutId("sh1")).toBe("sh1");
    expect(asAdministrationDashboardId("dash1")).toBe("dash1");
    expect(asAdministrationWidgetId("w1")).toBe("w1");
  });

  it("exposes canonical registrations for all twelve modules", () => {
    expect(CANONICAL_ADMINISTRATION_MODULE_REGISTRATIONS).toHaveLength(12);
    const keys = CANONICAL_ADMINISTRATION_MODULE_REGISTRATIONS.map((r) => r.key);
    expect(keys).toEqual([...ADMINISTRATION_MODULE_KEYS]);
    for (const reg of CANONICAL_ADMINISTRATION_MODULE_REGISTRATIONS) {
      expect(reg.defaultStatus).toBe("registered");
      expect(reg.version).toBe("0.1.0");
      expect(reg.name.length).toBeGreaterThan(0);
    }
  });
});
