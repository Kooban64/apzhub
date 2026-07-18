import type { EventBusDiagnostics } from "@apzhub/event-notification-framework";

import type { EventBusAuditRecord } from "./audit";
import type { EventBusMetricsSnapshot } from "./metrics";
import { PLATFORM_EVENT_BUS_VERSION } from "./version";

export type PlatformEventBusDiagnostics = {
  readonly version: string;
  readonly status: "ok" | "degraded" | "error";
  readonly metrics: EventBusMetricsSnapshot;
  readonly bus: EventBusDiagnostics;
  readonly recentAudit: readonly EventBusAuditRecord[];
  readonly lastIngressAt?: string;
  readonly lastDispatchAt?: string;
  readonly lastError?: string;
};

export type PlatformEventBusDiagnosticsState = {
  lastIngressAt?: string;
  lastDispatchAt?: string;
  lastError?: string;
};

export function buildDiagnostics(input: {
  readonly metrics: EventBusMetricsSnapshot;
  readonly bus: EventBusDiagnostics;
  readonly recentAudit: readonly EventBusAuditRecord[];
  readonly state: PlatformEventBusDiagnosticsState;
}): PlatformEventBusDiagnostics {
  const failed =
    input.metrics.dispatchFailed +
    input.metrics.outboxRelayFailed +
    input.metrics.ingressRejected;
  let status: PlatformEventBusDiagnostics["status"] = "ok";
  if (input.state.lastError && failed > 0) {
    status = "degraded";
  }
  if (input.bus.lastPublishStatus === "failed" && failed > 10) {
    status = "error";
  }

  return {
    version: PLATFORM_EVENT_BUS_VERSION,
    status,
    metrics: input.metrics,
    bus: input.bus,
    recentAudit: input.recentAudit,
    lastIngressAt: input.state.lastIngressAt,
    lastDispatchAt: input.state.lastDispatchAt,
    lastError: input.state.lastError,
  };
}
