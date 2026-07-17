import { describe, expect, it } from "vitest";

import {
  asAdministrationCapabilityId,
  asAdministrationMetadataId,
  asAdministrationModuleId,
  asAdministrationNavigationId,
  type AdministrationCapability,
  type AdministrationModule,
  type AdministrationNavigation,
} from "@apzhub/admin-contracts";

import {
  ADMIN_CORE_VERSION,
  AdministrationDomainError,
  assertAdministrationLifecycleTransition,
  assertKnownModuleKey,
  assertNoSecretMetadataNotes,
  canTransitionAdministrationLifecycle,
  createAdministrationFoundation,
  getCanonicalAdministrationModuleRegistration,
  isCapabilityProductionReady,
  listAllowedAdministrationLifecycleTransitions,
  listCanonicalAdministrationModuleRegistrations,
  requireFound,
  summarizeCapabilityStatus,
  validateAdministrationAggregate,
  validateAdministrationCapabilityMetadata,
  validateAdministrationMetadataNotes,
  validateAdministrationModuleKey,
  validateAdministrationNavigationMetadata,
} from "./index";

describe("admin-core", () => {
  it("exports core version 0.2.0", () => {
    expect(ADMIN_CORE_VERSION).toBe("0.2.0");
  });

  it("enforces lifecycle transitions fail-closed", () => {
    expect(canTransitionAdministrationLifecycle("draft", "registered")).toBe(
      true,
    );
    expect(canTransitionAdministrationLifecycle("draft", "active")).toBe(false);
    expect(canTransitionAdministrationLifecycle("active", "active")).toBe(true);
    expect(listAllowedAdministrationLifecycleTransitions("active")).toEqual([
      "deprecated",
      "archived",
    ]);
    expect(() =>
      assertAdministrationLifecycleTransition("archived", "active"),
    ).toThrow(/Cannot transition/);
  });

  it("validates module, capability, navigation, and secret notes", () => {
    const module: AdministrationModule = {
      id: asAdministrationModuleId("mod_1"),
      tenantId: "tenant_a",
      key: "identity",
      name: "Identity",
      status: "draft",
      createdAt: "t",
      updatedAt: "t",
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };
    validateAdministrationModuleKey(module);
    validateAdministrationAggregate(module);

    expect(() =>
      validateAdministrationAggregate({ ...module, tenantId: "  " }),
    ).toThrow(/tenantId/);
    expect(() =>
      validateAdministrationModuleKey({
        ...module,
        key: "unknown" as never,
      }),
    ).toThrow(/Unknown administration module key/);

    const capability: AdministrationCapability = {
      id: asAdministrationCapabilityId("cap_1"),
      tenantId: "tenant_a",
      moduleId: module.id,
      key: "sso",
      name: "SSO",
      enabled: true,
      available: true,
      healthy: true,
      certified: true,
      productionReady: true,
      owner: "platform-identity",
      version: "1.0.0",
      createdAt: "t",
      updatedAt: "t",
    };
    validateAdministrationCapabilityMetadata(capability);
    expect(isCapabilityProductionReady(capability)).toBe(true);
    expect(summarizeCapabilityStatus(capability).ready).toBe(true);

    expect(() =>
      validateAdministrationCapabilityMetadata({ ...capability, key: "  " }),
    ).toThrow(/key/);
    expect(() =>
      validateAdministrationCapabilityMetadata({ ...capability, owner: "  " }),
    ).toThrow(/owner/);
    expect(() =>
      validateAdministrationCapabilityMetadata({ ...capability, version: "  " }),
    ).toThrow(/version/);
    expect(() =>
      validateAdministrationCapabilityMetadata({
        ...capability,
        productionReady: true,
        healthy: false,
      }),
    ).toThrow(/productionReady/);
    expect(
      isCapabilityProductionReady({
        ...capability,
        productionReady: true,
        healthy: false,
      }),
    ).toBe(false);
    expect(
      summarizeCapabilityStatus({
        ...capability,
        limitations: ["beta"],
        productionReady: false,
      }).limitationCount,
    ).toBe(1);

    const navigation: AdministrationNavigation = {
      id: asAdministrationNavigationId("nav_1"),
      tenantId: "tenant_a",
      moduleId: module.id,
      key: "identity.root",
      label: "Identity",
      ordering: 1,
      visibility: "permission-gated",
      permissionKeys: ["admin.navigation"],
      iconKey: "shield",
      routePath: "/admin/identity",
      createdAt: "t",
      updatedAt: "t",
    };
    validateAdministrationNavigationMetadata(navigation);
    expect(() =>
      validateAdministrationNavigationMetadata({
        ...navigation,
        key: " ",
      }),
    ).toThrow(/key and label/);
    expect(() =>
      validateAdministrationNavigationMetadata({
        ...navigation,
        visibility: "public" as never,
      }),
    ).toThrow(/visibility/);
    expect(() =>
      validateAdministrationNavigationMetadata({
        ...navigation,
        ordering: Number.NaN,
      }),
    ).toThrow(/ordering/);

    expect(() => assertNoSecretMetadataNotes("api_key=xyz")).toThrow(/secret/);
    validateAdministrationMetadataNotes({
      id: asAdministrationMetadataId("md_1"),
      moduleId: module.id,
      notes: "safe note",
    });
    expect(() =>
      validateAdministrationMetadataNotes({
        id: asAdministrationMetadataId("md_2"),
        moduleId: module.id,
        notes: "password=secret",
      }),
    ).toThrow(/secret/);
  });

  it("lists and resolves canonical registrations", () => {
    const list = listCanonicalAdministrationModuleRegistrations();
    expect(list).toHaveLength(12);
    expect(getCanonicalAdministrationModuleRegistration("projects")?.name).toBe(
      "Projects Administration",
    );
    expect(getCanonicalAdministrationModuleRegistration("future")).toBeTruthy();
    expect(assertKnownModuleKey("search")).toBe("search");
    expect(() => assertKnownModuleKey("nope")).toThrow(/Unknown/);
  });

  it("requires explicit foundation repos", () => {
    expect(() =>
      createAdministrationFoundation({
        repos: null as never,
      }),
    ).toThrow(/explicit repos/);
  });

  it("requireFound helper", () => {
    expect(requireFound({ a: 1 }, "x", "1")).toEqual({ a: 1 });
    expect(() => requireFound(null, "x", "1")).toThrow(
      AdministrationDomainError,
    );
  });
});
