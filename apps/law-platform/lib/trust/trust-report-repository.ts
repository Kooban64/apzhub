import type { TrustReport, TrustReportHistoryCriteria } from "./trust-reporting-types";

/** Trust report repository — immutable read models (LAW-015-08). */
export interface TrustReportRepository {
  save(report: TrustReport): TrustReport;
  getById(tenantId: string, reportId: string): TrustReport | undefined;
  list(criteria: TrustReportHistoryCriteria): readonly TrustReport[];
}
