import type {
  AutomationCoverageService,
  CanonicalAutomationCoverageSummary,
} from "@apzhub/testing-contracts";
import {
  asAutomationCoverageSnapshotId,
  asAutomationImportId,
  asAutomatedExecutionId,
} from "@apzhub/testing-contracts";

import { toRepositoryContext } from "../mapping/context";
import type { ServiceRuntime } from "../services/types";

function toDomainSummary(
  summary: Readonly<Record<string, unknown>>,
  coveredCount?: number,
  totalCount?: number,
  percentage?: number,
): CanonicalAutomationCoverageSummary {
  return {
    covered: coveredCount ?? (summary.covered as number | undefined),
    total: totalCount ?? (summary.total as number | undefined),
    percentage: percentage ?? (summary.percentage as number | undefined),
    kind: summary.kind as string | undefined,
    raw: summary,
  };
}

export function createAutomationCoverageService(
  rt: ServiceRuntime,
): AutomationCoverageService {
  return {
    async ingestSnapshot(ctx, input) {
      const rctx = toRepositoryContext(ctx);
      const covered = input.summary.covered;
      const total = input.summary.total;
      const percentage =
        input.summary.percentage ??
        (covered != null && total != null && total > 0
          ? Math.round((covered / total) * 10000) / 100
          : undefined);
      const row = await rt.persistence.automationCoverageSnapshots.create(rctx, {
        importId: input.importId,
        executionId: input.executionId,
        summary: { ...input.summary },
        coveredCount: covered,
        totalCount: total,
        percentage,
      });
      rt.events.record({
        eventType: "automation.coverage_ingested",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: {
          snapshotId: row.id,
          importId: input.importId,
          executionId: input.executionId,
        },
      });
      return {
        id: asAutomationCoverageSnapshotId(row.id),
        tenantId: row.tenantId,
        organisationId: row.organisationId,
        importId: row.importId ? asAutomationImportId(row.importId) : undefined,
        executionId: row.executionId
          ? asAutomatedExecutionId(row.executionId)
          : undefined,
        summary: toDomainSummary(
          row.summary,
          row.coveredCount,
          row.totalCount,
          row.percentage,
        ),
        coveredCount: row.coveredCount,
        totalCount: row.totalCount,
        percentage: row.percentage,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        createdBy: row.createdBy,
        updatedBy: row.updatedBy,
        revision: row.revision,
      };
    },

    async listByImport(ctx, importId) {
      const rctx = toRepositoryContext(ctx);
      const page = await rt.persistence.automationCoverageSnapshots.list(rctx, {
        pageSize: 200,
        filters: { importId },
      });
      return page.items
        .filter((row) => row.importId === importId)
        .map((row) => ({
          id: asAutomationCoverageSnapshotId(row.id),
          tenantId: row.tenantId,
          organisationId: row.organisationId,
          importId: row.importId ? asAutomationImportId(row.importId) : undefined,
          executionId: row.executionId
            ? asAutomatedExecutionId(row.executionId)
            : undefined,
          summary: toDomainSummary(
            row.summary,
            row.coveredCount,
            row.totalCount,
            row.percentage,
          ),
          coveredCount: row.coveredCount,
          totalCount: row.totalCount,
          percentage: row.percentage,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          createdBy: row.createdBy,
          updatedBy: row.updatedBy,
          revision: row.revision,
        }));
    },

    async aggregate(ctx, executionId) {
      const rctx = toRepositoryContext(ctx);
      const page = await rt.persistence.automationCoverageSnapshots.list(rctx, {
        pageSize: 200,
      });
      const items = page.items.filter((row) => row.executionId === executionId);
      if (items.length === 0) return {};
      const covered = items.reduce((sum, i) => sum + (i.coveredCount ?? 0), 0);
      const total = items.reduce((sum, i) => sum + (i.totalCount ?? 0), 0);
      return {
        covered,
        total,
        percentage: total > 0 ? Math.round((covered / total) * 10000) / 100 : undefined,
        kind: "aggregated",
      };
    },
  };
}
