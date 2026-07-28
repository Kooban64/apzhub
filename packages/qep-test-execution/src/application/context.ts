/**
 * Application request context — APZQEP-OES-ENG-090A PART-03.
 * Kept local to avoid coupling this Wave to frozen contract packages.
 */

export type ExecutionRequestContext = {
  readonly tenantId: string;
  readonly userId: string;
  readonly correlationId: string;
  readonly organisationId?: string;
  readonly projectId?: string;
  readonly workspaceId?: string;
  readonly permissions?: readonly string[];
};
