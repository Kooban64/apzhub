import type { ActivityCategory } from "./activity-category";
import type { ActivityRegistrationIssue } from "./activity-metadata";

export type ActivityRegistryStatus = "scaffold" | "empty" | "ready" | "degraded";

/** Activity Registry diagnostics snapshot — metadata registry only. */
export interface ActivityRegistryDiagnostics {
  readonly status: ActivityRegistryStatus;
  readonly registeredActivityTypeCount: number;
  readonly activeCount: number;
  readonly platformCount: number;
  readonly manifestCount: number;
  readonly activityTypeIds: readonly string[];
  readonly duplicateActivityTypeIds: readonly string[];
  readonly validationIssueCount: number;
  readonly categoryCounts: Readonly<Partial<Record<ActivityCategory, number>>>;
  readonly scopeCounts: Readonly<Partial<Record<string, number>>>;
  readonly manifestCapabilityCount: number;
  readonly manifestCapabilityIds?: readonly string[];
  readonly platformCatalogueVersion?: string;
  readonly frameworkVersion?: string;
  readonly issues: readonly ActivityRegistrationIssue[];
  readonly message: string;
}

/** Activity Service diagnostics — session store snapshot. */
export interface ActivityServiceDiagnostics {
  readonly status: "scaffold" | "empty" | "ready";
  readonly totalActivityCount: number;
  readonly scopeCounts: Readonly<Partial<Record<string, number>>>;
  readonly categoryCounts: Readonly<Partial<Record<ActivityCategory, number>>>;
  readonly latestActivityTimestamp?: string;
  readonly message: string;
}
