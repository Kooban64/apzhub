import type { ServiceRequestContext } from "../../common/context";
import type { TestingDashboardSummary } from "../../domain/testing-dashboard";

/** Vendor-neutral testing dashboard aggregate platform service. */
export interface TestingDashboardService {
  getDashboardSummary(ctx: ServiceRequestContext): Promise<TestingDashboardSummary>;
}
