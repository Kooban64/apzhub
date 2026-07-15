import type { ServiceRequestContext } from "../../common/context";
import type {
  AutomatedExecutionId,
  AutomationCoverageSnapshot,
  AutomationImport,
  AutomationImportHistory,
  AutomationImportId,
  AutomationImportInput,
  AutomationImportOutcome,
  AutomationResultItem,
  AutomationRun,
  AutomationRunId,
  CanonicalAutomationCoverageSummary,
  CanonicalAutomationResult,
} from "@apzhub/testing-contracts";

/** Vendor-neutral automation result ingestion platform service; it never executes tests. */
export interface TestingAutomationService {
  validateImport(
    ctx: ServiceRequestContext,
    result: CanonicalAutomationResult,
  ): Promise<void>;
  importResult(
    ctx: ServiceRequestContext,
    input: AutomationImportInput,
  ): Promise<AutomationImportOutcome>;
  listImports(ctx: ServiceRequestContext): Promise<readonly AutomationImport[]>;
  getImport(
    ctx: ServiceRequestContext,
    id: AutomationImportId,
  ): Promise<AutomationImport>;
  listImportHistory(
    ctx: ServiceRequestContext,
    importId: AutomationImportId,
  ): Promise<readonly AutomationImportHistory[]>;
  getHistory(ctx: ServiceRequestContext): Promise<readonly AutomationImportHistory[]>;
  listRuns(
    ctx: ServiceRequestContext,
    executionId: AutomatedExecutionId,
  ): Promise<readonly AutomationRun[]>;
  getRun(ctx: ServiceRequestContext, id: AutomationRunId): Promise<AutomationRun>;
  listResultItems(
    ctx: ServiceRequestContext,
    runId: AutomationRunId,
  ): Promise<readonly AutomationResultItem[]>;
  listCoverageSnapshots(
    ctx: ServiceRequestContext,
    importId: AutomationImportId,
  ): Promise<readonly AutomationCoverageSnapshot[]>;
  aggregateCoverage(
    ctx: ServiceRequestContext,
    executionId: AutomatedExecutionId,
  ): Promise<CanonicalAutomationCoverageSummary>;
}
