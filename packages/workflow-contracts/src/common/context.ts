/** Workflow Platform request context (APZWORKFLOW-001). Decoupled from gateway. */

export type WorkflowRequestContext = {
  readonly tenantId: string;
  readonly userId: string;
  readonly correlationId?: string;
  readonly organisationId?: string;
  readonly permissions?: readonly string[];
};
