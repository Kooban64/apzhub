export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import { PlatformApiHttpError } from "@/lib/api/v1/errors";
import { jsonDataResponse } from "@/lib/api/v1/response";
import { actorEmail, requireApzpenAccess, resolveTenantId } from "@/lib/apzpen/access";
import { ApzpenDomainError } from "@/lib/apzpen/domain";
import { downloadVaultEvidence, uploadFindingEvidenceFile } from "@/lib/apzpen/service";
import { listEvidenceObjects } from "@/lib/apzpen/evidence-vault";

function mapError(error: unknown): never {
  if (error instanceof ApzpenDomainError) {
    const status = error.code === "NOT_FOUND" ? 404 : 400;
    throw new PlatformApiHttpError(status, {
      code: error.code,
      message: error.message,
    });
  }
  throw error;
}

async function handleGet(request: NextRequest, context: PlatformApiRequestContext) {
  requireApzpenAccess(context, "read");
  const tenantId = resolveTenantId(context);
  const objectId = request.nextUrl.searchParams.get("objectId");
  const download = request.nextUrl.searchParams.get("download");
  if (objectId && download === "1") {
    try {
      const { meta, bytes } = downloadVaultEvidence(tenantId, objectId);
      return new Response(new Uint8Array(bytes), {
        status: 200,
        headers: {
          "content-type": meta.contentType,
          "content-disposition": `attachment; filename="${meta.originalName.replace(/"/g, "")}"`,
          "x-apzpen-sha256": meta.sha256,
        },
      });
    } catch (error) {
      mapError(error);
    }
  }
  const findingId = request.nextUrl.searchParams.get("findingId") ?? undefined;
  const engagementId = request.nextUrl.searchParams.get("engagementId") ?? undefined;
  const objects = listEvidenceObjects(tenantId, { findingId, engagementId });
  return jsonDataResponse({ objects }, context.tracing);
}

async function handlePost(request: NextRequest, context: PlatformApiRequestContext) {
  requireApzpenAccess(context, "test");
  const tenantId = resolveTenantId(context);
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const findingId = String(form.get("findingId") ?? "");
      const label = String(form.get("label") ?? "");
      const file = form.get("file");
      if (!findingId || !(file instanceof File)) {
        throw new PlatformApiHttpError(400, {
          code: "VALIDATION",
          message: "findingId and file required",
        });
      }
      const bytes = Buffer.from(await file.arrayBuffer());
      const result = uploadFindingEvidenceFile({
        tenantId,
        findingId,
        createdBy: actorEmail(context),
        originalName: file.name,
        contentType: file.type || undefined,
        bytes,
        label: label || undefined,
      });
      return jsonDataResponse(result, context.tracing, { status: 201 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      findingId?: string;
      label?: string;
      originalName?: string;
      contentType?: string;
      contentBase64?: string;
      text?: string;
    };
    if (!body.findingId) {
      throw new PlatformApiHttpError(400, {
        code: "VALIDATION",
        message: "findingId required",
      });
    }
    const bytes = body.contentBase64
      ? Buffer.from(body.contentBase64, "base64")
      : Buffer.from(body.text ?? "", "utf8");
    const result = uploadFindingEvidenceFile({
      tenantId,
      findingId: body.findingId,
      createdBy: actorEmail(context),
      originalName: body.originalName ?? "evidence.txt",
      contentType: body.contentType,
      bytes,
      label: body.label,
    });
    return jsonDataResponse(result, context.tracing, { status: 201 });
  } catch (error) {
    mapError(error);
  }
}

export const GET = withPlatformApiAuth(handleGet, {
  operation: "apzpen.evidence.vault.read",
});
export const POST = withPlatformApiAuth(handlePost, {
  operation: "apzpen.evidence.vault.write",
});
