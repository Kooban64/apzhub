import type { PlatformHealthResponse } from "@apzhub/types";

export interface PlatformOperationsSummary {
  readonly health: PlatformHealthResponse;
  readonly tenants: { readonly count: number };
  readonly users: { readonly count: number };
  readonly roles: { readonly count: number };
  readonly permissions: { readonly count: number };
  readonly modules: { readonly count: number };
  readonly services: { readonly count: number };
  readonly products: { readonly count: number };
  readonly identityDiagnostics: Record<string, unknown> | null;
  readonly authorizationDiagnostics: Record<string, unknown> | null;
  readonly securitySummary: Record<string, unknown> | null;
  readonly consolidatedDiagnostics: Record<string, unknown> | null;
  readonly generatedAt: string;
}

export interface PlatformControlPlaneSnapshot {
  readonly generatedAt: string;
  readonly platformVersion: string;
  readonly buildNumber: string;
  readonly environment: string;
  readonly overview: {
    readonly platformHealth: string;
    readonly productionReadiness: "READY" | "READY_WITH_OBSERVATIONS" | "NOT_READY";
    readonly readinessScore: number;
    readonly degradedCapabilityCount: number;
    readonly unhealthyCapabilityCount: number;
    readonly affectedProducts: readonly string[];
    readonly lifecycleState?: string;
    readonly maintenanceMode?: boolean;
  };
  readonly capabilities: readonly {
    readonly capabilityId: string;
    readonly name: string;
    readonly owner: string;
    readonly status: string;
    readonly health: string;
    readonly readiness: string;
    readonly warnings: readonly string[];
    readonly recommendations: readonly string[];
  }[];
  readonly dependencyHealth: {
    readonly status: string;
    readonly dependencies: readonly { readonly name: string; readonly status: string }[];
  };
  readonly productionVerification: {
    readonly verdict: "READY" | "READY_WITH_OBSERVATIONS" | "NOT_READY";
    readonly score: number;
    readonly summary: { readonly passCount: number; readonly warnCount: number; readonly failCount: number };
  };
  readonly technicalDebt: {
    readonly registerReference: string;
    readonly openCount: number;
    readonly openItems: readonly { readonly id: string; readonly priority: string; readonly summary: string }[];
  };
  readonly documentation: {
    readonly status: string;
    readonly operationsGuides: readonly string[];
  };
  readonly lifecycle?: {
    readonly currentState: string;
    readonly maintenanceMode: boolean;
    readonly shutdownStatus: string;
    readonly recoveryStatus: string;
    readonly allowedTransitions: readonly string[];
    readonly readinessGates: readonly { readonly gate: string; readonly satisfied: boolean; readonly message: string }[];
    readonly capabilities: readonly {
      readonly capabilityId: string;
      readonly name: string;
      readonly lifecycleState: string;
      readonly readiness: string;
      readonly shutdownStatus: string;
      readonly recoveryStatus: string;
      readonly sequenceOrder: number;
    }[];
    readonly products: readonly {
      readonly productId: string;
      readonly name: string;
      readonly lifecycleState: string;
      readonly readiness: string;
    }[];
    readonly versionCompatibility: {
      readonly compatible: boolean;
      readonly platformVersion: string;
    };
    readonly warnings: readonly string[];
    readonly recommendations: readonly string[];
  };
}

export interface PlatformUserSummary {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly emailVerified: boolean;
  readonly activeTenantId: string | null;
  readonly createdAt: string;
  readonly roles: readonly string[];
  readonly effectivePermissions: readonly string[];
}

export interface PlatformCapabilitySummary {
  readonly id: string;
  readonly name: string;
  readonly kind: string;
  readonly version: string;
  readonly lifecycleState: string;
  readonly healthState: string;
  readonly category?: string;
}

export interface PlatformAuditEntry {
  readonly eventId: string;
  readonly occurredAt: string;
  readonly category: string;
  readonly payload: Record<string, unknown>;
}

export interface PlatformConfigurationSummary {
  readonly environment: string;
  readonly platformVersion: string;
  readonly buildNumber: string;
  readonly repositoryMode: string;
  readonly nodeEnv: string;
  readonly databaseConfigured: boolean;
  readonly redisConfigured: boolean;
}
