/**
 * Client-side Support DTO types — aligned with platform-service-contracts domain
 * and `/api/v1` OpenAPI shapes. Prefer product naming (Support Request) in UI.
 */

import type {
  SupportArticle,
  SupportArticleAttachment,
  SupportArticleBodyFormat,
  SupportArticleChannel,
  SupportArticleVisibility,
  SupportDistributionBucket,
  SupportGroup,
  SupportHistoryEvent,
  SupportIntelligenceSnapshot,
  SupportOrganization,
  SupportSearchHit,
  SupportSearchHitKind,
  SupportSearchResult,
  SupportTicket,
  SupportTicketPriority,
  SupportTicketStatus,
  SupportUser,
} from "@apzhub/platform-service-contracts";

/** Product alias — Support Request is the APZHUB name for SupportTicket. */
export type SupportRequest = SupportTicket;
export type SupportRequestStatus = SupportTicketStatus;
export type SupportRequestPriority = SupportTicketPriority;

export type {
  SupportArticle,
  SupportArticleAttachment,
  SupportArticleBodyFormat,
  SupportArticleChannel,
  SupportArticleVisibility,
  SupportDistributionBucket,
  SupportGroup,
  SupportHistoryEvent,
  SupportIntelligenceSnapshot,
  SupportOrganization,
  SupportSearchHit,
  SupportSearchHitKind,
  SupportSearchResult,
  SupportUser,
};

export interface SupportApiMeta {
  readonly requestId: string;
  readonly correlationId: string;
}

export interface SupportApiPage {
  readonly cursor: string | null;
  readonly nextCursor: string | null;
  readonly limit: number;
  readonly hasMore: boolean;
}

export interface SupportApiSuccessEnvelope<T> {
  readonly data: T;
  readonly meta: SupportApiMeta;
}

export interface SupportApiCollectionEnvelope<T> {
  readonly data: readonly T[];
  readonly page: SupportApiPage;
  readonly meta: SupportApiMeta;
}

export interface SupportApiErrorBody {
  readonly code: string;
  readonly message: string;
  readonly details?: Readonly<Record<string, unknown>>;
}

export interface SupportApiErrorEnvelope {
  readonly error: SupportApiErrorBody;
  readonly meta: SupportApiMeta;
}

export interface SupportPaginationParams {
  readonly limit?: number;
  readonly cursor?: string;
  readonly page?: number;
  readonly perPage?: number;
  readonly sort?: string;
  readonly order?: "asc" | "desc";
}

export interface SupportRequestListParams extends SupportPaginationParams {
  readonly status?: SupportRequestStatus;
  readonly priority?: SupportRequestPriority;
  readonly customerId?: string;
  readonly requesterId?: string;
  readonly ownerId?: string;
  readonly assigneeId?: string;
  readonly organizationId?: string;
  readonly groupId?: string;
  readonly search?: string;
}

export interface CreateSupportRequestInput {
  readonly title: string;
  readonly groupId: string;
  readonly requesterId: string;
  readonly assigneeId?: string;
  readonly organizationId?: string;
  readonly status?: SupportRequestStatus;
  readonly priority?: SupportRequestPriority;
  readonly tags?: readonly string[];
}

export interface UpdateSupportRequestInput {
  readonly title?: string;
  readonly groupId?: string;
  readonly requesterId?: string;
  readonly assigneeId?: string | null;
  readonly organizationId?: string | null;
  readonly status?: SupportRequestStatus;
  readonly priority?: SupportRequestPriority;
  readonly tags?: readonly string[];
}

export interface SupportArticleAttachmentUpload {
  readonly filename: string;
  readonly contentType?: string;
  readonly dataBase64: string;
  readonly sizeBytes?: number;
}

export interface SupportArticleAttachmentContent {
  readonly id: string;
  readonly articleId: string;
  readonly supportTicketId: string;
  readonly filename: string;
  readonly contentType: string;
  readonly sizeBytes: number;
  readonly dataBase64: string;
}

export interface CreateInternalNoteInput {
  readonly body: string;
  readonly bodyFormat?: SupportArticleBodyFormat;
  readonly subject?: string;
  readonly attachments?: readonly SupportArticleAttachmentUpload[];
}

export type CustomerReplyChannel = Exclude<SupportArticleChannel, "note" | "unknown">;

export interface CreateCustomerReplyInput {
  readonly body: string;
  readonly bodyFormat?: SupportArticleBodyFormat;
  readonly subject?: string;
  readonly channel?: CustomerReplyChannel;
  readonly to?: readonly string[];
  readonly cc?: readonly string[];
  readonly bcc?: readonly string[];
  readonly attachments?: readonly SupportArticleAttachmentUpload[];
}

export interface OrganizationListParams extends SupportPaginationParams {
  readonly search?: string;
  readonly active?: boolean;
}

export interface CreateOrganizationInput {
  readonly name: string;
  readonly note?: string;
  readonly domain?: string;
  readonly shared?: boolean;
}

export interface UpdateOrganizationInput {
  readonly name?: string;
  readonly note?: string;
  readonly domain?: string;
  readonly shared?: boolean;
  readonly active?: boolean;
}

export interface GroupListParams extends SupportPaginationParams {
  readonly search?: string;
  readonly active?: boolean;
}

export interface CreateGroupInput {
  readonly name: string;
  readonly note?: string;
  readonly active?: boolean;
}

export interface UpdateGroupInput {
  readonly name?: string;
  readonly note?: string;
  readonly active?: boolean;
}

export interface SupportUserListParams extends SupportPaginationParams {
  readonly search?: string;
  readonly email?: string;
  readonly login?: string;
  readonly active?: boolean;
  readonly role?: SupportUser["role"];
}

export interface SupportSearchParams extends SupportPaginationParams {
  readonly q?: string;
  readonly query?: string;
  readonly kinds?: readonly SupportSearchHitKind[] | string;
  readonly organizationId?: string;
  readonly groupId?: string;
  readonly supportRequestId?: string;
}

export interface SupportHistoryListParams extends SupportPaginationParams {
  readonly occurredAfter?: string;
  readonly occurredBefore?: string;
}

export interface SupportCollectionResult<T> {
  readonly data: readonly T[];
  readonly page: SupportApiPage;
  readonly meta: SupportApiMeta;
}

export interface SupportDataResult<T> {
  readonly data: T;
  readonly meta: SupportApiMeta;
}
