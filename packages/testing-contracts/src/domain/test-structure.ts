import type { AuditFields } from "./audit";
import type {
  RegressionSuiteId,
  RequirementId,
  RiskId,
  TestCaseId,
  TestCaseVersionId,
  TestPlanId,
  TestStepId,
  TestSuiteId,
} from "../identifiers";
import type {
  CaseVersionReason,
  Priority,
  Severity,
  TestStatus,
} from "../enums";

export interface TestPlan extends AuditFields {
  readonly id: TestPlanId;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly status: TestStatus;
  readonly suiteIds: readonly TestSuiteId[];
  readonly requirementIds: readonly RequirementId[];
  readonly riskIds: readonly RiskId[];
  readonly releaseLabel?: string;
  readonly milestoneLabel?: string;
  readonly ownerId?: string;
  readonly assigneeId?: string;
  readonly versionNumber?: number;
  readonly parentPlanId?: TestPlanId;
}

export interface TestSuite extends AuditFields {
  readonly id: TestSuiteId;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly status: TestStatus;
  readonly planIds: readonly TestPlanId[];
  readonly caseIds: readonly TestCaseId[];
  readonly isRegression: boolean;
  readonly ownerId?: string;
  readonly parentSuiteId?: TestSuiteId;
  readonly sortOrder?: number;
  readonly versionNumber?: number;
  readonly groupKey?: string;
}

export interface TestStep {
  readonly id: TestStepId;
  readonly caseId: TestCaseId;
  readonly ordinal: number;
  readonly action: string;
  readonly expectedResult: string;
  readonly dataHint?: string;
  readonly parentStepId?: TestStepId;
  readonly nestLevel?: number;
  readonly repeatIndex?: number;
  readonly parameters?: Readonly<Record<string, string>>;
  readonly attachmentIds?: readonly string[];
}

/** Named parameter placeholder used by templates / data-driven manual cases. */
export interface TestCaseParameter {
  readonly key: string;
  readonly label?: string;
  readonly defaultValue?: string;
  readonly required?: boolean;
}

export interface TestCase extends AuditFields {
  readonly id: TestCaseId;
  readonly key: string;
  readonly title: string;
  readonly description?: string;
  readonly status: TestStatus;
  readonly priority: Priority;
  readonly suiteIds: readonly TestSuiteId[];
  readonly requirementIds: readonly RequirementId[];
  readonly steps: readonly TestStep[];
  readonly tags?: readonly string[];
  readonly estimatedMinutes?: number;
  readonly preconditions?: string;
  readonly postconditions?: string;
  readonly expectedResultsSummary?: string;
  readonly templateKey?: string;
  readonly parameters?: readonly TestCaseParameter[];
  readonly components?: readonly string[];
  readonly ownerId?: string;
  readonly reviewerId?: string;
  readonly versionNumber?: number;
  readonly parentCaseId?: TestCaseId;
  readonly riskLevel?: Severity;
}

/** Immutable snapshot of a test case at a version boundary. */
export interface TestCaseVersion extends AuditFields {
  readonly id: TestCaseVersionId;
  readonly caseId: TestCaseId;
  readonly versionNumber: number;
  readonly reason: CaseVersionReason;
  readonly snapshot: Readonly<Omit<TestCase, "steps">> & {
    readonly steps: readonly Omit<TestStep, "id" | "caseId">[];
  };
  readonly changedByUserId?: string;
  readonly changeSummary?: string;
}

export interface RegressionSuite extends AuditFields {
  readonly id: RegressionSuiteId;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly suiteIds: readonly TestSuiteId[];
  readonly planId?: TestPlanId;
  readonly ownerId?: string;
}
