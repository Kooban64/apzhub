import type { SavedReport } from "../domain/types";
import type { TrendSample } from "../domain/trend-engine";

export type SavedReportListFilter = {
  readonly tenantId: string;
  readonly ownerId?: string;
  readonly projectId?: string;
  readonly query?: string;
};

export type ReportingRepository = {
  getSavedReport(tenantId: string, reportId: string): Promise<SavedReport | undefined>;
  saveSavedReport(report: SavedReport): Promise<void>;
  listSavedReports(filter: SavedReportListFilter): Promise<readonly SavedReport[]>;
  /** Optional derived samples for trends — not business SoR. */
  appendTrendSample(tenantId: string, sample: TrendSample): Promise<void>;
  listTrendSamples(tenantId: string, limit?: number): Promise<readonly TrendSample[]>;
};

export function createInMemoryReportingRepository(): ReportingRepository {
  const reports = new Map<string, SavedReport>();
  const trends = new Map<string, TrendSample[]>();
  const key = (tenantId: string, reportId: string) => `${tenantId}:${reportId}`;

  return {
    async getSavedReport(tenantId, reportId) {
      return reports.get(key(tenantId, reportId));
    },
    async saveSavedReport(report) {
      reports.set(key(report.tenantId, report.reportId), report);
    },
    async listSavedReports(filter) {
      let items = [...reports.values()].filter((r) => r.tenantId === filter.tenantId);
      if (filter.ownerId) {
        items = items.filter(
          (r) => r.ownerId === filter.ownerId || r.sharedWith.includes(filter.ownerId!),
        );
      }
      if (filter.projectId) {
        items = items.filter((r) => r.projectId === filter.projectId);
      }
      if (filter.query?.trim()) {
        const q = filter.query.trim().toLowerCase();
        items = items.filter((r) => r.name.toLowerCase().includes(q));
      }
      return items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
    async appendTrendSample(tenantId, sample) {
      const list = trends.get(tenantId) ?? [];
      list.push(sample);
      // keep last 30 samples
      trends.set(tenantId, list.slice(-30));
    },
    async listTrendSamples(tenantId, limit = 12) {
      const list = trends.get(tenantId) ?? [];
      return list.slice(-limit);
    },
  };
}
