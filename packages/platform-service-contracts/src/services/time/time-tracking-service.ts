import type { ServiceRequestContext } from "../../common/context";

export interface TimeFoundationCapabilities {
  readonly adapterId: string;
  readonly adapterVersion: string;
  readonly domainCrudAvailable: boolean;
  readonly operations: readonly string[];
}

export interface TimeConnectionTestResult {
  readonly ok: boolean;
  readonly message: string;
  readonly engineVersion?: string;
}

export interface TimeHealthSnapshot {
  readonly status: "healthy" | "degraded" | "unavailable";
  readonly checks: readonly {
    readonly name: string;
    readonly status: string;
    readonly message?: string;
  }[];
  readonly observedAt: string;
}

export interface TimeDiagnosticsSnapshot {
  readonly engineVersion?: string;
  readonly healthStatus: string;
  readonly warnings: readonly string[];
  readonly recommendations: readonly string[];
  /** False when Kimai domain CE APIs are available (KIMAI-002+). */
  readonly foundationOnly: boolean;
}

export interface TimeCompatibilitySnapshot {
  readonly compatibilityStatus: string;
  readonly detectedVersion?: string;
  readonly edition: "community";
}

export interface TimeReadinessSnapshot {
  readonly ready: boolean;
  readonly classification: string;
  readonly blockingFailures: readonly string[];
  readonly warnings: readonly string[];
}

/** Canonical Time Tracking Platform Service — foundation + orchestration facade. */
export interface TimeTrackingService {
  getFoundationCapabilities(
    ctx: ServiceRequestContext,
  ): Promise<TimeFoundationCapabilities>;
  testConnection(ctx: ServiceRequestContext): Promise<TimeConnectionTestResult>;
  getHealth(ctx: ServiceRequestContext): Promise<TimeHealthSnapshot>;
  getDiagnostics(ctx: ServiceRequestContext): Promise<TimeDiagnosticsSnapshot>;
  getCompatibility(ctx: ServiceRequestContext): Promise<TimeCompatibilitySnapshot>;
  getReadiness(ctx: ServiceRequestContext): Promise<TimeReadinessSnapshot>;
}
