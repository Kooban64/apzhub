import type {
  ConsolidatedOperationalDiagnostics,
  HealthSignalStatus,
} from "@apzhub/platform-security";

export type CapabilityMaturityLevel =
  "foundation" | "operational" | "production" | "experimental";

export type ProductionReadinessVerdict =
  "READY" | "READY_WITH_OBSERVATIONS" | "NOT_READY";

export interface CapabilityHealthReport {
  readonly capabilityId: string;
  readonly name: string;
  readonly owner: string;
  readonly version: string;
  readonly maturityLevel: CapabilityMaturityLevel;
  readonly status: HealthSignalStatus;
  readonly health: HealthSignalStatus;
  readonly readiness: HealthSignalStatus;
  readonly configurationState: "valid" | "degraded" | "invalid" | "unknown";
  readonly warnings: readonly string[];
  readonly recommendations: readonly string[];
  readonly dependencies: readonly string[];
  readonly lastValidation: string;
  readonly diagnostics: Record<string, unknown>;
}

export interface ProductionVerificationFinding {
  readonly id: string;
  readonly category: string;
  readonly severity: "pass" | "warn" | "fail";
  readonly message: string;
  readonly capabilityId?: string;
  readonly recommendation?: string;
}

export interface ProductionVerificationReport {
  readonly verdict: ProductionReadinessVerdict;
  readonly score: number;
  readonly evaluatedAt: string;
  readonly findings: readonly ProductionVerificationFinding[];
  readonly summary: {
    readonly passCount: number;
    readonly warnCount: number;
    readonly failCount: number;
  };
}

export interface TechnicalDebtOpsItem {
  readonly id: string;
  readonly priority: "critical" | "high" | "medium" | "low";
  readonly summary: string;
  readonly milestone?: string;
}

export interface OperationsControlPlaneSnapshot {
  readonly generatedAt: string;
  readonly platformVersion: string;
  readonly buildNumber: string;
  readonly environment: string;
  readonly overview: {
    readonly platformHealth: HealthSignalStatus;
    readonly productionReadiness: ProductionReadinessVerdict;
    readonly readinessScore: number;
    readonly degradedCapabilityCount: number;
    readonly unhealthyCapabilityCount: number;
    readonly affectedProducts: readonly string[];
    readonly lifecycleState?: string;
    readonly maintenanceMode?: boolean;
  };
  readonly capabilities: readonly CapabilityHealthReport[];
  readonly dependencyHealth: ConsolidatedOperationalDiagnostics["resilience"]["health"];
  readonly productionVerification: ProductionVerificationReport;
  readonly technicalDebt: {
    readonly registerReference: string;
    readonly openItems: readonly TechnicalDebtOpsItem[];
    readonly openCount: number;
  };
  readonly documentation: {
    readonly status: HealthSignalStatus;
    readonly operationsGuides: readonly string[];
  };
  readonly lifecycle?: import("@apzhub/platform-lifecycle").PlatformLifecycleSnapshot;
}

export interface OperationsControlPlaneInput {
  readonly consolidated: ConsolidatedOperationalDiagnostics;
  readonly bootstrapReady: boolean;
  readonly platformVersion: string;
  readonly buildNumber: string;
  readonly environment: string;
  readonly productStatuses?: Readonly<Record<string, HealthSignalStatus>>;
  readonly lifecycleRuntime?: import("@apzhub/platform-lifecycle").PlatformLifecycleRuntimeState;
}
