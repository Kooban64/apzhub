/**
 * Thin Search execution platform service implementations (APZSEARCH-006).
 */

import type {
  SearchDocumentDeleteInput,
  SearchDocumentGetInput,
  SearchDocumentUpsertInput,
  SearchExecutionGateway,
  SearchExecutionPlaneReadiness,
  SearchExecutionQueryOptions,
  SearchIndex,
  SearchIndexCreateInput,
  SearchIndexUpdateInput,
  SearchIndexedDocument,
  SearchQuery,
  SearchQueryValidationResult,
  SearchRequest,
  SearchRequestContext,
  SearchResponse,
  SearchResultPage,
  PlatformSearchExecutionProvider,
} from "@apzhub/search-contracts";
import {
  asSearchIndexId,
  searchExecutionUnavailable,
  searchIndexNotFound,
  validateSearchQuery,
} from "@apzhub/search-contracts";

import { SearchExecutionProviderResolver } from "./search-execution-provider-resolver";
import {
  applyMandatorySearchSecurityFilters,
  assertMandatoryTenantFilterPresent,
} from "./search-security-filters";
import {
  toProviderIndexUid,
  toPublicIndexId,
  type SearchIndexNamingOptions,
} from "./search-index-naming";

export type SearchExecutionServiceDeps = {
  readonly resolver: SearchExecutionProviderResolver;
  readonly naming: SearchIndexNamingOptions;
  readonly executionEnabled: boolean;
};

function resolveIndexUid(
  context: SearchRequestContext,
  collectionId: string,
  naming: SearchIndexNamingOptions,
): string {
  return toProviderIndexUid(collectionId, {
    ...naming,
    tenantId: context.tenantId,
  });
}

function assertExecutionEnabled(enabled: boolean): void {
  if (!enabled) {
    throw searchExecutionUnavailable(
      "Search execution is not enabled — Meilisearch provider not configured",
    );
  }
}

