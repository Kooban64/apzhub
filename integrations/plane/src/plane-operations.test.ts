/**
 * OSS-101-09 — Plane operations, diagnostics & certification tests.
 */
import { describe, expect, it } from "vitest";

import type { FetchFn } from "./internal/plane-fetch-client";
import { createPlaneAdapter, disposePlaneAdapter } from "./plane-factory";
import { createMockPlaneCoreFetch } from "./testing/mock-plane-core-fetch";
import {
  DEFAULT_TEST_PLANE_CONFIG,
  TEST_CORRELATION_ID,
  TEST_TENANT_ID,
} from "./testing/mock-plane-api";
import {
  classifyPlaneOperationalHealth,
  buildPlaneCompatibilityMatrix,
  certifyPlaneCapabilities,
  evaluatePlaneReadiness,
  PLANE_ADAPTER_VERSION,
  PLANE_REFERENCE_ADAPTER_PATTERNS,
} from "./index";

const ctx = { correlationId: TEST_CORRELATION_ID, tenantId: TEST_TENANT_ID };

async function createAdapter(fetchFn: FetchFn = createMockPlaneCoreFetch()) {
  return createPlaneAdapter({
    plane: DEFAULT_TEST_PLANE_CONFIG,
    tenantId: TEST_TENANT_ID,
    apiToken: "plane-test-token",
    adapterOptions: { fetchFn },
  });
}

describe("OSS-101-09 capability certification", () => {
  it("certifies registered Plane capabilities with operations metadata", async () => {
    const { adapter, factory } = await createAdapter();
    await adapter.initialise();
    await adapter.testConnection(ctx);

    const certifications = adapter.operations.certifyCapabilities();
    expect(certifications.length).toBe(15);
    expect(PLANE_ADAPTER_VERSION).toBe("0.6.0");

    const projects = certifications.find((entry) => entry.serviceId === "projects");
    expect(projects?.implemented).toBe(true);
    expect(projects?.available).toBe(true);
    expect(projects?.enabled).toBe(true);
    expect(projects?.supportedOperations).toContain("create");
    expect(projects?.minimumPlaneVersion).toBe("0.23.0");

    const webhooks = certifications.find((entry) => entry.serviceId === "webhooks");
    expect(webhooks?.optional).toBe(true);

    const requiredIds = [
      "projects",
      "workspaces",
      "tasks",
      "labels",
      "project_states",
      "modules",
      "members",
      "comments",
      "activity",
      "watchers",
      "analytics",
      "synchronisation",
      "webhooks",
    ];
    for (const id of requiredIds) {
      expect(certifications.some((entry) => entry.serviceId === id)).toBe(true);
    }

    await disposePlaneAdapter(adapter, factory);
  });

  it("marks optional capabilities unavailable without failing certification framework", () => {
    const certifications = certifyPlaneCapabilities({
      serviceAvailable: () => true,
      featureDetection: {
        probedAt: new Date().toISOString(),
        unsupportedEndpoints: ["/webhooks/"],
        unavailableCapabilities: ["webhooks"],
        versionSpecificNotes: [],
        detections: [
          {
            capabilityId: "webhooks",
            endpoint: "/webhooks/",
            available: false,
            optional: true,
            statusCode: 404,
            note: "optional_endpoint_unavailable",
          },
        ],
      },
      providerReachable: true,
      authenticationValid: true,
    });

    const webhooks = certifications.find((entry) => entry.serviceId === "webhooks");
    expect(webhooks?.status).toBe("optional_unavailable");
    expect(webhooks?.available).toBe(false);
  });
});

describe("Compatibility matrix", () => {
  it("reports compatible Plane CE versions", async () => {
    const { adapter, factory } = await createAdapter(
      createMockPlaneCoreFetch({ instanceVersion: "0.23.1" }),
    );
    await adapter.initialise();
    await adapter.testConnection(ctx);

    const matrix = adapter.operations.getCompatibilityMatrix();
    expect(matrix.detectedPlaneVersion).toBe("0.23.1");
    expect(matrix.compatibilityStatus).toBe("compatible");
    expect(matrix.edition).toBe("community");
    expect(matrix.optionalCapabilities).toContain("webhooks");
    expect(matrix.communityVsEnterpriseNotes.length).toBeGreaterThan(0);

    await disposePlaneAdapter(adapter, factory);
  });

  it("detects incompatible versions without treating optional gaps as fatal", () => {
    const matrix = buildPlaneCompatibilityMatrix({
      detectedPlaneVersion: "0.22.0",
      featureDetection: {
        probedAt: new Date().toISOString(),
        unsupportedEndpoints: ["/webhooks/"],
        unavailableCapabilities: ["webhooks"],
        versionSpecificNotes: ["webhooks: endpoint returned 404"],
        detections: [],
      },
    });

    expect(matrix.compatibilityStatus).toBe("incompatible");
    expect(matrix.unsupportedFeatures).toContain("unavailable_capability:webhooks");
  });
});

