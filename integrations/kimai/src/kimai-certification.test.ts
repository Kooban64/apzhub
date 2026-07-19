import type { IntegrationRequestContext } from "@apzhub/integration-sdk";
import { describe, expect, it } from "vitest";

import {
  createKimaiAdapter,
  disposeKimaiAdapter,
  createMockKimaiFetch,
  DEFAULT_TEST_KIMAI_CONFIG,
  TEST_CORRELATION_ID,
  TEST_TENANT_ID,
  KIMAI_CERTIFICATION_CAPABILITY_IDS,
  listKimaiRegisteredCapabilityIds,
  isKimaiServiceImplemented,
} from "./index";

function ctx(): IntegrationRequestContext {
  return {
    tenantId: TEST_TENANT_ID,
    correlationId: TEST_CORRELATION_ID,
  };
}

describe("@apzhub/integration-kimai certification", () => {
  it("registers foundation capabilities and certifies them after connect", async () => {
    expect(KIMAI_CERTIFICATION_CAPABILITY_IDS).toEqual(
      expect.arrayContaining([
        "authentication",
        "version",
        "health",
        "compatibility",
        "readiness",
      ]),
    );
    expect(listKimaiRegisteredCapabilityIds()).toContain("time_tracking");
    expect(isKimaiServiceImplemented("authentication")).toBe(true);
    expect(isKimaiServiceImplemented("timesheets")).toBe(true);

    const { adapter, factory } = await createKimaiAdapter({
      tenantId: TEST_TENANT_ID,
      kimai: DEFAULT_TEST_KIMAI_CONFIG,
      apiToken: "cert-token",
      adapterOptions: { fetchFn: createMockKimaiFetch() },
    });
    await adapter.connect(ctx());

    const report = adapter.buildOperationalReport();
    expect(report.readiness.classification).toMatch(/ready/);
    expect(report.featureDetection.pingAvailable).toBe(true);
    expect(report.featureDetection.versionAvailable).toBe(true);
    expect(
      report.certifications.filter((c) => c.availability === "available").length,
    ).toBeGreaterThanOrEqual(6);

    const health = await adapter.health(ctx());
    const checkNames = health.checks.map((c) => c.name);
    expect(checkNames).toEqual(
      expect.arrayContaining([
        "kimai_api",
        "kimai_authentication",
        "kimai_version",
        "kimai_compatibility",
        "kimai_readiness",
        "kimai_operational_health",
      ]),
    );

    await disposeKimaiAdapter(adapter, factory);
  });

  it("marks readiness not_ready when connectivity fails", async () => {
    const { adapter, factory } = await createKimaiAdapter({
      tenantId: TEST_TENANT_ID,
      kimai: DEFAULT_TEST_KIMAI_CONFIG,
      apiToken: "cert-token",
      adapterOptions: { fetchFn: createMockKimaiFetch({ failPing: true }) },
    });
    const result = await adapter.testConnection(ctx());
    expect(result.ok).toBe(false);
    const readiness = adapter.operations.evaluateReadiness();
    expect(readiness.ready).toBe(false);
    expect(readiness.classification).toBe("not_ready");
    await disposeKimaiAdapter(adapter, factory);
  });
});
