import { describe, expect, it } from "vitest";

import { certifyPlaneCapabilities } from "../operations";
import {
  certifyPlaneWithSdkHarness,
  createPlaneAdapterHarness,
  getPlaneHarnessMetadata,
} from "./plane-harness";

describe("Plane SDK harness adoption", () => {
  it("createPlaneAdapterHarness boots without changing Plane operations", async () => {
    const harness = createPlaneAdapterHarness();
    await harness.boot();
    expect(harness.isBooted).toBe(true);
    expect(harness.getFixture("vendorId")).toBe("plane");
    await harness.cleanup();
  });

  it("certifyPlaneWithSdkHarness preserves certifyCapabilities results", () => {
    const serviceAvailable = (serviceId: string) =>
      serviceId !== "analytics" && serviceId !== "webhooks";

    const direct = certifyPlaneCapabilities({
      serviceAvailable,
      providerReachable: true,
      authenticationValid: true,
    });

    const viaHarness = certifyPlaneWithSdkHarness({
      serviceAvailable,
      providerReachable: true,
      authenticationValid: true,
    });

    expect(viaHarness.capabilityCertifications).toEqual(direct);
    expect(viaHarness.certifyCapabilities()).toEqual(direct);
    expect(viaHarness.sdkCertification.vendorId).toBe("plane");
    expect(viaHarness.sdkCertification.overall).not.toBe("fail");
  });

  it("exposes Plane harness metadata for SDK certification", () => {
    const meta = getPlaneHarnessMetadata();
    expect(meta.packageName).toBe("@apzhub/integration-plane");
    expect(meta.extendsAdapterBase).toBe(true);
    expect(meta.adapterVersion).toBe("0.6.0");
  });
});
