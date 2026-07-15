import type {
  CreateUserInput,
  ListQuery,
  PageResult,
  SearchQueryInput,
  SearchResult,
  SearchSuggestInput,
  SearchSuggestion,
  ServiceRequestContext,
  UpdateUserInput,
  User,
  UserListFilter,
  UserProfile,
  UserSortField,
} from "@apzhub/platform-service-contracts";
import type { UserId } from "@apzhub/platform-service-contracts";

import { throwUnsupportedProviderOperation } from "../../errors/map-provider-error";
import type { SearchProvider, UserProvider } from "../capability-providers";

const PLANE_INTEGRATION_ID = "plane";
const PLANE_USER_PROVIDER_ID = "plane-user";
const PLANE_SEARCH_PROVIDER_ID = "plane-search";

/**
 * Plane-backed user provider scaffold.
 * Global user directory operations are owned by platform identity — not Plane CE.
 */
export function createPlaneUserProvider(): UserProvider {
  return {
    async listUsers(
      ctx: ServiceRequestContext,
      _query?: ListQuery<UserListFilter, UserSortField>,
    ): Promise<PageResult<User>> {
      throwUnsupportedProviderOperation(ctx.correlationId, "user.listUsers");
    },

    async getUser(ctx: ServiceRequestContext, _userId: UserId): Promise<User> {
      throwUnsupportedProviderOperation(ctx.correlationId, "user.getUser");
    },

    async getUserByEmail(ctx: ServiceRequestContext, _email: string): Promise<User | null> {
      throwUnsupportedProviderOperation(ctx.correlationId, "user.getUserByEmail");
    },

    async getUserProfile(ctx: ServiceRequestContext, _userId: UserId): Promise<UserProfile> {
      throwUnsupportedProviderOperation(ctx.correlationId, "user.getUserProfile");
    },

    async createUser(ctx: ServiceRequestContext, _input: CreateUserInput): Promise<User> {
      throwUnsupportedProviderOperation(ctx.correlationId, "user.createUser");
    },

    async updateUser(
      ctx: ServiceRequestContext,
      _userId: UserId,
      _input: UpdateUserInput,
    ): Promise<User> {
      throwUnsupportedProviderOperation(ctx.correlationId, "user.updateUser");
    },
  };
}

/**
 * Plane-backed search provider scaffold.
 * Unified search indexing is platform-owned (020) — Plane adapter does not expose search yet.
 */
export function createPlaneSearchProvider(): SearchProvider {
  return {
    async search(_ctx: ServiceRequestContext, _input: SearchQueryInput): Promise<SearchResult> {
      return {
        status: "empty",
        documents: [],
        message: "Search provider not yet connected",
        durationMs: 0,
      };
    },

    async suggest(
      _ctx: ServiceRequestContext,
      _input: SearchSuggestInput,
    ): Promise<readonly SearchSuggestion[]> {
      return [];
    },
  };
}

export const PLANE_USER_PROVIDER_REGISTRATION = {
  providerId: PLANE_USER_PROVIDER_ID,
  integrationId: PLANE_INTEGRATION_ID,
  capability: "user" as const,
  priority: 100,
};

export const PLANE_SEARCH_PROVIDER_REGISTRATION = {
  providerId: PLANE_SEARCH_PROVIDER_ID,
  integrationId: PLANE_INTEGRATION_ID,
  capability: "search" as const,
  priority: 100,
};
