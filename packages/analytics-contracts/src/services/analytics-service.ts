/**
 * AnalyticsService — platform orchestration port (interfaces only).
 * APZHUB-PLATFORM-ANALYTICS-003 — no business logic.
 */

import type { AnalyticsRequestContext } from "../common/context";
import type {
  AnalyticsDashboard,
  AnalyticsHealth,
  DashboardEmbedding,
  DashboardParameter,
} from "../domain/analytics";
import type { AnalyticsDashboardId } from "../identifiers";

export type OpenDashboardRequest = {
  readonly dashboardId: AnalyticsDashboardId;
  readonly parameters?: readonly DashboardParameter[];
  readonly parameterValues?: Readonly<Record<string, unknown>>;
  readonly issueEmbed?: boolean;
};

export type OpenDashboardResult = {
  readonly dashboard: AnalyticsDashboard;
  readonly embedding?: DashboardEmbedding;
};

export type AnalyticsReadinessResult = {
  readonly readiness: "ready" | "ready_with_limitations" | "not_ready";
  readonly reasons: readonly string[];
  readonly providerId: string;
  readonly healthStatus: AnalyticsHealth["status"];
};

export type AnalyticsService = {
  readonly getHealth: (ctx: AnalyticsRequestContext) => Promise<AnalyticsHealth>;
  readonly getReadiness: (
    ctx: AnalyticsRequestContext,
  ) => Promise<AnalyticsReadinessResult>;
  readonly openDashboard: (
    ctx: AnalyticsRequestContext,
    request: OpenDashboardRequest,
  ) => Promise<OpenDashboardResult>;
};
