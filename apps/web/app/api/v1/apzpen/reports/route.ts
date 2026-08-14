export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import { PlatformApiHttpError } from "@/lib/api/v1/errors";
import { jsonDataResponse } from "@/lib/api/v1/response";
import { requireApzpenAccess, resolveTenantId } from "@/lib/apzpen/access";
import { ApzpenDomainError } from "@/lib/apzpen/domain";
import { generateEngagementReportPdf } from "@/lib/apzpen/follow-on-service";
import { generateEngagementReport, listTenantEngagements } from "@/lib/apzpen/service";
import type { ReportPackKind } from "@/lib/apzpen/reports";

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
  const engagementId = request.nextUrl.searchParams.get("engagementId");
  const kindRaw = request.nextUrl.searchParams.get("kind") ?? "executive";
  const kind = kindRaw as ReportPackKind;
  const format = request.nextUrl.searchParams.get("format") ?? "json";

  if (!engagementId) {
    const engagements = listTenantEngagements(tenantId);
    return jsonDataResponse(
      {
        engagements: engagements.map((e) => ({
          engagementId: e.engagementId,
          title: e.title,
          status: e.status,
          assessmentPosition: e.assessmentPosition,
        })),
        kinds: ["executive", "technical", "compliance"] as const,
        formats: ["json", "markdown", "pdf"] as const,
      },
      context.tracing,
    );
  }

  if (kind !== "executive" && kind !== "technical" && kind !== "compliance") {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION",
      message: "kind must be executive|technical|compliance",
    });
  }

  try {
    if (format === "pdf") {
      const { pack, pdf } = await generateEngagementReportPdf({
        tenantId,
        engagementId,
        kind,
      });
      if (!pdf.ok) {
        throw new PlatformApiHttpError(500, {
          code: "PDF_FAILED",
          message: pdf.reason,
        });
      }
      return new NextResponse(new Uint8Array(pdf.bytes), {
        status: 200,
        headers: {
          "content-type": "application/pdf",
          "content-disposition": `attachment; filename="apzpen-${kind}-${engagementId}.pdf"`,
          "x-apzpen-pdf-engine": pdf.engine,
          "x-apzpen-pack-title": pack.title,
        },
      });
    }

    const pack = generateEngagementReport({
      tenantId,
      engagementId,
      kind,
    });
    if (format === "markdown") {
      return new NextResponse(pack.markdown, {
        status: 200,
        headers: {
          "content-type": "text/markdown; charset=utf-8",
          "content-disposition": `inline; filename="apzpen-${kind}.md"`,
        },
      });
    }
    return jsonDataResponse({ pack }, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export const GET = withPlatformApiAuth(handleGet, {
  operation: "apzpen.reports.read",
});
