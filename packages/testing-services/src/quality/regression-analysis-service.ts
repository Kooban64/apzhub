import type {
  RegressionAnalysisResult,
  RegressionAnalysisService,
} from "@apzhub/testing-contracts";
import { asRegressionAnalysisId } from "@apzhub/testing-contracts";
import type { RegressionAnalysisRecord } from "@apzhub/testing-persistence";

import { toRepositoryContext } from "../mapping/context";
import { requireFound } from "../services/errors";
import type { ServiceRuntime } from "../services/types";
import {
  analyzeRegressionByCaseKey,
  numericDelta,
} from "./calculations";
import { assertRegressionInputs } from "./validation";

function toDomain(row: RegressionAnalysisRecord): RegressionAnalysisResult {
  return {
    id: asRegressionAnalysisId(row.id),
    tenantId: row.tenantId,
    baselineLabel: row.baselineLabel,
    currentLabel: row.currentLabel,
    newFailures: row.newFailures,
    resolvedFailures: row.resolvedFailures,
    reopenedFailures: row.reopenedFailures,
    coverageDelta: row.coverageDelta,
    executionDelta: row.executionDelta,
    computedAt: row.computedAt,
    details: row.details,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
  };
}

export function createRegressionAnalysisService(
  rt: ServiceRuntime,
): RegressionAnalysisService {
  return {
    async analyze(ctx, input) {
      assertRegressionInputs(input);
      const { newFailures, resolvedFailures, reopenedFailures } =
        analyzeRegressionByCaseKey(input.baselineResults, input.currentResults);
      const coverageDelta = numericDelta(
        input.currentCoveragePercent ?? 0,
        input.baselineCoveragePercent ?? 0,
      );
      const executionDelta = numericDelta(
        input.currentExecutionCount ?? input.currentResults.length,
        input.baselineExecutionCount ?? input.baselineResults.length,
      );
      const row = await rt.persistence.regressionAnalyses.create(
        toRepositoryContext(ctx),
        {
          id: rt.id(),
          baselineLabel: input.baselineLabel,
          currentLabel: input.currentLabel,
          newFailures,
          resolvedFailures,
          reopenedFailures,
          coverageDelta,
          executionDelta,
          computedAt: rt.now(),
          details: {
            baselineResultCount: input.baselineResults.length,
            currentResultCount: input.currentResults.length,
          },
          organisationId: ctx.organisationId,
        },
      );
      rt.events.record({
        eventType: "regression.analyzed",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: {
          analysisId: row.id,
          newFailureCount: newFailures.length,
          resolvedFailureCount: resolvedFailures.length,
          reopenedFailureCount: reopenedFailures.length,
        },
      });
      return toDomain(row);
    },
    async get(ctx, id) {
      return toDomain(
        requireFound(
          await rt.persistence.regressionAnalyses.get(
            toRepositoryContext(ctx),
            id,
          ),
          "regression_analysis",
          id,
        ),
      );
    },
    async list(ctx) {
      const page = await rt.persistence.regressionAnalyses.list(
        toRepositoryContext(ctx),
      );
      return page.items.map(toDomain);
    },
  };
}
