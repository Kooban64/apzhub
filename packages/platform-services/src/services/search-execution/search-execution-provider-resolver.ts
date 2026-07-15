/**
 * Search execution provider resolver (APZSEARCH-006).
 * Precedence (first match wins; no silent fallback beyond the chain):
 * explicit authorised provider → profile → collection → source →
 * tenant-active → platform-active → priority.
 */

import type {
  PlatformSearchExecutionProvider,
  PlatformSearchExecutionProviderRegistration,
  SearchExecutionQueryOptions,
  SearchRequestContext,
} from "@apzhub/search-contracts";
import {
  hasSearchQueryOpPermission,
  searchExecutionProviderUnavailable,
  searchProviderResolutionFailed,
  searchExecutionProviderNotFound,
} from "@apzhub/search-contracts";

export type SearchExecutionProviderResolverInput = {
  readonly providers: readonly PlatformSearchExecutionProvider[];
};

function isVisibleToTenant(
  registration: PlatformSearchExecutionProviderRegistration,
  tenantId: string,
): boolean {
  const visible = registration.visibleTenantIds;
  if (!visible || visible.length === 0) return true;
  return visible.includes(tenantId);
}

function isEligible(
  provider: PlatformSearchExecutionProvider,
  context: SearchRequestContext,
): boolean {
  const r = provider.registration;
  if (!r.enabled) return false;
  if (!r.healthy) return false;
  if (!isVisibleToTenant(r, context.tenantId)) return false;
  if (!r.capabilities.keywords) return false;
  return true;
}

function byPriorityDesc(
  a: PlatformSearchExecutionProvider,
  b: PlatformSearchExecutionProvider,
): number {
  return (b.registration.priority ?? 0) - (a.registration.priority ?? 0);
}

export class SearchExecutionProviderResolver {
  constructor(private readonly providers: readonly PlatformSearchExecutionProvider[]) {}

  list(context: SearchRequestContext): readonly PlatformSearchExecutionProvider[] {
    return this.providers.filter((p) => isEligible(p, context));
  }

  resolve(
    context: SearchRequestContext,
    options: SearchExecutionQueryOptions = {},
  ): PlatformSearchExecutionProvider {
    const eligible = this.list(context);
    if (eligible.length === 0) {
      throw searchProviderResolutionFailed(
        "No enabled/healthy/visible search execution provider available",
      );
    }

    if (options.providerId) {
      if (!hasSearchQueryOpPermission(context.permissions, "select-provider")) {
        throw searchExecutionProviderUnavailable(
          "Explicit provider selection requires search.query.select-provider",
        );
      }
      const explicit = eligible.find((p) => p.descriptor.id === options.providerId);
      if (!explicit) {
        const registered = this.providers.find(
          (p) => p.descriptor.id === options.providerId,
        );
        if (!registered) {
          throw searchExecutionProviderNotFound(options.providerId);
        }
        throw searchProviderResolutionFailed(
          `Requested provider ${options.providerId} is not eligible (disabled, unhealthy, or not visible)`,
        );
      }
      return explicit;
    }

    if (options.profileId) {
      const match = eligible
        .filter((p) => p.registration.profileIds?.includes(options.profileId!))
        .sort(byPriorityDesc)[0];
      if (match) return match;
    }

    if (options.collectionId || options.canonicalCollectionId) {
      const collectionId = String(
        options.collectionId ?? options.canonicalCollectionId,
      );
      const match = eligible
        .filter((p) => p.registration.collectionIds?.includes(collectionId))
        .sort(byPriorityDesc)[0];
      if (match) return match;
    }

    if (options.sourceId) {
      const match = eligible
        .filter((p) => p.registration.sourceIds?.includes(options.sourceId!))
        .sort(byPriorityDesc)[0];
      if (match) return match;
    }

    const tenantActive = eligible
      .filter((p) => p.registration.tenantActive)
      .sort(byPriorityDesc)[0];
    if (tenantActive) return tenantActive;

    const platformActive = eligible
      .filter((p) => p.registration.platformActive)
      .sort(byPriorityDesc)[0];
    if (platformActive) return platformActive;

    const byPriority = [...eligible].sort(byPriorityDesc)[0];
    if (byPriority) return byPriority;

    throw searchProviderResolutionFailed(
      "Resolution chain exhausted — refusing silent fallback",
    );
  }
}

export function createSearchExecutionProviderResolver(
  input: SearchExecutionProviderResolverInput,
): SearchExecutionProviderResolver {
  return new SearchExecutionProviderResolver(input.providers);
}
