import type { IntegrationRequestContext } from "@apzhub/integration-sdk";

import { mapZammadHistoryTimeline } from "../mappers/history-mapper";
import { extractSupportTicketZammadId } from "../mappers/mapper-context";
import type { SupportHistoryEvent, SupportTimeline } from "../models/canonical";
import type {
  PageRequest,
  PageResult,
  SortField,
  SupportHistoryListFilter,
  SupportHistorySortField,
} from "../models/query";
import {
  assertValid,
  mergeValidation,
  validatePageRequest,
  validateRequiredString,
  validateSortFields,
} from "../validation/request-validation";
import {
  applyClientFilters,
  applyClientSort,
  paginateInMemory,
} from "./list-helpers";
import type { ZammadServiceDeps } from "./zammad-operation-runner";

const HISTORY_SORT_FIELDS = [
  "occurredAt",
] as const satisfies readonly SupportHistorySortField[];

/**
 * Read-only Support Request history / audit timeline.
 */
export class ZammadHistoryService {
  constructor(private readonly deps: ZammadServiceDeps) {}

  async getTimeline(
    context: IntegrationRequestContext,
    supportTicketId: string,
    filter: SupportHistoryListFilter = {},
    page: PageRequest = {},
    sort: readonly SortField<SupportHistorySortField>[] = [
      { field: "occurredAt", direction: "asc" },
    ],
  ): Promise<PageResult<SupportHistoryEvent>> {
    assertValid(
      mergeValidation(
        validateRequiredString(supportTicketId, "supportTicketId"),
        validatePageRequest(page),
        validateSortFields(sort, HISTORY_SORT_FIELDS),
      ),
      "history.getTimeline",
    );

    return this.deps.runner.run(context, "zammad.history.getTimeline", async () => {
      const timeline = await this.loadTimeline(context, supportTicketId);
      let events = applyClientFilters(timeline.events, (event) =>
        matchesHistoryFilter(event, filter),
      );
      events = applyClientSort(events, sort, (item) => item.occurredAt);
      return paginateInMemory(events, page);
    });
  }

  async list(
    context: IntegrationRequestContext,
    supportTicketId: string,
    filter: SupportHistoryListFilter = {},
    page: PageRequest = {},
  ): Promise<PageResult<SupportHistoryEvent>> {
    return this.getTimeline(context, supportTicketId, filter, page);
  }

  async getSupportTimeline(
    context: IntegrationRequestContext,
    supportTicketId: string,
  ): Promise<SupportTimeline> {
    assertValid(
      validateRequiredString(supportTicketId, "supportTicketId"),
      "history.getSupportTimeline",
    );

    return this.deps.runner.run(
      context,
      "zammad.history.getSupportTimeline",
      async () => this.loadTimeline(context, supportTicketId),
    );
  }

  private async loadTimeline(
    context: IntegrationRequestContext,
    supportTicketId: string,
  ): Promise<SupportTimeline> {
    const records = await this.deps.client.listTicketHistory(
      context,
      extractSupportTicketZammadId(supportTicketId),
    );
    return mapZammadHistoryTimeline(
      records,
      { tenantId: this.deps.serviceContext.tenantId },
      supportTicketId,
    );
  }
}

function matchesHistoryFilter(
  event: SupportHistoryEvent,
  filter: SupportHistoryListFilter,
): boolean {
  if (filter.actions?.length && !filter.actions.includes(event.action)) {
    return false;
  }
  if (filter.actorId && event.actor.userId !== filter.actorId) return false;
  if (filter.occurredAfter && event.occurredAt < filter.occurredAfter) return false;
  if (filter.occurredBefore && event.occurredAt > filter.occurredBefore) return false;
  return true;
}
