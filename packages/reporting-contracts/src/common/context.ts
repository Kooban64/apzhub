/**
 * Minimal request context for platform reporting.
 * Products map their gateway context into this shape (APZREPORT-001).
 */
export type ReportingRequestContext = {
  readonly tenantId: string;
  readonly userId: string;
  readonly correlationId?: string;
  readonly organisationId?: string;
  readonly permissions?: readonly string[];
};
