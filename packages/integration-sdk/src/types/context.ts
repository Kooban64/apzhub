/** Request context propagated from Capability Services through the Integration SDK. */
export interface IntegrationRequestContext {
  readonly correlationId: string;
  readonly causationId?: string;
  readonly tenantId: string;
  readonly workspaceId?: string;
  readonly userId?: string;
  readonly locale?: string;
  readonly timezone?: string;
  readonly permissionSnapshot?: readonly string[];
}
