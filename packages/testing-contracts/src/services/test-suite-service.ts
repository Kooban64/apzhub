import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import type { TestSuite } from "../domain";
import type { TestStatus } from "../enums";
import type { TestCaseId, TestPlanId, TestSuiteId } from "../identifiers";

/** Test suite domain service — hierarchies, ordering, grouping, cloning, ownership. */
export interface TestSuiteService {
  list(ctx: ServiceRequestContext): Promise<readonly TestSuite[]>;
  get(ctx: ServiceRequestContext, id: TestSuiteId): Promise<TestSuite>;
  create(
    ctx: ServiceRequestContext,
    input: Omit<TestSuite, "id" | "createdAt" | "updatedAt">,
  ): Promise<TestSuite>;
  update(
    ctx: ServiceRequestContext,
    id: TestSuiteId,
    input: Partial<Omit<TestSuite, "id" | "tenantId" | "createdAt">>,
  ): Promise<TestSuite>;
  archive(ctx: ServiceRequestContext, id: TestSuiteId): Promise<TestSuite>;
  clone(
    ctx: ServiceRequestContext,
    id: TestSuiteId,
    options?: { readonly key?: string; readonly name?: string },
  ): Promise<TestSuite>;
  version(
    ctx: ServiceRequestContext,
    id: TestSuiteId,
    summary?: string,
  ): Promise<TestSuite>;
  setParent(
    ctx: ServiceRequestContext,
    id: TestSuiteId,
    parentSuiteId: TestSuiteId | null,
  ): Promise<TestSuite>;
  reorder(
    ctx: ServiceRequestContext,
    id: TestSuiteId,
    sortOrder: number,
  ): Promise<TestSuite>;
  setGroup(
    ctx: ServiceRequestContext,
    id: TestSuiteId,
    groupKey: string | null,
  ): Promise<TestSuite>;
  assignOwner(
    ctx: ServiceRequestContext,
    id: TestSuiteId,
    ownerId: string,
  ): Promise<TestSuite>;
  linkCase(
    ctx: ServiceRequestContext,
    id: TestSuiteId,
    caseId: TestCaseId,
  ): Promise<TestSuite>;
  unlinkCase(
    ctx: ServiceRequestContext,
    id: TestSuiteId,
    caseId: TestCaseId,
  ): Promise<TestSuite>;
  linkPlan(
    ctx: ServiceRequestContext,
    id: TestSuiteId,
    planId: TestPlanId,
  ): Promise<TestSuite>;
  setStatus(
    ctx: ServiceRequestContext,
    id: TestSuiteId,
    status: TestStatus,
  ): Promise<TestSuite>;
}
