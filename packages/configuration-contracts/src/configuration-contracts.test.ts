import { describe, expect, it } from "vitest";

import {
  CONFIGURATION_CONTRACTS_VERSION,
  CONFIGURATION_HIERARCHY_LEVELS,
  CONFIGURATION_LIFECYCLE_STATUSES,
  CONFIGURATION_OVERRIDE_PRECEDENCE,
  CONFIGURATION_VALIDATION_KINDS,
  PLATFORM_CONFIGURATION_PERMISSIONS,
  asConfigurationId,
  hasConfigurationPermission,
  isConfigurationLifecycleStatus,
  isPlatformConfigurationIdShape,
  isPlatformConfigurationPermission,
} from "./index";

describe("configuration-contracts", () => {
  it("exports version 0.2.0", () => {
    expect(CONFIGURATION_CONTRACTS_VERSION).toBe("0.2.0");
  });

  it("exposes full permission catalogue", () => {
    expect(PLATFORM_CONFIGURATION_PERMISSIONS).toEqual([
      "configuration.*",
      "configuration.read",
      "configuration.manage",
      "configuration.version",
      "configuration.validation",
      "configuration.audit",
    ]);
    expect(isPlatformConfigurationPermission("configuration.read")).toBe(true);
    expect(isPlatformConfigurationPermission("configuration.secret")).toBe(false);
  });

  it("evaluates permission wildcards", () => {
    expect(hasConfigurationPermission(["configuration.*"], "audit")).toBe(true);
    expect(hasConfigurationPermission(["configuration.read"], "manage")).toBe(false);
    expect(hasConfigurationPermission(["configuration.manage"], "manage")).toBe(true);
  });

  it("validates lifecycle and hierarchy catalogues", () => {
    expect(CONFIGURATION_LIFECYCLE_STATUSES).toContain("published");
    expect(isConfigurationLifecycleStatus("draft")).toBe(true);
    expect(isConfigurationLifecycleStatus("live")).toBe(false);
    expect(CONFIGURATION_HIERARCHY_LEVELS[0]).toBe("platform");
    expect(CONFIGURATION_OVERRIDE_PRECEDENCE[0]).toBe("user");
    expect(CONFIGURATION_VALIDATION_KINDS).toContain("custom");
  });

  it("brands valid identifiers and rejects invalid shapes", () => {
    expect(isPlatformConfigurationIdShape("cfg_1")).toBe(true);
    expect(asConfigurationId("cfg_1")).toBe("cfg_1");
    expect(() => asConfigurationId("!")).toThrow(/Invalid/);
  });

  it("covers remaining identifier and enum type guards", async () => {
    const {
      asConfigurationMetadataId,
      asConfigurationValueId,
      asConfigurationKeyId,
      asConfigurationNamespaceId,
      asConfigurationGroupId,
      asConfigurationVersionId,
      asConfigurationOverrideId,
      asConfigurationValidationId,
      asConfigurationAuditId,
      asConfigurationHistoryId,
      asConfigurationReferenceId,
      isConfigurationHierarchyLevel,
      isConfigurationScopeKind,
      isConfigurationValidationKind,
      isConfigurationValueKind,
      isConfigurationReferenceKind,
    } = await import("./index");
    expect(asConfigurationMetadataId("md_1")).toBe("md_1");
    expect(asConfigurationValueId("v1")).toBe("v1");
    expect(asConfigurationKeyId("k1")).toBe("k1");
    expect(asConfigurationNamespaceId("n1")).toBe("n1");
    expect(asConfigurationGroupId("g1")).toBe("g1");
    expect(asConfigurationVersionId("ver1")).toBe("ver1");
    expect(asConfigurationOverrideId("o1")).toBe("o1");
    expect(asConfigurationValidationId("vld1")).toBe("vld1");
    expect(asConfigurationAuditId("a1")).toBe("a1");
    expect(asConfigurationHistoryId("h1")).toBe("h1");
    expect(asConfigurationReferenceId("r1")).toBe("r1");
    expect(isConfigurationHierarchyLevel("tenant")).toBe(true);
    expect(isConfigurationScopeKind("global")).toBe(true);
    expect(isConfigurationValidationKind("json")).toBe(true);
    expect(isConfigurationValueKind("object")).toBe(true);
    expect(isConfigurationReferenceKind("notifications")).toBe(true);
    expect(isConfigurationReferenceKind("nope")).toBe(false);
  });
});
