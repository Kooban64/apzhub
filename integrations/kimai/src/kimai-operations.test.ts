import { describe, expect, it } from "vitest";

import {
  buildKimaiCompatibilityMatrix,
  classifyKimaiOperationalHealth,
  detectKimaiFeatures,
  evaluateKimaiReadiness,
  certifyKimaiCapabilities,
  mapOperationalHealthToSdkStatus,
} from "./operations";

describe("kimai operations", () => {
  it("classifies healthy and unavailable states", () => {
    expect(
      classifyKimaiOperationalHealth({
        apiStatus: "reachable",
        authenticationStatus: "valid",
        compatibilityStatus: "compatible",
      }).level,
    ).toBe("HEALTHY");

    expect(
      classifyKimaiOperationalHealth({
        apiStatus: "unavailable",
        authenticationStatus: "invalid",
      }).level,
    ).toBe("UNAVAILABLE");

    expect(mapOperationalHealthToSdkStatus("DEGRADED")).toBe("degraded");
  });

  it("builds compatibility matrix for detected versions", () => {
    const compatible = buildKimaiCompatibilityMatrix({
      detectedKimaiVersion: "2.24.0",
    });
    expect(compatible.compatibilityStatus).toBe("compatible");
    expect(compatible.edition).toBe("community");

    const incompatible = buildKimaiCompatibilityMatrix({
      detectedKimaiVersion: "1.0.0",
    });
    expect(incompatible.compatibilityStatus).toBe("incompatible");
  });

  it("detects foundation features without throwing", () => {
    const features = detectKimaiFeatures({
      checkedAt: "2026-07-19T00:00:00.000Z",
      pingSucceeded: true,
      versionSucceeded: false,
      detectedVersion: undefined,
    });
    expect(features.pingAvailable).toBe(true);
    expect(features.versionAvailable).toBe(false);
    expect(features.unsupportedEndpoints).toContain("/api/version");
  });

  it("evaluates readiness with required checks", () => {
    const certifications = certifyKimaiCapabilities({
      providerReachable: true,
      authenticationValid: true,
    });
    const readiness = evaluateKimaiReadiness({
      checkedAt: "2026-07-19T00:00:00.000Z",
      configurationValidation: { ok: true, message: "ok" },
      authenticationValid: true,
      providerReachable: true,
      capabilitiesRegistered: true,
      registeredCapabilityCount: certifications.length,
      compatibility: buildKimaiCompatibilityMatrix({
        detectedKimaiVersion: "2.24.0",
      }),
      metricsAvailable: true,
      loggerAvailable: true,
      capabilities: certifications,
      circuitBreakerOpen: false,
    });
    expect(readiness.ready).toBe(true);
    expect(readiness.classification).toBe("ready");
  });
});
