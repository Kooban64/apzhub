import { describe, expect, it } from "vitest";

import {
  createInMemoryCapabilityRegistration,
} from "@apzhub/integration-sdk/adapter";

import {
  createPlaneBootstrapConfiguration,
  getPlaneExtendedCapabilities,
  PLANE_EXTENDED_CAPABILITIES,
  PLANE_SDK_CAPABILITIES,
} from "./plane-bootstrap";
import { PLANE_INTEGRATION_ID } from "./plane-error-mapper";
import { DEFAULT_TEST_PLANE_CONFIG } from "./testing/mock-plane-api";

describe("Plane bootstrap configuration", () => {
  it("builds manifest and connection defaults", () => {
    const configuration = createPlaneBootstrapConfiguration({
      plane: DEFAULT_TEST_PLANE_CONFIG,
      tenantId: "tenant-1",
      connectionId: "plane-conn-1",
    });

    expect(configuration.manifest.integrationId).toBe(PLANE_INTEGRATION_ID);
    expect(configuration.manifest.declaredCapabilities).toEqual([...PLANE_SDK_CAPABILITIES]);
    expect(configuration.connection?.baseUrl).toBe(DEFAULT_TEST_PLANE_CONFIG.baseUrl);
    expect(configuration.connection?.credentialRef).toBe(DEFAULT_TEST_PLANE_CONFIG.apiTokenRef);
    expect(configuration.connection?.headerName).toBe("X-Api-Key");
    expect(configuration.connection?.metadata?.workspaceSlug).toBe("apzhub");
    expect(configuration.connection?.metadata?.extendedCapabilities).toBe(
      PLANE_EXTENDED_CAPABILITIES.join(","),
    );
  });

  it("registers SDK capabilities without structural changes for extensions", () => {
    const configuration = createPlaneBootstrapConfiguration({
      plane: DEFAULT_TEST_PLANE_CONFIG,
      tenantId: "tenant-1",
    });

    const registry = createInMemoryCapabilityRegistration();
    const registration = registry.register(configuration.manifest);

    expect(registration.ok).toBe(true);
    expect(registration.registeredCapabilities).toContain("projects");
    expect(registration.registeredCapabilities).toContain("health");

    const extended = getPlaneExtendedCapabilities(configuration);
    expect(extended).toEqual([...PLANE_EXTENDED_CAPABILITIES]);
    expect(extended).toContain("users");
    expect(extended).toContain("workspaces");
    expect(extended).toContain("members");
    expect(extended).toContain("project_states");
    expect(extended).toContain("tasks");
    expect(extended).toContain("issues");
  });
});
