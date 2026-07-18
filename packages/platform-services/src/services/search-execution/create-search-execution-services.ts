/**
 * Search Execution Platform Services factories (APZSEARCH-006).
 * Production refuses silent mock / allow-all / in-memory execution fallback.
 */

import {
  createMeilisearchAdapter,
  createMockMeilisearchFetch,
  DEFAULT_TEST_MEILISEARCH_CONFIG,
  type FetchFn,
  type MeilisearchAdapter,
} from "@apzhub/integration-meilisearch";
import type {
  PlatformSearchExecutionProvider,
  SearchExecutionGateway,
  SearchExecutionPlaneReadiness,
} from "@apzhub/search-contracts";
import {
  PlatformServiceError,
  isPlatformServiceError,
  type PlatformServiceErrorCategory,
  type PlatformServiceErrorCode,
  type ServiceRequestContext,
} from "@apzhub/platform-service-contracts";
import {
  isSearchDomainError,
  type SearchDomainError,
  type SearchRequestContext,
} from "@apzhub/search-contracts";

import type { RequestPipeline } from "../../execution/request-pipeline";
import { wrapServiceWithPipeline } from "../../execution/wrap-service";
import { mapSearchDomainError } from "../search/search-service-impls";
import { MeilisearchSearchProvider } from "./meilisearch-search-provider";
import {
  createSearchExecutionProviderResolver,
  SearchExecutionProviderResolver,
} from "./search-execution-provider-resolver";
import { createSearchExecutionServiceImpls } from "./search-execution-service-impls";
import {
  isSearchExecutionMeilisearchConfigured,
  resolveSearchMeilisearchProviderEnv,
  type SearchMeilisearchProviderEnv,
} from "./search-execution-env";
import type { SearchIndexNamingOptions } from "./search-index-naming";

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

async function withSearchErrorMapping<T>(
  ctx: ServiceRequestContext,
  invoke: () => Promise<T> | T,
): Promise<T> {
  try {
    return await invoke();
  } catch (error) {
    if (isPlatformServiceError(error)) throw error;
    if (isSearchDomainError(error)) {
      throw mapSearchExecutionDomainError(error, ctx.correlationId);
    }
    throw error;
  }
}

