import { describe, expect, it } from "vitest";

import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import { resolveOperationAuthorization } from "../../authorization/operation-authorization-map";
import { createTestingPlatformServicesForTest } from "./create-testing-platform-services";

const ctx: ServiceRequestContext = {
  tenantId: "tenant_a",
  userId: "user_1",
  correlationId: "corr_ei_gw_1",
  permissions: [
    "*",
    "engineering.*",
    "analytics.*",
    "benchmark.*",
    "trend.*",
    "quality.*",
    "testing.*",
  ],
  organisationId: "org_1",
};

describe("testing engineering intelligence gateway facet", () => {
  it("exposes engineeringIntelligence via createTestingPlatformServicesForTest", async () => {
    const bundle = createTestingPlatformServicesForTest({
      allowInMemoryPersistence: true,
    });
    expect(bundle.gatewaySurface.engineeringIntelligence).toBeDefined();

    const score = await bundle.gatewaySurface.engineeringIntelligence.score(ctx);
    expect(score.score).toBeGreaterThanOrEqual(0);

    const health =
      await bundle.gatewaySurface.engineeringIntelligence.assessHealth(ctx);
    expect(health.isDecision).toBe(false);

    const snap = await bundle.gatewaySurface.engineeringIntelligence.computeSnapshot(
      ctx,
      { tenantId: "tenant_a" },
      "gw-ei",
    );
    expect(snap.label).toBe("gw-ei");
    expect(
      (await bundle.gatewaySurface.engineeringIntelligence.listSnapshots(ctx)).length,
    ).toBe(1);

    const trend = await bundle.gatewaySurface.engineeringIntelligence.buildTrend(
      ctx,
      "coverage",
    );
    expect(trend.kind).toBe("coverage");

    const bench = await bundle.gatewaySurface.engineeringIntelligence.compareBenchmark(
      ctx,
      "coverage",
      [40, 50, 60],
      45,
    );
    expect(bench.comparison.current).toBe(60);

    const baseline = await bundle.gatewaySurface.engineeringIntelligence.recordBaseline(
      ctx,
      { kind: "last_quarter", metricKey: "coverage", value: 55 },
    );
    expect(baseline.value).toBe(55);

    const hist = await bundle.gatewaySurface.engineeringIntelligence.captureHistorical(
      ctx,
      {
        kind: "weekly",
        startAt: "2026-07-01T00:00:00.000Z",
        endAt: "2026-07-07T23:59:59.000Z",
      },
    );
    expect(hist.immutable).toBe(true);
  });

  it("maps authz for engineering intelligence operations", () => {
    expect(
      resolveOperationAuthorization("testingEngineeringIntelligence", "score")
        ?.requiredPermission,
    ).toBe("quality.score");
    expect(
      resolveOperationAuthorization("testingEngineeringIntelligence", "assessHealth")
        ?.requiredPermission,
    ).toBe("engineering.health");
    expect(
      resolveOperationAuthorization("testingEngineeringIntelligence", "buildTrend")
        ?.requiredPermission,
    ).toBe("trend.compute");
    expect(
      resolveOperationAuthorization(
        "testingEngineeringIntelligence",
        "compareBenchmark",
      )?.requiredPermission,
    ).toBe("benchmark.compute");
    expect(
      resolveOperationAuthorization(
        "testingEngineeringIntelligence",
        "captureHistorical",
      )?.requiredPermission,
    ).toBe("analytics.compute");
  });
});
