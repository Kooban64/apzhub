/** Platform Metrics typed client view models (APZMETRICS-003). */

export type MetricsClientRequestOptions = {
  readonly signal?: AbortSignal;
  readonly headers?: HeadersInit;
};

export type MetricsCollectionResult<T> = {
  readonly items: readonly T[];
  readonly page: { readonly limit: number; readonly hasMore: boolean };
};

export type MetricsEntityViewModel = {
  readonly id: string;
  readonly tenantId?: string;
  readonly organisationId?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly createdBy?: string;
  readonly updatedBy?: string;
  readonly revision?: number;
  readonly [key: string]: unknown;
};

export type MetricsDiagnosticsHealthViewModel = {
  readonly status: "healthy" | "degraded" | "unavailable";
  readonly persistenceMode: "postgres" | "memory";
  readonly formulaExecutionEnabled: false;
  readonly kpiExecutionEnabled: false;
  readonly providerIntegrationEnabled: false;
  readonly checkedAt: string;
};

export type MetricsDiagnosticsReadinessViewModel = {
  readonly ready: boolean;
  readonly metricsEnabled: true;
  readonly persistenceMode: "postgres" | "memory";
  readonly formulaExecutionEnabled: false;
  readonly kpiExecutionEnabled: false;
  readonly providerIntegrationEnabled: false;
  readonly capabilities: readonly string[];
};

export type MetricsManagementPlaneViewModel = {
  readonly metricsEnabled: boolean;
  readonly managementPlaneReady: boolean;
  readonly persistenceReady: boolean;
  readonly formulaExecutionEnabled: false;
  readonly kpiExecutionEnabled: false;
  readonly providerIntegrationEnabled: false;
  readonly workbenchReady: false;
  readonly metadataCompleteness?: string;
  readonly registrationState?: string;
  readonly persistenceMode?: string;
  readonly capabilities?: Record<string, unknown>;
  readonly [key: string]: unknown;
};
