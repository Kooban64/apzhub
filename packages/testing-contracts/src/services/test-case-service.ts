import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import type {
  TestCase,
  TestCaseParameter,
  TestCaseVersion,
  TestStep,
} from "../domain";
import type { Priority, Severity, TestStatus } from "../enums";
import type { TestCaseId, TestCaseVersionId, TestSuiteId } from "../identifiers";

/** Test case domain service — lifecycle, versioning, clone, templates, parameters. */
export interface TestCaseService {
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
  archive(ctx: ServiceRequestContext, id: TestCaseId): Promise<TestCase>;
  transitionStatus(
    ctx: ServiceRequestContext,
    id: TestCaseId,
    status: TestStatus,
  ): Promise<TestCase>;
  clone(
    ctx: ServiceRequestContext,
    id: TestCaseId,
    options?: { readonly key?: string; readonly title?: string },
  ): Promise<TestCase>;
  createFromTemplate(
    ctx: ServiceRequestContext,
    templateKey: string,
    input: Partial<Omit<TestCase, "id" | "createdAt" | "updatedAt" | "templateKey">> & {
      readonly key: string;
      readonly title: string;
      readonly tenantId: string;
    },
  ): Promise<TestCase>;
  version(
    ctx: ServiceRequestContext,
    id: TestCaseId,
    reason?: string,
    summary?: string,
  ): Promise<TestCaseVersion>;
  listVersions(
    ctx: ServiceRequestContext,
    id: TestCaseId,
  ): Promise<readonly TestCaseVersion[]>;
  getVersion(
    ctx: ServiceRequestContext,
    versionId: TestCaseVersionId,
  ): Promise<TestCaseVersion>;
  replaceSteps(
    ctx: ServiceRequestContext,
    id: TestCaseId,
    steps: readonly TestStep[],
  ): Promise<TestCase>;
  setParameters(
    ctx: ServiceRequestContext,
    id: TestCaseId,
    parameters: readonly TestCaseParameter[],
  ): Promise<TestCase>;
  setPreconditions(
    ctx: ServiceRequestContext,
    id: TestCaseId,
    preconditions: string | undefined,
  ): Promise<TestCase>;
  setPostconditions(
    ctx: ServiceRequestContext,
    id: TestCaseId,
    postconditions: string | undefined,
  ): Promise<TestCase>;
  setPriority(
    ctx: ServiceRequestContext,
    id: TestCaseId,
    priority: Priority,
  ): Promise<TestCase>;
  setRisk(
    ctx: ServiceRequestContext,
    id: TestCaseId,
    riskLevel: Severity | undefined,
  ): Promise<TestCase>;
  setTags(
    ctx: ServiceRequestContext,
    id: TestCaseId,
    tags: readonly string[],
  ): Promise<TestCase>;
  setComponents(
    ctx: ServiceRequestContext,
    id: TestCaseId,
    components: readonly string[],
  ): Promise<TestCase>;
  assignOwner(
    ctx: ServiceRequestContext,
    id: TestCaseId,
    ownerId: string,
  ): Promise<TestCase>;
  assignReviewer(
    ctx: ServiceRequestContext,
    id: TestCaseId,
    reviewerId: string,
  ): Promise<TestCase>;
  linkSuite(
    ctx: ServiceRequestContext,
    id: TestCaseId,
    suiteId: TestSuiteId,
  ): Promise<TestCase>;
}
