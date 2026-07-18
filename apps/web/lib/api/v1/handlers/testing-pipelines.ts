/**
 * Testing Pipelines HTTP handlers (APZTCMS-018) — presentation only.
 * Call PlatformServiceGateway.testing.* exclusively.
 */

import type { NextRequest } from "next/server";
import type { z } from "zod";

import type {
  TestingPipelineArtifactService,
  TestingPipelineJobService,
  TestingPipelineRepositoryService,
  TestingPipelineRunLiveService,
  TestingPipelineStepService,
  TestingPipelineSummaryService,
  TestingPipelineWorkflowService,
  TestingPipelinesService,
} from "@apzhub/platform-service-contracts";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PLATFORM_API_MAX_BODY_BYTES } from "../constants";
import { getPlatformServiceGateway } from "../gateway/bootstrap";
import { jsonCollectionResponse, jsonDataResponse } from "../response";
import { parseJsonBody, parsePathParam, parseQuery } from "../schemas/common";
import {
  pipelineIdParamSchema,
  pipelineImportFromProviderBodySchema,
  pipelineJobIdParamSchema,
  pipelineOwnerParamSchema,
  pipelineProviderRunIdParamSchema,
  pipelineRepoParamSchema,
  pipelineRunIdParamSchema,
  pipelineRunListQuerySchema,
  pipelineWorkflowIdParamSchema,
  testingListQuerySchema,
} from "../schemas/testing";

type RouteContext = { params: Promise<Record<string, string>> };

type PipelineId = Parameters<TestingPipelinesService["getPipeline"]>[1];
type PipelineRunId = Parameters<TestingPipelinesService["getRun"]>[1];

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

async function ownerRepo(routeContext: RouteContext | undefined) {
  const owner = await param(routeContext, "owner", pipelineOwnerParamSchema);
  const repo = await param(routeContext, "repo", pipelineRepoParamSchema);
  return { owner, repo };
}

function toProviderDescriptor(adapter: { kind: string; version: string }) {
  return { kind: adapter.kind, version: adapter.version };
}

// ---------------------------------------------------------------------------
// Live provider reads
// ---------------------------------------------------------------------------

export async function handleGetPipelineRepository(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const { owner, repo } = await ownerRepo(routeContext);
  const gateway = await getPlatformServiceGateway();
  const result = await (
    gateway.testing.pipelineRepositories as TestingPipelineRepositoryService
  ).getRepository(context.serviceContext, owner, repo);
  return jsonDataResponse(result, context.tracing);
}

export async function handleListPipelineWorkflows(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const { owner, repo } = await ownerRepo(routeContext);
  const gateway = await getPlatformServiceGateway();
  const items = await (
    gateway.testing.pipelineWorkflows as TestingPipelineWorkflowService
  ).listWorkflows(context.serviceContext, owner, repo);
  return collection(items, context);
}

export async function handleGetPipelineWorkflow(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const { owner, repo } = await ownerRepo(routeContext);
  const workflowId = await param(
    routeContext,
    "workflowId",
    pipelineWorkflowIdParamSchema,
  );
  const gateway = await getPlatformServiceGateway();
  const result = await (
    gateway.testing.pipelineWorkflows as TestingPipelineWorkflowService
  ).getWorkflow(context.serviceContext, owner, repo, workflowId);
  return jsonDataResponse(result, context.tracing);
}

export async function handleListLivePipelineRuns(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const { owner, repo } = await ownerRepo(routeContext);
  const query = parseQuery(pipelineRunListQuerySchema, request.nextUrl.searchParams);
  const gateway = await getPlatformServiceGateway();
  const items = await (
    gateway.testing.pipelineRuns as TestingPipelineRunLiveService
  ).listRuns(context.serviceContext, owner, repo, query);
  return collection(items, context);
}

export async function handleGetLivePipelineRun(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const { owner, repo } = await ownerRepo(routeContext);
  const runId = await param(routeContext, "runId", pipelineProviderRunIdParamSchema);
  const gateway = await getPlatformServiceGateway();
  const result = await (
    gateway.testing.pipelineRuns as TestingPipelineRunLiveService
  ).getRun(context.serviceContext, owner, repo, runId);
  return jsonDataResponse(result, context.tracing);
}

export async function handleListLivePipelineJobs(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const { owner, repo } = await ownerRepo(routeContext);
  const runId = await param(routeContext, "runId", pipelineProviderRunIdParamSchema);
  const gateway = await getPlatformServiceGateway();
  const items = await (
    gateway.testing.pipelineJobs as TestingPipelineJobService
  ).listJobs(context.serviceContext, owner, repo, runId);
  return collection(items, context);
}

