import type { ServiceRequestContext } from "../../common/context";

export interface TimeReportingCapabilities {
  readonly foundationOnly: true;
  readonly supported: readonly string[];
  readonly unsupported: readonly string[];
}

export interface TimeReportingHealth {
  readonly status: "healthy" | "degraded" | "unavailable";
  readonly message: string;
  readonly checkedAt: string;
}

/** Foundation reporting facet — no exports / UI / analytics engines. */
export interface TimeReportingService {
  getReportingCapabilities(
    ctx: ServiceRequestContext,
  ): Promise<TimeReportingCapabilities>;
  getReportingHealth(ctx: ServiceRequestContext): Promise<TimeReportingHealth>;
}
