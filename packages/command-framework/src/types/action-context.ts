/** Who initiated action execution (ADR-0026). */
export type ActionActor = "user" | "system" | "ai-agent" | "voice";

/**
 * Runtime context supplied to ActionExecutor.
 *
 * Extension points reserved for future milestones — only fields required by AF-006
 * are used in execution today.
 */
export interface ActionContext {
  readonly actor: ActionActor;
  /** User initiating execution (when actor is `user`). */
  readonly userId?: string;
  /** Active session identifier. */
  readonly sessionId?: string;
  /** Tenant scope — reserved for multi-tenant execution (future). */
  readonly tenantId?: string;
  /** Distributed tracing correlation id — reserved (future). */
  readonly correlationId?: string;
  /** Trace id for observability — reserved (future). */
  readonly traceId?: string;
  /** BCP-47 locale — reserved (future). */
  readonly locale?: string;
  /** IANA timezone — reserved (future). */
  readonly timezone?: string;
  /** Cooperative cancellation — reserved (future). */
  readonly cancellationToken?: { readonly aborted: boolean };
  readonly surface?: string;
  readonly selection?: unknown;
  readonly workbenchContext?: unknown;
  readonly args?: Record<string, unknown>;
}

/** Request shape for execute calls. */
export interface ActionExecutionRequest {
  readonly actionId: string;
  readonly context: ActionContext;
}
