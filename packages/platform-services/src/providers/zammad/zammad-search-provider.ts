import type { ZammadCoreServices } from "@apzhub/integration-zammad";
import type {
  SupportSearchFilter,
  SupportSearchSortField,
} from "@apzhub/platform-service-contracts";
import type { SortField } from "@apzhub/platform-service-contracts";

import { toIntegrationContext } from "../../context/to-integration-context";
import { withProviderErrorMapping } from "../../errors/map-provider-error";
import { unwrapListQuery } from "../../query/unwrap-list-query";
import type { SupportSearchProvider } from "../capability-providers";

const ZAMMAD_INTEGRATION_ID = "zammad";
const ZAMMAD_SEARCH_PROVIDER_ID = "zammad-search";

export const ZAMMAD_SEARCH_PROVIDER_REGISTRATION = {
  providerId: ZAMMAD_SEARCH_PROVIDER_ID,
  integrationId: ZAMMAD_INTEGRATION_ID,
  capability: "support_search" as const,
  priority: 100,
};

const SEARCH_SORT_MAP: Partial<Record<SupportSearchSortField, SupportSearchSortField>> = {
  score: "score",
  updatedAt: "updatedAt",
  title: "title",
};

function mapSearchSort(
  sort: readonly { field: SupportSearchSortField; direction: "asc" | "desc" }[],
): readonly SortField<SupportSearchSortField>[] {
  return sort.flatMap((entry) => {
    const mapped = SEARCH_SORT_MAP[entry.field];
    return mapped ? [{ field: mapped, direction: entry.direction }] : [];
  });
}

export function createZammadSearchProvider(core: ZammadCoreServices): SupportSearchProvider {
  return {
    search(ctx, queryText, query) {
      const { page, sort, filter } = unwrapListQuery<SupportSearchFilter, SupportSearchSortField>(
        query,
      );
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.search.search(
          toIntegrationContext(ctx),
          queryText,
          filter,
          page,
          mapSearchSort(sort),
        ),
      );
    },
  };
}
