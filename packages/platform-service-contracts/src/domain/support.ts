import type {
  SupportArticleAttachmentId,
  SupportArticleId,
  SupportGroupId,
  SupportHistoryEventId,
  SupportOrganizationId,
  SupportSearchHitId,
  SupportTicketId,
  SupportUserId,
} from "./identifiers";

/**
 * Canonical Support Request status — maps engine ticket states.
 * Distinct from Projects TaskStatus.
 */
export type SupportTicketStatus =
  "new" | "open" | "pending" | "closed" | "merged" | "unknown";

/** Canonical Support Request priority — maps engine ticket priorities. */
export type SupportTicketPriority = "low" | "normal" | "high" | "urgent";

/**
 * Support Request (APZHUB) — SoR in the Support engine (e.g. Zammad Ticket).
 * Must never be confused with Projects Task.
 */
export interface SupportTicket {
  readonly id: SupportTicketId;
  readonly tenantId: string;
  /** Human-visible ticket number when the engine provides one. */
  readonly displayId?: string;
  readonly title: string;
  readonly groupId: SupportGroupId;
  readonly requesterId: SupportUserId;
  readonly assigneeId?: SupportUserId;
  readonly organizationId?: SupportOrganizationId;
  readonly status: SupportTicketStatus;
  readonly priority: SupportTicketPriority;
  readonly tags?: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly closedAt?: string;
}

export interface SupportTicketSummary {
  readonly id: SupportTicketId;
  readonly displayId?: string;
  readonly title: string;
  readonly status: SupportTicketStatus;
  readonly priority: SupportTicketPriority;
  readonly assigneeId?: SupportUserId;
}

