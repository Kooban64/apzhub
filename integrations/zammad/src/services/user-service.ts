import type { IntegrationRequestContext } from "@apzhub/integration-sdk";

import type { ZammadUserRecord } from "../internal/zammad-api-types";
import { extractSupportUserZammadId } from "../mappers/mapper-context";
import { mapZammadUser } from "../mappers/user-mapper";
import type { SupportUser } from "../models/canonical";
import type {
  PageRequest,
  PageResult,
  SortField,
  SupportUserListFilter,
  SupportUserSortField,
} from "../models/query";
import {
  assertValid,
  mergeValidation,
  validatePageRequest,
  validateRequiredString,
  validateSortFields,
} from "../validation/request-validation";
import {
  validateZammadArrayResponse,
  validateZammadUserResponse,
} from "../validation/response-validation";
import {
  applyClientFilters,
  applyClientSort,
  buildZammadListQuery,
  mapArrayPageResult,
} from "./list-helpers";
import type { ZammadServiceDeps } from "./zammad-operation-runner";

const USER_SORT_FIELDS = [
  "displayName",
  "email",
  "login",
  "createdAt",
  "updatedAt",
] as const satisfies readonly SupportUserSortField[];

/**
 * Support-domain users only (agents / customers).
 * Does not implement platform identity.
 */
export class ZammadUserService {
  constructor(private readonly deps: ZammadServiceDeps) {}

  async list(
    context: IntegrationRequestContext,
    filter: SupportUserListFilter = {},
    page: PageRequest = {},
    sort: readonly SortField<SupportUserSortField>[] = [],
  ): Promise<PageResult<SupportUser>> {
    assertValid(
      mergeValidation(
        validatePageRequest(page),
        validateSortFields(sort, USER_SORT_FIELDS),
      ),
      "users.list",
    );

    return this.deps.runner.run(context, "users.list", async () => {
      const list = await this.deps.client.listUsers(
        context,
        buildZammadListQuery(page, sort),
      );
      assertValid(validateZammadArrayResponse(list.items), "users.list.response");

      const mapperCtx = { tenantId: this.deps.serviceContext.tenantId };
      let result = mapArrayPageResult(
        list,
        (item) => {
          assertValid(validateZammadUserResponse(item), "user.entity");
          return mapZammadUser(item as ZammadUserRecord, mapperCtx);
        },
        page,
      );

      result = {
        ...result,
        items: applyClientFilters(result.items, (user) => matchesUserFilter(user, filter)),
      };

      if (sort.length > 0) {
        result = {
          ...result,
          items: applyClientSort(result.items, sort, (item, field) => {
            if (field === "createdAt") return item.createdAt;
            if (field === "updatedAt") return item.updatedAt;
            if (field === "email") return item.email ?? "";
            if (field === "login") return item.login ?? "";
            return item.displayName;
          }),
        };
      }

      return result;
    });
  }

  async get(
    context: IntegrationRequestContext,
    userId: string,
  ): Promise<SupportUser> {
    return this.deps.runner.run(context, "users.get", async () => {
      const record = await this.deps.client.getUser(
        context,
        extractSupportUserZammadId(userId),
      );
      assertValid(validateZammadUserResponse(record), "user.entity");
      return mapZammadUser(record, {
        tenantId: this.deps.serviceContext.tenantId,
      });
    });
  }

  async lookup(
    context: IntegrationRequestContext,
    input: { readonly email?: string; readonly login?: string },
  ): Promise<SupportUser | undefined> {
    assertValid(
      mergeValidation(
        input.email || input.login
          ? { ok: true, issues: [] }
          : { ok: false, issues: ["email or login is required"] },
      ),
      "users.lookup",
    );

    const query = input.email?.trim() || input.login?.trim() || "";
    const page = await this.search(context, query, { email: input.email, login: input.login });
    return page.items[0];
  }

  async search(
    context: IntegrationRequestContext,
    queryText: string,
    filter: SupportUserListFilter = {},
    page: PageRequest = {},
    sort: readonly SortField<SupportUserSortField>[] = [],
  ): Promise<PageResult<SupportUser>> {
    assertValid(
      mergeValidation(
        validateRequiredString(queryText, "query"),
        validatePageRequest(page),
        validateSortFields(sort, USER_SORT_FIELDS),
      ),
      "users.search",
    );

    return this.deps.runner.run(context, "users.search", async () => {
      const list = await this.deps.client.searchUsers(
        context,
        queryText,
        buildZammadListQuery(page, sort),
      );
      assertValid(validateZammadArrayResponse(list.items), "users.search.response");

      const mapperCtx = { tenantId: this.deps.serviceContext.tenantId };
      let result = mapArrayPageResult(
        list,
        (item) => {
          assertValid(validateZammadUserResponse(item), "user.entity");
          return mapZammadUser(item as ZammadUserRecord, mapperCtx);
        },
        page,
      );

      result = {
        ...result,
        items: applyClientFilters(result.items, (user) => matchesUserFilter(user, filter)),
      };

      return result;
    });
  }
}

function matchesUserFilter(
  user: SupportUser,
  filter: SupportUserListFilter,
): boolean {
  if (filter.active !== undefined && user.active !== filter.active) return false;
  if (filter.role && user.role !== filter.role) return false;
  if (filter.email && user.email?.toLowerCase() !== filter.email.toLowerCase()) {
    return false;
  }
  if (filter.login && user.login?.toLowerCase() !== filter.login.toLowerCase()) {
    return false;
  }
  if (filter.search) {
    const haystack = `${user.displayName} ${user.email ?? ""} ${user.login ?? ""}`.toLowerCase();
    if (!haystack.includes(filter.search.toLowerCase())) return false;
  }
  return true;
}
