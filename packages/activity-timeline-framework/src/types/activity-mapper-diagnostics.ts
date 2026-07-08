import type { ActivityDocument } from "../types/activity-document";

export type ActivityMappingIssueCode = "NO_MATCH" | "TEMPLATE_ERROR" | "TYPE_SKIPPED";

export interface ActivityMappingIssue {
  readonly code: ActivityMappingIssueCode;
  readonly activityTypeId?: string;
  readonly message: string;
}

export interface ActivityMapperResult {
  readonly ok: boolean;
  readonly createdCount: number;
  readonly matchedTypeCount: number;
  readonly documents: readonly ActivityDocument[];
  readonly issues: readonly ActivityMappingIssue[];
}

/** Activity mapper diagnostics — mapping runtime snapshot. */
export interface ActivityMapperDiagnostics {
  readonly status: "scaffold" | "empty" | "ready";
  readonly mappedCount: number;
  readonly lastMappedCount: number;
  readonly lastMatchedTypeCount: number;
  readonly lastSourceEventId?: string;
  readonly templateErrorCount: number;
  readonly message: string;
}
