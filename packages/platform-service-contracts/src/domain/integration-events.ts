/** Vendor-neutral integration event models (adapter boundary). */

export type IntegrationEventResource =
  | "project"
  | "task"
  | "comment"
  | "cycle"
  | "module"
  | "label"
  | "member"
  | "state"
  | "webhook"
  | "support_request"
  | "article"
  | "organization"
  | "group"
  | "support_user"
  | "unknown";

export type IntegrationEventAction =
  | "created"
  | "updated"
  | "archived"
  | "deleted"
  | "state_changed"
  | "assigned"
  | "unassigned"
  | "label_changed"
  | "cycle_changed"
  | "module_changed"
  | "commented"
  | "membership_changed"
  | "closed"
  | "reopened"
  | "priority_changed"
  | "attachment_added"
  | "unknown";

export type IntegrationEventType =
  | "project.created"
  | "project.updated"
  | "project.archived"
  | "project.deleted"
  | "task.created"
  | "task.updated"
  | "task.archived"
  | "task.deleted"
  | "task.state_changed"
  | "task.assigned"
  | "task.unassigned"
  | "task.label_changed"
  | "task.cycle_changed"
  | "task.module_changed"
  | "comment.created"
  | "comment.updated"
  | "comment.deleted"
  | "cycle.created"
  | "cycle.updated"
  | "cycle.archived"
  | "cycle.deleted"
  | "module.created"
  | "module.updated"
  | "module.archived"
  | "module.deleted"
  | "label.created"
  | "label.updated"
  | "label.deleted"
  | "member.added"
  | "member.updated"
  | "member.removed"
  | "state.created"
  | "state.updated"
  | "state.deleted"
  | "webhook.created"
  | "webhook.updated"
  | "webhook.deleted"
  | "support_request.created"
  | "support_request.updated"
  | "support_request.closed"
  | "support_request.reopened"
  | "support_request.assigned"
  | "support_request.unassigned"
  | "support_request.state_changed"
  | "support_request.priority_changed"
  | "article.created"
  | "article.updated"
  | "organization.created"
  | "organization.updated"
  | "organization.archived"
  | "group.created"
  | "group.updated"
  | "support_user.created"
  | "support_user.updated"
  | "attachment.metadata_recorded"
  | "integration.unknown";

export interface IntegrationEventEnvelope {
  readonly id: string;
  readonly type: IntegrationEventType;
  readonly resource: IntegrationEventResource;
  readonly action: IntegrationEventAction;
  readonly occurredAt: string;
  readonly workspaceId?: string;
  readonly projectId?: string;
  /** Optional Support Request id when the event relates to a ticket. */
  readonly supportTicketId?: string;
  readonly resourceId?: string;
  readonly actorId?: string;
  readonly correlationId?: string;
  readonly deliveryId?: string;
  /** Opaque vendor-neutral summary — never includes provider secrets. */
  readonly summary: string;
}

export interface EventTranslationResult {
  readonly ok: boolean;
  readonly event?: IntegrationEventEnvelope;
  readonly ignored: boolean;
  readonly reason?: string;
  readonly vendorEvent?: string;
  readonly vendorAction?: string;
}

export type WebhookId = string & {
  readonly __brand?: "WebhookId";
};

export type WebhookRegistrationId = string;

export interface WebhookRegistration {
  readonly id: WebhookRegistrationId;
  readonly url: string;
  readonly isActive: boolean;
  readonly eventTypes: readonly string[];
  readonly secretPresent: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateWebhookInput {
  readonly url: string;
  readonly eventTypes: readonly string[];
  readonly isActive?: boolean;
}

export interface UpdateWebhookInput {
  readonly url?: string;
  readonly eventTypes?: readonly string[];
  readonly isActive?: boolean;
}

export interface WebhookValidationResult {
  readonly ok: boolean;
  readonly issues: readonly string[];
}

export type SyncMode = "full" | "incremental";

export type SyncRunStatus = "idle" | "running" | "succeeded" | "failed";

export interface SyncCursor {
  readonly lastSyncAt?: string;
  readonly resumeToken?: string;
  readonly resourceCursors?: Readonly<Record<string, string>>;
}

export interface SyncStatus {
  readonly mode: SyncMode | "none";
  readonly status: SyncRunStatus;
  readonly lastSuccessfulSyncAt?: string;
  readonly lastFailedSyncAt?: string;
  readonly lastStartedAt?: string;
  readonly lastCompletedAt?: string;
  readonly recordsProcessed: number;
  readonly durationMs?: number;
  readonly providerVersion?: string;
  readonly providerLatencyMs?: number;
  readonly cursor: SyncCursor;
  readonly errors: readonly string[];
}

export interface SyncRunOptions {
  readonly since?: string;
  readonly resumeToken?: string;
  readonly maxRecords?: number;
}

export interface SyncRunResult {
  readonly status: SyncStatus;
  readonly recordsProcessed: number;
  readonly durationMs: number;
  readonly resources: Readonly<Record<string, number>>;
}
