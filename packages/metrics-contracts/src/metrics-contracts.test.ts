import { describe, expect, it } from "vitest";

import {
  METRICS_CONTRACTS_VERSION,
  asMetricId,
  hasMetricsPermission,
  isMetricsLifecycleStatus,
  isMetricsMetricKind,
  isPlatformMetricsIdShape,
  isPlatformMetricsPermission,
  PLATFORM_METRICS_PERMISSIONS,
} from "./index";

describe("metrics-contracts", () => {
  it("exports version 0.1.0", () => {
    expect(METRICS_CONTRACTS_VERSION).toBe("0.2.0");
  });

  it("brands identifiers and rejects invalid shapes", () => {
    expect(isPlatformMetricsIdShape("metric_1")).toBe(true);
    expect(asMetricId("metric_1")).toBe("metric_1");
    expect(() => asMetricId("")).toThrow(/Invalid platform metrics/);
  });

  it("enumerates permissions and wildcard helper", () => {
    expect(PLATFORM_METRICS_PERMISSIONS).toContain("metrics.*");
    expect(PLATFORM_METRICS_PERMISSIONS).toContain("metrics.kpi");
    expect(isPlatformMetricsPermission("metrics.read")).toBe(true);
    expect(hasMetricsPermission(["metrics.*"], "retention")).toBe(true);
    expect(hasMetricsPermission(["metrics.kpi"], "kpi")).toBe(true);
    expect(hasMetricsPermission(["metrics.read"], "manage")).toBe(false);
  });

  it("guards lifecycle and metric kinds", () => {
    expect(isMetricsLifecycleStatus("draft")).toBe(true);
    expect(isMetricsLifecycleStatus("deleted")).toBe(false);
    expect(isMetricsMetricKind("gauge")).toBe(true);
    expect(isMetricsMetricKind("prometheus")).toBe(false);
  });
});
