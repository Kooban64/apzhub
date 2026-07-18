import type { ZammadCoreServices } from "@apzhub/integration-zammad";
import type {
  SupportUserListFilter,
  SupportUserSortField,
} from "@apzhub/platform-service-contracts";
import type { SortField } from "@apzhub/platform-service-contracts";

import { toIntegrationContext } from "../../context/to-integration-context";
import { withProviderErrorMapping } from "../../errors/map-provider-error";
import { unwrapListQuery } from "../../query/unwrap-list-query";
import type { SupportUserProvider } from "../capability-providers";

const ZAMMAD_INTEGRATION_ID = "zammad";
const ZAMMAD_USER_PROVIDER_ID = "zammad-user";

export const ZAMMAD_USER_PROVIDER_REGISTRATION = {
  providerId: ZAMMAD_USER_PROVIDER_ID,
  integrationId: ZAMMAD_INTEGRATION_ID,
  capability: "support_user" as const,
  priority: 100,
};

const USER_SORT_MAP: Partial<Record<SupportUserSortField, SupportUserSortField>> = {
  displayName: "displayName",
  email: "email",
  login: "login",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
};

function mapUserSort(
  sort: readonly { field: SupportUserSortField; direction: "asc" | "desc" }[],
): readonly SortField<SupportUserSortField>[] {
  return sort.flatMap((entry) => {
    const mapped = USER_SORT_MAP[entry.field];
    return mapped ? [{ field: mapped, direction: entry.direction }] : [];
  });
}

export function createZammadUserProvider(
  core: ZammadCoreServices,
): SupportUserProvider {
  return {
    listUsers(ctx, query) {
      const { page, sort, filter } = unwrapListQuery<
        SupportUserListFilter,
        SupportUserSortField
      >(query);
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.users.list(toIntegrationContext(ctx), filter, page, mapUserSort(sort)),
      );
    },

    getUser(ctx, userId) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.users.get(toIntegrationContext(ctx), userId),
      );
    },

    lookup(ctx, input) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.users.lookup(toIntegrationContext(ctx), input),
      );
    },

    search(ctx, queryText, query) {
      const { page, sort, filter } = unwrapListQuery<
        SupportUserListFilter,
        SupportUserSortField
      >(query);
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.users.search(
          toIntegrationContext(ctx),
          queryText,
          filter,
          page,
          mapUserSort(sort),
        ),
      );
    },
  };
}
