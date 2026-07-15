import type { ServiceRequestContext } from "../common/context";
import type { ListQuery } from "../common/list-query";
import type { PageResult } from "../common/paging";
import type { User, UserProfile } from "../domain";
import type { CreateUserInput, UpdateUserInput } from "../inputs";
import type { UserListFilter, UserSortField } from "../queries";
import type { UserId } from "../domain/identifiers";

/** Vendor-neutral platform user operations. */
export interface UserService {
  listUsers(
    ctx: ServiceRequestContext,
    query?: ListQuery<UserListFilter, UserSortField>,
  ): Promise<PageResult<User>>;

  getUser(ctx: ServiceRequestContext, userId: UserId): Promise<User>;

  getUserByEmail(ctx: ServiceRequestContext, email: string): Promise<User | null>;

  getUserProfile(ctx: ServiceRequestContext, userId: UserId): Promise<UserProfile>;

  createUser(ctx: ServiceRequestContext, input: CreateUserInput): Promise<User>;

  updateUser(
    ctx: ServiceRequestContext,
    userId: UserId,
    input: UpdateUserInput,
  ): Promise<User>;
}
