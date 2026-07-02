import { describe, expect, it } from "vitest";

import {
  aggregateHealthStatus,
  buildHealthSummary,
  mapHealthStatusToCapabilityHealth,
  mapHealthStatusToLifecycleTarget,
} from "./aggregate";
import type { HealthProviderResult } from "../interfaces/types";

function result(
  status: HealthProviderResult["status"],
  id = "test",
): HealthProviderResult {
  return {
    providerId: id,
    providerName: id,
    status,
    severity: "info",
    timestamp: "2026-01-01T00:00:00.000Z",
    summary: status,
    metadata: {},
  };
}

describe("aggregateHealthStatus", () => {
  it("returns unknown when no results exist", () => {
    expect(aggregateHealthStatus([])).toBe("unknown");
  });

  it("returns the worst status across providers", () => {
    expect(
      aggregateHealthStatus([result("healthy"), result("degraded"), result("unknown")]),
    ).toBe("degraded");
    expect(
      aggregateHealthStatus([
        result("healthy"),
        result("unhealthy"),
        result("degraded"),
      ]),
    ).toBe("unhealthy");
  });

  it("returns healthy when all providers are healthy", () => {
    expect(aggregateHealthStatus([result("healthy"), result("healthy", "two")])).toBe(
      "healthy",
    );
  });
});

describe("buildHealthSummary", () => {
  it("summarises provider failures", () => {
    const summary = buildHealthSummary(
      "unhealthy",
      [result("healthy"), result("unhealthy", "broken")],
      ["broken"],
    );

    expect(summary).toContain("1/2");
    expect(summary).toContain("1 provider failure");
  });

  it("summarises healthy checks without failures", () => {
    const summary = buildHealthSummary(
      "healthy",
      [result("healthy"), result("healthy", "two")],
      [],
    );
    expect(summary).toContain("2/2");
  });
});

describe("health status mapping", () => {
  it("maps lifecycle targets", () => {
    expect(mapHealthStatusToLifecycleTarget("healthy")).toBe("healthy");
    expect(mapHealthStatusToLifecycleTarget("degraded")).toBe("degraded");
    expect(mapHealthStatusToLifecycleTarget("unhealthy")).toBe("failed");
    expect(mapHealthStatusToLifecycleTarget("unknown")).toBeNull();
  });

  it("maps capability health states", () => {
    expect(mapHealthStatusToCapabilityHealth("healthy")).toBe("healthy");
    expect(mapHealthStatusToCapabilityHealth("degraded")).toBe("degraded");
    expect(mapHealthStatusToCapabilityHealth("unhealthy")).toBe("unhealthy");
    expect(mapHealthStatusToCapabilityHealth("unknown")).toBe("unknown");
  });
});
