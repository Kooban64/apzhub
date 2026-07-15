import type { ServiceRequestContext } from "../../common/context";
import type { TestPlan, TestPlanId } from "@apzhub/testing-contracts";

/** Vendor-neutral testing plan platform service. */
export interface TestingPlanService {
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
  clone(
    ctx: ServiceRequestContext,
    id: TestPlanId,
    options?: { readonly key?: string; readonly name?: string },
  ): Promise<TestPlan>;
  archive(ctx: ServiceRequestContext, id: TestPlanId): Promise<TestPlan>;
}
