/**
 * Platform Reporting HTTP handlers (APZREPORT-002) — presentation only.
 * Call PlatformServiceGateway.reporting exclusively.
 */

import { REPORT_OUTPUT_FORMATS } from "@apzhub/reporting-contracts";
import type { NextRequest } from "next/server";
import type { z } from "zod";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PLATFORM_API_MAX_BODY_BYTES } from "../constants";
import { getPlatformServiceGateway } from "../gateway/bootstrap";
import { jsonCollectionResponse, jsonDataResponse } from "../response";
import { parseJsonBody, parsePathParam, parseQuery } from "../schemas/common";
import {
  generateReportBodySchema,
  previewReportBodySchema,
  reportMetadataIdParamSchema,
  reportTemplateIdParamSchema,
  reportingListQuerySchema,
  reportingTemplatesQuerySchema,
  renderReportBodySchema,
  validateReportBodySchema,
} from "../schemas/reporting";

type RouteContext = { params: Promise<Record<string, string>> };

type ReportingFacet = Awaited<
  ReturnType<typeof getPlatformServiceGateway>
>["reporting"];

type ValidateArgs = Parameters<ReportingFacet["validateReport"]>;
type GenerateArgs = Parameters<ReportingFacet["generateReport"]>;
type PreviewArgs = Parameters<ReportingFacet["previewReport"]>;
type RenderArgs = Parameters<ReportingFacet["renderReport"]>;

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

export async function handleListReportOutputFormats(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  return jsonDataResponse({ formats: [...REPORT_OUTPUT_FORMATS] }, context.tracing);
}

export async function handleListAvailableReports(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  parseQuery(reportingListQuerySchema, request.nextUrl.searchParams);
  const gateway = await getPlatformServiceGateway();
  const items = await gateway.reporting.listAvailableReports(context.serviceContext);
  return collection(items, context);
}

export async function handleListReportTemplates(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(reportingTemplatesQuerySchema, request.nextUrl.searchParams);
  const gateway = await getPlatformServiceGateway();
  const items = await gateway.reporting.listTemplates(
    context.serviceContext,
    query.reportType,
  );
  return collection(items, context);
}

export async function handleGetReportTemplate(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const templateId = await param(
    routeContext,
    "templateId",
    reportTemplateIdParamSchema,
  );
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.reporting.getTemplate(
    context.serviceContext,
    templateId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleValidateReport(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    validateReportBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.reporting.validateReport(
    context.serviceContext,
    body as ValidateArgs[1],
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGenerateReport(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    generateReportBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.reporting.generateReport(
    context.serviceContext,
    body as GenerateArgs[1],
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handlePreviewReport(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    previewReportBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.reporting.previewReport(
    context.serviceContext,
    body as PreviewArgs[1],
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleListReportGenerations(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  parseQuery(reportingListQuerySchema, request.nextUrl.searchParams);
  const gateway = await getPlatformServiceGateway();
  const items = await gateway.reporting.listReportMetadata(context.serviceContext);
  return collection(items, context);
}

export async function handleGetReportGeneration(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const metadataId = await param(
    routeContext,
    "metadataId",
    reportMetadataIdParamSchema,
  );
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.reporting.getReportMetadata(
    context.serviceContext,
    metadataId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleRenderReport(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    renderReportBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.reporting.renderReport(
    context.serviceContext,
    body as RenderArgs[1],
  );
  return jsonDataResponse(result, context.tracing);
}
