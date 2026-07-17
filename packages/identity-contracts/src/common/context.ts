/** Shared request context for Identity Administration Platform (APZIDENTITY-001). */

export type IdentityRequestContext = {
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly userId: string;
  readonly correlationId?: string;
  readonly permissions?: readonly string[];
};

export type IdentityAuditFields = {
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
  readonly revision: number;
};
