/** Search request context (APZSEARCH-001). */

export type SearchRequestContext = {
  readonly correlationId: string;
  readonly requestId?: string;
  readonly actorUserId: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly workspaceId?: string;
  readonly locale?: string;
  readonly permissions: readonly string[];
};
