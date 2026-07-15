import type {
  AutomationImport,
  AutomationResultItem,
  AutomationResultService,
  AutomationRun,
  AutomatedExecutionIngestion,
} from "@apzhub/testing-contracts";
import {
  asAutomationImportId,
  asAutomationResultItemId,
  asAutomationRunId,
  asAutomatedExecutionId,
  asExecutionSessionId,
  type AutomationAdapterKind,
  type AutomationType,
  type ExecutionStatus,
  type NormalizedResultStatus,
} from "@apzhub/testing-contracts";

import { toRepositoryContext } from "../mapping/context";
import { requireFound } from "../services/errors";
import type { ServiceRuntime } from "../services/types";

function toImport(row: {
  id: string;
  tenantId: string;
  organisationId?: string;
  adapterKind: string;
  adapterVersion: string;
  externalRunRef: string;
  status: string;
  correlationId?: string;
  checksum?: string;
  payloadFingerprint?: string;
  summary?: Readonly<Record<string, unknown>>;
  errorSummary?: string;
  startedAt?: string;
  completedAt?: string;
  canonicalSnapshot?: Readonly<Record<string, unknown>>;
  automatedExecutionId?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  revision: number;
}): AutomationImport {
  return {
    id: asAutomationImportId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId,
    adapterKind: row.adapterKind as AutomationAdapterKind,
    adapterVersion: row.adapterVersion,
    externalRunRef: row.externalRunRef,
    status: row.status as AutomationImport["status"],
    correlationId: row.correlationId,
    checksum: row.checksum,
    payloadFingerprint: row.payloadFingerprint,
    summary: row.summary,
    errorSummary: row.errorSummary,
    startedAt: row.startedAt,
    completedAt: row.completedAt,
    canonicalSnapshot: row.canonicalSnapshot,
    automatedExecutionId: row.automatedExecutionId
      ? asAutomatedExecutionId(row.automatedExecutionId)
      : undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
    revision: row.revision,
  };
}

function toExecution(row: {
  id: string;
  tenantId: string;
  organisationId?: string;
  sessionId?: string;
  importId: string;
  automationType: AutomationType;
  status: ExecutionStatus;
  adapterSourceId?: string;
  externalRunRef: string;
  environment: Readonly<Record<string, unknown>>;
  overallStatus: string;
  durationMs?: number;
  startedAt?: string;
  completedAt?: string;
  adapterKind: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  revision: number;
}): AutomatedExecutionIngestion {
  return {
    id: asAutomatedExecutionId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId,
    sessionId: row.sessionId ? asExecutionSessionId(row.sessionId) : undefined,
    importId: asAutomationImportId(row.importId),
    automationType: row.automationType,
    status: row.status,
    adapterSourceId: row.adapterSourceId,
    externalRunRef: row.externalRunRef,
    environment: row.environment,
    overallStatus: row.overallStatus as NormalizedResultStatus,
    durationMs: row.durationMs,
    startedAt: row.startedAt,
    completedAt: row.completedAt,
    adapterKind: row.adapterKind as AutomationAdapterKind,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
    revision: row.revision,
  };
}

function toRun(row: {
  id: string;
  tenantId: string;
  organisationId?: string;
  executionId: string;
  suiteKey?: string;
  caseKey?: string;
  title: string;
  status: string;
  durationMs?: number;
  message?: string;
  stack?: string;
  result?: Readonly<Record<string, unknown>>;
  tags: readonly string[];
  requirementRefs: readonly string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  revision: number;
}): AutomationRun {
  return {
    id: asAutomationRunId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId,
    executionId: asAutomatedExecutionId(row.executionId),
    suiteKey: row.suiteKey,
    caseKey: row.caseKey,
    title: row.title,
    status: row.status as NormalizedResultStatus,
    durationMs: row.durationMs,
    message: row.message,
    stack: row.stack,
    result: row.result,
    tags: row.tags,
    requirementRefs: row.requirementRefs,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
    revision: row.revision,
  };
}

export function createAutomationResultService(
  rt: ServiceRuntime,
): AutomationResultService {
  return {
    async listImports(ctx) {
      const rctx = toRepositoryContext(ctx);
      const page = await rt.persistence.automationImports.list(rctx, {
        pageSize: 200,
      });
      return page.items.map(toImport);
    },
    async getImport(ctx, id) {
      const rctx = toRepositoryContext(ctx);
      return toImport(
        requireFound(
          await rt.persistence.automationImports.get(rctx, id),
          "automation_import",
          id,
        ),
      );
    },
    async listExecutions(ctx) {
      const rctx = toRepositoryContext(ctx);
      const page = await rt.persistence.automatedExecutions.list(rctx, {
        pageSize: 200,
      });
      return page.items.map(toExecution);
    },
    async getExecution(ctx, id) {
      const rctx = toRepositoryContext(ctx);
      return toExecution(
        requireFound(
          await rt.persistence.automatedExecutions.get(rctx, id),
          "automated_execution",
          id,
        ),
      );
    },
    async listRuns(ctx, executionId) {
      const rctx = toRepositoryContext(ctx);
      const page = await rt.persistence.automationRuns.list(rctx, { pageSize: 500 });
      return page.items
        .filter((row) => row.executionId === executionId)
        .map(toRun);
    },
    async getRun(ctx, id) {
      const rctx = toRepositoryContext(ctx);
      return toRun(
        requireFound(
          await rt.persistence.automationRuns.get(rctx, id),
          "automation_run",
          id,
        ),
      );
    },
    async listResultItems(ctx, runId) {
      const rctx = toRepositoryContext(ctx);
      const page = await rt.persistence.automationResultItems.list(rctx, {
        pageSize: 500,
      });
      return page.items
        .filter((row) => row.runId === runId)
        .map(
          (row): AutomationResultItem => ({
            id: asAutomationResultItemId(row.id),
            tenantId: row.tenantId,
            organisationId: row.organisationId,
            runId: asAutomationRunId(row.runId),
            status: row.status as NormalizedResultStatus,
            stepPayload: row.stepPayload,
            name: row.name,
            durationMs: row.durationMs,
            message: row.message,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            createdBy: row.createdBy,
            updatedBy: row.updatedBy,
            revision: row.revision,
          }),
        );
    },
  };
}
