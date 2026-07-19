import { describe, expect, it } from "vitest";

import {
  createKimaiBootstrapConfiguration,
  KIMAI_SDK_CAPABILITIES,
  KIMAI_EXTENDED_CAPABILITIES,
} from "./kimai-bootstrap";
import { DEFAULT_TEST_KIMAI_CONFIG } from "./testing/mock-kimai-api";

describe("kimai-bootstrap", () => {
  it("builds bootstrap configuration with SDK and extended capabilities", () => {
    const configuration = createKimaiBootstrapConfiguration({
      tenantId: "tenant-a",
      kimai: DEFAULT_TEST_KIMAI_CONFIG,
    });

    expect(configuration.manifest.integrationId).toBe("kimai");
    expect(configuration.manifest.adapterId).toBe("kimai-adapter");
    expect(configuration.manifest.declaredCapabilities).toEqual([
      ...KIMAI_SDK_CAPABILITIES,
    ]);
    expect(configuration.connection).toBeDefined();
    expect(configuration.connection?.authenticationMode).toBe("bearer");
    expect(configuration.connection?.metadata?.foundationOnly).toBe("true");
    expect(configuration.connection?.metadata?.extendedCapabilities).toContain(
      KIMAI_EXTENDED_CAPABILITIES[0],
    );
  });

  it("maps legacy_headers to api_key_header mode", () => {
    const configuration = createKimaiBootstrapConfiguration({
      tenantId: "tenant-a",
      kimai: {
        authMode: "legacy_headers",
        apiUserRef: "secret://user",
        apiPasswordRef: "secret://pass",
        baseUrl: "https://kimai.example.test",
      },
    });
    expect(configuration.connection?.authenticationMode).toBe("api_key_header");
    expect(configuration.connection?.headerName).toBe("X-AUTH-TOKEN");
  });
});
