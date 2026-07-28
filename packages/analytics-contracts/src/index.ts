/**
 * @apzhub/analytics-contracts — Analytics Platform contracts (APZHUB-PLATFORM-ANALYTICS-003).
 * Provider-neutral models + service interfaces. No business logic. No Metabase DTOs.
 */

export { ANALYTICS_CONTRACTS_VERSION } from "./version";
export * from "./identifiers";
export * from "./common/context";
export * from "./enums/catalogue";
export * from "./domain/analytics";
export * from "./permissions/catalogue";

export type {
  AnalyticsService,
  AnalyticsReadinessResult,
  OpenDashboardRequest,
  OpenDashboardResult,
} from "./services/analytics-service";
export type {
  DashboardService,
  PublishDashboardInput,
  SetDashboardStatusInput,
  SetRoleVisibilityInput,
} from "./services/dashboard-service";
export type { DatasetService, UpsertDatasetInput } from "./services/dataset-service";
export type { ReportService, ResolveReportLinkResult } from "./services/report-service";
export type {
  SavedDashboardService,
  SaveDashboardInput,
} from "./services/saved-dashboard-service";
export type {
  AnalyticsPermissionService,
  PermissionService,
} from "./services/permission-service";
export type { CapabilityService } from "./services/capability-service";
export type { AnalyticsPlatformGateway } from "./services/platform-gateway";

export {
  EXAMPLE_ANALYTICS_CONTEXT,
  EXAMPLE_DASHBOARD_SUMMARY,
  EXAMPLE_ANALYTICS_DASHBOARD,
  EXAMPLE_DATASET,
  EXAMPLE_SAVED_DASHBOARD,
  EXAMPLE_HEALTH,
  EXAMPLE_CAPABILITY,
} from "./examples/example-shapes";