function mapSearchExecutionDomainError(
  error: SearchDomainError,
  correlationId: string,
): PlatformServiceError {
  // Reuse management mapping then refine execution classifications.
  const base = mapSearchDomainError(error, correlationId);
  const classification = error.classification;
  let category: PlatformServiceErrorCategory = base.category;
  let code: PlatformServiceErrorCode = base.code;

  if (
    classification === "tenant_filter_required" ||
    classification === "security_filter_violation" ||
    classification === "authorization_denied"
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
  } else if (
    classification === "execution_capability_unsupported" ||
    classification === "search_execution_unavailable" ||
    classification === "provider_resolution_failed" ||
    classification === "execution_provider_unavailable" ||
    classification === "execution_provider_unhealthy" ||
    classification === "execution_provider_disabled"
  ) {
    category = "configuration";
    code = "PROVIDER_CAPABILITY_UNSUPPORTED";
  } else if (classification === "engine_operation_failed") {
    category = "integration";
    code = "PROVIDER_UNAVAILABLE";
  }

  return new PlatformServiceError({
    category,
    code,
    message: error.message,
    correlationId,
    retryable: classification === "engine_operation_failed",
    details: {
      classification,
      ...(error.details ?? {}),
    },
  });
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

export type SearchExecutionServiceImpls = {
  [K in keyof SearchExecutionGateway]: RemapSearchCtx<SearchExecutionGateway[K]>;
};

export type SearchExecutionServicesBundle = {
  readonly providers: readonly PlatformSearchExecutionProvider[];
  readonly resolver: SearchExecutionProviderResolver;
  readonly gatewaySurface: SearchExecutionServiceImpls;
  readonly impls: SearchExecutionServiceImpls;
  readonly domainGateway: SearchExecutionGateway;
  readonly readiness: SearchExecutionPlaneReadiness & {
    readonly searchExecutionEnabled: boolean;
  };
  readonly dispose: () => Promise<void>;
  wrapWithPipeline(pipeline: RequestPipeline): SearchExecutionServiceImpls;
};

export type CreateSearchExecutionServicesInput = {
  readonly providers: readonly PlatformSearchExecutionProvider[];
  readonly naming?: SearchIndexNamingOptions;
  readonly executionEnabled?: boolean;
};

export type CreateSearchExecutionServicesWithMeilisearchInput = {
  readonly adapter: MeilisearchAdapter;
  readonly naming?: SearchIndexNamingOptions;
  readonly registration?: ConstructorParameters<
    typeof MeilisearchSearchProvider
  >[0]["registration"];
  readonly executionEnabled?: boolean;
};

export type CreateSearchExecutionServicesForProductionInput = {
  readonly env?: NodeJS.ProcessEnv | Record<string, string | undefined>;
  readonly tenantId?: string;
  readonly fetchFn?: FetchFn;
  /** Forbidden in production paths — must remain undefined. */
  readonly allowMockFetch?: never;
  readonly apiKey?: string;
};

export type CreateSearchExecutionServicesForTestInput = {
  readonly fetchFn?: FetchFn;
  readonly tenantId?: string;
  readonly indexPrefix?: string;
  readonly registration?: ConstructorParameters<
    typeof MeilisearchSearchProvider
  >[0]["registration"];
  readonly providers?: readonly PlatformSearchExecutionProvider[];
  readonly naming?: SearchIndexNamingOptions;
  readonly executionEnabled?: boolean;
  readonly meilisearchConfig?: {
    readonly baseUrl?: string;
    readonly apiKeyRef?: string;
    readonly defaultIndexUid?: string;
  };
};

export function wrapSearchExecutionGatewayWithPipeline(
  gateway: SearchExecutionServiceImpls,
  pipeline: RequestPipeline,
): SearchExecutionServiceImpls {
  return {
    searchExecution: wrapServiceWithPipeline(
      gateway.searchExecution,
      pipeline,
      "searchExecution",
    ),
    searchIndexes: wrapServiceWithPipeline(
      gateway.searchIndexes,
      pipeline,
      "searchIndexes",
    ),
    searchDocuments: wrapServiceWithPipeline(
      gateway.searchDocuments,
      pipeline,
      "searchDocuments",
    ),
    searchExecutionHealth: wrapServiceWithPipeline(
      gateway.searchExecutionHealth,
      pipeline,
      "searchExecutionHealth",
    ),
    searchExecutionDiagnostics: wrapServiceWithPipeline(
      gateway.searchExecutionDiagnostics,
      pipeline,
      "searchExecutionDiagnostics",
    ),
  };
}

function buildBundle(
  providers: readonly PlatformSearchExecutionProvider[],
  naming: SearchIndexNamingOptions,
  executionEnabled: boolean,
): SearchExecutionServicesBundle {
  const resolver = createSearchExecutionProviderResolver({ providers });
  const domainGateway = createSearchExecutionServiceImpls({
    resolver,
    naming,
    executionEnabled,
  });
  const impls: SearchExecutionServiceImpls = {
    searchExecution: wrapFacet(domainGateway.searchExecution),
    searchIndexes: wrapFacet(domainGateway.searchIndexes),
    searchDocuments: wrapFacet(domainGateway.searchDocuments),
    searchExecutionHealth: wrapFacet(domainGateway.searchExecutionHealth),
    searchExecutionDiagnostics: wrapFacet(domainGateway.searchExecutionDiagnostics),
  };

  return {
    providers,
    resolver,
    gatewaySurface: impls,
    impls,
    domainGateway,
    readiness: {
      searchExecutionEnabled: executionEnabled,
      executionEnabled,
      providerBound: executionEnabled && providers.length > 0,
      providerId: providers[0]?.descriptor.id,
      providerKind: providers[0]?.descriptor.kind,
      healthy: executionEnabled && providers.every((p) => p.registration.healthy),
      message: executionEnabled
        ? "Search execution plane ready"
        : "Search execution unavailable",
    },
    dispose: async () => {
      await Promise.all(providers.map((p) => p.dispose()));
    },
    wrapWithPipeline: (pipeline) =>
      wrapSearchExecutionGatewayWithPipeline(impls, pipeline),
  };
}

export function createSearchExecutionServices(
  input: CreateSearchExecutionServicesInput,
): SearchExecutionServicesBundle {
  const naming: SearchIndexNamingOptions = input.naming ?? {
    indexPrefix: "apzhub_",
  };
  return buildBundle(
    input.providers,
    naming,
    input.executionEnabled ?? input.providers.length > 0,
  );
}

export function createSearchExecutionServicesWithMeilisearch(
  input: CreateSearchExecutionServicesWithMeilisearchInput,
): SearchExecutionServicesBundle {
  const provider = new MeilisearchSearchProvider({
    adapter: input.adapter,
    registration: input.registration,
  });
  return createSearchExecutionServices({
    providers: [provider],
    naming: input.naming,
    executionEnabled: input.executionEnabled ?? true,
  });
}

/**
 * Production factory — requires configured Meilisearch endpoint.
 * Refuses silent mock / allow-all / in-memory execution fallback.
 */
export async function createSearchExecutionServicesForProduction(
  input: CreateSearchExecutionServicesForProductionInput = {},
): Promise<SearchExecutionServicesBundle> {
  const env = input.env ?? process.env;
  const providerEnv = resolveSearchMeilisearchProviderEnv(env);

  if (!isSearchExecutionMeilisearchConfigured(env) || !providerEnv.endpoint) {
    throw new Error(
      "createSearchExecutionServicesForProduction requires SEARCH_SERVICE_ENABLED=true and SEARCH_MEILISEARCH_ENDPOINT (or SEARCH_EXECUTION_PROVIDER=meilisearch). Silent mock/in-memory execution fallback is forbidden.",
    );
  }

  const apiKey = input.apiKey ?? providerEnv.apiKey;
  if (!apiKey && env.SEARCH_MEILISEARCH_REQUIRE_INLINE_KEY === "true") {
    throw new Error(
      "Meilisearch production binding requires SEARCH_MEILISEARCH_API_KEY when SEARCH_MEILISEARCH_REQUIRE_INLINE_KEY=true",
    );
  }

  const { adapter } = await createMeilisearchAdapter({
    tenantId: input.tenantId ?? "platform",
    meilisearch: {
      baseUrl: providerEnv.endpoint,
      apiKeyRef: providerEnv.apiKeyRef,
      defaultIndexUid: providerEnv.defaultIndexUid,
      timeoutMs: providerEnv.timeoutMs,
    },
    apiKey,
    fetchFn: input.fetchFn,
    autoInitialise: true,
  });

  return createSearchExecutionServicesWithMeilisearch({
    adapter,
    naming: { indexPrefix: providerEnv.indexPrefix },
    executionEnabled: true,
  });
}

/**
 * Test factory — explicit mock fetch / mock adapter only.
 */
export async function createSearchExecutionServicesForTest(
  input: CreateSearchExecutionServicesForTestInput = {},
): Promise<SearchExecutionServicesBundle> {
  if (input.providers) {
    return createSearchExecutionServices({
      providers: input.providers,
      naming: input.naming ?? { indexPrefix: input.indexPrefix ?? "apzhub_" },
      executionEnabled: input.executionEnabled ?? true,
    });
  }

  const fetchFn = input.fetchFn ?? createMockMeilisearchFetch();
  const { adapter } = await createMeilisearchAdapter({
    tenantId: input.tenantId ?? "tenant_test",
    meilisearch: {
      baseUrl:
        input.meilisearchConfig?.baseUrl ?? DEFAULT_TEST_MEILISEARCH_CONFIG.baseUrl,
      apiKeyRef:
        input.meilisearchConfig?.apiKeyRef ?? DEFAULT_TEST_MEILISEARCH_CONFIG.apiKeyRef,
      defaultIndexUid:
        input.meilisearchConfig?.defaultIndexUid ??
        DEFAULT_TEST_MEILISEARCH_CONFIG.defaultIndexUid,
    },
    apiKey: "test-key",
    fetchFn,
    autoInitialise: true,
  });

  return createSearchExecutionServicesWithMeilisearch({
    adapter,
    naming: input.naming ?? {
      indexPrefix: input.indexPrefix ?? "apzhub_",
    },
    registration: input.registration,
    executionEnabled: input.executionEnabled ?? true,
  });
}

export type { SearchMeilisearchProviderEnv };
