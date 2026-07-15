/**
 * Platform Search HTTP handlers (APZSEARCH-007) — presentation only.
 * Call PlatformServiceGateway searchExecution* / management facets exclusively.
 * Never Meilisearch, persistence, legacy gateway.search, or searchQuery.query.
 */

import type { NextRequest } from "next/server";
import type { z } from "zod";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PLATFORM_API_MAX_BODY_BYTES } from "../constants";
import { getPlatformServiceGateway } from "../gateway/bootstrap";
import { jsonCollectionResponse, jsonDataResponse } from "../response";
import { parseJsonBody, parsePathParam } from "../schemas/common";
import {
  createSearchCollectionBodySchema,
  createSearchConfigurationBodySchema,
  searchCollectionIdParamSchema,
  searchConfigurationIdParamSchema,
  searchIdParamSchema,
  searchManagementValidationConfigurationBodySchema,
  searchProfileIdParamSchema,
  searchProviderIdParamSchema,
  searchQueryBodySchema,
  searchScopeIdParamSchema,
  searchSourceIdParamSchema,
  searchSuggestionsBodySchema,
  searchValidateBodySchema,
  updateSearchCollectionBodySchema,
  updateSearchConfigurationBodySchema,
  updateSearchProviderBodySchema,
} from "../schemas/search";

type RouteContext = { params: Promise<Record<string, string>> };

const SECRET_KEY_PATTERN =
  /^(api[_-]?key|secret|password|token|access[_-]?key|private[_-]?key|connection[_-]?string|credential|auth)$/i;

function listPage(items: readonly unknown[]) {
  return { cursor: null, nextCursor: null, limit: items.length, hasMore: false };
}

function collection<T>(items: readonly T[], context: PlatformApiRequestContext) {
  return jsonCollectionResponse(items, listPage(items), context.tracing);
}

async function param(
  routeContext: RouteContext | undefined,
  key: string,
  schema: z.ZodType<string>,
): Promise<string> {
  const params = await routeContext?.params;
  return parsePathParam(schema, params?.[key] ?? "", key);
}

/** Deep-redact management payloads — never return secrets to HTTP clients. */
export function redactSearchManagementValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => redactSearchManagementValue(item)) as T;
  }
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      if (SECRET_KEY_PATTERN.test(key)) {
        out[`${key}Present`] = child !== undefined && child !== null && child !== "";
        continue;
      }
      if (
        typeof child === "string" &&
        (/sk-[a-zA-Z0-9]{8,}/.test(child) ||
          /Bearer\s+\S+/i.test(child) ||
          /password=/i.test(child) ||
          /api[_-]?key=/i.test(child))
      ) {
        out[key] = "[REDACTED]";
        continue;
      }
      out[key] = redactSearchManagementValue(child);
    }
    return out as T;
  }
  return value;
}

function asSearchQuery(body: z.infer<typeof searchQueryBodySchema>["query"]) {
  return body as never;
}

// ---------------------------------------------------------------------------
// Query plane — gateway.searchExecution*
// ---------------------------------------------------------------------------

export async function handleSearchQuery(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    searchQueryBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.searchExecution.execute(context.serviceContext, {
    query: asSearchQuery(body.query),
    profileId: body.profileId as never,
    sessionId: body.sessionId as never,
    correlationId: body.correlationId ?? context.tracing.correlationId,
  });
  return jsonDataResponse(result, context.tracing);
}

