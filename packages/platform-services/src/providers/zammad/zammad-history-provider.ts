import type { ZammadCoreServices } from "@apzhub/integration-zammad";
import type {
  SupportHistoryListFilter,
  SupportHistorySortField,
} from "@apzhub/platform-service-contracts";
import type { SortField } from "@apzhub/platform-service-contracts";

import { toIntegrationContext } from "../../context/to-integration-context";
import { withProviderErrorMapping } from "../../errors/map-provider-error";
import { unwrapListQuery } from "../../query/unwrap-list-query";
import type { SupportHistoryProvider } from "../capability-providers";

const ZAMMAD_INTEGRATION_ID = "zammad";
const ZAMMAD_HISTORY_PROVIDER_ID = "zammad-history";

export const ZAMMAD_HISTORY_PROVIDER_REGISTRATION = {
  providerId: ZAMMAD_HISTORY_PROVIDER_ID,
  integrationId: ZAMMAD_INTEGRATION_ID,
  capability: "support_history" as const,
  priority: 100,
};

const HISTORY_SORT_MAP: Partial<
  Record<SupportHistorySortField, SupportHistorySortField>
> = {
  occurredAt: "occurredAt",
};

function mapHistorySort(
  sort: readonly { field: SupportHistorySortField; direction: "asc" | "desc" }[],
): readonly SortField<SupportHistorySortField>[] {
  return sort.flatMap((entry) => {
    const mapped = HISTORY_SORT_MAP[entry.field];
    return mapped ? [{ field: mapped, direction: entry.direction }] : [];
  });
}

export function createZammadHistoryProvider(
  core: ZammadCoreServices,
): SupportHistoryProvider {
  return {
    getTimeline(ctx, supportTicketId, query) {
      const { page, sort, filter } = unwrapListQuery<
        SupportHistoryListFilter,
        SupportHistorySortField
      >(query);
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.history.getTimeline(
          toIntegrationContext(ctx),
          supportTicketId,
          filter,
          page,
          mapHistorySort(sort),
        ),
      );
    },

    list(ctx, supportTicketId, query) {
      const { page, filter } = unwrapListQuery<
        SupportHistoryListFilter,
        SupportHistorySortField
      >(query);
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.history.list(toIntegrationContext(ctx), supportTicketId, filter, page),
      );
    },

    getSupportTimeline(ctx, supportTicketId) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.history.getSupportTimeline(toIntegrationContext(ctx), supportTicketId),
      );
    },
  };
}
