/**
 * Optional Documents DMS HTTP handlers. Native Documents handlers and storage
 * remain independent and authoritative.
 */
import type { NextRequest } from "next/server";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PlatformApiHttpError } from "../errors";
import {
  getPlatformApiGatewayBootstrap,
  getPlatformServiceGateway,
} from "../gateway/bootstrap";
import { jsonCollectionResponse, jsonDataResponse } from "../response";

async function assertDocumentsDmsEnabled(): Promise<void> {
  const bootstrap = await getPlatformApiGatewayBootstrap();
  if (!bootstrap.documentsDmsEnabled) {
    throw new PlatformApiHttpError(503, {
      code: "DOCUMENTS_DMS_UNAVAILABLE",
      message: "Documents DMS HTTP API is not enabled (APZHUB_DOCUMENTS_DMS_ENABLED).",
    });
  }
}

function positiveInteger(value: string | null, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export async function handleGetDocumentsDmsHealth(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  await assertDocumentsDmsEnabled();
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.documentsDms.dms.getHealth(context.serviceContext);
  return jsonDataResponse(result, context.tracing);
}

export async function handleListDocumentsDmsDocuments(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  await assertDocumentsDmsEnabled();
  const page = positiveInteger(request.nextUrl.searchParams.get("page"), 1);
  const pageSize = Math.min(
    100,
    positiveInteger(request.nextUrl.searchParams.get("page_size"), 50),
  );
  const gateway = await getPlatformServiceGateway();
  const items = await gateway.documentsDms.dms.listDocuments(context.serviceContext, {
    page,
    pageSize,
  });
  return jsonCollectionResponse(
    items,
    {
      cursor: String(page),
      nextCursor: items.length === pageSize ? String(page + 1) : null,
      limit: pageSize,
      hasMore: items.length === pageSize,
    },
    context.tracing,
  );
}
