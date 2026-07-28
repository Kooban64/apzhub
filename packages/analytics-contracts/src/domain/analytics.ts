/**
 * Analytics Platform domain models (APZHUB-PLATFORM-ANALYTICS-003).
 *
 * Provider-agnostic DTOs. Information Model mapping:
 * - AnalyticsDashboard ↔ DashboardRegistryEntry
 * - DashboardCategory ↔ CatalogueTag
 * - AnalyticsDataset ↔ DatasetDescriptor
 * - AnalyticsWidget ↔ WidgetRef
 * - DashboardPermission ↔ RoleVisibilityBinding / ShareGrant surface
 * - DashboardEmbedding ↔ EmbedSession
 * - AnalyticsMetric / AnalyticsKPI → Metrics SoR references (not ownership)
 * - AnalyticsReport → Reporting SoR link (not ownership)
 */

import type { AnalyticsAuditFields, AnalyticsProviderBinding } from "../common/context";
import type {
  AnalyticsCapabilitySupport,
  AnalyticsEmbedMode,
  AnalyticsFilterKind,
  AnalyticsHealthStatus,
  AnalyticsLifecycleStatus,
  AnalyticsPermissionSubjectKind,
} from "../enums/catalogue";
import type {
  AnalyticsCapabilityId,
  AnalyticsDashboardId,
  AnalyticsDatasetId,
  AnalyticsFilterId,
  AnalyticsKPIId,
  AnalyticsMetricId,
  AnalyticsParameterId,
  AnalyticsReportId,
  AnalyticsWidgetId,
  DashboardCategoryId,
  DashboardEmbeddingId,
  DashboardPermissionId,
  SavedDashboardId,
} from "../identifiers";

/** Catalogue / registry category (IM: CatalogueTag). */
export type DashboardCategory = AnalyticsAuditFields & {
  readonly id: DashboardCategoryId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly sortOrder?: number;
  readonly status: AnalyticsLifecycleStatus;
};

/** Filter definition applied to dashboards / embeds / saved views. */
export type DashboardFilter = {
  readonly id: AnalyticsFilterId;
  readonly key: string;
  readonly label: string;
  readonly kind: AnalyticsFilterKind;
  readonly required?: boolean;
  readonly defaultValue?: unknown;
  readonly allowedValues?: readonly unknown[];
};

/** Named parameter for dashboard open / embed orchestration. */
export type DashboardParameter = {
  readonly id: AnalyticsParameterId;
  readonly key: string;
  readonly label: string;
  readonly kind: AnalyticsFilterKind;
  readonly required?: boolean;
  readonly defaultValue?: unknown;
};

/** Visibility / share grant surface (IM: RoleVisibilityBinding / ShareGrant). */
export type DashboardPermission = AnalyticsAuditFields & {
  readonly id: DashboardPermissionId;
  readonly tenantId: string;
  readonly dashboardId: AnalyticsDashboardId;
  readonly subjectKind: AnalyticsPermissionSubjectKind;
  readonly subjectId: string;
  readonly operations: readonly AnalyticsPermissionOperation[];
};

export type AnalyticsPermissionOperation =
  "view" | "share" | "embed" | "manage" | "admin";

/** List / catalogue projection of a dashboard. */
export type DashboardSummary = {
  readonly id: AnalyticsDashboardId;
  readonly tenantId: string;
  readonly title: string;
  readonly description?: string;
  readonly categoryId?: DashboardCategoryId;
  readonly status: AnalyticsLifecycleStatus;
  readonly tags?: readonly string[];
  readonly provider: AnalyticsProviderBinding;
  readonly updatedAt: string;
};

/**
 * Full dashboard registry entry (IM: DashboardRegistryEntry).
 * Provider-native visual definitions remain connector-internal.
 */
export type AnalyticsDashboard = AnalyticsAuditFields & {
  readonly id: AnalyticsDashboardId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly workspaceId?: string;
  readonly title: string;
  readonly description?: string;
  readonly categoryId?: DashboardCategoryId;
  readonly status: AnalyticsLifecycleStatus;
  readonly tags?: readonly string[];
  readonly provider: AnalyticsProviderBinding;
  readonly filters?: readonly DashboardFilter[];
  readonly parameters?: readonly DashboardParameter[];
  readonly widgetIds?: readonly AnalyticsWidgetId[];
  readonly metricRefs?: readonly AnalyticsMetricId[];
  readonly kpiRefs?: readonly AnalyticsKPIId[];
  readonly reportRefs?: readonly AnalyticsReportId[];
};

