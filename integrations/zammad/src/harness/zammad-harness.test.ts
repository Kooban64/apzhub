import { describe, expect, it } from "vitest";

import { certifyZammadCapabilities } from "../operations";
import {
  certifyZammadWithSdkHarness,
  createZammadAdapterHarness,
  getZammadHarnessMetadata,
} from "./zammad-harness";

describe("Zammad SDK harness adoption", () => {
  it("createZammadAdapterHarness boots without changing Zammad operations", async () => {
    const harness = createZammadAdapterHarness();
    await harness.boot();
    expect(harness.isBooted).toBe(true);
    expect(harness.getFixture("vendorId")).toBe("zammad");
    await harness.cleanup();
  });

  it("certifyZammadWithSdkHarness preserves certifyCapabilities results", () => {
    const serviceAvailable = () => true;

    const direct = certifyZammadCapabilities({
      serviceAvailable,
      providerReachable: true,
      authenticationValid: true,
    });

    const viaHarness = certifyZammadWithSdkHarness({
      serviceAvailable,
      providerReachable: true,
      authenticationValid: true,
    });

    expect(viaHarness.capabilityCertifications).toEqual(direct);
    expect(viaHarness.certifyCapabilities()).toEqual(direct);
    expect(viaHarness.sdkCertification.vendorId).toBe("zammad");
    expect(viaHarness.sdkCertification.overall).not.toBe("fail");
  });

  it("exposes Zammad harness metadata for SDK certification", () => {
    const meta = getZammadHarnessMetadata();
    expect(meta.packageName).toBe("@apzhub/integration-zammad");
    expect(meta.extendsAdapterBase).toBe(true);
    expect(meta.adapterVersion).toBe("0.8.0");
  });
});
