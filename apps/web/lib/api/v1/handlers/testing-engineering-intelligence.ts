/**
 * Engineering Intelligence HTTP handlers (APZTCMS-022) — presentation only.
 * Call PlatformServiceGateway.testing.engineeringIntelligence exclusively.
 */

import type { NextRequest } from "next/server";
import type { z } from "zod";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PLATFORM_API_MAX_BODY_BYTES } from "../constants";
import { getPlatformServiceGateway } from "../gateway/bootstrap";
import { jsonCollectionResponse, jsonDataResponse } from "../response";
import { parseJsonBody, parsePathParam, parseQuery } from "../schemas/common";
import {
  engineeringScopeBodySchema,
  engineeringSnapshotIdParamSchema,
  engineeringTrendBuildBodySchema,
  engineeringBenchmarkCompareBodySchema,
  testingListQuerySchema,
} from "../schemas/testing";

type RouteContext = { params: Promise<Record<string, string>> };

type EngineeringIntelligenceFacet = Awaited<
  ReturnType<typeof getPlatformServiceGateway>
>["testing"]["engineeringIntelligence"];

type ScoreArgs = Parameters<EngineeringIntelligenceFacet["score"]>;
type BuildTrendArgs = Parameters<EngineeringIntelligenceFacet["buildTrend"]>;
type CompareBenchmarkArgs = Parameters<
  EngineeringIntelligenceFacet["compareBenchmark"]
>;

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

function scopeFromBody(
  body: z.infer<typeof engineeringScopeBodySchema>,
): ScoreArgs[1] {
  if (!body.scope) return undefined;
  return body.scope as ScoreArgs[1];
}

function weightsFromBody(
  body: z.infer<typeof engineeringScopeBodySchema>,
): ScoreArgs[2] {
  return body.weights as ScoreArgs[2];
}

export async function handleGetEngineeringQualityScore(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  parseQuery(testingListQuerySchema, request.nextUrl.searchParams);
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.testing.engineeringIntelligence.score(
    context.serviceContext,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handlePostEngineeringQualityScore(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    engineeringScopeBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.testing.engineeringIntelligence.score(
    context.serviceContext,
    scopeFromBody(body),
    weightsFromBody(body),
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetEngineeringHealth(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  parseQuery(testingListQuerySchema, request.nextUrl.searchParams);
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.testing.engineeringIntelligence.assessHealth(
    context.serviceContext,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handlePostEngineeringHealth(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    engineeringScopeBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.testing.engineeringIntelligence.assessHealth(
    context.serviceContext,
    scopeFromBody(body),
    weightsFromBody(body),
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleListEngineeringSnapshots(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  parseQuery(testingListQuerySchema, request.nextUrl.searchParams);
  const gateway = await getPlatformServiceGateway();
  const items = await gateway.testing.engineeringIntelligence.listSnapshots(
    context.serviceContext,
  );
  return collection(items, context);
}

export async function handleComputeEngineeringSnapshot(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    engineeringScopeBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.testing.engineeringIntelligence.computeSnapshot(
    context.serviceContext,
    scopeFromBody(body),
    body.label,
    weightsFromBody(body),
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetEngineeringSnapshot(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "snapshotId", engineeringSnapshotIdParamSchema);
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.testing.engineeringIntelligence.getSnapshot(
    context.serviceContext,
    id,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleListEngineeringTrends(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  parseQuery(testingListQuerySchema, request.nextUrl.searchParams);
  const gateway = await getPlatformServiceGateway();
  const items = await gateway.testing.engineeringIntelligence.listTrends(
    context.serviceContext,
  );
  return collection(items, context);
}

export async function handleBuildEngineeringTrend(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    engineeringTrendBuildBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.testing.engineeringIntelligence.buildTrend(
    context.serviceContext,
    body.kind as BuildTrendArgs[1],
    body.scope as BuildTrendArgs[2],
    body.periodKind as BuildTrendArgs[3],
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleListEngineeringBenchmarks(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  parseQuery(testingListQuerySchema, request.nextUrl.searchParams);
  const gateway = await getPlatformServiceGateway();
  const items = await gateway.testing.engineeringIntelligence.listBenchmarks(
    context.serviceContext,
  );
  return collection(items, context);
}

export async function handleCompareEngineeringBenchmark(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    engineeringBenchmarkCompareBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.testing.engineeringIntelligence.compareBenchmark(
    context.serviceContext,
    body.metricKey,
    body.values,
    body.baselineValue,
    body.scope as CompareBenchmarkArgs[4],
    body.label,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleListEngineeringBaselines(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  parseQuery(testingListQuerySchema, request.nextUrl.searchParams);
  const gateway = await getPlatformServiceGateway();
  const items = await gateway.testing.engineeringIntelligence.listBaselines(
    context.serviceContext,
  );
  return collection(items, context);
}

export async function handleListEngineeringHistorical(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  parseQuery(testingListQuerySchema, request.nextUrl.searchParams);
  const gateway = await getPlatformServiceGateway();
  const items = await gateway.testing.engineeringIntelligence.listHistorical(
    context.serviceContext,
  );
  return collection(items, context);
}

export async function handleGetEngineeringRiskSummary(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  parseQuery(testingListQuerySchema, request.nextUrl.searchParams);
  const gateway = await getPlatformServiceGateway();
  const health = await gateway.testing.engineeringIntelligence.assessHealth(
    context.serviceContext,
  );
  return jsonDataResponse(health.risk, context.tracing);
}
