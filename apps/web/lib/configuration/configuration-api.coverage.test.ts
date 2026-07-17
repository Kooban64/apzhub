/**
 * APZCONFIG-005 — certification-only facade coverage (no new functionality).
 */
import { afterEach, describe, expect, it } from "vitest";

import {
  approveConfiguration,
  archiveConfiguration,
  clearConfigurationQueries,
  createConfiguration,
  createConfigurationOverride,
  createConfigurationVersion,
  createMockConfigurationClient,
  deprecateConfiguration,
  getConfiguration,
  getConfigurationCapabilities,
  getConfigurationClient,
  getConfigurationDiagnostics,
  getConfigurationHealth,
  getConfigurationNamespace,
  getConfigurationReadiness,
  getConfigurationReference,
  getConfigurationScope,
  listConfigurationAudit,
  listConfigurationGroups,
  listConfigurationNamespaces,
  listConfigurationOverrides,
  listConfigurationReferences,
  listConfigurations,
  listConfigurationScopes,
  listConfigurationValidationRules,
  listConfigurationVersions,
  publishConfiguration,
  publishConfigurationVersion,
  resetConfigurationClient,
  restoreConfiguration,
  setConfigurationClient,
  transitionConfiguration,
  updateConfiguration,
  updateConfigurationOverride,
  validateConfiguration,
  validateConfigurationMetadata,
  ConfigurationClientError,
  toConfigurationUserMessage,
  configurationQueryKeys,
} from "./index";
import { QueryClient } from "@tanstack/react-query";

describe("APZCONFIG-005 configuration-api facade coverage", () => {
  afterEach(() => {
    resetConfigurationClient();
  });

  it("exercises every production facade through the mock client", async () => {
    setConfigurationClient(createMockConfigurationClient());
    expect(getConfigurationClient()).toBeTruthy();

    expect((await listConfigurations({ status: "draft", limit: 10 })).items.length).toBeGreaterThan(0);
    expect((await getConfiguration("cfg_mock_1")).id).toBe("cfg_mock_1");
    expect(
      (
        await createConfiguration({
          namespaceKey: "platform",
          key: "k",
          displayName: "D",
          valueKind: "string",
          hierarchyLevel: "tenant",
          scope: { kind: "tenant", tenantId: "tenant_mock" },
        })
      ).id,
    ).toBe("cfg_new");
    expect((await updateConfiguration("cfg_mock_1", { revision: 1 })).revision).toBeGreaterThan(0);
    expect((await archiveConfiguration("cfg_mock_1")).status).toBe("archived");
    expect((await restoreConfiguration("cfg_mock_1")).status).toBe("draft");
    expect((await transitionConfiguration("cfg_mock_1", { to: "validated" })).status).toBe(
      "validated",
    );
    expect((await validateConfiguration("cfg_mock_1")).valid).toBe(true);
    expect((await approveConfiguration("cfg_mock_1")).status).toBe("approved");
    expect((await publishConfiguration("cfg_mock_1")).status).toBe("published");
    expect((await deprecateConfiguration("cfg_mock_1")).status).toBe("deprecated");

    expect((await listConfigurationNamespaces()).items[0]?.id).toBe("ns_mock");
    expect((await getConfigurationNamespace("ns_mock")).key).toBe("platform");
    expect((await listConfigurationGroups()).items[0]?.id).toBe("grp_mock");
    expect((await listConfigurationVersions("cfg_mock_1")).items[0]?.immutable).toBe(true);
    expect(
      (
        await createConfigurationVersion("cfg_mock_1", {
          valueKind: "string",
          payload: '"x"',
        })
      ).id,
    ).toBe("ver_new");
    expect((await publishConfigurationVersion("cfg_mock_1", "ver_mock")).isCurrent).toBe(true);

    expect((await listConfigurationOverrides("cfg_mock_1")).items[0]?.id).toBe("ovr_mock");
    expect(
      (
        await createConfigurationOverride({
          configurationId: "cfg_mock_1",
          hierarchyLevel: "tenant",
          scope: { kind: "tenant", tenantId: "tenant_mock" },
          valueKind: "string",
          payload: '"x"',
        })
      ).id,
    ).toBe("ovr_new");
    expect((await updateConfigurationOverride("ovr_mock", { payload: '"y"' })).id).toBe(
      "ovr_mock",
    );

    expect((await listConfigurationScopes()).items.length).toBeGreaterThan(0);
    expect((await getConfigurationScope("cfg_mock_1")).scopeKind).toBe("tenant");
    expect((await listConfigurationValidationRules()).items[0]?.kind).toBe("string");
    expect(
      (
        await validateConfigurationMetadata({
          hierarchyLevel: "tenant",
          scope: { kind: "tenant", tenantId: "tenant_mock" },
        })
      ).valid,
    ).toBe(true);
    expect((await listConfigurationReferences("cfg_mock_1")).items[0]?.id).toBe("ref_mock");
    expect((await getConfigurationReference("ref_mock")).kind).toBe("projects");
    expect((await listConfigurationAudit()).items.length).toBeGreaterThan(0);
    expect((await listConfigurationAudit("cfg_mock_1")).items.length).toBeGreaterThan(0);
    expect((await getConfigurationCapabilities()).runtimeResolutionReady).toBe(false);
    expect(await getConfigurationHealth()).toBeTruthy();
    expect(await getConfigurationReadiness()).toBeTruthy();
    expect(await getConfigurationDiagnostics()).toBeTruthy();
  });

  it("covers query-key helpers and error helpers", () => {
    expect(configurationQueryKeys.namespaces.detail("ns_1")[3]).toBe("ns_1");
    expect(configurationQueryKeys.groups.detail("grp_1")[3]).toBe("grp_1");
    expect(configurationQueryKeys.scopes.detail("cfg_1")[3]).toBe("cfg_1");
    expect(configurationQueryKeys.audit.configuration("cfg_1")[2]).toBe("cfg_1");
    expect(configurationQueryKeys.health()[1]).toBe("health");
    expect(configurationQueryKeys.readiness()[1]).toBe("readiness");
    expect(configurationQueryKeys.diagnostics()[1]).toBe("diagnostics");
    clearConfigurationQueries(new QueryClient());

    const err = new ConfigurationClientError({
      message: "x",
      code: "Y",
      status: 400,
    });
    expect(toConfigurationUserMessage(err)).toBe("x");
    expect(toConfigurationUserMessage(new Error("z"))).toBe("z");
    expect(toConfigurationUserMessage("plain")).toBe("Configuration request failed");
  });
});
