/** Impersonation metadata — optional; never grants permissions by itself. */
export interface ImpersonationContext {
  readonly actorUserId: string;
  readonly reason?: string;
}

/** Execution metadata attached by the platform execution pipeline (OSS-110-04). */
export interface ServiceExecutionMetadata {
  readonly requestId?: string;
  readonly startedAt?: string;
  readonly source?: string;
  readonly clientVersion?: string;
  readonly extras?: Readonly<Record<string, string>>;
}

/**
 * Request context propagated to every platform service operation (010).
 *
 * OSS-110-04 additive fields are optional for backwards compatibility.
 */
export interface ServiceRequestContext {
  readonly tenantId: string;
  readonly userId: string;
  readonly correlationId: string;
  readonly permissions: readonly string[];
  readonly workspaceId?: string;
  readonly locale?: string;
  readonly timezone?: string;
  /** Organisation scope when distinct from tenant. */
  readonly organisationId?: string;
  /** Per-request identifier — distinct from correlationId when present. */
  readonly requestId?: string;
  /** Active feature flag keys for this request. */
  readonly featureFlags?: readonly string[];
  /** Optional impersonation context. */
  readonly impersonation?: ImpersonationContext;
  /** Pipeline-populated execution metadata. */
  readonly execution?: ServiceExecutionMetadata;
}
