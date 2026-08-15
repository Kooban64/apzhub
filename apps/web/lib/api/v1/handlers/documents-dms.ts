/**
 * Optional Documents DMS HTTP handlers. Native Documents handlers and storage
 * remain independent and authoritative.
 */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PlatformApiHttpError } from "../errors";
import {
  getPlatformApiGatewayBootstrap,
  getPlatformServiceGateway,
} from "../gateway/bootstrap";
import { jsonCollectionResponse, jsonDataResponse } from "../response";

/** 10 MiB soft cap for DMS ingest in this slice. */
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

type RouteContext = { params: Promise<Record<string, string>> };

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

export async function handleUploadDocumentsDmsDocument(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  await assertDocumentsDmsEnabled();
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("multipart/form-data")) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_ERROR",
      message: "Documents DMS upload requires multipart/form-data with a file field.",
    });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_ERROR",
      message: "Unable to parse multipart upload body.",
    });
  }

  const fileEntry = form.get("file") ?? form.get("document");
  if (!(fileEntry instanceof File)) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_ERROR",
      message: "Multipart field 'file' (or 'document') is required.",
    });
  }
  if (fileEntry.size <= 0) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_ERROR",
      message: "Uploaded file is empty.",
    });
  }
  if (fileEntry.size > MAX_UPLOAD_BYTES) {
    throw new PlatformApiHttpError(413, {
      code: "PAYLOAD_TOO_LARGE",
      message: `Uploaded file exceeds the ${MAX_UPLOAD_BYTES} byte limit.`,
    });
  }

  const titleField = form.get("title");
  const title =
    typeof titleField === "string" && titleField.trim() ? titleField.trim() : undefined;
  const bytes = new Uint8Array(await fileEntry.arrayBuffer());
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.documentsDms.dms.uploadDocument(context.serviceContext, {
    fileName: fileEntry.name || "upload.bin",
    contentType: fileEntry.type || "application/octet-stream",
    bytes,
    title,
  });
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetDocumentsDmsDocument(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  await assertDocumentsDmsEnabled();
  const params = await routeContext?.params;
  const documentId = params?.documentId?.trim() ?? "";
  if (!documentId) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_ERROR",
      message: "documentId path parameter is required.",
    });
  }
  const gateway = await getPlatformServiceGateway();
  try {
    const result = await gateway.documentsDms.dms.getDocument(
      context.serviceContext,
      documentId,
    );
    return jsonDataResponse(result, context.tracing);
  } catch (error) {
    if (
      error instanceof Error &&
      /Invalid Documents DMS document id/i.test(error.message)
    ) {
      throw new PlatformApiHttpError(400, {
        code: "VALIDATION_ERROR",
        message: "Invalid Documents DMS document id.",
      });
    }
    throw error;
  }
}

export async function handleDownloadDocumentsDmsDocument(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  await assertDocumentsDmsEnabled();
  const params = await routeContext?.params;
  const documentId = params?.documentId?.trim() ?? "";
  if (!documentId) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_ERROR",
      message: "documentId path parameter is required.",
    });
  }
  const gateway = await getPlatformServiceGateway();
  let result;
  try {
    result = await gateway.documentsDms.dms.downloadDocument(
      context.serviceContext,
      documentId,
    );
  } catch (error) {
    if (
      error instanceof Error &&
      /Invalid Documents DMS document id/i.test(error.message)
    ) {
      throw new PlatformApiHttpError(400, {
        code: "VALIDATION_ERROR",
        message: "Invalid Documents DMS document id.",
      });
    }
    throw error;
  }
  const safeName = result.fileName.replace(/[^\w.-]+/g, "_");
  return new NextResponse(Buffer.from(result.bytes), {
    status: 200,
    headers: {
      "Content-Type": result.contentType,
      "Content-Length": String(result.bytes.byteLength),
      "Content-Disposition": `attachment; filename="${safeName}"`,
      "X-Documents-Dms-Id": result.documentId,
      "X-Request-Id": context.tracing.requestId,
      "X-Correlation-Id": context.tracing.correlationId,
    },
  });
}
