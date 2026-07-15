import type { ServiceRequestContext } from "../common/context";
import type { ListQuery } from "../common/list-query";
import type { PageResult } from "../common/paging";
import type { SupportGroup } from "../domain";
import type { CreateSupportGroupInput, UpdateSupportGroupInput } from "../inputs";
import type { SupportGroupListFilter, SupportGroupSortField } from "../queries";
import type { SupportGroupId } from "../domain/identifiers";

/** Vendor-neutral Support group / queue operations. */
export interface SupportGroupService {
  listGroups(
    ctx: ServiceRequestContext,
    query?: ListQuery<SupportGroupListFilter, SupportGroupSortField>,
  ): Promise<PageResult<SupportGroup>>;

  getGroup(ctx: ServiceRequestContext, groupId: SupportGroupId): Promise<SupportGroup>;

  createGroup(
    ctx: ServiceRequestContext,
    input: CreateSupportGroupInput,
  ): Promise<SupportGroup>;

  updateGroup(
    ctx: ServiceRequestContext,
    groupId: SupportGroupId,
    input: UpdateSupportGroupInput,
  ): Promise<SupportGroup>;
}
