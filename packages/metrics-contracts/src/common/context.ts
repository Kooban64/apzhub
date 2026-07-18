/** Shared request context for Platform Metrics (APZMETRICS-001). */

export type MetricsRequestContext = {
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly userId: string;
  readonly correlationId?: string;
  readonly permissions?: readonly string[];
};

export type MetricsAuditFields = {
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
  readonly revision: number;
};
