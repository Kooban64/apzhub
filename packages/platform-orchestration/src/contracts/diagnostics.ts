import type { OrchestrationKernelState } from "./state";

export type HealthStatus = "healthy" | "degraded" | "unhealthy";

export interface OrchestrationHealthReport {
  readonly status: HealthStatus;
  readonly state: OrchestrationKernelState;
  readonly version: string;
  readonly programme: string;
  readonly slice: string;
  readonly ready: boolean;
  readonly checkedAt: string;
  readonly details: Readonly<Record<string, string>>;
}

export interface OrchestrationDiagnosticsReport {
  readonly orchestrationId: string;
  readonly name: string;
  readonly state: OrchestrationKernelState;
  readonly version: string;
  readonly capabilityCount: number;
  readonly contractCount: number;
  readonly lifecycleRegistrationCount: number;
  readonly configValid: boolean;
  readonly checkedAt: string;
}