/** Organisation (Support domain) — engine Organization. */
export interface SupportOrganization {
  readonly id: SupportOrganizationId;
  readonly tenantId: string;
  readonly name: string;
  readonly note?: string;
  readonly domain?: string;
  readonly shared?: boolean;
  readonly active: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** Support Team / Queue — engine Group (not Projects Team). */
export interface SupportGroup {
  readonly id: SupportGroupId;
  readonly tenantId: string;
  readonly name: string;
  readonly note?: string;
  readonly active: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** Support-domain user projection (agent / customer) — not platform identity. */
export type SupportUserRole = "agent" | "customer" | "admin" | "unknown";

export interface SupportUser {
  readonly id: SupportUserId;
  readonly tenantId: string;
  readonly email?: string;
  readonly login?: string;
  readonly displayName: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly active: boolean;
  readonly role: SupportUserRole;
  readonly organizationIds?: readonly SupportOrganizationId[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface SupportUserSummary {
  readonly id: SupportUserId;
  readonly email?: string;
  readonly displayName: string;
  readonly role: SupportUserRole;
  readonly active: boolean;
}

/**
 * Support conversation article / message — Zammad Article.
 * Distinct from Projects Comment (Plane). Never reuse Comment DTOs.
 */
export type SupportArticleChannel =
  "note" | "email" | "phone" | "web" | "chat" | "sms" | "fax" | "unknown";

export type SupportArticleVisibility = "internal" | "public";

export type SupportArticleBodyFormat = "text/plain" | "text/html" | "unknown";

export type SupportArticleSenderType = "agent" | "customer" | "system" | "unknown";

export type SupportArticleDeliveryStatus =
  "none" | "pending" | "sent" | "failed" | "unknown";

export interface SupportArticleAuthor {
  readonly userId?: SupportUserId;
  readonly displayName?: string;
  readonly email?: string;
  readonly senderType: SupportArticleSenderType;
}

export interface SupportArticleRecipients {
  readonly to?: readonly string[];
  readonly cc?: readonly string[];
  readonly bcc?: readonly string[];
  readonly replyTo?: readonly string[];
}

/** Attachment metadata — binary content retrieved via downloadAttachment. */
export interface SupportArticleAttachment {
  readonly id: SupportArticleAttachmentId;
  readonly articleId: SupportArticleId;
  readonly filename: string;
  readonly contentType?: string;
  readonly sizeBytes?: number;
  readonly disposition?: string;
  readonly contentId?: string;
  readonly createdAt?: string;
}

/** Binary attachment content (base64) — R12-SUP-02. */
export interface SupportArticleAttachmentContent {
  readonly id: SupportArticleAttachmentId;
  readonly articleId: SupportArticleId;
  readonly supportTicketId: SupportTicketId;
  readonly filename: string;
  readonly contentType: string;
  readonly sizeBytes: number;
  readonly dataBase64: string;
}

export interface SupportArticle {
  readonly id: SupportArticleId;
  readonly tenantId: string;
  readonly supportTicketId: SupportTicketId;
  readonly subject?: string;
  readonly body: string;
  readonly bodyFormat: SupportArticleBodyFormat;
  readonly channel: SupportArticleChannel;
  readonly visibility: SupportArticleVisibility;
  readonly senderType: SupportArticleSenderType;
  readonly author: SupportArticleAuthor;
  readonly recipients?: SupportArticleRecipients;
  readonly deliveryStatus: SupportArticleDeliveryStatus;
  readonly attachments: readonly SupportArticleAttachment[];
  readonly createdAt: string;
  readonly updatedAt: string;
  /** Safe opaque vendor hints only — never secrets or full payloads. */
  readonly originMetadata?: Readonly<Record<string, string>>;
}

export interface SupportArticleSummary {
  readonly id: SupportArticleId;
  readonly supportTicketId: SupportTicketId;
  readonly subject?: string;
  readonly channel: SupportArticleChannel;
  readonly visibility: SupportArticleVisibility;
  readonly senderType: SupportArticleSenderType;
  readonly createdAt: string;
}

/** Support search hit kinds — vendor-neutral. */
export type SupportSearchHitKind =
  "support_request" | "organization" | "group" | "user" | "article";

export interface SupportSearchHit {
  readonly id: SupportSearchHitId;
  readonly kind: SupportSearchHitKind;
  readonly title: string;
  readonly snippet?: string;
  readonly supportTicketId?: SupportTicketId;
  readonly organizationId?: SupportOrganizationId;
  readonly groupId?: SupportGroupId;
  readonly userId?: SupportUserId;
  readonly articleId?: SupportArticleId;
  readonly score?: number;
  readonly updatedAt?: string;
}

export interface SupportSearchResult {
  readonly query: string;
  readonly hits: readonly SupportSearchHit[];
  readonly totalCount: number;
  readonly page: number;
  readonly perPage: number;
  readonly hasNextPage: boolean;
}

/** Ticket history / audit timeline — read-only. */
export type SupportHistoryAction =
  | "created"
  | "updated"
  | "state_changed"
  | "owner_changed"
  | "priority_changed"
  | "customer_changed"
  | "organization_changed"
  | "group_changed"
  | "article_created"
  | "attachment_added"
  | "unknown";

export interface SupportHistoryActor {
  readonly userId?: SupportUserId;
  readonly displayName?: string;
  readonly kind: "agent" | "customer" | "system" | "unknown";
}

export interface SupportHistoryFieldChange {
  readonly field: string;
  readonly fromValue?: string;
  readonly toValue?: string;
}

export interface SupportHistoryEvent {
  readonly id: SupportHistoryEventId;
  readonly supportTicketId: SupportTicketId;
  readonly action: SupportHistoryAction;
  readonly summary: string;
  readonly actor: SupportHistoryActor;
  readonly fieldChanges?: readonly SupportHistoryFieldChange[];
  readonly articleId?: SupportArticleId;
  readonly occurredAt: string;
}

export interface SupportTimeline {
  readonly supportTicketId: SupportTicketId;
  readonly events: readonly SupportHistoryEvent[];
  readonly totalCount: number;
}

/** Read-only Support intelligence metrics. */
export interface SupportDistributionBucket {
  readonly key: string;
  readonly label?: string;
  readonly count: number;
}

export interface SupportIntelligenceSnapshot {
  readonly capturedAt: string;
  readonly totalTickets: number;
  readonly openTickets: number;
  readonly closedTickets: number;
  readonly pendingTickets: number;
  readonly newTickets: number;
  readonly overdueTickets: number;
  readonly unassignedTickets: number;
  readonly articleCount?: number;
  readonly byPriority: readonly SupportDistributionBucket[];
  readonly byState: readonly SupportDistributionBucket[];
  readonly byOrganization: readonly SupportDistributionBucket[];
  readonly byGroup: readonly SupportDistributionBucket[];
  readonly byOwner: readonly SupportDistributionBucket[];
  /** Present only when the engine exposes response-time signals. */
  readonly averageFirstResponseMinutes?: number;
}
