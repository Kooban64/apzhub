/** Authorization helpers for search persistence (APZSEARCH-003). */

import {
  hasSearchAuditPermission,
  hasSearchCapabilitiesPermission,
  hasSearchCollectionPermission,
  hasSearchConfigurationPermission,
  hasSearchDiagnosticsPermission,
  hasSearchHealthPermission,
  hasSearchMetadataPermission,
  hasSearchProfilePermission,
  hasSearchProviderPermission,
  hasSearchQueryPermission,
  hasSearchScopePermission,
  hasSearchSourcePermission,
  hasSearchStatisticsPermission,
  hasSearchValidationPermission,
  type SearchCollectionPermissionOp,
  type SearchConfigurationPermissionOp,
  type SearchMetadataPermissionOp,
  type SearchProfilePermissionOp,
  type SearchProviderPermissionOp,
  type SearchScopePermissionOp,
  type SearchSourcePermissionOp,
} from "@apzhub/search-contracts";

import type { SearchRepositoryContext } from "./types";

export class SearchAuthorizationError extends Error {
  readonly code = "SEARCH_AUTHORIZATION_DENIED";
  constructor(message: string) {
    super(message);
    this.name = "SearchAuthorizationError";
  }
}

export function assertProviderPermission(
  ctx: SearchRepositoryContext,
  op?: SearchProviderPermissionOp,
): void {
  if (!hasSearchProviderPermission(ctx.permissions, op)) {
    throw new SearchAuthorizationError(
      op
        ? `search.provider.${op} permission required`
        : "search.provider permission required",
    );
  }
}

export function assertConfigurationPermission(
  ctx: SearchRepositoryContext,
  op?: SearchConfigurationPermissionOp,
): void {
  if (!hasSearchConfigurationPermission(ctx.permissions, op)) {
    throw new SearchAuthorizationError(
      op
        ? `search.configuration.${op} permission required`
        : "search.configuration permission required",
    );
  }
}

export function assertDiagnosticsPermission(ctx: SearchRepositoryContext): void {
  if (!hasSearchDiagnosticsPermission(ctx.permissions)) {
    throw new SearchAuthorizationError("search.diagnostics permission required");
  }
}

export function assertAuditPermission(ctx: SearchRepositoryContext): void {
  if (!hasSearchAuditPermission(ctx.permissions)) {
    throw new SearchAuthorizationError("search.audit permission required");
  }
}

export function assertQueryPermission(ctx: SearchRepositoryContext): void {
  if (!hasSearchQueryPermission(ctx.permissions)) {
    throw new SearchAuthorizationError("search.query permission required");
  }
}

export function assertCollectionPermission(
  ctx: SearchRepositoryContext,
  op?: SearchCollectionPermissionOp,
): void {
  if (!hasSearchCollectionPermission(ctx.permissions, op)) {
    throw new SearchAuthorizationError(
      op
        ? `search.collection.${op} permission required`
        : "search.collection permission required",
    );
  }
}

export function assertSourcePermission(
  ctx: SearchRepositoryContext,
  op?: SearchSourcePermissionOp,
): void {
  if (!hasSearchSourcePermission(ctx.permissions, op)) {
    throw new SearchAuthorizationError(
      op
        ? `search.source.${op} permission required`
        : "search.source permission required",
    );
  }
}

export function assertScopePermission(
  ctx: SearchRepositoryContext,
  op?: SearchScopePermissionOp,
): void {
  if (!hasSearchScopePermission(ctx.permissions, op)) {
    throw new SearchAuthorizationError(
      op
        ? `search.scope.${op} permission required`
        : "search.scope permission required",
    );
  }
}

export function assertProfilePermission(
  ctx: SearchRepositoryContext,
  op?: SearchProfilePermissionOp,
): void {
  if (!hasSearchProfilePermission(ctx.permissions, op)) {
    throw new SearchAuthorizationError(
      op
        ? `search.profile.${op} permission required`
        : "search.profile permission required",
    );
  }
}

export function assertMetadataPermission(
  ctx: SearchRepositoryContext,
  op?: SearchMetadataPermissionOp,
): void {
  if (!hasSearchMetadataPermission(ctx.permissions, op)) {
    throw new SearchAuthorizationError(
      op
        ? `search.metadata.${op} permission required`
        : "search.metadata permission required",
    );
  }
}

export function assertCapabilitiesPermission(ctx: SearchRepositoryContext): void {
  if (!hasSearchCapabilitiesPermission(ctx.permissions)) {
    throw new SearchAuthorizationError("search.capabilities.read permission required");
  }
}

export function assertHealthPermission(ctx: SearchRepositoryContext): void {
  if (!hasSearchHealthPermission(ctx.permissions)) {
    throw new SearchAuthorizationError("search.health.read permission required");
  }
}

export function assertStatisticsPermission(ctx: SearchRepositoryContext): void {
  if (!hasSearchStatisticsPermission(ctx.permissions)) {
    throw new SearchAuthorizationError("search.statistics.read permission required");
  }
}

export function assertValidationPermission(ctx: SearchRepositoryContext): void {
  if (!hasSearchValidationPermission(ctx.permissions)) {
    throw new SearchAuthorizationError("search.validation.execute permission required");
  }
}

export function assertSameTenant(ctx: SearchRepositoryContext, tenantId: string): void {
  if (ctx.tenantId !== tenantId) {
    throw new SearchAuthorizationError("tenant isolation violation");
  }
}

export function matchesOrganisation(
  ctx: SearchRepositoryContext,
  organisationId: string | undefined,
): boolean {
  if (ctx.organisationId === undefined || organisationId === undefined) {
    return true;
  }
  return ctx.organisationId === organisationId;
}
