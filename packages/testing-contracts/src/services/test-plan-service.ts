import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import type { TestPlan } from "../domain";
import type { TestStatus } from "../enums";
import type { RequirementId, RiskId, TestPlanId, TestSuiteId } from "../identifiers";

/** Test plan domain service — create, archive, clone, version, ownership, assignment. */
export interface TestPlanService {
  list(ctx: ServiceRequestContext): Promise<readonly TestPlan[]>;
  get(ctx: ServiceRequestContext, id: TestPlanId): Promise<TestPlan>;
  create(
    ctx: ServiceRequestContext,
    input: Omit<TestPlan, "id" | "createdAt" | "updatedAt">,
  ): Promise<TestPlan>;
  update(
    ctx: ServiceRequestContext,
    id: TestPlanId,
    input: Partial<Omit<TestPlan, "id" | "tenantId" | "createdAt">>,
  ): Promise<TestPlan>;
  archive(ctx: ServiceRequestContext, id: TestPlanId): Promise<TestPlan>;
  clone(
    ctx: ServiceRequestContext,
    id: TestPlanId,
    options?: { readonly key?: string; readonly name?: string },
  ): Promise<TestPlan>;
  version(
    ctx: ServiceRequestContext,
    id: TestPlanId,
    summary?: string,
  ): Promise<TestPlan>;
  setStatus(
    ctx: ServiceRequestContext,
    id: TestPlanId,
    status: TestStatus,
  ): Promise<TestPlan>;
  assignOwner(
    ctx: ServiceRequestContext,
    id: TestPlanId,
    ownerId: string,
  ): Promise<TestPlan>;
  assignAssignee(
    ctx: ServiceRequestContext,
    id: TestPlanId,
    assigneeId: string,
  ): Promise<TestPlan>;
  linkSuite(
    ctx: ServiceRequestContext,
    id: TestPlanId,
    suiteId: TestSuiteId,
  ): Promise<TestPlan>;
  unlinkSuite(
    ctx: ServiceRequestContext,
    id: TestPlanId,
    suiteId: TestSuiteId,
  ): Promise<TestPlan>;
  linkRequirement(
    ctx: ServiceRequestContext,
    id: TestPlanId,
    requirementId: RequirementId,
  ): Promise<TestPlan>;
  linkRisk(
    ctx: ServiceRequestContext,
    id: TestPlanId,
    riskId: RiskId,
  ): Promise<TestPlan>;
}
