import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import type {
  DefectLink,
  Evidence,
  Requirement,
  Risk,
  TestCase,
  TestPlan,
  TestSuite,
  TestStep,
} from "../domain";
import type {
  DefectLinkId,
  EvidenceId,
  RequirementId,
  RiskId,
  TestCaseId,
  TestPlanId,
  TestSuiteId,
} from "../identifiers";

/** Primary orchestration contract for test assets and related metadata. */
export interface TestingService {
  listRequirements(ctx: ServiceRequestContext): Promise<readonly Requirement[]>;
  getRequirement(ctx: ServiceRequestContext, id: RequirementId): Promise<Requirement>;
  createRequirement(
    ctx: ServiceRequestContext,
    input: Omit<Requirement, "id" | "createdAt" | "updatedAt">,
  ): Promise<Requirement>;
  updateRequirement(
    ctx: ServiceRequestContext,
    id: RequirementId,
    input: Partial<Omit<Requirement, "id" | "tenantId" | "createdAt">>,
  ): Promise<Requirement>;

  listRisks(ctx: ServiceRequestContext): Promise<readonly Risk[]>;
  getRisk(ctx: ServiceRequestContext, id: RiskId): Promise<Risk>;
  createRisk(
    ctx: ServiceRequestContext,
    input: Omit<Risk, "id" | "createdAt" | "updatedAt">,
  ): Promise<Risk>;

  listTestPlans(ctx: ServiceRequestContext): Promise<readonly TestPlan[]>;
  getTestPlan(ctx: ServiceRequestContext, id: TestPlanId): Promise<TestPlan>;
  createTestPlan(
    ctx: ServiceRequestContext,
    input: Omit<TestPlan, "id" | "createdAt" | "updatedAt">,
  ): Promise<TestPlan>;
  updateTestPlan(
    ctx: ServiceRequestContext,
    id: TestPlanId,
    input: Partial<Omit<TestPlan, "id" | "tenantId" | "createdAt">>,
  ): Promise<TestPlan>;

  listTestSuites(ctx: ServiceRequestContext): Promise<readonly TestSuite[]>;
  getTestSuite(ctx: ServiceRequestContext, id: TestSuiteId): Promise<TestSuite>;
  createTestSuite(
    ctx: ServiceRequestContext,
    input: Omit<TestSuite, "id" | "createdAt" | "updatedAt">,
  ): Promise<TestSuite>;

  listTestCases(ctx: ServiceRequestContext): Promise<readonly TestCase[]>;
  getTestCase(ctx: ServiceRequestContext, id: TestCaseId): Promise<TestCase>;
  createTestCase(
    ctx: ServiceRequestContext,
    input: Omit<TestCase, "id" | "createdAt" | "updatedAt">,
  ): Promise<TestCase>;
  updateTestCase(
    ctx: ServiceRequestContext,
    id: TestCaseId,
    input: Partial<Omit<TestCase, "id" | "tenantId" | "createdAt">>,
  ): Promise<TestCase>;
  replaceTestSteps(
    ctx: ServiceRequestContext,
    caseId: TestCaseId,
    steps: readonly TestStep[],
  ): Promise<TestCase>;

  listEvidence(ctx: ServiceRequestContext): Promise<readonly Evidence[]>;
  getEvidence(ctx: ServiceRequestContext, id: EvidenceId): Promise<Evidence>;
  registerEvidenceMetadata(
    ctx: ServiceRequestContext,
    input: Omit<Evidence, "id" | "createdAt" | "updatedAt">,
  ): Promise<Evidence>;

  listDefectLinks(ctx: ServiceRequestContext): Promise<readonly DefectLink[]>;
  createDefectLink(
    ctx: ServiceRequestContext,
    input: Omit<DefectLink, "id" | "createdAt" | "updatedAt">,
  ): Promise<DefectLink>;
  removeDefectLink(ctx: ServiceRequestContext, id: DefectLinkId): Promise<void>;
}
