/** Shared request context for Configuration Platform (APZCONFIG-001). */

export type ConfigurationRequestContext = {
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly userId: string;
  readonly correlationId?: string;
  readonly permissions?: readonly string[];
};

export type ConfigurationAuditFields = {
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
  readonly revision: number;
};
