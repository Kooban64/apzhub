import type { ServiceRequestContext } from "../common/context";
import type { ListQuery } from "../common/list-query";
import type { PageResult } from "../common/paging";
import type { SupportHistoryEvent, SupportTimeline } from "../domain";
import type { SupportHistoryListFilter, SupportHistorySortField } from "../queries";
import type { SupportTicketId } from "../domain/identifiers";

/** Read-only Support Request history / audit timeline. */
export interface SupportHistoryService {
  getTimeline(
    ctx: ServiceRequestContext,
    supportTicketId: SupportTicketId,
    query?: ListQuery<SupportHistoryListFilter, SupportHistorySortField>,
  ): Promise<PageResult<SupportHistoryEvent>>;

  list(
    ctx: ServiceRequestContext,
    supportTicketId: SupportTicketId,
    query?: ListQuery<SupportHistoryListFilter, SupportHistorySortField>,
  ): Promise<PageResult<SupportHistoryEvent>>;

  getSupportTimeline(
    ctx: ServiceRequestContext,
    supportTicketId: SupportTicketId,
  ): Promise<SupportTimeline>;
}
