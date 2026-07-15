import type { ServiceRequestContext } from "../../common/context";
import type { TestSuite, TestSuiteId } from "@apzhub/testing-contracts";

/** Vendor-neutral testing suite platform service. */
export interface TestingSuiteService {
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
  clone(
    ctx: ServiceRequestContext,
    id: TestSuiteId,
    options?: { readonly key?: string; readonly name?: string },
  ): Promise<TestSuite>;
  archive(ctx: ServiceRequestContext, id: TestSuiteId): Promise<TestSuite>;
}
