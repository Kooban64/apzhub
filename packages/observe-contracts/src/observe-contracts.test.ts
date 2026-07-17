import { describe, expect, it } from "vitest";

import {
  OBSERVE_CONTRACTS_VERSION,
  OBSERVE_HEALTH_STATUSES,
  OBSERVE_PROVIDER_KINDS,
  PLATFORM_OBSERVE_PERMISSIONS,
  PLATFORM_OBSERVE_PERMISSION_WILDCARD,
  asAlertDefinitionId,
  asAlertStateId,
  asComponentStatusId,
  asDashboardDefinitionId,
  asHealthCheckId,
  asHealthSummaryId,
  asIncidentReferenceId,
  asLivenessCheckId,
  asLogSourceId,
  asMaintenanceWindowId,
  asMetricDefinitionId,
  asMetricSampleId,
  asObservabilityMetadataId,
  asPlatformDiagnosticId,
  asReadinessCheckId,
  asServiceHealthId,
  asServiceStatusId,
  asTraceDefinitionId,
  asTraceSpanId,
  hasObservePermission,
  isObserveAlertSeverity,
  isObserveAlertStateKind,
  isObserveHealthStatus,
  isObserveLivenessStatus,
  isObserveLogSourceKind,
  isObserveMetadataStatus,
  isObserveMetricKind,
  isObserveProviderKind,
  isObserveReadinessStatus,
  isPlatformObserveIdShape,
  isPlatformObservePermission,
} from "./index";

describe("observe-contracts", () => {
  it("exports contracts version 0.2.0", () => {
    expect(OBSERVE_CONTRACTS_VERSION).toBe("0.2.0");
  });

  it("registers observe permission catalogue", () => {
    expect(PLATFORM_OBSERVE_PERMISSIONS).toEqual([
      "observe.*",
      "observe.read",
      "observe.manage",
      "observe.health",
      "observe.metrics",
      "observe.logs",
      "observe.traces",
      "observe.alerts",
      "observe.diagnostics",
    ]);
    expect(PLATFORM_OBSERVE_PERMISSION_WILDCARD).toBe("observe.*");
    expect(isPlatformObservePermission("observe.health")).toBe(true);
    expect(isPlatformObservePermission("observe.grafana")).toBe(false);
    expect(hasObservePermission(["observe.*"], "metrics")).toBe(true);
    expect(hasObservePermission(["observe.read"], "manage")).toBe(false);
    expect(hasObservePermission(["observe.alerts"], "alerts")).toBe(true);
    expect(hasObservePermission(["observe.logs"], "logs")).toBe(true);
    expect(hasObservePermission(["observe.traces"], "traces")).toBe(true);
    expect(hasObservePermission(["observe.diagnostics"], "diagnostics")).toBe(
      true,
    );
    expect(hasObservePermission(["observe.health"], "health")).toBe(true);
  });

  it("brands identifiers and validates shapes", () => {
    expect(isPlatformObserveIdShape("hc_1")).toBe(true);
    expect(isPlatformObserveIdShape("")).toBe(false);
    expect(asHealthCheckId("hc_1")).toBe("hc_1");
    expect(asReadinessCheckId("rc_1")).toBe("rc_1");
    expect(asLivenessCheckId("lc_1")).toBe("lc_1");
    expect(asServiceHealthId("sh_1")).toBe("sh_1");
    expect(asServiceStatusId("ss_1")).toBe("ss_1");
    expect(asComponentStatusId("cs_1")).toBe("cs_1");
    expect(asMetricDefinitionId("metric.http_requests")).toBe(
      "metric.http_requests",
    );
    expect(asMetricSampleId("ms_1")).toBe("ms_1");
    expect(asAlertDefinitionId("ad_1")).toBe("ad_1");
    expect(asAlertStateId("as_1")).toBe("as_1");
    expect(asDashboardDefinitionId("db_1")).toBe("db_1");
    expect(asLogSourceId("ls_1")).toBe("ls_1");
    expect(asTraceDefinitionId("td_1")).toBe("td_1");
    expect(asTraceSpanId("ts_1")).toBe("ts_1");
    expect(asIncidentReferenceId("ir_1")).toBe("ir_1");
    expect(asMaintenanceWindowId("mw_1")).toBe("mw_1");
    expect(asHealthSummaryId("hs_1")).toBe("hs_1");
    expect(asPlatformDiagnosticId("pd_1")).toBe("pd_1");
    expect(asObservabilityMetadataId("om_1")).toBe("om_1");
    expect(() => asHealthCheckId("")).toThrow(/Invalid platform observe/);
  });

  it("validates observability enumerations", () => {
    expect(OBSERVE_HEALTH_STATUSES).toContain("healthy");
    expect(OBSERVE_PROVIDER_KINDS).toContain("prometheus");
    expect(isObserveHealthStatus("healthy")).toBe(true);
    expect(isObserveHealthStatus("firing")).toBe(false);
    expect(isObserveReadinessStatus("ready")).toBe(true);
    expect(isObserveReadinessStatus("alive")).toBe(false);
    expect(isObserveLivenessStatus("alive")).toBe(true);
    expect(isObserveLivenessStatus("ready")).toBe(false);
    expect(isObserveAlertSeverity("critical")).toBe(true);
    expect(isObserveAlertSeverity("healthy")).toBe(false);
    expect(isObserveAlertStateKind("firing")).toBe(true);
    expect(isObserveAlertStateKind("healthy")).toBe(false);
    expect(isObserveMetricKind("counter")).toBe(true);
    expect(isObserveMetricKind("firing")).toBe(false);
    expect(isObserveLogSourceKind("application")).toBe(true);
    expect(isObserveLogSourceKind("prometheus")).toBe(false);
    expect(isObserveProviderKind("grafana")).toBe(true);
    expect(isObserveProviderKind("smtp")).toBe(false);
    expect(isObserveMetadataStatus("active")).toBe(true);
    expect(isObserveMetadataStatus("firing")).toBe(false);
  });
});
