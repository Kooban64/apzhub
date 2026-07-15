import type { ServiceRequestContext } from "../common/context";
import type { ListQuery } from "../common/list-query";
import type { PageResult } from "../common/paging";
import type { SupportOrganization } from "../domain";
import type {
  CreateSupportOrganizationInput,
  UpdateSupportOrganizationInput,
} from "../inputs";
import type {
  SupportOrganizationListFilter,
  SupportOrganizationSortField,
} from "../queries";
import type { SupportOrganizationId } from "../domain/identifiers";

/** Vendor-neutral Support organisation operations. */
export interface SupportOrganizationService {
  listOrganizations(
    ctx: ServiceRequestContext,
    query?: ListQuery<SupportOrganizationListFilter, SupportOrganizationSortField>,
  ): Promise<PageResult<SupportOrganization>>;

  getOrganization(
    ctx: ServiceRequestContext,
    organizationId: SupportOrganizationId,
  ): Promise<SupportOrganization>;

  createOrganization(
    ctx: ServiceRequestContext,
    input: CreateSupportOrganizationInput,
  ): Promise<SupportOrganization>;

  updateOrganization(
    ctx: ServiceRequestContext,
    organizationId: SupportOrganizationId,
    input: UpdateSupportOrganizationInput,
  ): Promise<SupportOrganization>;

  archiveOrganization(
    ctx: ServiceRequestContext,
    organizationId: SupportOrganizationId,
  ): Promise<SupportOrganization>;
}
