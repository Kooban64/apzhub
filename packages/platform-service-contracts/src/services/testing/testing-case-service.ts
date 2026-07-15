import type { ServiceRequestContext } from "../../common/context";
import type { TestCase, TestCaseId, TestStatus } from "@apzhub/testing-contracts";

/** Vendor-neutral testing case platform service. */
export interface TestingCaseService {
  list(ctx: ServiceRequestContext): Promise<readonly TestCase[]>;
  get(ctx: ServiceRequestContext, id: TestCaseId): Promise<TestCase>;
  create(
    ctx: ServiceRequestContext,
    input: Omit<TestCase, "id" | "createdAt" | "updatedAt">,
  ): Promise<TestCase>;
  update(
    ctx: ServiceRequestContext,
    id: TestCaseId,
    input: Partial<Omit<TestCase, "id" | "tenantId" | "createdAt">>,
  ): Promise<TestCase>;
  clone(
    ctx: ServiceRequestContext,
    id: TestCaseId,
    options?: { readonly key?: string; readonly title?: string },
  ): Promise<TestCase>;
  archive(ctx: ServiceRequestContext, id: TestCaseId): Promise<TestCase>;
  transitionStatus(
    ctx: ServiceRequestContext,
    id: TestCaseId,
    status: TestStatus,
  ): Promise<TestCase>;
}
