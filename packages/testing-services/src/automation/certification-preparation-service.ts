import type {
  AutomationCertificationPreparationService,
  AutomationCertificationPreparationInputs,
  NormalizedResultStatus,
} from "@apzhub/testing-contracts";
import {
  asAutomationImportId,
  asAutomatedExecutionId,
} from "@apzhub/testing-contracts";

import { toRepositoryContext } from "../mapping/context";
import { requireFound } from "../services/errors";
import type { ServiceRuntime } from "../services/types";

function isFailed(status: NormalizedResultStatus | string): boolean {
  return status === "fail" || status === "errored" || status === "timed_out";
}

export function createAutomationCertificationPreparationService(
  rt: ServiceRuntime,
): AutomationCertificationPreparationService {
  async function compute(
    ctx: Parameters<AutomationCertificationPreparationService["prepareForImport"]>[0],
    importId?: string,
    executionId?: string,
  ): Promise<AutomationCertificationPreparationInputs> {
    const rctx = toRepositoryContext(ctx);
    let resolvedImportId = importId;
    let resolvedExecutionId = executionId;

    if (resolvedImportId && !resolvedExecutionId) {
      const imp = requireFound(
        await rt.persistence.automationImports.get(rctx, resolvedImportId),
        "automation_import",
        resolvedImportId,
      );
      resolvedExecutionId = imp.automatedExecutionId;
    }

    if (resolvedExecutionId && !resolvedImportId) {
      const exec = requireFound(
        await rt.persistence.automatedExecutions.get(rctx, resolvedExecutionId),
        "automated_execution",
        resolvedExecutionId,
      );
      resolvedImportId = exec.importId;
    }

    const runs = resolvedExecutionId
      ? (
          await rt.persistence.automationRuns.list(rctx, { pageSize: 500 })
        ).items.filter((r) => r.executionId === resolvedExecutionId)
      : [];

    const totalCases = runs.length;
    const passedCases = runs.filter((r) => r.status === "pass").length;
    const skippedCases = runs.filter((r) => r.status === "skipped").length;
    const failedAutomationCount = runs.filter((r) => isFailed(r.status)).length;
    const automationCompletenessPercent =
      totalCases === 0
        ? 0
        : Math.round(((passedCases + skippedCases) / totalCases) * 100);

    const evidence = (await rt.persistence.evidence.list(rctx, { pageSize: 500 }))
      .items;
    const missingEvidenceCount =
      resolvedExecutionId &&
      !evidence.some((e) => e.executionId === resolvedExecutionId)
        ? 1
        : 0;

    const coverage = resolvedExecutionId
      ? (
          await rt.persistence.automationCoverageSnapshots.list(rctx, {
            pageSize: 50,
          })
        ).items.filter((c) => c.executionId === resolvedExecutionId)
      : [];
    const coverageContributionPercent =
      coverage.length > 0
        ? coverage.reduce((sum, c) => sum + (c.percentage ?? 0), 0) / coverage.length
        : undefined;

    const imp = resolvedImportId
      ? await rt.persistence.automationImports.get(rctx, resolvedImportId)
      : undefined;
    let importHealth: AutomationCertificationPreparationInputs["importHealth"] =
      "unknown";
    if (imp) {
      if (imp.status === "completed" || imp.status === "corrected") {
        importHealth = failedAutomationCount > 0 ? "degraded" : "healthy";
      } else if (imp.status === "failed" || imp.status === "duplicate") {
        importHealth = "failed";
      } else {
        importHealth = "degraded";
      }
    }

    const result: AutomationCertificationPreparationInputs = {
      importId: resolvedImportId
        ? asAutomationImportId(resolvedImportId)
        : undefined,
      executionId: resolvedExecutionId
        ? asAutomatedExecutionId(resolvedExecutionId)
        : undefined,
      automationCompletenessPercent,
      coverageContributionPercent,
      failedAutomationCount,
      missingEvidenceCount,
      importHealth,
      totalCases,
      passedCases,
      skippedCases,
      computedAt: rt.now(),
      isDecision: false,
    };

    rt.events.record({
      eventType: "automation.certification_preparation_computed",
      tenantId: ctx.tenantId,
      correlationId: ctx.correlationId,
      actorUserId: ctx.userId,
      payload: {
        importId: resolvedImportId,
        executionId: resolvedExecutionId,
        isDecision: false,
      },
    });

    return result;
  }

  return {
    prepareForImport(ctx, importId) {
      return compute(ctx, importId);
    },
    prepareForExecution(ctx, executionId) {
      return compute(ctx, undefined, executionId);
    },
  };
}
