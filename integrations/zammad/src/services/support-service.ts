import type { IntegrationRequestContext } from "@apzhub/integration-sdk";

import type { ZammadTicketRecord } from "../internal/zammad-api-types";
import { extractSupportTicketZammadId } from "../mappers/mapper-context";
import {
  mapSupportTicketToZammadBody,
  mapZammadTicket,
} from "../mappers/support-ticket-mapper";
import type { SupportTicket } from "../models/canonical";
import type {
  AssignSupportTicketCustomerInput,
  AssignSupportTicketOwnerInput,
  ChangeSupportTicketPriorityInput,
  ChangeSupportTicketStateInput,
  CreateSupportTicketInput,
  UpdateSupportTicketInput,
} from "../models/inputs";
import type {
  PageRequest,
  PageResult,
  SortField,
  SupportTicketListFilter,
  SupportTicketSortField,
} from "../models/query";
import {
  assertValid,
  mergeValidation,
  validatePageRequest,
  validateRequiredString,
  validateSortFields,
} from "../validation/request-validation";
import {
  validateZammadArrayResponse,
  validateZammadTicketResponse,
} from "../validation/response-validation";
import {
  applyClientFilters,
  applyClientSort,
  buildZammadListQuery,
  mapArrayPageResult,
  paginateInMemory,
} from "./list-helpers";
import type { ZammadServiceDeps } from "./zammad-operation-runner";

const SUPPORT_SORT_FIELDS = [
  "title",
  "displayId",
  "status",
  "priority",
  "createdAt",
  "updatedAt",
] as const satisfies readonly SupportTicketSortField[];

export class ZammadSupportService {
  constructor(private readonly deps: ZammadServiceDeps) {}

  async list(
    context: IntegrationRequestContext,
    filter: SupportTicketListFilter = {},
    page: PageRequest = {},
    sort: readonly SortField<SupportTicketSortField>[] = [],
  ): Promise<PageResult<SupportTicket>> {
    assertValid(
      mergeValidation(
        validatePageRequest(page),
        validateSortFields(sort, SUPPORT_SORT_FIELDS),
      ),
      "support.list",
    );

    return this.deps.runner.run(context, "support.list", async () => {
      const searchQuery = buildSearchQuery(filter);
      const list = searchQuery
        ? await this.deps.client.searchTickets(
            context,
            searchQuery,
            buildZammadListQuery(page, sort),
          )
        : await this.deps.client.listTickets(
            context,
            buildZammadListQuery(page, sort),
          );

      assertValid(validateZammadArrayResponse(list.items), "support.list.response");

      const mapperCtx = { tenantId: this.deps.serviceContext.tenantId };
      let result = mapArrayPageResult(
        list,
        (item) => {
          assertValid(validateZammadTicketResponse(item), "support.entity");
          return mapZammadTicket(item as ZammadTicketRecord, mapperCtx);
        },
        page,
      );

      result = {
        ...result,
        items: applyClientFilters(result.items, (ticket) =>
          matchesSupportFilter(ticket, filter),
        ),
      };

      if (sort.length > 0) {
        result = {
          ...result,
          items: applyClientSort(result.items, sort, (item, field) => {
            if (field === "createdAt") return item.createdAt;
            if (field === "updatedAt") return item.updatedAt;
            if (field === "displayId") return item.displayId ?? "";
            return String(item[field as keyof SupportTicket] ?? "");
          }),
        };
      }

      return result;
    });
  }

  async get(
    context: IntegrationRequestContext,
    supportTicketId: string,
  ): Promise<SupportTicket> {
    return this.deps.runner.run(context, "support.get", async () => {
      const record = await this.deps.client.getTicket(
        context,
        extractSupportTicketZammadId(supportTicketId),
      );
      assertValid(validateZammadTicketResponse(record), "support.entity");
      return mapZammadTicket(record, {
        tenantId: this.deps.serviceContext.tenantId,
      });
    });
  }

  async create(
    context: IntegrationRequestContext,
    input: CreateSupportTicketInput,
  ): Promise<SupportTicket> {
    assertValid(
      mergeValidation(
        validateRequiredString(input.title, "title", { maxLength: 255 }),
        validateRequiredString(input.groupId, "groupId"),
        validateRequiredString(input.requesterId, "requesterId"),
      ),
      "support.create",
    );

    return this.deps.runner.run(context, "support.create", async () => {
      const record = await this.deps.client.createTicket(
        context,
        mapSupportTicketToZammadBody({
          title: input.title,
          groupId: input.groupId,
          requesterId: input.requesterId,
          assigneeId: input.assigneeId,
          organizationId: input.organizationId,
          status: input.status,
          priority: input.priority,
          tags: input.tags,
          includeCreateArticle: true,
        }),
      );
      assertValid(validateZammadTicketResponse(record), "support.entity");
      return mapZammadTicket(record, {
        tenantId: this.deps.serviceContext.tenantId,
      });
    });
  }

  async update(
    context: IntegrationRequestContext,
    supportTicketId: string,
    input: UpdateSupportTicketInput,
  ): Promise<SupportTicket> {
    return this.deps.runner.run(context, "support.update", async () => {
      const record = await this.deps.client.updateTicket(
        context,
        extractSupportTicketZammadId(supportTicketId),
        mapSupportTicketToZammadBody(input),
      );
      assertValid(validateZammadTicketResponse(record), "support.entity");
      return mapZammadTicket(record, {
        tenantId: this.deps.serviceContext.tenantId,
      });
    });
  }

  async close(
    context: IntegrationRequestContext,
    supportTicketId: string,
  ): Promise<SupportTicket> {
    return this.changeState(context, supportTicketId, { status: "closed" });
  }

