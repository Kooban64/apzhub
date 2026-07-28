/**
 * Future gateway facet shape — documentation-level composition type.
 * HTTP wiring is out of scope for APZHUB-PLATFORM-ANALYTICS-003.
 */

import type { AnalyticsService } from "./analytics-service";
import type { CapabilityService } from "./capability-service";
import type { DashboardService } from "./dashboard-service";
import type { DatasetService } from "./dataset-service";
import type { AnalyticsPermissionService } from "./permission-service";
import type { ReportService } from "./report-service";
import type { SavedDashboardService } from "./saved-dashboard-service";

/** `gateway.analytics.*` composition — interfaces only. */
export type AnalyticsPlatformGateway = {
  readonly analytics: AnalyticsService;
  readonly dashboards: DashboardService;
  readonly datasets: DatasetService;
  readonly reports: ReportService;
  readonly savedDashboards: SavedDashboardService;
  readonly permissions: AnalyticsPermissionService;
  readonly capabilities: CapabilityService;
};
