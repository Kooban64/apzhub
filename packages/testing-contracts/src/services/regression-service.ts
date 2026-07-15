import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import type { RegressionSuite } from "../domain";
import type { RegressionSuiteId, TestPlanId, TestSuiteId } from "../identifiers";

/** Regression set domain service. */
export interface RegressionService {
  list(ctx: ServiceRequestContext): Promise<readonly RegressionSuite[]>;
  get(ctx: ServiceRequestContext, id: RegressionSuiteId): Promise<RegressionSuite>;
  create(
    ctx: ServiceRequestContext,
    input: Omit<RegressionSuite, "id" | "createdAt" | "updatedAt">,
  ): Promise<RegressionSuite>;
  update(
    ctx: ServiceRequestContext,
    id: RegressionSuiteId,
    input: Partial<Omit<RegressionSuite, "id" | "tenantId" | "createdAt">>,
  ): Promise<RegressionSuite>;
  archive(
    ctx: ServiceRequestContext,
    id: RegressionSuiteId,
  ): Promise<RegressionSuite>;
  addSuite(
    ctx: ServiceRequestContext,
    id: RegressionSuiteId,
    suiteId: TestSuiteId,
  ): Promise<RegressionSuite>;
  removeSuite(
    ctx: ServiceRequestContext,
    id: RegressionSuiteId,
    suiteId: TestSuiteId,
  ): Promise<RegressionSuite>;
  assignPlan(
    ctx: ServiceRequestContext,
    id: RegressionSuiteId,
    planId: TestPlanId | null,
  ): Promise<RegressionSuite>;
  assignOwner(
    ctx: ServiceRequestContext,
    id: RegressionSuiteId,
    ownerId: string,
  ): Promise<RegressionSuite>;
}
