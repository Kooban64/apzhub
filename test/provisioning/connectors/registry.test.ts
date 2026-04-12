import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getConnectorForService,
  getProvisioningConnectorProfile,
  listConnectors,
} from "@/lib/provisioning/connectors/registry";

describe("connector registry", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("defaults to mock profile with distinct mail and calendar connector ids", () => {
    expect(getProvisioningConnectorProfile()).toBe("mock");
    const mail = getConnectorForService("mail");
    const cal = getConnectorForService("calendar");
    expect(mail.connectorId).toBe("mock.mail.v1");
    expect(cal.connectorId).toBe("mock.calendar.v1");
    expect(listConnectors().map((c) => c.connectorId)).toEqual(
      expect.arrayContaining(["mock.mail.v1", "mock.calendar.v1", "mock.fallback.v1"]),
    );
  });

  it("simulated profile uses mail.simulated and calendar.simulated", () => {
    vi.stubEnv("APZHUB_PROVISIONING_CONNECTOR_PROFILE", "simulated");
    expect(getProvisioningConnectorProfile()).toBe("simulated");
    expect(getConnectorForService("mail").connectorId).toBe("mail.simulated.v1");
    expect(getConnectorForService("calendar").connectorId).toBe("calendar.simulated.v1");
    expect(getConnectorForService("drive").connectorId).toBe("mock.fallback.v1");
  });

  it("vendor_dry_run profile registers explicit vendor connectors", () => {
    vi.stubEnv("APZHUB_PROVISIONING_CONNECTOR_PROFILE", "vendor_dry_run");
    expect(getProvisioningConnectorProfile()).toBe("vendor_dry_run");
    expect(getConnectorForService("paperless").connectorId).toBe("dry-run.paperless.v1");
    expect(getConnectorForService("mail").connectorId).toBe("dry-run.mail.v1");
    expect(listConnectors().some((c) => c.connectorId === "dry-run.n8n.v1")).toBe(true);
  });
});