export async function handleGetLivePipelineJob(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const { owner, repo } = await ownerRepo(routeContext);
  const runId = await param(routeContext, "runId", pipelineProviderRunIdParamSchema);
  const jobId = await param(routeContext, "jobId", pipelineJobIdParamSchema);
  const gateway = await getPlatformServiceGateway();
  const result = await (
    gateway.testing.pipelineJobs as TestingPipelineJobService
  ).getJob(context.serviceContext, owner, repo, runId, jobId);
  return jsonDataResponse(result, context.tracing);
}

export async function handleListLivePipelineSteps(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const { owner, repo } = await ownerRepo(routeContext);
  const runId = await param(routeContext, "runId", pipelineProviderRunIdParamSchema);
  const jobId = await param(routeContext, "jobId", pipelineJobIdParamSchema);
  const gateway = await getPlatformServiceGateway();
  const items = await (
    gateway.testing.pipelineSteps as TestingPipelineStepService
  ).listSteps(context.serviceContext, owner, repo, runId, jobId);
  return collection(items, context);
}

export async function handleListLivePipelineArtifacts(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const { owner, repo } = await ownerRepo(routeContext);
  const runId = await param(routeContext, "runId", pipelineProviderRunIdParamSchema);
  const gateway = await getPlatformServiceGateway();
  const items = await (
    gateway.testing.pipelineArtifacts as TestingPipelineArtifactService
  ).listArtifacts(context.serviceContext, owner, repo, runId);
  return collection(items, context);
}

export async function handleGetLivePipelineSummary(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const { owner, repo } = await ownerRepo(routeContext);
  const runId = await param(routeContext, "runId", pipelineProviderRunIdParamSchema);
  const gateway = await getPlatformServiceGateway();
  const result = await (
    gateway.testing.pipelineSummaries as TestingPipelineSummaryService
  ).retrieveSummary(context.serviceContext, owner, repo, runId);
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// SoR pipelines
// ---------------------------------------------------------------------------

export async function handleListSorPipelines(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  parseQuery(testingListQuerySchema, request.nextUrl.searchParams);
  const gateway = await getPlatformServiceGateway();
  return collection(
    await gateway.testing.pipelines.listPipelines(context.serviceContext),
    context,
  );
}

export async function handleGetSorPipeline(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = (await param(
    routeContext,
    "pipelineId",
    pipelineIdParamSchema,
  )) as PipelineId;
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(
    await gateway.testing.pipelines.getPipeline(context.serviceContext, id),
    context.tracing,
  );
}

export async function handleListSorPipelineRuns(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  parseQuery(testingListQuerySchema, request.nextUrl.searchParams);
  const pipelineId = (await param(
    routeContext,
    "pipelineId",
    pipelineIdParamSchema,
  )) as PipelineId;
  const gateway = await getPlatformServiceGateway();
  return collection(
    await gateway.testing.pipelines.listRuns(context.serviceContext, pipelineId),
    context,
  );
}

export async function handleGetSorPipelineRun(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const runId = (await param(
    routeContext,
    "runId",
    pipelineRunIdParamSchema,
  )) as PipelineRunId;
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(
    await gateway.testing.pipelines.getRun(context.serviceContext, runId),
    context.tracing,
  );
}

export async function handleGetSorPipelineRunLinks(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const runId = (await param(
    routeContext,
    "runId",
    pipelineRunIdParamSchema,
  )) as PipelineRunId;
  const gateway = await getPlatformServiceGateway();
  return jsonDataResponse(
    await gateway.testing.pipelines.getLinks(context.serviceContext, runId),
    context.tracing,
  );
}

export async function handleListSorPipelineRunJobs(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const runId = (await param(
    routeContext,
    "runId",
    pipelineRunIdParamSchema,
  )) as PipelineRunId;
  const gateway = await getPlatformServiceGateway();
  return collection(
    await gateway.testing.pipelines.listJobs(context.serviceContext, runId),
    context,
  );
}

export async function handleListSorPipelineRunStages(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const runId = (await param(
    routeContext,
    "runId",
    pipelineRunIdParamSchema,
  )) as PipelineRunId;
  const gateway = await getPlatformServiceGateway();
  return collection(
    await gateway.testing.pipelines.listStages(context.serviceContext, runId),
    context,
  );
}

export async function handleListPipelineProviders(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await getPlatformServiceGateway();
  const providers = await gateway.testing.pipelines.listProviders(
    context.serviceContext,
  );
  return collection(providers.map(toProviderDescriptor), context);
}

export async function handleImportPipelineFromProvider(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    pipelineImportFromProviderBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.testing.pipelines.importFromProvider(
    context.serviceContext,
    body,
  );
  return jsonDataResponse(result, context.tracing, { status: 201 });
}
