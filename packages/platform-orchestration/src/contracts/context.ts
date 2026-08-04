/**
 * Context structures only — no permission evaluation or flow execution.
 */

export interface TenantContext {
  readonly tenantId: string;
}

export interface ProjectContext {
  readonly tenantId: string;
  readonly projectId: string;
}

export interface ActorContext {
  readonly actorId: string;
  readonly actorType: "user" | "service" | "system";
}

/** Permission context carrier — evaluation is out of scope for QO-001. */
export interface PermissionContext {
  readonly permissionIds: readonly string[];
}

export interface CorrelationContext {
  readonly correlationId: string;
  readonly causationId?: string;
}

export interface ExecutionContext {
  readonly tenant: TenantContext;
  readonly project?: ProjectContext;
  readonly actor?: ActorContext;
  readonly permissions?: PermissionContext;
  readonly correlation: CorrelationContext;
  readonly locale?: string;
  readonly timezone?: string;
}

export function createExecutionContext(input: {
  readonly tenantId: string;
  readonly correlationId: string;
  readonly projectId?: string;
  readonly actorId?: string;
  readonly actorType?: ActorContext["actorType"];
  readonly permissionIds?: readonly string[];
  readonly causationId?: string;
  readonly locale?: string;
  readonly timezone?: string;
}): ExecutionContext {
  return {
    tenant: { tenantId: input.tenantId },
    project: input.projectId
      ? { tenantId: input.tenantId, projectId: input.projectId }
      : undefined,
    actor: input.actorId
      ? { actorId: input.actorId, actorType: input.actorType ?? "user" }
      : undefined,
    permissions: input.permissionIds
      ? { permissionIds: input.permissionIds }
      : undefined,
    correlation: {
      correlationId: input.correlationId,
      causationId: input.causationId,
    },
    locale: input.locale,
    timezone: input.timezone,
  };
}
