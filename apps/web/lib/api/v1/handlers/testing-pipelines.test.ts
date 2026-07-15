/**
 * Pipeline HTTP handler coverage (APZTCMS-018).
 */
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  handleGetLivePipelineJob,
  handleGetLivePipelineRun,
  handleGetLivePipelineSummary,
  handleGetPipelineRepository,
  handleGetPipelineWorkflow,
  handleGetSorPipeline,
  handleGetSorPipelineRun,
  handleGetSorPipelineRunLinks,
  handleImportPipelineFromProvider,
  handleListLivePipelineArtifacts,
  handleListLivePipelineJobs,
  handleListLivePipelineRuns,
  handleListLivePipelineSteps,
  handleListPipelineProviders,
  handleListPipelineWorkflows,
  handleListSorPipelineRunJobs,
  handleListSorPipelineRuns,
  handleListSorPipelineRunStages,
  handleListSorPipelines,
} from "./testing-pipelines";
import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { resetPlatformApiGatewayBootstrap } from "../gateway/bootstrap";
import {
  API_TEST_PIPELINE_ID,
  API_TEST_PIPELINE_JOB_ID,
  API_TEST_PIPELINE_LIVE_RUN_ID,
  API_TEST_PIPELINE_OWNER,
  API_TEST_PIPELINE_REPO,
  API_TEST_PIPELINE_RUN_ID,
  API_TEST_PIPELINE_WORKFLOW_ID,
  buildMockSession,
  buildTestServiceContext,
  installMockGateway,
} from "../testing/fixtures";

function makeRequest(url: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  if (!headers.has("content-type") && init?.body) {
    headers.set("content-type", "application/json");
  }
  return new NextRequest(new URL(url, "http://localhost"), {
    ...init,
    headers,
  });
}

function makeContext(): PlatformApiRequestContext {
  return {
    tracing: {
      requestId: "req-test-0001",
      correlationId: "corr-test-0001",
      timestamp: "2026-07-10T00:00:00.000Z",
    },
    session: buildMockSession() as unknown as PlatformApiRequestContext["session"],
    serviceContext: buildTestServiceContext(),
  };
}

function params(record: Record<string, string>) {
  return { params: Promise.resolve(record) };
}

describe("testing pipeline handlers", () => {
  beforeEach(() => {
    installMockGateway();
  });

  afterEach(() => {
    resetPlatformApiGatewayBootstrap();
    vi.clearAllMocks();
  });

  it("covers live provider read handlers", async () => {
    const ownerRepo = {
      owner: API_TEST_PIPELINE_OWNER,
      repo: API_TEST_PIPELINE_REPO,
    };

    expect(
      (
        await handleGetPipelineRepository(
          makeRequest("/api/v1/testing/pipelines/repositories/acme/portal"),
          makeContext(),
          params(ownerRepo),
        )
      ).status,
    ).toBe(200);

    expect(
      (
        await handleListPipelineWorkflows(
          makeRequest("/x"),
          makeContext(),
          params(ownerRepo),
        )
      ).status,
    ).toBe(200);

    expect(
      (
        await handleGetPipelineWorkflow(
          makeRequest("/x"),
          makeContext(),
          params({ ...ownerRepo, workflowId: API_TEST_PIPELINE_WORKFLOW_ID }),
        )
      ).status,
    ).toBe(200);

    expect(
      (
        await handleListLivePipelineRuns(
          makeRequest("/x?page=1&perPage=5&status=passed&branch=main"),
          makeContext(),
          params(ownerRepo),
        )
      ).status,
    ).toBe(200);

    expect(
      (
        await handleGetLivePipelineRun(
          makeRequest("/x"),
          makeContext(),
          params({ ...ownerRepo, runId: API_TEST_PIPELINE_LIVE_RUN_ID }),
        )
      ).status,
    ).toBe(200);

    expect(
      (
        await handleListLivePipelineJobs(
          makeRequest("/x"),
          makeContext(),
          params({ ...ownerRepo, runId: API_TEST_PIPELINE_LIVE_RUN_ID }),
        )
      ).status,
    ).toBe(200);

    expect(
      (
        await handleGetLivePipelineJob(
          makeRequest("/x"),
          makeContext(),
          params({
            ...ownerRepo,
            runId: API_TEST_PIPELINE_LIVE_RUN_ID,
            jobId: API_TEST_PIPELINE_JOB_ID,
          }),
        )
      ).status,
    ).toBe(200);

    expect(
      (
        await handleListLivePipelineSteps(
          makeRequest("/x"),
          makeContext(),
          params({
            ...ownerRepo,
            runId: API_TEST_PIPELINE_LIVE_RUN_ID,
            jobId: API_TEST_PIPELINE_JOB_ID,
          }),
        )
      ).status,
    ).toBe(200);

    expect(
      (
        await handleListLivePipelineArtifacts(
          makeRequest("/x"),
          makeContext(),
          params({ ...ownerRepo, runId: API_TEST_PIPELINE_LIVE_RUN_ID }),
        )
      ).status,
    ).toBe(200);

    expect(
      (
        await handleGetLivePipelineSummary(
          makeRequest("/x"),
          makeContext(),
          params({ ...ownerRepo, runId: API_TEST_PIPELINE_LIVE_RUN_ID }),
        )
      ).status,
    ).toBe(200);
  });

  it("covers SoR pipeline handlers", async () => {
    expect(
      (await handleListSorPipelines(makeRequest("/api/v1/testing/pipelines"), makeContext()))
        .status,
    ).toBe(200);

    expect(
      (
        await handleGetSorPipeline(
          makeRequest("/x"),
          makeContext(),
          params({ pipelineId: API_TEST_PIPELINE_ID }),
        )
      ).status,
    ).toBe(200);

    expect(
      (
        await handleListSorPipelineRuns(
          makeRequest("/x"),
          makeContext(),
          params({ pipelineId: API_TEST_PIPELINE_ID }),
        )
      ).status,
    ).toBe(200);

    expect(
      (
        await handleGetSorPipelineRun(
          makeRequest("/x"),
          makeContext(),
          params({ runId: API_TEST_PIPELINE_RUN_ID }),
        )
      ).status,
    ).toBe(200);

    expect(
      (
        await handleGetSorPipelineRunLinks(
          makeRequest("/x"),
          makeContext(),
          params({ runId: API_TEST_PIPELINE_RUN_ID }),
        )
      ).status,
    ).toBe(200);

    expect(
      (
        await handleListSorPipelineRunJobs(
          makeRequest("/x"),
          makeContext(),
          params({ runId: API_TEST_PIPELINE_RUN_ID }),
        )
      ).status,
    ).toBe(200);

    expect(
      (
        await handleListSorPipelineRunStages(
          makeRequest("/x"),
          makeContext(),
          params({ runId: API_TEST_PIPELINE_RUN_ID }),
        )
      ).status,
    ).toBe(200);

    expect(
      (await handleListPipelineProviders(makeRequest("/x"), makeContext())).status,
    ).toBe(200);

    const imported = await handleImportPipelineFromProvider(
      makeRequest("/api/v1/testing/pipelines", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          owner: API_TEST_PIPELINE_OWNER,
          repo: API_TEST_PIPELINE_REPO,
          runId: 99,
        }),
      }),
      makeContext(),
    );
    expect(imported.status).toBe(201);
  });
});
