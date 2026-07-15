/** Document Platform request context (APZDOCS-001). Decoupled from gateway. */

export type DocumentRequestContext = {
  readonly tenantId: string;
  readonly userId: string;
  readonly correlationId?: string;
  readonly organisationId?: string;
  readonly permissions?: readonly string[];
};