export function createSearchExecutionServiceImpls(
  deps: SearchExecutionServiceDeps,
): SearchExecutionGateway {
  const { resolver, naming, executionEnabled } = deps;

  async function resolveProvider(
    context: SearchRequestContext,
    options?: SearchExecutionQueryOptions,
  ): Promise<PlatformSearchExecutionProvider> {
    assertExecutionEnabled(executionEnabled);
    return resolver.resolve(context, options);
  }

  const searchExecution: SearchExecutionGateway["searchExecution"] = {
    async execute(context, request, options) {
      const provider = await resolveProvider(context, options);
      const secured = applyMandatorySearchSecurityFilters(context, request.query);
      assertMandatoryTenantFilterPresent(context, secured.query);

      const collectionId =
        options?.canonicalCollectionId ??
        options?.collectionId ??
        request.query.collections?.[0];
      const indexUid = collectionId
        ? resolveIndexUid(context, String(collectionId), naming)
        : options?.indexId
          ? resolveIndexUid(context, String(options.indexId), naming)
          : undefined;

      const page = await provider.query(context, secured.query, {
        indexUid,
      });

      return {
        request: { ...request, query: secured.query },
        page,
        providerId: provider.descriptor.id,
      } satisfies SearchResponse;
    },

    validateQuery(
      _context: SearchRequestContext,
      query: SearchQuery,
    ): SearchQueryValidationResult {
      return validateSearchQuery(query);
    },

    async executeWithFacets(context, request, options) {
      return this.execute(
        context,
        {
          ...request,
          query: { ...request.query, includeFacets: true },
        },
        options,
      );
    },

    async executeWithHighlights(context, request, options) {
      return this.execute(
        context,
        {
          ...request,
          query: { ...request.query, includeHighlights: true },
        },
        options,
      );
    },

    async suggest(
      context,
      query,
      options,
    ): Promise<SearchResultPage> {
      const provider = await resolveProvider(context, options);
      const secured = applyMandatorySearchSecurityFilters(context, {
        ...query,
        includeSuggestions: true,
      });
      return provider.query(context, secured.query);
    },
  };

  const searchIndexes: SearchExecutionGateway["searchIndexes"] = {
    async list(context) {
      const provider = await resolveProvider(context);
      return provider.listIndexes(context);
    },

    async get(context, indexId) {
      const provider = await resolveProvider(context);
      const uid = resolveIndexUid(context, String(indexId), naming);
      return provider.getIndex(context, uid);
    },

    async create(context, input: SearchIndexCreateInput) {
      const provider = await resolveProvider(context);
      const uid = resolveIndexUid(context, String(input.collectionId), naming);
      const created = await provider.createIndex(context, {
        ...input,
        indexUid: uid,
      });
      return {
        ...created,
        id: asSearchIndexId(toPublicIndexId(String(input.collectionId))),
        collectionId: input.collectionId as SearchIndex["collectionId"],
      };
    },

    async update(context, indexId, input: SearchIndexUpdateInput) {
      const provider = await resolveProvider(context);
      const uid = resolveIndexUid(context, String(indexId), naming);
      const updated = await provider.updateIndex(context, uid, input);
      return {
        ...updated,
        id: asSearchIndexId(toPublicIndexId(String(indexId))),
      };
    },

    async delete(context, indexId) {
      const provider = await resolveProvider(context);
      const uid = resolveIndexUid(context, String(indexId), naming);
      const existing = await provider.getIndex(context, uid);
      if (!existing) {
        throw searchIndexNotFound(String(indexId));
      }
      await provider.deleteIndex(context, uid);
    },
  };

  const searchDocuments: SearchExecutionGateway["searchDocuments"] = {
    async upsert(context, input: SearchDocumentUpsertInput) {
      const provider = await resolveProvider(context);
      const uid = resolveIndexUid(context, String(input.collectionId), naming);
      return provider.upsertDocuments(context, uid, input);
    },

    async get(context, input: SearchDocumentGetInput) {
      const provider = await resolveProvider(context);
      const uid = resolveIndexUid(context, String(input.collectionId), naming);
      return provider.getDocument(context, uid, input);
    },

    async delete(context, input: SearchDocumentDeleteInput) {
      const provider = await resolveProvider(context);
      const uid = resolveIndexUid(context, String(input.collectionId), naming);
      await provider.deleteDocument(context, uid, input);
    },
  };

  const searchExecutionHealth: SearchExecutionGateway["searchExecutionHealth"] =
    {
      async getHealth(context) {
        assertExecutionEnabled(executionEnabled);
        const provider = resolver.resolve(context);
        return provider.getHealth(context);
      },
      async getReadiness(
        context,
      ): Promise<SearchExecutionPlaneReadiness> {
        if (!executionEnabled) {
          return {
            executionEnabled: false,
            providerBound: false,
            healthy: false,
            message: "Search execution provider not configured",
          };
        }
        try {
          const provider = resolver.resolve(context);
          const health = await provider.getHealth(context);
          return {
            executionEnabled: true,
            providerBound: true,
            providerId: provider.descriptor.id,
            providerKind: provider.descriptor.kind,
            healthy: health.status === "available",
            message: health.message,
          };
        } catch (error) {
          return {
            executionEnabled: true,
            providerBound: false,
            healthy: false,
            message:
              error instanceof Error
                ? error.message
                : "Search execution readiness check failed",
          };
        }
      },
    };

  const searchExecutionDiagnostics: SearchExecutionGateway["searchExecutionDiagnostics"] =
    {
      async getDiagnostics(context) {
        const provider = await resolveProvider(context);
        return provider.getDiagnostics(context);
      },
      async getStatistics(context) {
        const provider = await resolveProvider(context);
        return provider.getStatistics(context);
      },
      async getCapabilities(context) {
        const provider = await resolveProvider(context);
        return provider.getCapabilities(context);
      },
    };

  return {
    searchExecution,
    searchIndexes,
    searchDocuments,
    searchExecutionHealth,
    searchExecutionDiagnostics,
  };
}

export type { SearchIndexedDocument };