/** Logical dataset descriptor (IM: DatasetDescriptor). */
export type AnalyticsDataset = AnalyticsAuditFields & {
  readonly id: AnalyticsDatasetId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly status: AnalyticsLifecycleStatus;
  readonly provider: AnalyticsProviderBinding;
  readonly dimensions?: readonly string[];
  readonly measures?: readonly string[];
};

/**
 * Curated metric reference onto Analytics surfaces.
 * Definitions remain owned by Metrics SoR — this is a link only.
 */
export type AnalyticsMetric = {
  readonly id: AnalyticsMetricId;
  readonly tenantId: string;
  readonly metricsSorRef: string;
  readonly key: string;
  readonly displayName: string;
  readonly description?: string;
  readonly unit?: string;
};

/**
 * Curated KPI reference onto Analytics surfaces.
 * Definitions remain owned by Metrics SoR — this is a link only.
 */
export type AnalyticsKPI = {
  readonly id: AnalyticsKPIId;
  readonly tenantId: string;
  readonly metricsSorRef: string;
  readonly key: string;
  readonly displayName: string;
  readonly description?: string;
  readonly target?: number;
};

/**
 * Report link for Analytics catalogue / dashboard surfaces.
 * Artefacts remain owned by Reporting SoR — this is a link only.
 */
export type AnalyticsReport = {
  readonly id: AnalyticsReportId;
  readonly tenantId: string;
  readonly reportingSorRef: string;
  readonly key: string;
  readonly title: string;
  readonly description?: string;
};

/** Widget / card layout reference (IM: WidgetRef). */
export type AnalyticsWidget = {
  readonly id: AnalyticsWidgetId;
  readonly tenantId: string;
  readonly dashboardId: AnalyticsDashboardId;
  readonly title?: string;
  readonly provider: AnalyticsProviderBinding;
  readonly sortOrder?: number;
};

/** Principal/org saved dashboard + filter snapshot (IM: SavedDashboard). */
export type SavedDashboard = AnalyticsAuditFields & {
  readonly id: SavedDashboardId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly ownerPrincipalId: string;
  readonly dashboardId: AnalyticsDashboardId;
  readonly name: string;
  readonly description?: string;
  readonly filterSnapshot?: Readonly<Record<string, unknown>>;
  readonly parameterSnapshot?: Readonly<Record<string, unknown>>;
  readonly status: AnalyticsLifecycleStatus;
};

/** Embed session metadata (IM: EmbedSession) — not durable result SoR. */
export type DashboardEmbedding = {
  readonly id: DashboardEmbeddingId;
  readonly tenantId: string;
  readonly dashboardId: AnalyticsDashboardId;
  readonly mode: AnalyticsEmbedMode;
  readonly issuedAt: string;
  readonly expiresAt: string;
  readonly issuedToPrincipalId: string;
  readonly correlationId?: string;
  /** Opaque token handle — never raw provider secrets. */
  readonly tokenRef: string;
  readonly revoked?: boolean;
};

/** Aggregated Analytics Platform health (provider-agnostic). */
export type AnalyticsHealth = {
  readonly status: AnalyticsHealthStatus;
  readonly checkedAt: string;
  readonly providerStatuses: readonly {
    readonly providerId: string;
    readonly status: AnalyticsHealthStatus;
    readonly message?: string;
  }[];
  readonly reasons?: readonly string[];
};

/** Declared Analytics capability for discovery / readiness. */
export type AnalyticsCapability = {
  readonly id: AnalyticsCapabilityId;
  readonly key: string;
  readonly name: string;
  readonly support: AnalyticsCapabilitySupport;
  readonly description?: string;
  readonly notes?: readonly string[];
};

/** Catalogue query / page helpers for DashboardService. */
export type DashboardCatalogueQuery = {
  readonly categoryId?: DashboardCategoryId;
  readonly status?: AnalyticsLifecycleStatus;
  readonly tag?: string;
  readonly search?: string;
  readonly limit?: number;
  readonly cursor?: string;
};

export type CataloguePage<T> = {
  readonly items: readonly T[];
  readonly nextCursor?: string;
  readonly totalEstimate?: number;
};

/** Information Model aliases — same shapes, IM vocabulary. */
export type DashboardRegistryEntry = AnalyticsDashboard;
export type DatasetDescriptor = AnalyticsDataset;
export type WidgetRef = AnalyticsWidget;
export type EmbedSession = DashboardEmbedding;
export type CatalogueTag = DashboardCategory;
