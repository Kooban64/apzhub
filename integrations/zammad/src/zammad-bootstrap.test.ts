import { describe, expect, it } from "vitest";

import { createInMemoryCapabilityRegistration } from "@apzhub/integration-sdk/adapter";

import {
  createZammadBootstrapConfiguration,
  getZammadExtendedCapabilities,
  ZAMMAD_EXTENDED_CAPABILITIES,
  ZAMMAD_SDK_CAPABILITIES,
} from "./zammad-bootstrap";
import { ZAMMAD_INTEGRATION_ID } from "./zammad-error-mapper";
import { DEFAULT_TEST_ZAMMAD_CONFIG } from "./testing/mock-zammad-api";

describe("Zammad bootstrap configuration", () => {
  it("builds manifest and connection defaults", () => {
    const configuration = createZammadBootstrapConfiguration({
      zammad: DEFAULT_TEST_ZAMMAD_CONFIG,
      tenantId: "tenant-1",
      connectionId: "zammad-conn-1",
    });

    expect(configuration.manifest.integrationId).toBe(ZAMMAD_INTEGRATION_ID);
    expect(configuration.manifest.declaredCapabilities).toEqual([
      ...ZAMMAD_SDK_CAPABILITIES,
    ]);
    expect(configuration.connection?.baseUrl).toBe(DEFAULT_TEST_ZAMMAD_CONFIG.baseUrl);
    expect(configuration.connection?.credentialRef).toBe(
      DEFAULT_TEST_ZAMMAD_CONFIG.apiTokenRef,
    );
    expect(configuration.connection?.authenticationMode).toBe("api_token");
    expect(configuration.connection?.metadata?.edition).toBe("community");
    expect(configuration.connection?.metadata?.engineVersionMin).toBe("6.3.0");
    expect(configuration.connection?.metadata?.engineVersionMax).toBe("6.5.x");
    expect(configuration.connection?.metadata?.extendedCapabilities).toBe(
      ZAMMAD_EXTENDED_CAPABILITIES.join(","),
    );
    expect(configuration.zammad.oauth.enabled).toBe(false);
  });

  it("registers SDK capabilities and exposes extended placeholders", () => {
    const configuration = createZammadBootstrapConfiguration({
      zammad: DEFAULT_TEST_ZAMMAD_CONFIG,
      tenantId: "tenant-1",
    });

    const registry = createInMemoryCapabilityRegistration();
    const registration = registry.register(configuration.manifest);

    expect(registration.ok).toBe(true);
    expect(registration.registeredCapabilities).toContain("tickets");
    expect(registration.registeredCapabilities).toContain("health");
    expect(registration.registeredCapabilities).toContain("search");
    expect(registration.registeredCapabilities).toContain("analytics");

    const extended = getZammadExtendedCapabilities(configuration);
    expect(extended).toEqual([...ZAMMAD_EXTENDED_CAPABILITIES]);
    expect(extended).toContain("support");
    expect(extended).toContain("organizations");
    expect(extended).toContain("webhooks");
  });
});
