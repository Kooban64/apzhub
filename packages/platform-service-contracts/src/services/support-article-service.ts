import type { ServiceRequestContext } from "../common/context";
import type { ListQuery } from "../common/list-query";
import type { PageResult } from "../common/paging";
import type { SupportArticle, SupportArticleAttachmentContent } from "../domain";
import type {
  CreateSupportArticleInput,
  CreateSupportCustomerReplyInput,
  CreateSupportInternalNoteInput,
} from "../inputs";
import type { SupportArticleListFilter, SupportArticleSortField } from "../queries";
import type {
  SupportArticleAttachmentId,
  SupportArticleId,
  SupportTicketId,
} from "../domain/identifiers";

/** Vendor-neutral Support article / conversation operations (binary via base64). */
export interface SupportArticleService {
  list(
    ctx: ServiceRequestContext,
    supportTicketId: SupportTicketId,
    query?: ListQuery<SupportArticleListFilter, SupportArticleSortField>,
  ): Promise<PageResult<SupportArticle>>;

  get(
    ctx: ServiceRequestContext,
    supportTicketId: SupportTicketId,
    articleId: SupportArticleId,
  ): Promise<SupportArticle>;

  createNote(
    ctx: ServiceRequestContext,
    input: CreateSupportInternalNoteInput,
  ): Promise<SupportArticle>;

  createReply(
    ctx: ServiceRequestContext,
    input: CreateSupportCustomerReplyInput,
  ): Promise<SupportArticle>;

  create(
    ctx: ServiceRequestContext,
    input: CreateSupportArticleInput,
  ): Promise<SupportArticle>;

  /** Download binary attachment content (base64). Max 1 MiB. */
  downloadAttachment(
    ctx: ServiceRequestContext,
    supportTicketId: SupportTicketId,
    articleId: SupportArticleId,
    attachmentId: SupportArticleAttachmentId,
  ): Promise<SupportArticleAttachmentContent>;
}
