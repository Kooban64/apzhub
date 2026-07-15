import type { ServiceRequestContext } from "../common/context";
import type { ListQuery } from "../common/list-query";
import type { PageResult } from "../common/paging";
import type { SupportUser } from "../domain";
import type { SupportUserListFilter, SupportUserSortField } from "../queries";
import type { SupportUserId } from "../domain/identifiers";

/** Vendor-neutral Support-domain user operations (agents / customers). */
export interface SupportUserService {
  listUsers(
    ctx: ServiceRequestContext,
    query?: ListQuery<SupportUserListFilter, SupportUserSortField>,
  ): Promise<PageResult<SupportUser>>;

  getUser(ctx: ServiceRequestContext, userId: SupportUserId): Promise<SupportUser>;

  lookup(
    ctx: ServiceRequestContext,
    input: { readonly email?: string; readonly login?: string },
  ): Promise<SupportUser | undefined>;

  search(
    ctx: ServiceRequestContext,
    queryText: string,
    query?: ListQuery<SupportUserListFilter, SupportUserSortField>,
  ): Promise<PageResult<SupportUser>>;
}
