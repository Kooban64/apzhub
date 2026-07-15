import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import type {
  AutomatedExecution,
  ExecutionSession,
  ManualExecution,
  TestResult,
  TestRun,
} from "../domain";
import type {
  AutomatedExecutionId,
  ExecutionSessionId,
  ManualExecutionId,
  TestResultId,
  TestRunId,
} from "../identifiers";

/** Manual and automated execution session / run / result contract. */
export interface ExecutionService {
  listSessions(ctx: ServiceRequestContext): Promise<readonly ExecutionSession[]>;
  getSession(
    ctx: ServiceRequestContext,
    id: ExecutionSessionId,
  ): Promise<ExecutionSession>;
  createSession(
    ctx: ServiceRequestContext,
    input: Omit<ExecutionSession, "id" | "createdAt" | "updatedAt">,
  ): Promise<ExecutionSession>;
  updateSessionStatus(
    ctx: ServiceRequestContext,
    id: ExecutionSessionId,
    status: ExecutionSession["status"],
  ): Promise<ExecutionSession>;

  startManualExecution(
    ctx: ServiceRequestContext,
    input: Omit<ManualExecution, "id" | "createdAt" | "updatedAt">,
  ): Promise<ManualExecution>;
  getManualExecution(
    ctx: ServiceRequestContext,
    id: ManualExecutionId,
  ): Promise<ManualExecution>;
  completeManualExecution(
    ctx: ServiceRequestContext,
    id: ManualExecutionId,
  ): Promise<ManualExecution>;

  registerAutomatedExecution(
    ctx: ServiceRequestContext,
    input: Omit<AutomatedExecution, "id" | "createdAt" | "updatedAt">,
  ): Promise<AutomatedExecution>;
  getAutomatedExecution(
    ctx: ServiceRequestContext,
    id: AutomatedExecutionId,
  ): Promise<AutomatedExecution>;

  listRuns(ctx: ServiceRequestContext): Promise<readonly TestRun[]>;
  getRun(ctx: ServiceRequestContext, id: TestRunId): Promise<TestRun>;
  createRun(
    ctx: ServiceRequestContext,
    input: Omit<TestRun, "id" | "createdAt" | "updatedAt">,
  ): Promise<TestRun>;
  completeRun(ctx: ServiceRequestContext, id: TestRunId): Promise<TestRun>;

  recordResult(
    ctx: ServiceRequestContext,
    input: Omit<TestResult, "id" | "createdAt" | "updatedAt">,
  ): Promise<TestResult>;
  getResult(ctx: ServiceRequestContext, id: TestResultId): Promise<TestResult>;
  listResultsForRun(
    ctx: ServiceRequestContext,
    runId: TestRunId,
  ): Promise<readonly TestResult[]>;
}
