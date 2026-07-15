/**
 * OSS-100-10 — Integration SDK v1.0 reference-adapter re-certification (governance).
 *
 * Exercises Plane/Zammad SDK harness wrappers, AdapterBoundaryValidator,
 * AdapterCompliance, and AdapterCertification with known-good metadata.
 * Does not bump package versions or alter adapter behaviour.
 */
import { describe, expect, it } from "vitest";

import {
  INTEGRATION_SDK_VERSION,
  INTEGRATION_SDK_PACKAGE,
} from "@apzhub/integration-sdk";
import {
  assessAdapterCompliance,
  certifyAdapter,
  scaffoldAdapter,
  validateAdapterBoundary,
} from "@apzhub/integration-sdk/harness";
import {
  certifyPlaneWithSdkHarness,
  createPlaneAdapterHarness,
  getPlaneHarnessMetadata,
  PLANE_CERTIFICATION_CAPABILITY_IDS,
} from "@apzhub/integration-plane";
import {
  certifyZammadWithSdkHarness,
  createZammadAdapterHarness,
  getZammadHarnessMetadata,
  ZAMMAD_CERTIFICATION_CAPABILITY_IDS,
} from "@apzhub/integration-zammad";

describe("OSS-100-10 Integration SDK v1.0 re-certification", () => {
  it("aligns INTEGRATION_SDK_VERSION with package 0.9.0 RC", () => {
    expect(INTEGRATION_SDK_PACKAGE).toBe("@apzhub/integration-sdk");
    expect(INTEGRATION_SDK_VERSION).toBe("0.9.0");
  });

  it("createPlaneAdapterHarness boots and cleans up", async () => {
    const harness = createPlaneAdapterHarness();
    await harness.boot();
    expect(harness.isBooted).toBe(true);
    expect(harness.getFixture("vendorId")).toBe("plane");
    await harness.cleanup();
  });

  it("certifyPlaneWithSdkHarness passes with capability count and zero architecture fails", () => {
    const result = certifyPlaneWithSdkHarness({
      serviceAvailable: (serviceId) =>
        serviceId !== "analytics" && serviceId !== "webhooks",
      providerReachable: true,
      authenticationValid: true,
    });

    expect(result.sdkCertification.overall).not.toBe("fail");
    expect(result.sdkCertification.vendorId).toBe("plane");
    expect(result.capabilityCertifications.length).toBe(
      PLANE_CERTIFICATION_CAPABILITY_IDS.length,
    );
    expect(PLANE_CERTIFICATION_CAPABILITY_IDS.length).toBe(15);

    const architecture = result.sdkCertification.categories.find(
      (c) => c.category === "Architecture",
    );
    expect(architecture?.outcome).not.toBe("fail");
    const archFails =
      architecture?.checks.filter((c) => c.outcome === "fail") ?? [];
    expect(archFails).toEqual([]);
  });

  it("createZammadAdapterHarness boots and cleans up", async () => {
    const harness = createZammadAdapterHarness();
    await harness.boot();
    expect(harness.isBooted).toBe(true);
    expect(harness.getFixture("vendorId")).toBe("zammad");
    await harness.cleanup();
  });

  it("certifyZammadWithSdkHarness passes with capability count and zero architecture fails", () => {
    const result = certifyZammadWithSdkHarness({
      serviceAvailable: () => true,
      providerReachable: true,
      authenticationValid: true,
    });

    expect(result.sdkCertification.overall).not.toBe("fail");
    expect(result.sdkCertification.vendorId).toBe("zammad");
    expect(result.capabilityCertifications.length).toBe(
      ZAMMAD_CERTIFICATION_CAPABILITY_IDS.length,
    );
    expect(ZAMMAD_CERTIFICATION_CAPABILITY_IDS.length).toBe(11);

    const architecture = result.sdkCertification.categories.find(
      (c) => c.category === "Architecture",
    );
    expect(architecture?.outcome).not.toBe("fail");
    const archFails =
      architecture?.checks.filter((c) => c.outcome === "fail") ?? [];
    expect(archFails).toEqual([]);
  });

  it("AdapterBoundaryValidator reports zero violations on clean files and fails sample forbidden imports", () => {
    const clean = validateAdapterBoundary({
      files: {
        "src/adapter.ts":
          'import { IntegrationAdapterBase } from "@apzhub/integration-sdk/adapter";\n',
        "src/client.ts":
          'import { createTransportClient } from "@apzhub/integration-sdk/transport";\n',
      },
    });
    expect(clean.overall).toBe("pass");
    expect(clean.violations).toEqual([]);

    const dirty = validateAdapterBoundary({
      files: {
        "src/bad.ts": 'import { x } from "@apzhub/platform-services";\n',
        "src/map.ts": "const store = EntityMappingStore;\n",
        "src/leak.ts":
          'import { PlaneAdapter } from "@apzhub/integration-plane";\n',
      },
    });
    expect(dirty.overall).toBe("fail");
    expect(dirty.violations.length).toBeGreaterThan(0);
  });

  it("AdapterCompliance / AdapterCertification succeed for known-good scaffold metadata", () => {
    const scaffold = scaffoldAdapter({
      vendorId: "certref",
      displayName: "Certification Reference",
    });
    const compliance = assessAdapterCompliance({
      structure: {
        vendorId: "certref",
        packageName: scaffold.packageName,
        version: "0.1.0",
        files: scaffold.files,
        declaredCapabilities: ["authentication", "health", "diagnostics"],
        dependencies: {
          "@apzhub/integration-sdk": "workspace:*",
        },
      },
    });
    expect(compliance.overall).not.toBe("fail");

    const meta = getPlaneHarnessMetadata();
    const planeCert = certifyAdapter(meta);
    expect(planeCert.overall).not.toBe("fail");
    expect(meta.adapterVersion).toBe("0.6.0");

    const zMeta = getZammadHarnessMetadata();
    const zammadCert = certifyAdapter(zMeta);
    expect(zammadCert.overall).not.toBe("fail");
    expect(zMeta.adapterVersion).toBe("0.6.0");
  });
});
