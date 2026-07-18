/**
 * Search Publication Administration HTTP handlers (APZSEARCH-017).
 * Thin presentation → Publication Admin Gateway. Never Meilisearch / persistence / orchestrator internals.
 */

import type { NextRequest } from "next/server";

import { isDevRegistrationAllowed } from "@apzhub/config";
import { resolveSessionAuthorization } from "@apzhub/platform-authorization/server";
import {
  SearchPublicationAdminError,
  type PublicationAdminActor,
  type PublicationListQuery,
} from "@apzhub/search-publication-admin";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PlatformApiHttpError } from "../errors";
import { jsonCollectionResponse, jsonDataResponse } from "../response";
import { getSearchPublicationAdmin } from "@/lib/search/publication-admin-bootstrap";

type RouteContext = { params: Promise<Record<string, string>> };

async function resolveActor(
  context: PlatformApiRequestContext,
): Promise<PublicationAdminActor> {
  const userId = context.serviceContext.userId;
  const tenantId = context.serviceContext.tenantId;
  let permissions: string[] = [];

  try {
    const authz = await resolveSessionAuthorization({
      userId,
      tenantId,
      productKey: "apzhub",
    });
    permissions = [...authz.permissions];
  } catch {
    permissions = [];
  }

  if (permissions.length === 0 && isDevRegistrationAllowed()) {
    permissions = ["search.publication.admin"];
  }

  return {
    userId,
    tenantId,
    organisationId: context.serviceContext.organisationId,
    correlationId: context.tracing.correlationId,
    permissions,
  };
}

function translateAdminError(error: unknown): never {
  if (error instanceof SearchPublicationAdminError) {
    throw new PlatformApiHttpError(error.status, {
      code: error.code,
      message: error.message,
    });
  }
  throw error;
}

function listPage(total: number, offset: number, limit: number) {
  return {
    cursor: null,
    nextCursor: null,
    limit,
    hasMore: offset + limit < total,
    total,
  };
}

export async function handleListSearchPublications(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  try {
    const admin = await getSearchPublicationAdmin();
    const actor = await resolveActor(context);
    const url = request.nextUrl;
    const query: PublicationListQuery = {
      filter: {
        status: (url.searchParams.get("status") as never) || undefined,
        productId: (url.searchParams.get("productId") as never) || undefined,
        entityType: url.searchParams.get("entityType") || undefined,
        entityId: url.searchParams.get("entityId") || undefined,
        q: url.searchParams.get("q") || undefined,
        includeAcknowledged: url.searchParams.get("includeAcknowledged") === "true",
        includeArchived: url.searchParams.get("includeArchived") === "true",
      },
      sortBy: (url.searchParams.get("sortBy") as never) || undefined,
      sortDir: (url.searchParams.get("sortDir") as "asc" | "desc") || undefined,
      offset: Number(url.searchParams.get("offset") ?? 0),
      limit: Number(url.searchParams.get("limit") ?? 50),
    };
    const result = await admin.gateway.listPublications(actor, query);
    return jsonDataResponse(
      {
        items: result.items,
        total: result.total,
        offset: result.offset,
        limit: result.limit,
      },
      context.tracing,
    );
  } catch (error) {
    translateAdminError(error);
  }
}

export async function handleGetSearchPublication(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  try {
    const admin = await getSearchPublicationAdmin();
    const actor = await resolveActor(context);
    const params = await routeContext?.params;
    const id = params?.publicationId ?? "";
    const entry = await admin.gateway.getPublication(actor, id);
    return jsonDataResponse(entry, context.tracing);
  } catch (error) {
    translateAdminError(error);
  }
}

export async function handleGetSearchPublicationQueue(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  try {
    const admin = await getSearchPublicationAdmin();
    const actor = await resolveActor(context);
    const summary = await admin.gateway.getQueueSummary(actor);
    return jsonDataResponse(summary, context.tracing);
  } catch (error) {
    translateAdminError(error);
  }
}

export async function handleGetSearchPublicationProducts(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  try {
    const admin = await getSearchPublicationAdmin();
    const actor = await resolveActor(context);
    const items = await admin.gateway.getProductSummaries(actor);
    return jsonCollectionResponse(
      items,
      listPage(items.length, 0, items.length),
      context.tracing,
    );
  } catch (error) {
    translateAdminError(error);
  }
}

