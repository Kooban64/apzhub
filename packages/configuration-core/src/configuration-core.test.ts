import { describe, expect, it } from "vitest";

import {
  asConfigurationId,
  asConfigurationKeyId,
  asConfigurationNamespaceId,
  asConfigurationValidationId,
  asConfigurationValueId,
  asConfigurationVersionId,
  type ConfigurationKey,
  type ConfigurationValidation,
  type ConfigurationValue,
  type ConfigurationVersion,
} from "@apzhub/configuration-contracts";

import {
  CONFIGURATION_CORE_VERSION,
  assertConfigurationLifecycleTransition,
  assertNoSecretPayload,
  assertValidHierarchyLevel,
  assertVersionImmutable,
  buildRollbackVersionMetadata,
  canInheritFrom,
  canTransitionConfigurationLifecycle,
  createConfigurationFoundation,
  listAllowedConfigurationLifecycleTransitions,
  nextVersionNumber,
  precedenceRankForHierarchyLevel,
  requireFound,
  selectCurrentVersion,
  sortOverridesByPrecedence,
  validateConfigurationAggregate,
  validateConfigurationKeyMetadata,
  validateValidationRuleMetadata,
  validateConfigurationValueMetadata,
  ConfigurationDomainError,
} from "./index";

describe("configuration-core", () => {
  it("exports core version", () => {
    expect(CONFIGURATION_CORE_VERSION).toBe("0.2.0");
  });

  it("enforces lifecycle transitions fail-closed", () => {
    expect(canTransitionConfigurationLifecycle("draft", "validated")).toBe(true);
    expect(canTransitionConfigurationLifecycle("draft", "published")).toBe(false);
    expect(listAllowedConfigurationLifecycleTransitions("published")).toEqual([
      "deprecated",
      "archived",
    ]);
    expect(() =>
      assertConfigurationLifecycleTransition("archived", "published"),
    ).toThrow(/Cannot transition/);
  });

  it("orders hierarchy precedence with user winning", () => {
    expect(precedenceRankForHierarchyLevel("user")).toBe(0);
    expect(precedenceRankForHierarchyLevel("platform")).toBe(5);
    expect(canInheritFrom("tenant", "platform")).toBe(true);
    expect(canInheritFrom("platform", "tenant")).toBe(false);
    expect(assertValidHierarchyLevel("organisation")).toBe("organisation");
    expect(() => assertValidHierarchyLevel("cluster")).toThrow(/Invalid hierarchy/);

    const sorted = sortOverridesByPrecedence([
      {
        id: "o2" as never,
        configurationId: asConfigurationId("cfg_1"),
        hierarchyLevel: "platform",
        scope: { kind: "global" },
        valueId: asConfigurationValueId("v1"),
        precedenceRank: 5,
        createdAt: "t",
        updatedAt: "t",
      },
      {
        id: "o1" as never,
        configurationId: asConfigurationId("cfg_1"),
        hierarchyLevel: "user",
        scope: { kind: "user", userId: "u1" },
        valueId: asConfigurationValueId("v2"),
        precedenceRank: 0,
        createdAt: "t",
        updatedAt: "t",
      },
    ]);
    expect(sorted[0]?.hierarchyLevel).toBe("user");
  });

  it("validates metadata without executing validators", () => {
    const key: ConfigurationKey = {
      id: asConfigurationKeyId("ck_1"),
      tenantId: "tenant_a",
      namespaceId: asConfigurationNamespaceId("ns_1"),
      key: "feature.maxRetries",
      displayName: "Max retries",
      valueKind: "number",
      createdAt: "t",
      updatedAt: "t",
    };
    validateConfigurationKeyMetadata(key);

    const rule: ConfigurationValidation = {
      id: asConfigurationValidationId("cv_1"),
      configurationKeyId: key.id,
      kind: "range",
      min: 1,
      max: 10,
      createdAt: "t",
      updatedAt: "t",
    };
    validateValidationRuleMetadata(rule);

    expect(() => validateValidationRuleMetadata({ ...rule, min: 20, max: 1 })).toThrow(
      /range/,
    );

    expect(() =>
      validateValidationRuleMetadata({
        ...rule,
        kind: "enum",
        enumValues: [],
      }),
    ).toThrow(/enum/);
    expect(() =>
      validateValidationRuleMetadata({
        ...rule,
        kind: "pattern",
        pattern: undefined,
      }),
    ).toThrow(/pattern/);
    expect(() =>
      validateValidationRuleMetadata({
        ...rule,
        kind: "custom",
        customValidatorKey: undefined,
      }),
    ).toThrow(/custom/);

    expect(() => assertNoSecretPayload("password=hunter2")).toThrow(/secret/);

    const value: ConfigurationValue = {
      id: asConfigurationValueId("val_1"),
      configurationId: asConfigurationId("cfg_1"),
      valueKind: "number",
      payload: "3",
      createdAt: "t",
      updatedAt: "t",
    };
    validateConfigurationValueMetadata(value, key);

    expect(() =>
      validateConfigurationKeyMetadata({
        ...key,
        key: "   ",
      }),
    ).toThrow(/non-empty/);
    expect(() =>
      validateConfigurationValueMetadata({ ...value, valueKind: "string" }, key),
    ).toThrow(/does not match/);
    expect(() =>
      validateConfigurationValueMetadata({ ...value, valueKind: "boolean" }, key),
    ).toThrow(/does not match/);
  });

  it("supports immutable versioning and rollback metadata", () => {
    const versions: ConfigurationVersion[] = [
      {
        id: asConfigurationVersionId("ver_1"),
        configurationId: asConfigurationId("cfg_1"),
        versionNumber: 1,
        immutable: true,
        isCurrent: false,
        createdAt: "t",
        createdBy: "u1",
      },
      {
        id: asConfigurationVersionId("ver_2"),
        configurationId: asConfigurationId("cfg_1"),
        versionNumber: 2,
        immutable: true,
        isCurrent: true,
        createdAt: "t",
        createdBy: "u1",
      },
    ];
    expect(nextVersionNumber(versions)).toBe(3);
    expect(selectCurrentVersion(versions)?.id).toBe("ver_2");

    const rollback = buildRollbackVersionMetadata({
      id: asConfigurationVersionId("ver_3"),
      configurationId: asConfigurationId("cfg_1"),
      fromVersion: versions[0]!,
      createdBy: "u1",
      createdAt: "t2",
      versionNumber: 3,
    });
    expect(rollback.rollbackFromVersionId).toBe("ver_1");
    expect(rollback.immutable).toBe(true);
  });

  it("requires explicit foundation repos", () => {
    expect(() =>
      createConfigurationFoundation({
        repos: null as never,
      }),
    ).toThrow(/explicit repos/);
  });

  it("requireFound and aggregate validation helpers", () => {
    expect(requireFound({ a: 1 }, "x", "1")).toEqual({ a: 1 });
    expect(() => requireFound(null, "x", "1")).toThrow(ConfigurationDomainError);
    validateConfigurationAggregate({
      id: asConfigurationId("cfg_1"),
      tenantId: "tenant_a",
      namespaceId: asConfigurationNamespaceId("ns_1"),
      keyId: asConfigurationKeyId("ck_1"),
      hierarchyLevel: "platform",
      scope: { kind: "global" },
      status: "draft",
      createdAt: "t",
      updatedAt: "t",
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    });
    expect(() =>
      validateConfigurationAggregate({
        id: asConfigurationId("cfg_1"),
        tenantId: "  ",
        namespaceId: asConfigurationNamespaceId("ns_1"),
        keyId: asConfigurationKeyId("ck_1"),
        hierarchyLevel: "platform",
        scope: { kind: "global" },
        status: "draft",
        createdAt: "t",
        updatedAt: "t",
        createdBy: "u",
        updatedBy: "u",
        revision: 1,
      }),
    ).toThrow(/tenantId/);

    assertVersionImmutable({
      id: asConfigurationVersionId("ver_1"),
      configurationId: asConfigurationId("cfg_1"),
      versionNumber: 1,
      immutable: true,
      isCurrent: true,
      createdAt: "t",
      createdBy: "u",
    });
    expect(() =>
      assertVersionImmutable({
        id: asConfigurationVersionId("ver_1"),
        configurationId: asConfigurationId("cfg_1"),
        versionNumber: 1,
        immutable: false,
        isCurrent: true,
        createdAt: "t",
        createdBy: "u",
      }),
    ).toThrow(/immutable/);
    expect(nextVersionNumber([])).toBe(1);
    expect(selectCurrentVersion([])).toBeNull();
  });
});
