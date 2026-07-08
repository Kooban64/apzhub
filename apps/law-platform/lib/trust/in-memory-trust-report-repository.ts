import type { TrustReportRepository } from "./trust-report-repository";
import type { TrustReport, TrustReportHistoryCriteria } from "./trust-reporting-types";

/** In-memory immutable trust report store (LAW-015-08). */
export class InMemoryTrustReportRepository implements TrustReportRepository {
  private readonly reports = new Map<string, TrustReport>();

  clear(): void {
    this.reports.clear();
  }

  save(report: TrustReport): TrustReport {
    const frozen = Object.freeze(structuredClone(report));
    this.reports.set(this.key(report.tenantId, report.reportId), frozen);
    return frozen;
  }

  getById(tenantId: string, reportId: string): TrustReport | undefined {
    return this.reports.get(this.key(tenantId, reportId));
  }

  list(criteria: TrustReportHistoryCriteria): readonly TrustReport[] {
    return [...this.reports.values()]
      .filter((report) => {
        if (report.tenantId !== criteria.tenantId) {
          return false;
        }
        if (
          criteria.trustAccountId &&
          report.trustAccountId !== criteria.trustAccountId
        ) {
          return false;
        }
        if (criteria.reportType && report.reportType !== criteria.reportType) {
          return false;
        }
        return true;
      })
      .sort(
        (a, b) =>
          a.generatedAt.localeCompare(b.generatedAt) ||
          a.reportId.localeCompare(b.reportId),
      );
  }

  private key(tenantId: string, reportId: string): string {
    return `${tenantId}::${reportId}`;
  }
}
