/**
 * PostgreSQL ReportingRepository — APZQEP-151 Cap F.
 * Persists saved-report metadata and rebuildable trend samples only.
 * Facts/metrics remain derived.
 */
import { getDatabaseExecutor, type DatabaseExecutor } from "@apzhub/config";
import { qepReportingTrendSample, qepSavedReport } from "@apzhub/config";
import { and, desc, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";

import type { TrendSample } from "../../domain/trend-engine";
import type { SavedReport } from "../../domain/types";
import type { ReportingRepository } from "../../application/repository";

export function createPostgresReportingRepository(
  db: DatabaseExecutor,
): ReportingRepository {
  const exec = () => getDatabaseExecutor(db);

  return {
    async getSavedReport(tenantId, reportId) {
      const [row] = await exec()
        .select()
        .from(qepSavedReport)
        .where(
          and(eq(qepSavedReport.tenantId, tenantId), eq(qepSavedReport.id, reportId)),
        )
        .limit(1);
      return row ? (row.reportJson as unknown as SavedReport) : undefined;
    },

    async saveSavedReport(report) {
      const values = {
        id: report.reportId,
        tenantId: report.tenantId,
        projectId: report.projectId ?? null,
        ownerId: report.ownerId,
        name: report.name,
        templateId: report.templateId,
        reportJson: report as unknown as Record<string, unknown>,
        revision: report.revision,
        createdAt: new Date(report.createdAt),
        updatedAt: new Date(report.updatedAt),
      };
      const expectedPrior = Math.max(0, report.revision - 1);
      const [existing] = await exec()
        .select({ revision: qepSavedReport.revision })
        .from(qepSavedReport)
        .where(
          and(
            eq(qepSavedReport.tenantId, report.tenantId),
            eq(qepSavedReport.id, report.reportId),
          ),
        )
        .limit(1);

      if (!existing) {
        await exec().insert(qepSavedReport).values(values);
        return;
      }
      if (existing.revision !== expectedPrior) {
        throw new Error(
          `reporting.concurrency.stale_revision:expected=${expectedPrior}:actual=${existing.revision}`,
        );
      }
      const updated = await exec()
        .update(qepSavedReport)
        .set(values)
        .where(
          and(
            eq(qepSavedReport.tenantId, report.tenantId),
            eq(qepSavedReport.id, report.reportId),
            eq(qepSavedReport.revision, expectedPrior),
          ),
        )
        .returning({ id: qepSavedReport.id });
      if (updated.length === 0) {
        throw new Error(
          `reporting.concurrency.stale_revision:expected=${expectedPrior}`,
        );
      }
    },

    async listSavedReports(filter) {
      const conditions = [eq(qepSavedReport.tenantId, filter.tenantId)];
      if (filter.projectId) {
        conditions.push(eq(qepSavedReport.projectId, filter.projectId));
      }
      const rows = await exec()
        .select()
        .from(qepSavedReport)
        .where(and(...conditions))
        .orderBy(desc(qepSavedReport.updatedAt));
      let items = rows.map((r) => r.reportJson as unknown as SavedReport);
      if (filter.ownerId) {
        items = items.filter(
          (r) => r.ownerId === filter.ownerId || r.sharedWith.includes(filter.ownerId!),
        );
      }
      if (filter.query?.trim()) {
        const q = filter.query.trim().toLowerCase();
        items = items.filter((r) => r.name.toLowerCase().includes(q));
      }
      return items;
    },

    async appendTrendSample(tenantId, sample) {
      await exec()
        .insert(qepReportingTrendSample)
        .values({
          id: randomUUID(),
          tenantId,
          sampledAt: new Date(sample.at),
          sampleJson: sample as unknown as Record<string, unknown>,
        });
    },

    async listTrendSamples(tenantId, limit = 12) {
      const rows = await exec()
        .select()
        .from(qepReportingTrendSample)
        .where(eq(qepReportingTrendSample.tenantId, tenantId))
        .orderBy(desc(qepReportingTrendSample.sampledAt))
        .limit(limit);
      return rows.map((r) => r.sampleJson as unknown as TrendSample).reverse();
    },
  };
}
