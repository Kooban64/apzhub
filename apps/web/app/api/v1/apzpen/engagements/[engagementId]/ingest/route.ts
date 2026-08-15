export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import { PlatformApiHttpError } from "@/lib/api/v1/errors";
import { jsonDataResponse } from "@/lib/api/v1/response";
import { actorEmail, requireApzpenAccess, resolveTenantId } from "@/lib/apzpen/access";
import { ApzpenDomainError } from "@/lib/apzpen/domain";
import {
  isFaradayArtefactIngestEnabled,
  isPathUnderFaradayRoot,
  readFaradayArtefact,
} from "@/lib/apzpen/faraday-artefact";
import {
  isGreenboneArtefactIngestEnabled,
  isPathUnderGreenboneRoot,
  readGreenboneArtefact,
} from "@/lib/apzpen/greenbone-artefact";
import {
  ingestDispatchJobArtefact,
  ingestProviderArtefact,
} from "@/lib/apzpen/service";
import type {
  ProviderIngestFormat,
  ProviderToolId,
} from "@/lib/apzpen/provider-ingest";

function mapError(error: unknown): never {
  if (error instanceof ApzpenDomainError) {
    const status =
      error.code === "NOT_FOUND"
        ? 404
        : error.code === "VALIDATION" || error.code === "CERTIFY_BLOCKED"
          ? 400
          : 409;
    throw new PlatformApiHttpError(status, {
      code: error.code,
      message: error.message,
    });
  }
  throw error;
}

type ArtefactTool = "greenbone" | "faraday";

function resolveArtefactTool(
  artefactPath: string,
  toolId: ProviderToolId | undefined,
): ArtefactTool {
  const underGreenbone = isPathUnderGreenboneRoot(artefactPath);
  const underFaraday = isPathUnderFaradayRoot(artefactPath);

  if (toolId === "greenbone") {
    if (!underGreenbone) {
      throw new PlatformApiHttpError(400, {
        code: "VALIDATION",
        message:
          "artefactPath must be under security/out/greenbone for toolId greenbone",
      });
    }
    return "greenbone";
  }
  if (toolId === "faraday") {
    if (!underFaraday) {
      throw new PlatformApiHttpError(400, {
        code: "VALIDATION",
        message: "artefactPath must be under security/out/faraday for toolId faraday",
      });
    }
    return "faraday";
  }

  if (underFaraday && !underGreenbone) return "faraday";
  if (underGreenbone && !underFaraday) return "greenbone";

  throw new PlatformApiHttpError(400, {
    code: "VALIDATION",
    message:
      "artefactPath must be under security/out/greenbone or security/out/faraday (or pass toolId)",
  });
}

async function handlePost(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  requireApzpenAccess(context, "test");
  const tenantId = resolveTenantId(context);
  const engagementId = (await routeContext?.params)?.engagementId;
  if (!engagementId) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION",
      message: "engagementId required",
    });
  }

  const contentType = request.headers.get("content-type") ?? "";
  let format: ProviderIngestFormat | undefined;
  let toolId: ProviderToolId | undefined;
  let payload: unknown;
  let rawText: string | undefined;
  let jobId: string | undefined;
  let artefactPath: string | undefined;

  try {
    if (contentType.includes("application/json")) {
      const body = (await request.json()) as {
        format?: ProviderIngestFormat;
        toolId?: ProviderToolId;
        payload?: unknown;
        rawText?: string;
        jobId?: string;
        /** Server-side path under greenbone/faraday out (requires matching ARTEFACT_INGEST env). */
        artefactPath?: string;
        fromArtefactPath?: string;
      };
      jobId = body.jobId;
      format = body.format;
      toolId = body.toolId;
      payload = body.payload;
      rawText = body.rawText;
      artefactPath = body.fromArtefactPath?.trim() || body.artefactPath?.trim();
    } else {
      rawText = await request.text();
      format =
        (request.nextUrl.searchParams.get("format") as ProviderIngestFormat) || "auto";
      toolId =
        (request.nextUrl.searchParams.get("toolId") as ProviderToolId) || undefined;
    }

    if (artefactPath) {
      const artefactTool = resolveArtefactTool(artefactPath, toolId);

      if (artefactTool === "greenbone") {
        if (!isGreenboneArtefactIngestEnabled()) {
          throw new PlatformApiHttpError(403, {
            code: "FORBIDDEN",
            message:
              "Greenbone artefact-path ingest disabled — set APZPEN_GREENBONE_ARTEFACT_INGEST=true",
          });
        }
        let artefactPayload: unknown;
        try {
          artefactPayload = readGreenboneArtefact(artefactPath);
        } catch (error) {
          throw new PlatformApiHttpError(400, {
            code: "VALIDATION",
            message:
              error instanceof Error
                ? error.message
                : "Unable to read Greenbone artefact",
          });
        }
        const result = ingestProviderArtefact({
          tenantId,
          engagementId,
          createdBy: actorEmail(context),
          format: format ?? "simplified",
          toolId: "greenbone",
          payload: artefactPayload,
        });
        return jsonDataResponse(
          {
            format: result.format,
            toolId: result.toolId,
            parsedCount: result.parsedCount,
            createdCount: result.created.length,
            skipped: result.skipped,
            findings: result.created,
            artefactPath,
          },
          context.tracing,
          { status: 201 },
        );
      }

      if (!isFaradayArtefactIngestEnabled()) {
        throw new PlatformApiHttpError(403, {
          code: "FORBIDDEN",
          message:
            "Faraday artefact-path ingest disabled — set APZPEN_FARADAY_ARTEFACT_INGEST=true",
        });
      }
      let artefactPayload: unknown;
      try {
        artefactPayload = readFaradayArtefact(artefactPath);
      } catch (error) {
        throw new PlatformApiHttpError(400, {
          code: "VALIDATION",
          message:
            error instanceof Error ? error.message : "Unable to read Faraday artefact",
        });
      }
      const result = ingestProviderArtefact({
        tenantId,
        engagementId,
        createdBy: actorEmail(context),
        format: format ?? "simplified",
        toolId: "faraday",
        payload: artefactPayload,
      });
      return jsonDataResponse(
        {
          format: result.format,
          toolId: result.toolId,
          parsedCount: result.parsedCount,
          createdCount: result.created.length,
          skipped: result.skipped,
          findings: result.created,
          artefactPath,
        },
        context.tracing,
        { status: 201 },
      );
    }

    if (jobId) {
      const result = ingestDispatchJobArtefact({
        tenantId,
        engagementId,
        jobId,
        createdBy: actorEmail(context),
      });
      return jsonDataResponse(
        {
          format: result.format,
          toolId: result.toolId,
          parsedCount: result.parsedCount,
          createdCount: result.created.length,
          skipped: result.skipped,
          findings: result.created,
          job: {
            jobId: result.job.jobId,
            tool: result.job.tool,
            artefactPath: result.job.artefactPath,
          },
        },
        context.tracing,
        { status: 201 },
      );
    }

    const result = ingestProviderArtefact({
      tenantId,
      engagementId,
      createdBy: actorEmail(context),
      format,
      toolId,
      payload,
      rawText,
    });

    return jsonDataResponse(
      {
        format: result.format,
        toolId: result.toolId,
        parsedCount: result.parsedCount,
        createdCount: result.created.length,
        skipped: result.skipped,
        findings: result.created,
      },
      context.tracing,
      { status: 201 },
    );
  } catch (error) {
    mapError(error);
  }
}

export const POST = withPlatformApiAuth(handlePost, {
  operation: "apzpen.engagements.ingest",
});
