/** Shared request context for Administration Platform (APZADMIN-001). */

export type AdministrationRequestContext = {
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly userId: string;
  readonly correlationId?: string;
  readonly permissions?: readonly string[];
};

export type AdministrationAuditFields = {
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
  readonly revision: number;
};
