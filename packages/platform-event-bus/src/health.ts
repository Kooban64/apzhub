import type { PlatformEventBusDiagnostics } from "./diagnostics";
import { PLATFORM_EVENT_BUS_VERSION } from "./version";

export type PlatformEventBusHealth = {
  readonly component: "platform-event-bus";
  readonly version: string;
  readonly status: "healthy" | "degraded" | "unhealthy";
  readonly checks: Readonly<Record<string, "pass" | "warn" | "fail">>;
  readonly message: string;
};

export function toHealth(
  diagnostics: PlatformEventBusDiagnostics,
): PlatformEventBusHealth {
  const checks = {
    registry: "pass" as const,
    bus:
      diagnostics.bus.lastPublishStatus === "failed"
        ? ("warn" as const)
        : ("pass" as const),
    ingress: diagnostics.status === "error" ? ("fail" as const) : ("pass" as const),
  };

  const status =
    diagnostics.status === "error"
      ? "unhealthy"
      : diagnostics.status === "degraded"
        ? "degraded"
        : "healthy";

  return {
    component: "platform-event-bus",
    version: PLATFORM_EVENT_BUS_VERSION,
    status,
    checks,
    message:
      status === "healthy"
        ? "Platform Event Bus ready"
        : (diagnostics.lastError ?? `status=${diagnostics.status}`),
  };
}
