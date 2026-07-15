import type { ZammadCoreServices } from "@apzhub/integration-zammad";
import type {
  CreateSupportGroupInput,
  SupportGroupListFilter,
  SupportGroupSortField,
  UpdateSupportGroupInput,
} from "@apzhub/platform-service-contracts";
import type { SortField } from "@apzhub/platform-service-contracts";

import { toIntegrationContext } from "../../context/to-integration-context";
import { withProviderErrorMapping } from "../../errors/map-provider-error";
import { unwrapListQuery } from "../../query/unwrap-list-query";
import type { SupportGroupProvider } from "../capability-providers";

const ZAMMAD_INTEGRATION_ID = "zammad";
const ZAMMAD_GROUP_PROVIDER_ID = "zammad-group";

export const ZAMMAD_GROUP_PROVIDER_REGISTRATION = {
  providerId: ZAMMAD_GROUP_PROVIDER_ID,
  integrationId: ZAMMAD_INTEGRATION_ID,
  capability: "support_group" as const,
  priority: 100,
};

const GROUP_SORT_MAP: Partial<Record<SupportGroupSortField, SupportGroupSortField>> = {
  name: "name",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
};

function mapGroupSort(
  sort: readonly { field: SupportGroupSortField; direction: "asc" | "desc" }[],
): readonly SortField<SupportGroupSortField>[] {
  return sort.flatMap((entry) => {
    const mapped = GROUP_SORT_MAP[entry.field];
    return mapped ? [{ field: mapped, direction: entry.direction }] : [];
  });
}

export function createZammadGroupProvider(core: ZammadCoreServices): SupportGroupProvider {
  return {
    listGroups(ctx, query) {
      const { page, sort, filter } = unwrapListQuery<SupportGroupListFilter, SupportGroupSortField>(
        query,
      );
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.groups.list(toIntegrationContext(ctx), filter, page, mapGroupSort(sort)),
      );
    },

    getGroup(ctx, groupId) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.groups.get(toIntegrationContext(ctx), groupId),
      );
    },

    createGroup(ctx, input: CreateSupportGroupInput) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.groups.create(toIntegrationContext(ctx), input),
      );
    },

    updateGroup(ctx, groupId, input: UpdateSupportGroupInput) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.groups.update(toIntegrationContext(ctx), groupId, input),
      );
    },
  };
}
