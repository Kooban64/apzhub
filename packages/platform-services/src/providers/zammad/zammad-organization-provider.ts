import type { ZammadCoreServices } from "@apzhub/integration-zammad";
import type {
  CreateSupportOrganizationInput,
  SupportOrganizationListFilter,
  SupportOrganizationSortField,
  UpdateSupportOrganizationInput,
} from "@apzhub/platform-service-contracts";
import type { SortField } from "@apzhub/platform-service-contracts";

import { toIntegrationContext } from "../../context/to-integration-context";
import { withProviderErrorMapping } from "../../errors/map-provider-error";
import { unwrapListQuery } from "../../query/unwrap-list-query";
import type { SupportOrganizationProvider } from "../capability-providers";

const ZAMMAD_INTEGRATION_ID = "zammad";
const ZAMMAD_ORGANIZATION_PROVIDER_ID = "zammad-organization";

export const ZAMMAD_ORGANIZATION_PROVIDER_REGISTRATION = {
  providerId: ZAMMAD_ORGANIZATION_PROVIDER_ID,
  integrationId: ZAMMAD_INTEGRATION_ID,
  capability: "support_organization" as const,
  priority: 100,
};

const ORG_SORT_MAP: Partial<
  Record<SupportOrganizationSortField, SupportOrganizationSortField>
> = {
  name: "name",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
};

function mapOrgSort(
  sort: readonly { field: SupportOrganizationSortField; direction: "asc" | "desc" }[],
): readonly SortField<SupportOrganizationSortField>[] {
  return sort.flatMap((entry) => {
    const mapped = ORG_SORT_MAP[entry.field];
    return mapped ? [{ field: mapped, direction: entry.direction }] : [];
  });
}

export function createZammadOrganizationProvider(
  core: ZammadCoreServices,
): SupportOrganizationProvider {
  return {
    listOrganizations(ctx, query) {
      const { page, sort, filter } = unwrapListQuery<
        SupportOrganizationListFilter,
        SupportOrganizationSortField
      >(query);
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.organizations.list(
          toIntegrationContext(ctx),
          filter,
          page,
          mapOrgSort(sort),
        ),
      );
    },

    getOrganization(ctx, organizationId) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.organizations.get(toIntegrationContext(ctx), organizationId),
      );
    },

    createOrganization(ctx, input: CreateSupportOrganizationInput) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.organizations.create(toIntegrationContext(ctx), input),
      );
    },

    updateOrganization(ctx, organizationId, input: UpdateSupportOrganizationInput) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.organizations.update(toIntegrationContext(ctx), organizationId, input),
      );
    },

    archiveOrganization(ctx, organizationId) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.organizations.archive(toIntegrationContext(ctx), organizationId),
      );
    },
  };
}
