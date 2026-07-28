/**
 * ReportService — Reporting SoR link resolution (interfaces only).
 * Does not own Reporting artefacts. APZHUB-PLATFORM-ANALYTICS-003.
 */

import type { AnalyticsRequestContext } from "../common/context";
import type { AnalyticsReport } from "../domain/analytics";
import type { AnalyticsReportId } from "../identifiers";

export type ResolveReportLinkResult = {
  readonly report: AnalyticsReport;
  /** Opaque deep-link / handle into Reporting Platform — not a file blob. */
  readonly reportingLinkRef: string;
};

export type ReportService = {
  readonly resolveReportLink: (
    ctx: AnalyticsRequestContext,
    reportId: AnalyticsReportId,
  ) => Promise<ResolveReportLinkResult>;
  readonly listReportLinks: (
    ctx: AnalyticsRequestContext,
  ) => Promise<readonly AnalyticsReport[]>;
};
