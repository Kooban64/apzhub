/** Structured authorisation audit events (OSS-110-06). */

export type AuthorizationAuditDecision = "allow" | "deny";

export interface AuthorizationAuditEvent {
  readonly type: "authorization.evaluated";
  readonly timestamp: string;
  readonly actorId: string;
  readonly effectiveActorId: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly roleIds?: readonly string[];
  readonly roleNames?: readonly string[];
  readonly permission?: string;
  readonly resourceType?: string;
  readonly resourceId?: string;
  readonly action?: string;
  readonly decision: AuthorizationAuditDecision;
  readonly denialReason?: string;
  readonly denialCode?: string;
  readonly policyOutcomes?: readonly string[];
  readonly impersonation: boolean;
  readonly correlationId: string;
  readonly requestId?: string;
  readonly durationMs?: number;
  readonly service?: string;
  readonly operation?: string;
}

export interface AuthorizationAuditSink {
  record(event: AuthorizationAuditEvent): void;
}

export const noopAuthorizationAuditSink: AuthorizationAuditSink = {
  record() {
    /* no-op */
  },
};

export class InMemoryAuthorizationAuditSink implements AuthorizationAuditSink {
  readonly events: AuthorizationAuditEvent[] = [];

  record(event: AuthorizationAuditEvent): void {
    this.events.push(event);
  }

  clear(): void {
    this.events.length = 0;
  }
}