export async function handleSearchValidateQuery(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    searchValidateBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.searchExecution.validateQuery(
    context.serviceContext,
    asSearchQuery(body.query),
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleSearchSuggestions(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    searchSuggestionsBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await getPlatformServiceGateway();
  const suggest = gateway.searchExecution.suggest;
  if (!suggest) {
    return jsonDataResponse(
      {
        hits: [],
        page: 1,
        pageSize: body.pageSize ?? 10,
        hasMore: false,
        suggestions: [],
      },
      context.tracing,
    );
  }
  const result = await suggest(
    context.serviceContext,
    {
      keywords: body.keywords,
      phrase: body.phrase,
      pageSize: body.pageSize,
      includeSuggestions: true,
    } as never,
    undefined,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetSearchCapabilities(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.searchExecutionDiagnostics.getCapabilities(
    context.serviceContext,
  );
  return jsonDataResponse(redactSearchManagementValue(result), context.tracing);
}

export async function handleGetSearchHealth(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.searchExecutionHealth.getHealth(
    context.serviceContext,
  );
  return jsonDataResponse(redactSearchManagementValue(result), context.tracing);
}

export async function handleGetSearchReadiness(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.searchExecutionHealth.getReadiness(
    context.serviceContext,
  );
  return jsonDataResponse(redactSearchManagementValue(result), context.tracing);
}

export async function handleGetSearchDiagnostics(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.searchExecutionDiagnostics.getDiagnostics(
    context.serviceContext,
  );
  return jsonDataResponse(redactSearchManagementValue(result), context.tracing);
}

export async function handleGetSearchStatistics(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.searchExecutionDiagnostics.getStatistics(
    context.serviceContext,
  );
  return jsonDataResponse(redactSearchManagementValue(result), context.tracing);
}

// ---------------------------------------------------------------------------
// Management plane — gateway.searchProviders / configurations / …
// ---------------------------------------------------------------------------

export async function handleListSearchProviders(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await getPlatformServiceGateway();
  const items = await gateway.searchProviders.listProviders(context.serviceContext);
  return collection(redactSearchManagementValue(items), context);
}

export async function handleGetSearchProvider(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const providerId = await param(
    routeContext,
    "providerId",
    searchProviderIdParamSchema,
  );
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.searchProviders.getProvider(
    context.serviceContext,
    providerId as never,
  );
  return jsonDataResponse(redactSearchManagementValue(result), context.tracing);
}

export async function handleUpdateSearchProvider(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const providerId = await param(
    routeContext,
    "providerId",
    searchProviderIdParamSchema,
  );
  const body = await parseJsonBody(
    request,
    updateSearchProviderBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await getPlatformServiceGateway();
  if (body.enabled === true) {
    await gateway.searchProviders.enableProvider(
      context.serviceContext,
      providerId as never,
    );
  } else if (body.enabled === false) {
    await gateway.searchProviders.disableProvider(
      context.serviceContext,
      providerId as never,
    );
  }
  const result = await gateway.searchProviders.updateProvider(
    context.serviceContext,
    providerId as never,
    {
      label: body.label,
      ownership: body.ownership,
      version: body.version,
    },
  );
  return jsonDataResponse(redactSearchManagementValue(result), context.tracing);
}

export async function handleListSearchConfigurations(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await getPlatformServiceGateway();
  const items = await gateway.searchConfigurations.list(context.serviceContext);
  return collection(redactSearchManagementValue(items), context);
}

export async function handleGetSearchConfiguration(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const configurationId = await param(
    routeContext,
    "configurationId",
    searchConfigurationIdParamSchema,
  );
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.searchConfigurations.get(
    context.serviceContext,
    configurationId,
  );
  return jsonDataResponse(redactSearchManagementValue(result), context.tracing);
}

export async function handleCreateSearchConfiguration(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createSearchConfigurationBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.searchConfigurations.create(
    context.serviceContext,
    {
      label: body.label,
      configuration: body.configuration as never,
    } as never,
  );
  return jsonDataResponse(redactSearchManagementValue(result), context.tracing);
}

export async function handleUpdateSearchConfiguration(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const configurationId = await param(
    routeContext,
    "configurationId",
    searchConfigurationIdParamSchema,
  );
  const body = await parseJsonBody(
    request,
    updateSearchConfigurationBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.searchConfigurations.update(
    context.serviceContext,
    configurationId,
    body as never,
  );
  return jsonDataResponse(redactSearchManagementValue(result), context.tracing);
}

export async function handleListSearchCollections(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await getPlatformServiceGateway();
  const items = await gateway.searchCollections.list(context.serviceContext);
  return collection(redactSearchManagementValue(items), context);
}

export async function handleGetSearchCollection(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const collectionId = await param(
    routeContext,
    "collectionId",
    searchCollectionIdParamSchema,
  );
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.searchCollections.get(
    context.serviceContext,
    collectionId as never,
  );
  return jsonDataResponse(redactSearchManagementValue(result), context.tracing);
}

export async function handleCreateSearchCollection(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createSearchCollectionBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.searchCollections.create(
    context.serviceContext,
    body as never,
  );
  return jsonDataResponse(redactSearchManagementValue(result), context.tracing);
}

export async function handleUpdateSearchCollection(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const collectionId = await param(
    routeContext,
    "collectionId",
    searchCollectionIdParamSchema,
  );
  const body = await parseJsonBody(
    request,
    updateSearchCollectionBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.searchCollections.update(
    context.serviceContext,
    collectionId as never,
    body as never,
  );
  return jsonDataResponse(redactSearchManagementValue(result), context.tracing);
}

export async function handleListSearchSources(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await getPlatformServiceGateway();
  const items = await gateway.searchSources.list(context.serviceContext);
  return collection(redactSearchManagementValue(items), context);
}

export async function handleGetSearchSource(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const sourceId = await param(routeContext, "sourceId", searchSourceIdParamSchema);
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.searchSources.get(
    context.serviceContext,
    sourceId as never,
  );
  return jsonDataResponse(redactSearchManagementValue(result), context.tracing);
}

export async function handleListSearchScopes(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await getPlatformServiceGateway();
  const items = await gateway.searchScopes.list(context.serviceContext);
  return collection(redactSearchManagementValue(items), context);
}

export async function handleGetSearchScope(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const scopeId = await param(routeContext, "scopeId", searchScopeIdParamSchema);
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.searchScopes.get(
    context.serviceContext,
    scopeId as never,
  );
  return jsonDataResponse(redactSearchManagementValue(result), context.tracing);
}

export async function handleListSearchProfiles(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await getPlatformServiceGateway();
  const items = await gateway.searchProfiles.list(context.serviceContext);
  return collection(redactSearchManagementValue(items), context);
}

export async function handleGetSearchProfile(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const profileId = await param(
    routeContext,
    "profileId",
    searchProfileIdParamSchema,
  );
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.searchProfiles.get(
    context.serviceContext,
    profileId as never,
  );
  return jsonDataResponse(redactSearchManagementValue(result), context.tracing);
}

export async function handleGetSearchManagementCapabilities(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.searchCapabilities.getCapabilities(
    context.serviceContext,
  );
  return jsonDataResponse(redactSearchManagementValue(result), context.tracing);
}

export async function handleGetSearchManagementHealth(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.searchHealth.getHealth(context.serviceContext);
  return jsonDataResponse(redactSearchManagementValue(result), context.tracing);
}

export async function handleGetSearchManagementDiagnostics(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.searchDiagnostics.getDiagnostics(
    context.serviceContext,
  );
  return jsonDataResponse(redactSearchManagementValue(result), context.tracing);
}

export async function handleGetSearchManagementStatistics(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.searchStatistics.getStatistics(
    context.serviceContext,
  );
  return jsonDataResponse(redactSearchManagementValue(result), context.tracing);
}

export async function handleListSearchAudit(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await getPlatformServiceGateway();
  const items = await gateway.searchAudit.list(context.serviceContext);
  return collection(redactSearchManagementValue(items), context);
}

export async function handleSearchManagementValidateQuery(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    searchValidateBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.searchValidation.validateQuery(
    context.serviceContext,
    asSearchQuery(body.query),
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleSearchManagementValidateConfiguration(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    searchManagementValidationConfigurationBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.searchValidation.validateConfiguration(
    context.serviceContext,
    body.configuration as never,
  );
  return jsonDataResponse(redactSearchManagementValue(result), context.tracing);
}

/** Explicit documentation helper — internal index/document HTTP is deliberately omitted. */
export const OMITTED_SEARCH_HTTP_ROUTES = [
  "/api/v1/search/internal/indexes",
  "/api/v1/search/internal/documents",
  "/api/v1/search/indexes",
  "/api/v1/search/documents",
] as const;

// silence unused id schema when only used in OpenAPI/docs tooling
void searchIdParamSchema;
