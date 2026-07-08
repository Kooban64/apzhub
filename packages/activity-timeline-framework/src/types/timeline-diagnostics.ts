import type { TimelineRegistrationIssue } from "./timeline-metadata";

export type TimelineRegistryStatus = "scaffold" | "empty" | "ready" | "degraded";

/** Timeline Registry diagnostics — definition metadata only, not timeline entries. */
export interface TimelineRegistryDiagnostics {
  readonly status: TimelineRegistryStatus;
  readonly registeredTimelineCount: number;
  readonly activeCount: number;
  readonly platformCount: number;
  readonly manifestCount: number;
  readonly timelineIds: readonly string[];
  readonly duplicateTimelineIds: readonly string[];
  readonly validationIssueCount: number;
  readonly scopeCounts: Readonly<Partial<Record<string, number>>>;
  readonly manifestCapabilityCount: number;
  readonly manifestCapabilityIds?: readonly string[];
  readonly platformCatalogueVersion?: string;
  readonly frameworkVersion?: string;
  readonly issues: readonly TimelineRegistrationIssue[];
  readonly message: string;
}
