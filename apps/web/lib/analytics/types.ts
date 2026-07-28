/** Analytics Workbench view models — Platform HTTP API shapes only. */

export type AnalyticsLifecycleStatus =
  "draft" | "published" | "deprecated" | "archived";

export type AnalyticsHealthStatus = "healthy" | "degraded" | "unhealthy" | "unknown";

export interface AnalyticsProviderBinding {
  readonly providerId: string;
  readonly providerRef: string;
}

export interface AnalyticsDashboardSummary {
  readonly id: string;
  readonly tenantId: string;
  readonly title: string;
  readonly description?: string;
  readonly categoryId?: string;
  readonly status: AnalyticsLifecycleStatus;
  readonly tags?: readonly string[];
  readonly provider: AnalyticsProviderBinding;
  readonly updatedAt: string;
}

export interface AnalyticsDashboard extends AnalyticsDashboardSummary {
  readonly organisationId?: string;
  readonly workspaceId?: string;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
  readonly revision: number;
}

export interface AnalyticsCategory {
  readonly id: string;
  readonly tenantId: string;
  readonly key: string;
  readonly name: string;
  readonly status: AnalyticsLifecycleStatus;
  readonly sortOrder?: number;
}

export interface AnalyticsDataset {
  readonly id: string;
  readonly tenantId: string;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly status: AnalyticsLifecycleStatus;
  readonly provider: AnalyticsProviderBinding;
  readonly dimensions?: readonly string[];
  readonly measures?: readonly string[];
}

export interface AnalyticsReport {
  readonly id: string;
  readonly tenantId: string;
  readonly reportingSorRef: string;
  readonly key: string;
  readonly title: string;
  readonly description?: string;
}

export interface AnalyticsSavedDashboard {
  readonly id: string;
  readonly tenantId: string;
  readonly ownerPrincipalId: string;
  readonly dashboardId: string;
  readonly name: string;
  readonly description?: string;
  readonly filterSnapshot?: Readonly<Record<string, unknown>>;
  readonly parameterSnapshot?: Readonly<Record<string, unknown>>;
  readonly status: AnalyticsLifecycleStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly revision: number;
}

export interface AnalyticsHealthSnapshot {
  readonly status: AnalyticsHealthStatus;
  readonly checkedAt: string;
  readonly providerStatuses: readonly {
    readonly providerId: string;
    readonly status: AnalyticsHealthStatus;
    readonly message?: string;
  }[];
  readonly reasons?: readonly string[];
}

export interface AnalyticsReadinessSnapshot {
  readonly readiness: "ready" | "ready_with_limitations" | "not_ready";
  readonly reasons: readonly string[];
  readonly providerId: string;
  readonly healthStatus: AnalyticsHealthStatus;
}

export interface AnalyticsCapability {
  readonly id: string;
  readonly key: string;
  readonly name: string;
  readonly support: string;
  readonly description?: string;
  readonly notes?: readonly string[];
}

export interface AnalyticsCapabilitiesSnapshot {
  readonly capabilities: readonly AnalyticsCapability[];
  readonly analyticsEnabled: boolean;
  readonly registryMode: string;
  readonly opsMode: string;
  readonly providerId: string;
  readonly httpApiVersion: string;
  readonly workbenchReady: boolean;
  readonly productReady: boolean;
}

export interface AnalyticsPage {
  readonly cursor: string | null;
  readonly nextCursor: string | null;
  readonly limit: number;
  readonly hasMore: boolean;
}

export interface AnalyticsCollectionResult<T> {
  readonly items: readonly T[];
  readonly page?: AnalyticsPage;
}

export interface AnalyticsApiRequestOptions {
  readonly signal?: AbortSignal;
  readonly correlationId?: string;
}

export interface CreateAnalyticsSavedInput {
  readonly id?: string;
  readonly dashboardId: string;
  readonly name: string;
  readonly description?: string;
  readonly status?: AnalyticsLifecycleStatus;
  readonly filterSnapshot?: Readonly<Record<string, unknown>>;
  readonly parameterSnapshot?: Readonly<Record<string, unknown>>;
}

export interface UpdateAnalyticsSavedInput {
  readonly dashboardId?: string;
  readonly name?: string;
  readonly description?: string | null;
  readonly status?: AnalyticsLifecycleStatus;
  readonly filterSnapshot?: Readonly<Record<string, unknown>> | null;
  readonly parameterSnapshot?: Readonly<Record<string, unknown>> | null;
}

export interface AnalyticsDashboardListParams {
  readonly categoryId?: string;
  readonly status?: AnalyticsLifecycleStatus;
  readonly tag?: string;
  readonly limit?: number;
  readonly cursor?: string;
}
