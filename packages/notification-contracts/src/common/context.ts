/** Shared request context for Notification Platform (APZNOTIFY-001). */

export type NotificationRequestContext = {
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly userId: string;
  readonly correlationId?: string;
  readonly permissions?: readonly string[];
};

export type NotificationAuditFields = {
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
  readonly revision: number;
};
