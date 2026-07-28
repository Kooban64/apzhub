/**
 * OSS-102-07 — Zammad operations, diagnostics & certification tests.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import type { FetchFn } from "./internal/zammad-fetch-client";
import { createZammadAdapter, disposeZammadAdapter } from "./zammad-factory";
import { ZAMMAD_ADAPTER_VERSION } from "./zammad-adapter";
import {
  createMockZammadFetch,
  DEFAULT_TEST_ZAMMAD_CONFIG,
  TEST_CORRELATION_ID,
  TEST_TENANT_ID,
} from "./testing/mock-zammad-api";
import {
  assessZammadReferenceAdapterCompliance,
  buildZammadCompatibilityMatrix,
  certifyAttachmentPlaceholder,
  certifyZammadCapabilities,
  classifyZammadOperationalHealth,
  decideZammadCertificationOutcome,
  defaultZammadReferenceCompliance,
  evaluateZammadReadiness,
  ZAMMAD_KNOWN_LIMITATIONS,
  ZAMMAD_OPERATIONS_ADAPTER_VERSION,
  ZAMMAD_REFERENCE_ADAPTER_PATTERNS,
  ZAMMAD_SUPPORTED_VERSION_RANGE,
} from "./index";

const ctx = { correlationId: TEST_CORRELATION_ID, tenantId: TEST_TENANT_ID };

async function createAdapter(fetchFn: FetchFn = createMockZammadFetch()) {
  return createZammadAdapter({
    zammad: DEFAULT_TEST_ZAMMAD_CONFIG,
    tenantId: TEST_TENANT_ID,
    apiToken: "zammad-test-token",
    adapterOptions: { fetchFn },
  });
}

function assertNoSecrets(payload: unknown): void {
  const serialized = JSON.stringify(payload);
  expect(serialized).not.toMatch(/zammad-test-token/i);
  expect(serialized).not.toMatch(/Authorization/i);
  expect(serialized).not.toMatch(/Token token=/i);
  expect(serialized).not.toMatch(/Bearer /i);
  expect(serialized).not.toMatch(/password\s*[:=]/i);
  expect(serialized).not.toMatch(/"apiToken"\s*:\s*"[^"]+"/i);
  expect(serialized).not.toMatch(/"secret"\s*:\s*"[^"]+"/i);
}

describe("OSS-102-07 capability certification", () => {
  it("certifies implemented capabilities with accurate operation metadata", async () => {
    const { adapter, factory } = await createAdapter();
    await adapter.testConnection(ctx);

    const certifications = adapter.operations.certifyCapabilities();
    expect(ZAMMAD_ADAPTER_VERSION).toBe("0.8.0");
    expect(ZAMMAD_OPERATIONS_ADAPTER_VERSION).toBe("0.8.0");
    expect(certifications.length).toBeGreaterThanOrEqual(12);

    const support = certifications.find((entry) => entry.capabilityId === "support");
    expect(support?.implemented).toBe(true);
    expect(support?.registered).toBe(true);
    expect(support?.available).toBe(true);
    expect(support?.supportedOperations).toContain("listSupportRequests");
    expect(support?.minimumZammadVersion).toBe("6.3.0");
    expect(support?.maximumVerifiedZammadVersion).toBe("6.5.x");

    const requiredIds = [
      "support",
      "organizations",
      "groups",
      "users",
      "articles",
      "events",
      "synchronisation",
    ];
    for (const id of requiredIds) {
      expect(certifications.some((entry) => entry.capabilityId === id)).toBe(true);
    }

    const optionalIds = ["webhooks", "analytics", "search", "history"];
    for (const id of optionalIds) {
      const entry = certifications.find((c) => c.capabilityId === id);
      expect(entry?.optional).toBe(true);
    }

    await disposeZammadAdapter(adapter, factory);
  });

  it("certifies binary attachments and ingress; keeps delete and persistent sync limited", () => {
    const attachments = certifyAttachmentPlaceholder();
    expect(attachments.implemented).toBe(true);
    expect(attachments.available).toBe(true);
    expect(attachments.supportedOperations).toContain("uploadBinaryAttachment");
    expect(attachments.supportedOperations).toContain("downloadBinaryAttachment");
    expect(attachments.unsupportedOperations).toContain("deleteBinaryAttachment");

    const certifications = certifyZammadCapabilities({
      serviceAvailable: () => true,
      providerReachable: true,
      authenticationValid: true,
    });
    expect(certifications.some((c) => c.capabilityId === "attachments")).toBe(true);
    expect(
      certifications
        .find((c) => c.capabilityId === "webhooks")
        ?.supportedOperations.includes("webhookHttpIngress"),
    ).toBe(true);
    expect(
      certifications
        .find((c) => c.capabilityId === "events")
        ?.supportedOperations.includes("platformEventPublication"),
    ).toBe(true);
    expect(
      certifications
        .find((c) => c.capabilityId === "synchronisation")
        ?.unsupportedOperations.includes("persistentSyncState"),
    ).toBe(true);
  });

  it("marks optional capability gaps without total certification failure", () => {
    const certifications = certifyZammadCapabilities({
      serviceAvailable: () => true,
      featureDetection: {
        unavailableCapabilities: ["webhooks"],
      },
      providerReachable: true,
      authenticationValid: true,
    });

    const webhooks = certifications.find((entry) => entry.capabilityId === "webhooks");
    expect(webhooks?.status).toBe("optional_unavailable");
    expect(webhooks?.available).toBe(false);
    expect(webhooks?.degraded).toBe(true);

    const outcome = decideZammadCertificationOutcome({
      capabilities: certifications,
      compatibility: buildZammadCompatibilityMatrix({
        detectedZammadVersion: "6.4.0",
        versionMin: "6.3.0",
        versionMax: "6.5.x",
      }),
      readiness: {
        ready: true,
        overallHealth: "DEGRADED",
        checkedAt: "2026-07-10T00:00:00.000Z",
        checks: [],
        blockingIssues: [],
        warnings: ["webhook_configuration: degraded"],
      },
      healthLevel: "DEGRADED",
      referenceCompliance: defaultZammadReferenceCompliance(),
    });
    expect(outcome).toBe("CERTIFIED_WITH_LIMITATIONS");
  });

  it("fails certification when a required capability is missing", () => {
    const certifications = certifyZammadCapabilities({
      serviceAvailable: (id) => id !== "support",
      providerReachable: true,
      authenticationValid: true,
    });
    const support = certifications.find((c) => c.capabilityId === "support");
    expect(support?.implemented).toBe(false);

    const outcome = decideZammadCertificationOutcome({
      capabilities: certifications,
      compatibility: buildZammadCompatibilityMatrix({
        detectedZammadVersion: "6.4.0",
        versionMin: "6.3.0",
        versionMax: "6.5.x",
      }),
      readiness: {
        ready: false,
        overallHealth: "LIMITED",
        checkedAt: "2026-07-10T00:00:00.000Z",
        checks: [],
        blockingIssues: ["core_support_readiness"],
        warnings: [],
      },
      healthLevel: "LIMITED",
      referenceCompliance: defaultZammadReferenceCompliance(),
    });
    expect(outcome).toBe("NOT_CERTIFIED");
  });
});

describe("Compatibility matrix", () => {
  it("reports compatible mid-range and verified family versions", () => {
    for (const version of ["6.3.0", "6.4.2", "6.5.9"]) {
      const matrix = buildZammadCompatibilityMatrix({
        detectedZammadVersion: version,
        versionMin: ZAMMAD_SUPPORTED_VERSION_RANGE.min,
        versionMax: ZAMMAD_SUPPORTED_VERSION_RANGE.max,
        edition: "community",
      });
      expect(matrix.compatibilityStatus).toBe("compatible");
      expect(matrix.selfHostedCeCompatible).toBe(true);
      expect(matrix.blockingIncompatibilities).toEqual([]);
    }
  });

  it("classifies unsupported older and unverified newer versions", () => {
    const old = buildZammadCompatibilityMatrix({
      detectedZammadVersion: "6.2.0",
      versionMin: "6.3.0",
      versionMax: "6.5.x",
    });
    expect(old.compatibilityStatus).toBe("incompatible");
    expect(old.blockingIncompatibilities.length).toBeGreaterThan(0);

    const newer = buildZammadCompatibilityMatrix({
      detectedZammadVersion: "6.6.0",
      versionMin: "6.3.0",
      versionMax: "6.5.x",
    });
    expect(newer.compatibilityStatus).toBe("unverified");
    expect(newer.blockingIncompatibilities).toEqual([]);
    expect(newer.warnings.some((w) => w.includes("newer"))).toBe(true);
  });

  it("handles malformed and missing versions", () => {
    const missing = buildZammadCompatibilityMatrix({
      versionMin: "6.3.0",
      versionMax: "6.5.x",
    });
    expect(missing.compatibilityStatus).toBe("warning");

    const malformed = buildZammadCompatibilityMatrix({
      detectedZammadVersion: "not-a-version",
      versionMin: "6.3.0",
      versionMax: "6.5.x",
    });
    expect(malformed.compatibilityStatus).toBe("warning");
    expect(malformed.warnings).toContain("malformed_provider_version");
  });

  it("records optional feature differences without blocking", () => {
    const matrix = buildZammadCompatibilityMatrix({
      detectedZammadVersion: "6.4.0",
      versionMin: "6.3.0",
      versionMax: "6.5.x",
      featureDetection: {
        probedAt: "2026-07-10T00:00:00.000Z",
        unsupportedEndpoints: ["/api/v1/webhooks"],
        unavailableCapabilities: ["webhooks"],
        versionSpecificNotes: ["webhooks: endpoint returned 404"],
        detections: [],
      },
    });
    expect(matrix.compatibilityStatus).toBe("compatible");
    expect(matrix.unsupportedFeatures).toContain("webhooks");
    expect(matrix.blockingIncompatibilities).toEqual([]);
  });
});

describe("Health classification", () => {
  const baseCaps = certifyZammadCapabilities({
    serviceAvailable: () => true,
    providerReachable: true,
    authenticationValid: true,
  });
  const compatible = buildZammadCompatibilityMatrix({
    detectedZammadVersion: "6.4.0",
    versionMin: "6.3.0",
    versionMax: "6.5.x",
  });

  it("classifies healthy adapter", () => {
    const health = classifyZammadOperationalHealth({
      providerReachable: true,
      authenticationValid: true,
      circuitBreakerOpen: false,
      compatibility: compatible,
      capabilities: baseCaps,
    });
    expect(health.level).toBe("HEALTHY");
  });

  it("classifies degraded optional webhook and limited/unavailable branches", () => {
    expect(
      classifyZammadOperationalHealth({
        providerReachable: true,
        authenticationValid: true,
        circuitBreakerOpen: false,
        compatibility: compatible,
        capabilities: baseCaps,
        webhookUnhealthy: true,
        featureDetection: {
          probedAt: "t",
          unsupportedEndpoints: [],
          unavailableCapabilities: ["webhooks"],
          versionSpecificNotes: [],
          detections: [],
        },
      }).level,
    ).toBe("DEGRADED");

    expect(
      classifyZammadOperationalHealth({
        providerReachable: true,
        authenticationValid: true,
        circuitBreakerOpen: false,
        compatibility: compatible,
        capabilities: certifyZammadCapabilities({
          serviceAvailable: (id) => id !== "search",
          providerReachable: true,
          authenticationValid: true,
        }),
        featureDetection: {
          probedAt: "t",
          unsupportedEndpoints: [],
          unavailableCapabilities: ["search"],
          versionSpecificNotes: [],
          detections: [],
        },
      }).level,
    ).toBe("DEGRADED");

    expect(
      classifyZammadOperationalHealth({
        providerReachable: true,
        authenticationValid: false,
        circuitBreakerOpen: false,
        compatibility: compatible,
        capabilities: baseCaps,
      }).level,
    ).toBe("UNAVAILABLE");

    expect(
      classifyZammadOperationalHealth({
        providerReachable: false,
        authenticationValid: true,
        circuitBreakerOpen: false,
        compatibility: compatible,
        capabilities: baseCaps,
      }).level,
    ).toBe("UNAVAILABLE");

    expect(
      classifyZammadOperationalHealth({
        providerReachable: true,
        authenticationValid: true,
        circuitBreakerOpen: true,
        compatibility: compatible,
        capabilities: baseCaps,
      }).level,
    ).toBe("UNAVAILABLE");

    expect(
      classifyZammadOperationalHealth({
        providerReachable: true,
        authenticationValid: true,
        circuitBreakerOpen: false,
        compatibility: compatible,
        capabilities: baseCaps,
        configurationInvalid: true,
      }).level,
    ).toBe("UNAVAILABLE");

    const unsupported = buildZammadCompatibilityMatrix({
      detectedZammadVersion: "5.0.0",
      versionMin: "6.3.0",
      versionMax: "6.5.x",
    });
    expect(
      classifyZammadOperationalHealth({
        providerReachable: true,
        authenticationValid: true,
        circuitBreakerOpen: false,
        compatibility: unsupported,
        capabilities: baseCaps,
      }).level,
    ).toBe("UNAVAILABLE");
  });
  it("classifies LIMITED for required capability and sync failures", () => {
    expect(
      classifyZammadOperationalHealth({
        providerReachable: true,
        authenticationValid: true,
        circuitBreakerOpen: false,
        compatibility: compatible,
        capabilities: certifyZammadCapabilities({
          serviceAvailable: (id) => id !== "support",
          providerReachable: true,
          authenticationValid: true,
        }),
      }).level,
    ).toBe("LIMITED");

    expect(
      classifyZammadOperationalHealth({
        providerReachable: true,
        authenticationValid: true,
        circuitBreakerOpen: false,
        compatibility: compatible,
        capabilities: baseCaps,
        syncUnhealthy: true,
      }).level,
    ).toBe("LIMITED");
  });

  it("classifies DEGRADED for unverified and warning compatibility", () => {
    const unverified = buildZammadCompatibilityMatrix({
      detectedZammadVersion: "6.6.0",
      versionMin: "6.3.0",
      versionMax: "6.5.x",
    });
    expect(
      classifyZammadOperationalHealth({
        providerReachable: true,
        authenticationValid: true,
        circuitBreakerOpen: false,
        compatibility: unverified,
        capabilities: baseCaps,
      }).level,
    ).toBe("DEGRADED");

    const warning = buildZammadCompatibilityMatrix({
      versionMin: "6.3.0",
      versionMax: "6.5.x",
    });
    const degraded = classifyZammadOperationalHealth({
      providerReachable: true,
      authenticationValid: true,
      circuitBreakerOpen: false,
      compatibility: warning,
      capabilities: baseCaps,
    });
    expect(degraded.level).toBe("DEGRADED");
    expect(degraded.reasons.some((r) => r.includes("provider_version"))).toBe(true);
  });

  it("maps operational health to SDK statuses", async () => {
    const { mapOperationalHealthToSdkStatus } = await import("./operations");
    expect(mapOperationalHealthToSdkStatus("HEALTHY")).toBe("healthy");
    expect(mapOperationalHealthToSdkStatus("DEGRADED")).toBe("degraded");
    expect(mapOperationalHealthToSdkStatus("LIMITED")).toBe("degraded");
    expect(mapOperationalHealthToSdkStatus("UNAVAILABLE")).toBe("unavailable");
  });
});

describe("Readiness checks", () => {
  it("passes required checks and treats webhook as optional", () => {
    const readiness = evaluateZammadReadiness({
      checkedAt: "2026-07-10T00:00:00.000Z",
      configurationValidation: { ok: true, message: "ok" },
      authenticationValid: true,
      providerReachable: true,
      capabilitiesRegistered: true,
      registeredCapabilityCount: 11,
      compatibility: buildZammadCompatibilityMatrix({
        detectedZammadVersion: "6.4.0",
        versionMin: "6.3.0",
        versionMax: "6.5.x",
      }),
      coreSupportAvailable: true,
      articleServiceAvailable: true,
      syncServiceAvailable: true,
      webhookServiceAvailable: true,
      diagnosticsAvailable: true,
      metricsAvailable: true,
      loggerAvailable: true,
      capabilities: certifyZammadCapabilities({
        serviceAvailable: () => true,
        providerReachable: true,
        authenticationValid: true,
      }),
      circuitBreakerOpen: false,
      webhookUnhealthy: true,
    });

    expect(readiness.ready).toBe(true);
    expect(readiness.warnings.some((w) => w.includes("webhook"))).toBe(true);
    expect(readiness.checks.map((c) => c.id)).toEqual(
      expect.arrayContaining([
        "configuration",
        "authentication",
        "connectivity",
        "version_compatibility",
        "capability_registration",
        "core_support_readiness",
        "article_service_readiness",
        "sync_configuration",
        "webhook_configuration",
        "diagnostics_availability",
        "logger_availability",
        "metrics_availability",
      ]),
    );
    assertNoSecrets(readiness);
  });

  it("blocks readiness for core, version, logger, and sync failures", () => {
    const blocked = evaluateZammadReadiness({
      checkedAt: "2026-07-10T00:00:00.000Z",
      configurationValidation: { ok: true, message: "ok" },
      authenticationValid: true,
      providerReachable: true,
      capabilitiesRegistered: true,
      registeredCapabilityCount: 11,
      compatibility: buildZammadCompatibilityMatrix({
        detectedZammadVersion: "6.0.0",
        versionMin: "6.3.0",
        versionMax: "6.5.x",
      }),
      coreSupportAvailable: false,
      articleServiceAvailable: true,
      syncServiceAvailable: true,
      webhookServiceAvailable: true,
      diagnosticsAvailable: true,
      metricsAvailable: false,
      loggerAvailable: false,
      capabilities: certifyZammadCapabilities({
        serviceAvailable: () => true,
        providerReachable: true,
        authenticationValid: true,
      }),
      circuitBreakerOpen: false,
      syncUnhealthy: true,
    });

    expect(blocked.ready).toBe(false);
    expect(blocked.blockingIssues.some((i) => i.includes("version"))).toBe(true);
    expect(blocked.blockingIssues.some((i) => i.includes("core_support"))).toBe(true);
    expect(blocked.blockingIssues.some((i) => i.includes("logger"))).toBe(true);
    expect(blocked.blockingIssues.some((i) => i.includes("sync"))).toBe(true);
    expect(blocked.checks.every((c) => c.remediationHint !== undefined || c.ok)).toBe(
      true,
    );
  });
});

describe("Feature detection and mock operational scenarios", () => {
  it("detects available endpoints without creating records", async () => {
    const fetchFn = createMockZammadFetch();
    const { adapter, factory } = await createAdapter(fetchFn);
    await adapter.testConnection(ctx);

    const before = await adapter.core.support.list(ctx, {}, { page: 1, perPage: 100 });
    const detection = await adapter.detectFeatures(ctx);
    const after = await adapter.core.support.list(ctx, {}, { page: 1, perPage: 100 });

    expect(detection.detections.length).toBeGreaterThan(0);
    expect(after.totalCount).toBe(before.totalCount);
    expect(detection.unavailableCapabilities).not.toContain("webhooks");

    await disposeZammadAdapter(adapter, factory);
  });

  it("records optional webhook/search/history failures safely", async () => {
    const { adapter, factory } = await createAdapter(
      createMockZammadFetch({
        failWebhooks: true,
        failSearch: true,
        failHistory: true,
      }),
    );
    await adapter.testConnection(ctx);
    const detection = await adapter.detectFeatures(ctx);
    expect(detection.unavailableCapabilities).toEqual(
      expect.arrayContaining(["webhooks", "search", "history"]),
    );
    const health = adapter.operations.classifyHealth();
    expect(["DEGRADED", "HEALTHY", "LIMITED"]).toContain(health.level);
    await disposeZammadAdapter(adapter, factory);
  });

  it("records permission-restricted and missing optional endpoints", async () => {
    const { detectZammadFeatures } = await import("./operations");
    const { adapter, factory } = await createAdapter(
      createMockZammadFetch({ webhooksStatus: 403, searchStatus: 404 }),
    );
    await adapter.testConnection(ctx);
    const detection = await detectZammadFeatures(ctx, {
      client: adapter.core.getRestClient(),
      clock: { now: () => "2026-07-11T00:00:00.000Z" },
      probes: [
        {
          capabilityId: "webhooks",
          endpoint: "/api/v1/webhooks",
          optional: true,
          run: async () => {
            try {
              await adapter.core.getRestClient().listWebhooks(ctx);
              return { statusCode: 200 };
            } catch (error) {
              const statusCode =
                typeof error === "object" && error !== null && "statusCode" in error
                  ? Number((error as { statusCode?: number }).statusCode)
                  : 403;
              return { statusCode };
            }
          },
        },
        {
          capabilityId: "search",
          endpoint: "/api/v1/tickets/search",
          optional: true,
          run: async () => ({ statusCode: 404 }),
        },
        {
          capabilityId: "history",
          endpoint: "/api/v1/ticket_history/{id}",
          optional: true,
          run: async () => {
            throw new Error("probe boom");
          },
        },
      ],
    });
    expect(detection.unavailableCapabilities).toEqual(
      expect.arrayContaining(["webhooks", "search", "history"]),
    );
    expect(
      detection.versionSpecificNotes.some(
        (n) => n.includes("403") || n.includes("404"),
      ),
    ).toBe(true);
    expect(detection.detections.some((d) => d.note === "probe_failed_safely")).toBe(
      true,
    );
    await disposeZammadAdapter(adapter, factory);
  });

  it("simulates unsupported version, auth failure, rate limit, slow provider, sync interrupt", async () => {
    const unsupported = await createAdapter(
      createMockZammadFetch({ engineVersion: "5.9.0" }),
    );
    await unsupported.adapter.testConnection(ctx);
    expect(
      unsupported.adapter.operations.getCompatibilityMatrix().compatibilityStatus,
    ).toBe("incompatible");
    await disposeZammadAdapter(unsupported.adapter, unsupported.factory);

    const unverified = await createAdapter(
      createMockZammadFetch({ engineVersion: "6.6.1" }),
    );
    await unverified.adapter.testConnection(ctx);
    expect(
      unverified.adapter.operations.getCompatibilityMatrix().compatibilityStatus,
    ).toBe("unverified");
    await disposeZammadAdapter(unverified.adapter, unverified.factory);

    const authFail = await createAdapter(
      createMockZammadFetch({ failMe: true, meStatus: 401 }),
    );
    await authFail.adapter.initialise();
    const authResult = await authFail.adapter.testConnection(ctx);
    expect(authResult.ok).toBe(false);
    await disposeZammadAdapter(authFail.adapter, authFail.factory);

    const rateLimited = await createAdapter(
      createMockZammadFetch({ rateLimitWebhooks: true }),
    );
    await rateLimited.adapter.initialise();
    await expect(rateLimited.adapter.core.webhooks.list(ctx)).rejects.toBeTruthy();
    await disposeZammadAdapter(rateLimited.adapter, rateLimited.factory);

    const slow = await createAdapter(createMockZammadFetch({ delayMs: 25 }));
    await slow.adapter.testConnection(ctx);
    expect(
      slow.adapter.getRuntimeDiagnosticsSnapshot().apiLatencySummary,
    ).toBeDefined();
    await disposeZammadAdapter(slow.adapter, slow.factory);

    const syncInterrupt = await createAdapter(
      createMockZammadFetch({ syncInterruptAfterCalls: 0 }),
    );
    await syncInterrupt.adapter.initialise();
    await expect(
      syncInterrupt.adapter.core.synchronisation.runFullSync(ctx),
    ).rejects.toBeTruthy();
    await disposeZammadAdapter(syncInterrupt.adapter, syncInterrupt.factory);
  });
});

describe("Diagnostics, reports, and certification summary", () => {
  it("builds secret-free diagnostics and serialisable operational report", async () => {
    const { adapter, factory } = await createAdapter();
    await adapter.testConnection(ctx);
    await adapter.detectFeatures(ctx);

    const snapshot = adapter.getRuntimeDiagnosticsSnapshot();
    expect(snapshot.adapterVersion).toBe("0.8.0");
    expect(snapshot.providerVersion).toBeDefined();
    expect(snapshot.persistentSyncStateSupport).toBe(false);
    expect(snapshot.webhookIngressSupport).toBe(true);
    expect(snapshot.binaryAttachmentSupport).toBe(true);
    expect(snapshot.capabilityCount).toBeGreaterThan(0);
    assertNoSecrets(snapshot);

    const report = await adapter.buildOperationalReport(ctx);
    expect(report.integrationId).toBe("zammad");
    expect(["CERTIFIED", "CERTIFIED_WITH_LIMITATIONS"]).toContain(
      report.certificationOutcome,
    );
    expect(report.capabilities.length).toBeGreaterThan(0);
    expect(report.knownLimitations).toEqual(
      expect.arrayContaining([...ZAMMAD_KNOWN_LIMITATIONS]),
    );
    expect(report.referencePatterns).toEqual(
      expect.arrayContaining([...ZAMMAD_REFERENCE_ADAPTER_PATTERNS]),
    );
    expect(report.referenceCompliance.compliant).toBe(true);

    const serialized = JSON.stringify(report);
    const parsed = JSON.parse(serialized) as typeof report;
    expect(parsed.reportId).toBe(report.reportId);
    expect(parsed.capabilities.map((c) => c.capabilityId).sort()).toEqual(
      [...report.capabilities.map((c) => c.capabilityId)].sort(),
    );
    assertNoSecrets(report);

    const readiness = await adapter.evaluateReadiness(ctx);
    expect(readiness.ready).toBe(true);

    await disposeZammadAdapter(adapter, factory);
  });

  it("proves internal notes cannot become customer-visible via payload builders", async () => {
    const ticketId = "100";
    const { adapter, factory } = await createAdapter();
    const note = await adapter.core.articles.createNote(ctx, {
      supportTicketId: ticketId,
      body: "internal only",
      bodyFormat: "text/plain",
    });
    expect(note.visibility).toBe("internal");

    const { adapter: corruptAdapter, factory: corruptFactory } =
      await createZammadAdapter({
        zammad: DEFAULT_TEST_ZAMMAD_CONFIG,
        tenantId: TEST_TENANT_ID,
        apiToken: "zammad-test-token",
        adapterOptions: {
          fetchFn: createMockZammadFetch({ forceCreatedArticleInternal: false }),
        },
      });
    await expect(
      corruptAdapter.core.articles.createNote(ctx, {
        supportTicketId: ticketId,
        body: "must stay internal",
        bodyFormat: "text/plain",
      }),
    ).rejects.toBeTruthy();
    await disposeZammadAdapter(corruptAdapter, corruptFactory);
    await disposeZammadAdapter(adapter, factory);
  });
});

describe("Reference Adapter compliance and architecture boundaries", () => {
  it("passes Reference Adapter compliance assessment", () => {
    const result = defaultZammadReferenceCompliance();
    expect(result.compliant).toBe(true);
    expect(["pass", "pass_with_limitations"]).toContain(result.outcome);
    expect(result.checks.every((c) => (c.required ? c.ok : true))).toBe(true);

    const failed = assessZammadReferenceAdapterCompliance({
      packageStructureOk: true,
      factoryPatternOk: true,
      adapterLifecycleOk: true,
      operationRunnerOk: true,
      restClientBoundaryOk: true,
      internalApiTypesPrivate: true,
      canonicalDtoUseOk: true,
      capabilityRegistrationOk: true,
      diagnosticsOk: true,
      metricsOk: true,
      loggingOk: true,
      errorTranslationOk: true,
      mockInfrastructureOk: true,
      testCoverageOk: true,
      documentationOk: true,
      versioningOk: true,
      forbiddenDependencyRulesOk: false,
    });
    expect(failed.outcome).toBe("fail");
    expect(
      decideZammadCertificationOutcome({
        capabilities: certifyZammadCapabilities({
          serviceAvailable: () => true,
          providerReachable: true,
          authenticationValid: true,
        }),
        compatibility: buildZammadCompatibilityMatrix({
          detectedZammadVersion: "6.4.0",
          versionMin: "6.3.0",
          versionMax: "6.5.x",
        }),
        readiness: {
          ready: true,
          overallHealth: "HEALTHY",
          checkedAt: "t",
          checks: [],
          blockingIssues: [],
          warnings: [],
        },
        healthLevel: "HEALTHY",
        referenceCompliance: failed,
      }),
    ).toBe("INCOMPATIBLE");
  });

  it("forbids platform-services, gateway, mapping-store, routes, DB, and Plane reuse", () => {
    const root = dirname(fileURLToPath(import.meta.url));
    const forbidden = [
      "@apzhub/platform-services",
      "PlatformServiceGateway",
      "EntityMappingStore",
      "createPlatformServices",
      "@apzhub/integration-plane",
      'from "next/',
      "from 'next/",
      "postgres",
      "drizzle-orm",
      "prisma",
    ];

    const offenders: string[] = [];

    function walk(dir: string): void {
      for (const entry of readdirSync(dir)) {
        if (
          entry === "node_modules" ||
          entry.endsWith(".test.ts") ||
          entry === "testing"
        ) {
          continue;
        }
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
          walk(full);
          continue;
        }
        if (!entry.endsWith(".ts")) continue;
        const source = readFileSync(full, "utf8");
        for (const needle of forbidden) {
          if (source.includes(needle)) {
            offenders.push(`${relative(root, full)}:${needle}`);
          }
        }
      }
    }

    walk(root);
    expect(offenders).toEqual([]);
  });

  it("does not export Zammad internal API types from the public package root", async () => {
    const publicApi = await import("./index");
    expect("ZammadTicketRecord" in publicApi).toBe(false);
    expect("ZammadListQuery" in publicApi).toBe(false);
    expect("ZammadRestClient" in publicApi).toBe(false);
    expect("ZammadFetchClient" in publicApi).toBe(false);
  });
});
