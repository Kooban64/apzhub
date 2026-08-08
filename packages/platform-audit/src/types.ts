/** APE-Audit — normalized audit event envelope (Foundation v1.0). */

export type PlatformAuditSource =
  | "administration"
  | "identity"
  | "configuration"
  | "notification"
  | "search"
  | "workflow"
  | "document"
  | "business_process"
  | "projects"
  | "memory"
  | "other";

export type PlatformAuditEvent = {
  readonly id: string;
  readonly tenantId: string;
  readonly source: PlatformAuditSource;
  readonly product?: string;
  readonly action: string;
  readonly actorUserId?: string;
  readonly occurredAt: string;
  readonly correlationId?: string;
  readonly summary?: string;
  readonly detail?: Readonly<Record<string, unknown>>;
};

export type PlatformAuditListQuery = {
  readonly tenantId: string;
  readonly correlationId?: string;
  readonly product?: string;
  readonly source?: PlatformAuditSource;
  readonly from?: string;
  readonly to?: string;
  readonly limit?: number;
};

export type PlatformAuditListResult = {
  readonly items: readonly PlatformAuditEvent[];
  readonly truncated: boolean;
};

/** Domain adapter — fans out to an existing audit SoR without migrating rows. */
export type PlatformAuditSourceProvider = {
  readonly source: PlatformAuditSource;
  list(query: PlatformAuditListQuery): Promise<readonly PlatformAuditEvent[]>;
};
