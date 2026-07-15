import type { ZammadCoreServices } from "@apzhub/integration-zammad";
import type {
  AssignSupportTicketOwnerInput,
  ChangeSupportTicketPriorityInput,
  ChangeSupportTicketStateInput,
  CreateSupportTicketInput,
  SupportTicketListFilter,
  SupportTicketSortField,
  UpdateSupportTicketInput,
} from "@apzhub/platform-service-contracts";
import type { SortField } from "@apzhub/platform-service-contracts";

import { toIntegrationContext } from "../../context/to-integration-context";
import { withProviderErrorMapping } from "../../errors/map-provider-error";
import { unwrapListQuery } from "../../query/unwrap-list-query";
import type { SupportProvider } from "../capability-providers";

const ZAMMAD_INTEGRATION_ID = "zammad";
const ZAMMAD_SUPPORT_PROVIDER_ID = "zammad-support";

export const ZAMMAD_SUPPORT_PROVIDER_REGISTRATION = {
  providerId: ZAMMAD_SUPPORT_PROVIDER_ID,
  integrationId: ZAMMAD_INTEGRATION_ID,
  capability: "support_request" as const,
  priority: 100,
};

const SUPPORT_SORT_MAP: Partial<Record<SupportTicketSortField, SupportTicketSortField>> = {
  title: "title",
  displayId: "displayId",
  status: "status",
  priority: "priority",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
};

function mapSupportSort(
  sort: readonly { field: SupportTicketSortField; direction: "asc" | "desc" }[],
): readonly SortField<SupportTicketSortField>[] {
  return sort.flatMap((entry) => {
    const mapped = SUPPORT_SORT_MAP[entry.field];
    return mapped ? [{ field: mapped, direction: entry.direction }] : [];
  });
}

/** Zammad-backed Support Request capability provider. */
export function createZammadSupportProvider(core: ZammadCoreServices): SupportProvider {
  return {
    listSupportRequests(ctx, query) {
      const { page, sort, filter } = unwrapListQuery<SupportTicketListFilter, SupportTicketSortField>(
        query,
      );
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.support.list(toIntegrationContext(ctx), filter, page, mapSupportSort(sort)),
      );
    },

    getSupportRequest(ctx, supportRequestId) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.support.get(toIntegrationContext(ctx), supportRequestId),
      );
    },

    createSupportRequest(ctx, input: CreateSupportTicketInput) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.support.create(toIntegrationContext(ctx), input),
      );
    },

    updateSupportRequest(ctx, supportRequestId, input: UpdateSupportTicketInput) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.support.update(toIntegrationContext(ctx), supportRequestId, input),
      );
    },

    closeSupportRequest(ctx, supportRequestId) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.support.close(toIntegrationContext(ctx), supportRequestId),
      );
    },

    reopenSupportRequest(ctx, supportRequestId) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.support.reopen(toIntegrationContext(ctx), supportRequestId),
      );
    },

    assignSupportRequest(ctx, supportRequestId, input: AssignSupportTicketOwnerInput) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.support.assignOwner(toIntegrationContext(ctx), supportRequestId, input),
      );
    },

    changeSupportRequestPriority(
      ctx,
      supportRequestId,
      input: ChangeSupportTicketPriorityInput,
    ) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.support.changePriority(toIntegrationContext(ctx), supportRequestId, input),
      );
    },

    changeSupportRequestState(ctx, supportRequestId, input: ChangeSupportTicketStateInput) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.support.changeState(toIntegrationContext(ctx), supportRequestId, input),
      );
    },

    searchSupportRequests(ctx, query) {
      const { page, sort, filter } = unwrapListQuery<SupportTicketListFilter, SupportTicketSortField>(
        query,
      );
      return withProviderErrorMapping(ctx.correlationId, async () => {
        if (filter.displayId?.trim()) {
          return core.support.searchByTicketNumber(
            toIntegrationContext(ctx),
            filter.displayId,
            page,
          );
        }
        if (filter.title?.trim() || filter.search?.trim()) {
          const title = filter.title?.trim() || filter.search?.trim() || "";
          return core.support.searchByTitle(toIntegrationContext(ctx), title, page);
        }
        return core.support.list(
          toIntegrationContext(ctx),
          filter,
          page,
          mapSupportSort(sort),
        );
      });
    },
  };
}
