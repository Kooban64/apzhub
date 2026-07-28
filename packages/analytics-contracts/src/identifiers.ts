/** Branded platform identifiers for Analytics Platform entities (APZHUB-PLATFORM-ANALYTICS-003). */

declare const brand: unique symbol;

type Brand<T, TBrand extends string> = T & { readonly [brand]: TBrand };

export type AnalyticsDashboardId = Brand<string, "AnalyticsDashboardId">;
export type DashboardCategoryId = Brand<string, "DashboardCategoryId">;
export type AnalyticsDatasetId = Brand<string, "AnalyticsDatasetId">;
export type AnalyticsMetricId = Brand<string, "AnalyticsMetricId">;
export type AnalyticsKPIId = Brand<string, "AnalyticsKPIId">;
export type AnalyticsReportId = Brand<string, "AnalyticsReportId">;
export type AnalyticsWidgetId = Brand<string, "AnalyticsWidgetId">;
export type SavedDashboardId = Brand<string, "SavedDashboardId">;
export type DashboardEmbeddingId = Brand<string, "DashboardEmbeddingId">;
export type DashboardPermissionId = Brand<string, "DashboardPermissionId">;
export type AnalyticsFilterId = Brand<string, "AnalyticsFilterId">;
export type AnalyticsParameterId = Brand<string, "AnalyticsParameterId">;
export type AnalyticsCapabilityId = Brand<string, "AnalyticsCapabilityId">;

/** Opaque provider resource reference — never a vendor-native public ID. */
export type AnalyticsProviderRef = Brand<string, "AnalyticsProviderRef">;

const ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{1,127}$/;

export function isPlatformAnalyticsIdShape(value: string): boolean {
  return ID_PATTERN.test(value);
}

function brandId<T extends string>(value: string): T {
  if (!isPlatformAnalyticsIdShape(value)) {
    throw new Error(`Invalid platform analytics identifier shape: ${value}`);
  }
  return value as T;
}

export function asAnalyticsDashboardId(value: string): AnalyticsDashboardId {
  return brandId(value);
}
export function asDashboardCategoryId(value: string): DashboardCategoryId {
  return brandId(value);
}
export function asAnalyticsDatasetId(value: string): AnalyticsDatasetId {
  return brandId(value);
}
export function asAnalyticsMetricId(value: string): AnalyticsMetricId {
  return brandId(value);
}
export function asAnalyticsKPIId(value: string): AnalyticsKPIId {
  return brandId(value);
}
export function asAnalyticsReportId(value: string): AnalyticsReportId {
  return brandId(value);
}
export function asAnalyticsWidgetId(value: string): AnalyticsWidgetId {
  return brandId(value);
}
export function asSavedDashboardId(value: string): SavedDashboardId {
  return brandId(value);
}
export function asDashboardEmbeddingId(value: string): DashboardEmbeddingId {
  return brandId(value);
}
export function asDashboardPermissionId(value: string): DashboardPermissionId {
  return brandId(value);
}
export function asAnalyticsFilterId(value: string): AnalyticsFilterId {
  return brandId(value);
}
export function asAnalyticsParameterId(value: string): AnalyticsParameterId {
  return brandId(value);
}
export function asAnalyticsCapabilityId(value: string): AnalyticsCapabilityId {
  return brandId(value);
}
export function asAnalyticsProviderRef(value: string): AnalyticsProviderRef {
  return brandId(value);
}