export async function handleGetSearchPublicationDiagnostics(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  try {
    const admin = await getSearchPublicationAdmin();
    const actor = await resolveActor(context);
    const diagnostics = await admin.gateway.getDiagnostics(actor);
    return jsonDataResponse(diagnostics, context.tracing);
  } catch (error) {
    translateAdminError(error);
  }
}

export async function handleRetrySearchPublication(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  try {
    const admin = await getSearchPublicationAdmin();
    const actor = await resolveActor(context);
    const params = await routeContext?.params;
    const result = await admin.gateway.retryPublication(
      actor,
      params?.publicationId ?? "",
    );
    return jsonDataResponse(result, context.tracing);
  } catch (error) {
    translateAdminError(error);
  }
}

export async function handleRetrySearchPublicationBatch(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  try {
    const admin = await getSearchPublicationAdmin();
    const actor = await resolveActor(context);
    const body = (await request.json().catch(() => ({}))) as {
      readonly ids?: readonly string[];
      readonly failedBatch?: boolean;
      readonly limit?: number;
    };
    const results = body.failedBatch
      ? await admin.gateway.retryFailedBatch(actor, body.limit)
      : await admin.gateway.retryPublications(actor, body.ids ?? []);
    return jsonCollectionResponse(
      results,
      listPage(results.length, 0, results.length),
      context.tracing,
    );
  } catch (error) {
    translateAdminError(error);
  }
}

export async function handleClearCompletedSearchPublicationRetries(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  try {
    const admin = await getSearchPublicationAdmin();
    const actor = await resolveActor(context);
    const result = await admin.gateway.clearCompletedRetries(actor);
    return jsonDataResponse(result, context.tracing);
  } catch (error) {
    translateAdminError(error);
  }
}

export async function handleAcknowledgeSearchPublicationDeadLetter(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  try {
    const admin = await getSearchPublicationAdmin();
    const actor = await resolveActor(context);
    const params = await routeContext?.params;
    const body = (await request.json().catch(() => ({}))) as {
      readonly reason?: string;
    };
    const result = await admin.gateway.acknowledgeDeadLetter(
      actor,
      params?.publicationId ?? "",
      body.reason,
    );
    return jsonDataResponse(result, context.tracing);
  } catch (error) {
    translateAdminError(error);
  }
}

export async function handleArchiveSearchPublicationDeadLetter(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  try {
    const admin = await getSearchPublicationAdmin();
    const actor = await resolveActor(context);
    const params = await routeContext?.params;
    const body = (await request.json().catch(() => ({}))) as {
      readonly reason?: string;
    };
    const result = await admin.gateway.archiveDeadLetter(
      actor,
      params?.publicationId ?? "",
      body.reason,
    );
    return jsonDataResponse(result, context.tracing);
  } catch (error) {
    translateAdminError(error);
  }
}

export async function handleRetrySearchPublicationDeadLetter(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  try {
    const admin = await getSearchPublicationAdmin();
    const actor = await resolveActor(context);
    const params = await routeContext?.params;
    const result = await admin.gateway.retryDeadLetter(
      actor,
      params?.publicationId ?? "",
    );
    return jsonDataResponse(result, context.tracing);
  } catch (error) {
    translateAdminError(error);
  }
}

export async function handleDrainSearchPublicationBatch(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  try {
    const admin = await getSearchPublicationAdmin();
    const actor = await resolveActor(context);
    const result = await admin.gateway.drainBatch(actor);
    return jsonDataResponse(result, context.tracing);
  } catch (error) {
    translateAdminError(error);
  }
}

export async function handleListSearchPublicationAudit(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  try {
    const admin = await getSearchPublicationAdmin();
    const actor = await resolveActor(context);
    const limit = Number(request.nextUrl.searchParams.get("limit") ?? 100);
    const items = await admin.gateway.listAudit(actor, limit);
    return jsonCollectionResponse(
      items,
      listPage(items.length, 0, items.length),
      context.tracing,
    );
  } catch (error) {
    translateAdminError(error);
  }
}
