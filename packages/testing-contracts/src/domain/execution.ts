import type { AuditFields } from "./audit";
import type {
  AutomatedExecutionId,
  AutomationJobId,
  EvidenceId,
  ExecutionSessionId,
  ManualExecutionId,
  TestCaseId,
  TestPlanId,
  TestResultId,
  TestRunId,
  TestStepId,
  TestSuiteId,
} from "../identifiers";
import type {
  AutomationType,
  ExecutionApprovalState,
  ExecutionStatus,
  ExecutionType,
  TestResultStatus,
  TestRunStatus,
} from "../enums";

export interface ExecutionSession extends AuditFields {
  readonly id: ExecutionSessionId;
  readonly planId?: TestPlanId;
  readonly suiteId?: TestSuiteId;
  readonly executionType: ExecutionType;
  readonly status: ExecutionStatus;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly assigneeId?: string;
  readonly notes?: string;
}

export interface ExecutionComment {
  readonly id: string;
  readonly authorUserId: string;
  readonly body: string;
  readonly createdAt: string;
}

export interface ManualExecution extends AuditFields {
  readonly id: ManualExecutionId;
  readonly sessionId: ExecutionSessionId;
  readonly caseId: TestCaseId;
  readonly status: ExecutionStatus;
  readonly assigneeId?: string;
  readonly testerId?: string;
  readonly reviewerId?: string;
  readonly startedAt?: string;
  readonly pausedAt?: string;
  readonly resumedAt?: string;
  readonly completedAt?: string;
  readonly approvalState?: ExecutionApprovalState;
  readonly comments?: readonly ExecutionComment[];
  readonly stepActuals: readonly ManualStepActual[];
  readonly overallResult?: TestResultStatus;
  readonly restartOfId?: ManualExecutionId;
  /** Parameter overrides applied during step substitution. */
  readonly parameterOverrides?: Readonly<Record<string, string>>;
  readonly blockReason?: string;
}

export interface ManualStepActual {
  readonly stepId: TestStepId;
  readonly actualResult?: string;
  readonly status?: TestResultStatus;
  readonly evidenceIds?: readonly EvidenceId[];
  readonly notes?: string;
  readonly comment?: string;
  /** Alias for comment — kept for callers that prefer plural. */
  readonly comments?: string;
  readonly recordedAt?: string;
  readonly expectedSnapshot?: string;
  readonly expectedResult?: string;
  readonly recordedByUserId?: string;
  readonly parentStepId?: TestStepId;
  readonly nestLevel?: number;
  readonly repeatIndex?: number;
  readonly parameters?: Readonly<Record<string, string>>;
  readonly attachmentIds?: readonly string[];
  readonly ordinal?: number;
}

export interface AutomatedExecution extends AuditFields {
  readonly id: AutomatedExecutionId;
  readonly sessionId: ExecutionSessionId;
  readonly automationType: AutomationType;
  readonly status: ExecutionStatus;
  readonly adapterSourceId?: string;
  readonly externalRunRef?: string;
  readonly jobId?: AutomationJobId;
  readonly startedAt?: string;
  readonly completedAt?: string;
}

export interface TestRun extends AuditFields {
  readonly id: TestRunId;
  readonly sessionId: ExecutionSessionId;
  readonly caseId?: TestCaseId;
  readonly suiteId?: TestSuiteId;
  readonly executionType: ExecutionType;
  readonly status: TestRunStatus;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly resultIds: readonly TestResultId[];
  readonly evidenceIds: readonly EvidenceId[];
}

export interface TestResult extends AuditFields {
  readonly id: TestResultId;
  readonly runId: TestRunId;
  readonly caseId: TestCaseId;
  readonly stepId?: TestStepId;
  readonly status: TestResultStatus;
  readonly message?: string;
  readonly durationMs?: number;
  readonly evidenceIds?: readonly EvidenceId[];
}
