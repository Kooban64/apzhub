import { describe, expect, it } from "vitest";

import {
  PLANE_SUPPORTED_VERSION_RANGE,
  getPlaneConfigurationDiagnostics,
} from "./plane-config-diagnostics";
import { validatePlaneIntegrationConfig } from "./plane-integration-validation";

describe("validatePlaneIntegrationConfig", () => {
  it("passes when integration is disabled", () => {
    const issues = validatePlaneIntegrationConfig({
      PLANE_INTEGRATION_ENABLED: false,
    });
    expect(issues.every((issue) => issue.severity !== "fail")).toBe(true);
  });

  it("requires connection settings when integration is enabled", () => {
    const issues = validatePlaneIntegrationConfig({
      PLANE_INTEGRATION_ENABLED: true,
    });
    expect(issues.some((issue) => issue.severity === "fail")).toBe(true);
  });

  it("passes when required fields are present", () => {
    const issues = validatePlaneIntegrationConfig({
      PLANE_INTEGRATION_ENABLED: true,
      PLANE_BASE_URL: "http://localhost:18085",
      PLANE_API_BASE_URL: "http://localhost:18085/api",
      PLANE_API_TOKEN: "plane-dev-token-min-16",
    });
    expect(issues.every((issue) => issue.severity !== "fail")).toBe(true);
  });
});

describe("getPlaneConfigurationDiagnostics", () => {
  it("reports disabled when integration flag is false", () => {
    const diagnostics = getPlaneConfigurationDiagnostics({
      PLANE_INTEGRATION_ENABLED: "false",
    });
    expect(diagnostics.integrationEnabled).toBe(false);
    expect(diagnostics.healthStatus).toBe("disabled");
  });

  it("reports misconfigured when enabled without token", () => {
    const diagnostics = getPlaneConfigurationDiagnostics({
      PLANE_INTEGRATION_ENABLED: "true",
      PLANE_BASE_URL: "http://localhost:18085",
      PLANE_API_BASE_URL: "http://localhost:18085/api",
    });
    expect(diagnostics.healthStatus).toBe("misconfigured");
    expect(diagnostics.apiTokenPresent).toBe(false);
  });

  it("reports configured without probing Plane HTTP", () => {
    const diagnostics = getPlaneConfigurationDiagnostics({
      PLANE_INTEGRATION_ENABLED: "true",
      PLANE_BASE_URL: "http://localhost:18085",
      PLANE_API_BASE_URL: "http://localhost:18085/api",
      PLANE_API_TOKEN: "plane-dev-token-min-16",
      PLANE_WORKSPACE_ID: "dev-workspace-slug",
    });
    expect(diagnostics.healthStatus).toBe("configured");
    expect(diagnostics.connectionConfigured).toBe(true);
    expect(diagnostics.workspaceConfigured).toBe(true);
    expect(diagnostics.versionCompatibility.status).toBe("not_checked");
    expect(diagnostics.versionCompatibility.supportedRange).toEqual(PLANE_SUPPORTED_VERSION_RANGE);
  });
});