describe("Feature detection and degraded mode", () => {
  it("records unsupported optional endpoints as metadata", async () => {
    const { adapter, factory } = await createAdapter(
      createMockPlaneCoreFetch({
        unsupportedEndpoints: ["/webhooks/"],
        analyticsStatus: 404,
      }),
    );
    await adapter.initialise();
    await adapter.testConnection(ctx);

    const detection = await adapter.detectFeatures(ctx);
    expect(detection.unavailableCapabilities).toEqual(
      expect.arrayContaining(["webhooks", "analytics"]),
    );
    expect(detection.unsupportedEndpoints.length).toBeGreaterThan(0);

    const health = adapter.operations.classifyHealth();
    expect(["DEGRADED", "HEALTHY", "LIMITED"]).toContain(health.level);

    await disposePlaneAdapter(adapter, factory);
  });

  it("simulates webhook failures and sync interruptions in mocks", async () => {
    const webhookFail = await createAdapter(
      createMockPlaneCoreFetch({ webhookStatus: 503 }),
    );
    await webhookFail.adapter.initialise();
    await expect(webhookFail.adapter.core.webhooks.list(ctx)).rejects.toBeTruthy();
    await disposePlaneAdapter(webhookFail.adapter, webhookFail.factory);

    const syncInterrupt = await createAdapter(
      createMockPlaneCoreFetch({ syncInterruptAfterCalls: 0 }),
    );
    await syncInterrupt.adapter.initialise();
    await expect(
      syncInterrupt.adapter.core.synchronisation.runFullSync(ctx),
    ).rejects.toBeTruthy();
    await disposePlaneAdapter(syncInterrupt.adapter, syncInterrupt.factory);
  });
});

describe("Readiness, health, diagnostics, and reports", () => {
  it("evaluates readiness and builds an operational report", async () => {
    const { adapter, factory } = await createAdapter();
    await adapter.initialise();
    await adapter.testConnection(ctx);
    await adapter.detectFeatures(ctx);

    const readiness = await adapter.evaluateReadiness(ctx);
    expect(readiness.ready).toBe(true);
    expect(readiness.checks.map((check) => check.id)).toEqual(
      expect.arrayContaining([
        "configuration",
        "authentication",
        "connectivity",
        "capability_registration",
        "provider_compatibility",
        "sync_configuration",
        "webhook_configuration",
        "metrics_availability",
        "logger_availability",
      ]),
    );

    const report = await adapter.buildOperationalReport(ctx);
    expect(report.integrationId).toBe("plane");
    expect(report.capabilities.length).toBe(15);
    expect(report.diagnostics.adapterVersion).toBe("0.6.0");
    expect(report.diagnostics.sdkVersion).toBe("0.5.0");
    expect(report.diagnostics.authenticationMode).toBe("api_key_header");
    expect(report.referencePatterns).toEqual(
      expect.arrayContaining([PLANE_REFERENCE_ADAPTER_PATTERNS[0]]),
    );
    expect(JSON.stringify(report)).not.toMatch(/plane-test-token|secret-present|Bearer\s+/i);
    expect(JSON.stringify(report)).not.toContain("X-Api-Key");

    const extension = adapter.planeDiagnosticsExtension;
    expect(extension.operationsCapability.adapterVersion).toBe("0.6.0");
    expect(extension.operationsCapability.certifiedCapabilityCount).toBe(15);

    await disposePlaneAdapter(adapter, factory);
  });

  it("classifies UNAVAILABLE when provider is down", () => {
    const health = classifyPlaneOperationalHealth({
      providerReachable: false,
      authenticationValid: true,
      circuitBreakerOpen: false,
      compatibility: buildPlaneCompatibilityMatrix({ detectedPlaneVersion: "0.23.1" }),
      capabilities: certifyPlaneCapabilities({
        serviceAvailable: () => true,
        providerReachable: false,
        authenticationValid: true,
      }),
    });
    expect(health.level).toBe("UNAVAILABLE");
    expect(health.reasons).toContain("provider_unreachable");
  });

  it("classifies LIMITED for incompatible provider versions", () => {
    const health = classifyPlaneOperationalHealth({
      providerReachable: true,
      authenticationValid: true,
      circuitBreakerOpen: false,
      compatibility: buildPlaneCompatibilityMatrix({ detectedPlaneVersion: "0.21.0" }),
      capabilities: certifyPlaneCapabilities({
        serviceAvailable: () => true,
        providerReachable: true,
        authenticationValid: true,
      }),
    });
    expect(health.level).toBe("LIMITED");
  });

  it("marks readiness not ready when configuration fails", () => {
    const readiness = evaluatePlaneReadiness({
      checkedAt: new Date().toISOString(),
      configurationValidation: { ok: false, message: "bad config", issues: ["missing url"] },
      authenticationValid: true,
      providerReachable: true,
      capabilitiesRegistered: true,
      registeredCapabilityCount: 15,
      compatibility: buildPlaneCompatibilityMatrix({ detectedPlaneVersion: "0.23.1" }),
      syncServiceAvailable: true,
      webhookServiceAvailable: true,
      metricsAvailable: true,
      loggerAvailable: true,
      capabilities: certifyPlaneCapabilities({
        serviceAvailable: () => true,
        providerReachable: true,
        authenticationValid: true,
      }),
      circuitBreakerOpen: false,
    });

    expect(readiness.ready).toBe(false);
    expect(readiness.blockingIssues.some((issue) => issue.startsWith("configuration:"))).toBe(
      true,
    );
  });
});
