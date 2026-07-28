/** Shared request context for Analytics Platform contracts (APZHUB-PLATFORM-ANALYTICS-003). */

export type AnalyticsRequestContext = {
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly workspaceId?: string;
  readonly userId: string;
  readonly correlationId?: string;
  readonly locale?: string;
  readonly timezone?: string;
  readonly permissions?: readonly string[];
};

export type AnalyticsAuditFields = {
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
  readonly revision: number;
};

/**
 * Provider binding — opaque refs only.
 * Never expose Metabase / vendor-native field names on platform contracts.
 */
export type AnalyticsProviderBinding = {
  readonly providerId: string;
  readonly providerRef: string;
};
