import type { ServiceRequestContext } from "../common/context";
import type { ListQuery } from "../common/list-query";
import type { PageResult } from "../common/paging";
import type { SupportTicket } from "../domain";
import type {
  AssignSupportTicketOwnerInput,
  ChangeSupportTicketPriorityInput,
  ChangeSupportTicketStateInput,
  CreateSupportTicketInput,
  UpdateSupportTicketInput,
} from "../inputs";
import type { SupportTicketListFilter, SupportTicketSortField } from "../queries";
import type { SupportTicketId } from "../domain/identifiers";

/** Vendor-neutral Support Request (ticket) operations. */
export interface SupportService {
  listSupportRequests(
    ctx: ServiceRequestContext,
    query?: ListQuery<SupportTicketListFilter, SupportTicketSortField>,
  ): Promise<PageResult<SupportTicket>>;

  getSupportRequest(
    ctx: ServiceRequestContext,
    supportRequestId: SupportTicketId,
  ): Promise<SupportTicket>;

  createSupportRequest(
    ctx: ServiceRequestContext,
    input: CreateSupportTicketInput,
  ): Promise<SupportTicket>;

  updateSupportRequest(
    ctx: ServiceRequestContext,
    supportRequestId: SupportTicketId,
    input: UpdateSupportTicketInput,
  ): Promise<SupportTicket>;

  closeSupportRequest(
    ctx: ServiceRequestContext,
    supportRequestId: SupportTicketId,
  ): Promise<SupportTicket>;

  reopenSupportRequest(
    ctx: ServiceRequestContext,
    supportRequestId: SupportTicketId,
  ): Promise<SupportTicket>;

  assignSupportRequest(
    ctx: ServiceRequestContext,
    supportRequestId: SupportTicketId,
    input: AssignSupportTicketOwnerInput,
  ): Promise<SupportTicket>;

  changeSupportRequestPriority(
    ctx: ServiceRequestContext,
    supportRequestId: SupportTicketId,
    input: ChangeSupportTicketPriorityInput,
  ): Promise<SupportTicket>;

  changeSupportRequestState(
    ctx: ServiceRequestContext,
    supportRequestId: SupportTicketId,
    input: ChangeSupportTicketStateInput,
  ): Promise<SupportTicket>;

  searchSupportRequests(
    ctx: ServiceRequestContext,
    query?: ListQuery<SupportTicketListFilter, SupportTicketSortField>,
  ): Promise<PageResult<SupportTicket>>;
}
