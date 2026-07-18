/**
 * Search Platform Services — thin gateway facets (APZSEARCH-003).
 * Business logic remains in @apzhub/search-persistence foundation.
 */

import {
  PlatformServiceError,
  isPlatformServiceError,
  type PlatformServiceErrorCategory,
  type PlatformServiceErrorCode,
  type ServiceRequestContext,
} from "@apzhub/platform-service-contracts";
import {
  isSearchDomainError,
  type SearchPlatformGateway,
  type SearchRequestContext,
  type SearchDomainError,
} from "@apzhub/search-contracts";
import type { SearchPlatformFoundation } from "@apzhub/search-persistence";

function toSearchCtx(ctx: ServiceRequestContext): SearchRequestContext {
  return {
    tenantId: ctx.tenantId,
    actorUserId: ctx.userId,
    correlationId: ctx.correlationId,
    organisationId: ctx.organisationId,
    permissions: ctx.permissions,
    requestId: ctx.requestId,
    workspaceId: ctx.workspaceId,
    locale: ctx.locale,
  };
}

function mapSearchDomainError(
  error: SearchDomainError,
  correlationId: string,
): PlatformServiceError {
  const classification = error.classification;
  let category: PlatformServiceErrorCategory = "business_rule";
  let code: PlatformServiceErrorCode = "BUSINESS_RULE_VIOLATION";

  if (
    classification === "validation_failed" ||
    classification === "invalid_input" ||
    classification === "configuration_invalid"
  ) {
    category = "validation";
    code = "VALIDATION_FAILED";
  } else if (classification.endsWith("_not_found") || classification === "not_found") {
    category = "not_found";
    code = "NOT_FOUND";
  } else if (
    classification === "provider_duplicate" ||
    classification === "duplicate" ||
    classification === "conflict" ||
    classification === "configuration_conflict"
  ) {
    category = "conflict";
    code = "CONFLICT";
  } else if (classification === "authorization_denied") {
    category = "authorization";
    code = "FORBIDDEN";
  } else if (classification === "tenant_mismatch") {
    category = "authorization";
    code = "TENANT_MISMATCH";
  } else if (classification === "organisation_mismatch") {
    category = "authorization";
    code = "ORGANISATION_MISMATCH";
  } else if (
    classification === "search_execution_unavailable" ||
    classification === "capability_unsupported" ||
    classification === "execution_capability_unsupported" ||
    classification === "provider_resolution_failed" ||
    classification === "execution_provider_unavailable" ||
    classification === "execution_provider_unhealthy" ||
    classification === "execution_provider_disabled"
  ) {
    category = "configuration";
    code = "PROVIDER_CAPABILITY_UNSUPPORTED";
  } else if (
    classification === "tenant_filter_required" ||
    classification === "security_filter_violation"
  ) {
    category = "authorization";
    code = "FORBIDDEN";
  } else if (
    classification === "execution_provider_not_found" ||
    classification === "index_not_found" ||
    classification === "document_not_found"
  ) {
    category = "not_found";
    code = "NOT_FOUND";
  } else if (classification === "engine_operation_failed") {
    category = "integration";
    code = "PROVIDER_UNAVAILABLE";
  }

  return new PlatformServiceError({
    category,
    code,
    message: error.message,
    correlationId,
    retryable: false,
    details: {
      classification,
      ...(error.details ?? {}),
    },
  });
}

async function withSearchErrorMapping<T>(
  ctx: ServiceRequestContext,
  invoke: () => Promise<T> | T,
): Promise<T> {
  try {
    return await invoke();
  } catch (error) {
    if (isPlatformServiceError(error)) throw error;
    if (isSearchDomainError(error)) {
      throw mapSearchDomainError(error, ctx.correlationId);
    }
    if (error instanceof Error && error.name === "SearchAuthorizationError") {
      throw new PlatformServiceError({
        category: "authorization",
        code: "FORBIDDEN",
        message: error.message,
        correlationId: ctx.correlationId,
        retryable: false,
      });
    }
    throw error;
  }
}

type RemapSearchFn<F> = F extends (
  ctx: SearchRequestContext,
  ...args: infer A
) => infer R
  ? (ctx: ServiceRequestContext, ...args: A) => Promise<Awaited<R>>
  : F;

type RemapSearchCtx<T> = {
  [K in keyof T]: undefined extends T[K]
    ? RemapSearchFn<Exclude<T[K], undefined>> | undefined
    : RemapSearchFn<T[K]>;
};

function wrapFacet<T extends object>(facet: T): RemapSearchCtx<T> {
  return new Proxy(facet, {
    get(target, property, receiver) {
      const value = Reflect.get(target, property, receiver);
      if (typeof property === "symbol" || typeof value !== "function") {
        return value;
      }
      return async (ctx: ServiceRequestContext, ...rest: unknown[]) =>
        withSearchErrorMapping(ctx, () =>
          (value as (...args: unknown[]) => unknown).call(
            target,
            toSearchCtx(ctx),
            ...rest,
          ),
        );
    },
  }) as RemapSearchCtx<T>;
}

export type SearchPlatformServiceImpls = {
  [K in keyof SearchPlatformGateway]: RemapSearchCtx<SearchPlatformGateway[K]>;
};

export function createSearchPlatformServiceImpls(input: {
  readonly foundation: SearchPlatformFoundation;
}): SearchPlatformServiceImpls {
  const g = input.foundation.gateway;
  return {
    searchQuery: wrapFacet(g.searchQuery),
    searchProviders: wrapFacet(g.searchProviders),
    searchConfigurations: wrapFacet(g.searchConfigurations),
    searchCapabilities: wrapFacet(g.searchCapabilities),
    searchHealth: wrapFacet(g.searchHealth),
    searchDiagnostics: wrapFacet(g.searchDiagnostics),
    searchCollections: wrapFacet(g.searchCollections),
    searchSources: wrapFacet(g.searchSources),
    searchScopes: wrapFacet(g.searchScopes),
    searchProfiles: wrapFacet(g.searchProfiles),
    searchMetadata: wrapFacet(g.searchMetadata),
    searchAudit: wrapFacet(g.searchAudit),
    searchStatistics: wrapFacet(g.searchStatistics),
    searchValidation: wrapFacet(g.searchValidation),
  };
}

export { mapSearchDomainError };