  async reopen(
    context: IntegrationRequestContext,
    supportTicketId: string,
  ): Promise<SupportTicket> {
    return this.changeState(context, supportTicketId, { status: "open" });
  }

  async changeState(
    context: IntegrationRequestContext,
    supportTicketId: string,
    input: ChangeSupportTicketStateInput,
  ): Promise<SupportTicket> {
    assertValid(
      validateRequiredString(input.status, "status"),
      "support.changeState",
    );

    return this.deps.runner.run(context, "support.changeState", async () => {
      const record = await this.deps.client.updateTicket(
        context,
        extractSupportTicketZammadId(supportTicketId),
        mapSupportTicketToZammadBody({ status: input.status }),
      );
      assertValid(validateZammadTicketResponse(record), "support.entity");
      return mapZammadTicket(record, {
        tenantId: this.deps.serviceContext.tenantId,
      });
    });
  }

  async changePriority(
    context: IntegrationRequestContext,
    supportTicketId: string,
    input: ChangeSupportTicketPriorityInput,
  ): Promise<SupportTicket> {
    assertValid(
      validateRequiredString(input.priority, "priority"),
      "support.changePriority",
    );

    return this.deps.runner.run(context, "support.changePriority", async () => {
      const record = await this.deps.client.updateTicket(
        context,
        extractSupportTicketZammadId(supportTicketId),
        mapSupportTicketToZammadBody({ priority: input.priority }),
      );
      assertValid(validateZammadTicketResponse(record), "support.entity");
      return mapZammadTicket(record, {
        tenantId: this.deps.serviceContext.tenantId,
      });
    });
  }

  async assignOwner(
    context: IntegrationRequestContext,
    supportTicketId: string,
    input: AssignSupportTicketOwnerInput,
  ): Promise<SupportTicket> {
    return this.deps.runner.run(context, "support.assignOwner", async () => {
      const record = await this.deps.client.updateTicket(
        context,
        extractSupportTicketZammadId(supportTicketId),
        mapSupportTicketToZammadBody({ assigneeId: input.assigneeId }),
      );
      assertValid(validateZammadTicketResponse(record), "support.entity");
      return mapZammadTicket(record, {
        tenantId: this.deps.serviceContext.tenantId,
      });
    });
  }

  async removeOwner(
    context: IntegrationRequestContext,
    supportTicketId: string,
  ): Promise<SupportTicket> {
    return this.assignOwner(context, supportTicketId, { assigneeId: null });
  }

  async assignCustomer(
    context: IntegrationRequestContext,
    supportTicketId: string,
    input: AssignSupportTicketCustomerInput,
  ): Promise<SupportTicket> {
    assertValid(
      validateRequiredString(input.requesterId, "requesterId"),
      "support.assignCustomer",
    );

    return this.deps.runner.run(context, "support.assignCustomer", async () => {
      const record = await this.deps.client.updateTicket(
        context,
        extractSupportTicketZammadId(supportTicketId),
        mapSupportTicketToZammadBody({ requesterId: input.requesterId }),
      );
      assertValid(validateZammadTicketResponse(record), "support.entity");
      return mapZammadTicket(record, {
        tenantId: this.deps.serviceContext.tenantId,
      });
    });
  }

  async searchByTicketNumber(
    context: IntegrationRequestContext,
    ticketNumber: string,
    page: PageRequest = {},
  ): Promise<PageResult<SupportTicket>> {
    assertValid(
      validateRequiredString(ticketNumber, "ticketNumber"),
      "support.searchByTicketNumber",
    );
    return this.list(context, { displayId: ticketNumber }, page);
  }

  async searchByTitle(
    context: IntegrationRequestContext,
    title: string,
    page: PageRequest = {},
  ): Promise<PageResult<SupportTicket>> {
    assertValid(validateRequiredString(title, "title"), "support.searchByTitle");
    return this.list(context, { title }, page);
  }

  /** In-memory pagination helper for filtered client-side result sets. */
  paginate(
    items: readonly SupportTicket[],
    page: PageRequest = {},
  ): PageResult<SupportTicket> {
    return paginateInMemory(items, page);
  }
}

function buildSearchQuery(filter: SupportTicketListFilter): string | undefined {
  if (filter.displayId?.trim()) {
    return `number:${filter.displayId.trim()}`;
  }
  if (filter.title?.trim()) {
    return filter.title.trim();
  }
  if (filter.search?.trim()) {
    return filter.search.trim();
  }
  return undefined;
}

function matchesSupportFilter(
  ticket: SupportTicket,
  filter: SupportTicketListFilter,
): boolean {
  if (filter.status && ticket.status !== filter.status) return false;
  if (filter.priority && ticket.priority !== filter.priority) return false;
  if (filter.groupId && ticket.groupId !== filter.groupId) return false;
  if (filter.requesterId && ticket.requesterId !== filter.requesterId) return false;
  if (filter.organizationId && ticket.organizationId !== filter.organizationId) {
    return false;
  }
  if (filter.assigneeId === null && ticket.assigneeId !== undefined) return false;
  if (
    typeof filter.assigneeId === "string" &&
    ticket.assigneeId !== filter.assigneeId
  ) {
    return false;
  }
  if (filter.displayId && ticket.displayId !== filter.displayId) return false;
  if (
    filter.title &&
    !ticket.title.toLowerCase().includes(filter.title.toLowerCase())
  ) {
    return false;
  }
  if (
    filter.search &&
    !`${ticket.title} ${ticket.displayId ?? ""}`
      .toLowerCase()
      .includes(filter.search.toLowerCase())
  ) {
    return false;
  }
  return true;
}
