import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createHttpPipelineClient } from "./pipeline-client";
import {
  PipelineClientError,
  isPipelineClientError,
  toPipelineUserMessage,
} from "./pipeline-errors";
import {
  getLivePipelineJob,
  getLivePipelineRun,
  getLivePipelineSummary,
  getPipelineLinks,
  getPipelineRepository,
  getPipelineWorkflow,
  getSorPipeline,
  getSorPipelineRun,
  importPipelineFromProvider,
  listLivePipelineArtifacts,
  listLivePipelineJobs,
  listLivePipelineRuns,
  listLivePipelineSteps,
  listPipelineProviders,
  listPipelineWorkflows,
  listSorPipelineJobs,
  listSorPipelineRuns,
  listSorPipelineStages,
  listSorPipelines,
  resetPipelineClient,
  setPipelineClient,
} from "./pipeline-api";
import { createMockPipelineClient } from "./mock-pipeline-client";

const jsonResponse = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { "content-type": "application/json" },
  });

describe("pipeline client coverage", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes("/summary")) {
        return jsonResponse({
          data: { headline: "OK", overallStatus: "passed", passed: 1 },
        });
      }
      if (url.includes("/artifacts")) {
        return jsonResponse({
          data: [{ name: "a.xml", sizeBytes: 2048, type: "xml" }],
          page: { total: 1 },
        });
      }
      if (url.includes("/steps")) {
        return jsonResponse({
          data: [{ key: "s1", name: "Step", status: "passed", durationMs: 500 }],
          page: { total: 1 },
        });
      }
      if (url.includes("/jobs/") && !url.endsWith("/jobs")) {
        return jsonResponse({
          data: { key: "1", name: "unit", status: "passed", durationMs: 1000 },
        });
      }
      if (url.includes("/jobs")) {
        return jsonResponse({
          data: [{ key: "1", name: "unit", status: "passed", durationMs: 1000 }],
          page: { total: 1 },
        });
      }
      if (url.includes("/workflows/") && !url.endsWith("/workflows")) {
        return jsonResponse({
          data: { id: "7", name: "CI", path: "ci.yml", state: "active" },
        });
      }
      if (url.includes("/workflows")) {
        return jsonResponse({
          data: [{ id: "7", name: "CI", path: "ci.yml", state: "active" }],
          page: { total: 1 },
        });
      }
      if (url.includes("/runs/") && url.includes("/links")) {
        return jsonResponse({
          data: {
            evidenceIds: ["e1"],
            coverageMetricIds: ["c1"],
            certificationRecordId: "cert1",
            releaseId: "rel1",
            automationImportId: "imp1",
            executionIds: ["ex1"],
          },
        });
      }
      if (url.includes("/runs/") && url.includes("/stages")) {
        return jsonResponse({
          data: [{ key: "build", name: "build", status: "passed", durationMs: 2000 }],
          page: { total: 1 },
        });
      }
      if (url.match(/\/runs\/[^/]+$/) && url.includes("/pipelines/runs/")) {
        return jsonResponse({
          data: {
            id: "prun_1",
            pipelineId: "pipe_1",
            externalRunRef: "99",
            providerKind: "github_actions",
            status: "passed",
            durationMs: 60_000,
            environment: { branch: "main", commit: "deadbeef" },
          },
        });
      }
      if (url.includes("/runs/") && !url.includes("/pipelines/runs/")) {
        return jsonResponse({
          data: {
            id: "99",
            name: "CI",
            status: "passed",
            workflowId: "7",
            durationMs: 1500,
            branch: "main",
          },
        });
      }
      if (url.includes("/runs")) {
        return jsonResponse({
          data: [
            {
              id: "99",
              name: "CI",
              status: "passed",
              workflowId: "7",
              durationMs: 1500,
            },
          ],
          page: { total: 1 },
        });
      }
      if (url.includes("/providers")) {
        return jsonResponse({
          data: [{ kind: "github_actions", version: "1.0.0" }],
          page: { total: 1 },
        });
      }
      if (url.match(/\/pipelines\/[^/]+$/) && !url.endsWith("/pipelines")) {
        return jsonResponse({
          data: {
            id: "pipe_1",
            key: "ci",
            name: "CI",
            providerKind: "github_actions",
            status: "active",
          },
        });
      }
      if (url.endsWith("/pipelines") || url.includes("/pipelines?")) {
        return jsonResponse({
          data: [
            {
              id: "pipe_1",
              key: "ci",
              name: "CI",
              providerKind: "github_actions",
              status: "active",
            },
          ],
          page: { total: 1 },
        });
      }
      return jsonResponse({
        data: {
          id: "1",
          name: "portal",
          fullName: "acme/portal",
          private: false,
          htmlUrl: "https://example.com",
          description: "desc",
          defaultBranch: "main",
          ownerLogin: "acme",
        },
      });
    });
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    resetPipelineClient();
  });

  it("covers remaining HTTP client methods and mappers", async () => {
    const client = createHttpPipelineClient();
    await expect(client.listWorkflows("acme", "portal")).resolves.toMatchObject({
      total: 1,
    });
    await expect(client.getWorkflow("acme", "portal", "7")).resolves.toMatchObject({
      id: "7",
    });
    await expect(client.getLiveRun("acme", "portal", "99")).resolves.toMatchObject({
      durationLabel: "2s",
    });
    await expect(client.listLiveJobs("acme", "portal", "99")).resolves.toMatchObject({
      total: 1,
    });
    await expect(client.getLiveJob("acme", "portal", "99", "1")).resolves.toMatchObject(
      {
        name: "unit",
      },
    );
    await expect(
      client.listLiveSteps("acme", "portal", "99", "1"),
    ).resolves.toMatchObject({
      total: 1,
    });
    await expect(
      client.listLiveArtifacts("acme", "portal", "99"),
    ).resolves.toMatchObject({
      items: [{ sizeLabel: "2.0 KB" }],
    });
    await expect(client.getLiveSummary("acme", "portal", "99")).resolves.toMatchObject({
      headline: "OK",
    });
    await expect(client.getPipeline("pipe_1")).resolves.toMatchObject({ key: "ci" });
    await expect(client.listSorRuns("pipe_1")).resolves.toMatchObject({ total: 1 });
    await expect(client.getLinks("prun_1")).resolves.toMatchObject({
      evidenceIds: ["e1"],
      releaseId: "rel1",
    });
    await expect(client.listSorJobs("prun_1")).resolves.toMatchObject({ total: 1 });
    await expect(client.listSorStages("prun_1")).resolves.toMatchObject({ total: 1 });
    await expect(client.listProviders()).resolves.toMatchObject({ total: 1 });
  });

  it("maps categorized HTTP statuses", async () => {
    for (const [status, code] of [
      [404, "not_found"],
      [429, "rate_limited"],
      [408, "timeout"],
      [503, "provider_unavailable"],
    ] as const) {
      fetchMock.mockResolvedValueOnce(
        jsonResponse({ error: { message: code } }, { status }),
      );
      await expect(createHttpPipelineClient().listPipelines()).rejects.toMatchObject({
        code,
        status,
      });
    }
  });

  it("covers pipeline-api wrappers via mock client", async () => {
    setPipelineClient(createMockPipelineClient());
    await expect(getPipelineRepository("a", "b")).resolves.toMatchObject({
      name: "portal",
    });
    await expect(listPipelineWorkflows("a", "b")).resolves.toMatchObject({ total: 1 });
    await expect(getPipelineWorkflow("a", "b", "7")).resolves.toMatchObject({
      id: "7",
    });
    await expect(listLivePipelineRuns("a", "b")).resolves.toMatchObject({ total: 1 });
    await expect(getLivePipelineRun("a", "b", "99")).resolves.toMatchObject({
      id: "99",
    });
    await expect(listLivePipelineJobs("a", "b", "99")).resolves.toMatchObject({
      total: 1,
    });
    await expect(getLivePipelineJob("a", "b", "99", "1")).resolves.toMatchObject({
      name: "unit",
    });
    await expect(listLivePipelineSteps("a", "b", "99", "1")).resolves.toMatchObject({
      total: 1,
    });
    await expect(listLivePipelineArtifacts("a", "b", "99")).resolves.toMatchObject({
      total: 1,
    });
    await expect(getLivePipelineSummary("a", "b", "99")).resolves.toMatchObject({
      overallStatus: "passed",
    });
    await expect(listSorPipelines()).resolves.toMatchObject({ total: 1 });
    await expect(getSorPipeline("pipe")).resolves.toMatchObject({ key: "portal-ci" });
    await expect(listSorPipelineRuns("pipe")).resolves.toMatchObject({ total: 1 });
    await expect(getSorPipelineRun("prun")).resolves.toMatchObject({
      id: "prun_apztcms_018",
    });
    await expect(getPipelineLinks("prun")).resolves.toMatchObject({ evidenceIds: [] });
    await expect(listSorPipelineJobs("prun")).resolves.toMatchObject({ total: 1 });
    await expect(listSorPipelineStages("prun")).resolves.toMatchObject({ total: 1 });
    await expect(listPipelineProviders()).resolves.toMatchObject({ total: 1 });
    await expect(
      importPipelineFromProvider({ owner: "a", repo: "b", runId: "99" }),
    ).resolves.toMatchObject({ status: "completed" });
  });

  it("covers pipeline error helpers", () => {
    const err = new PipelineClientError("x", "y", 400, {
      correlationId: "c",
      requestId: "r",
    });
    expect(isPipelineClientError(err)).toBe(true);
    expect(isPipelineClientError(new Error("nope"))).toBe(false);
    expect(toPipelineUserMessage(err)).toBe("x");
    expect(toPipelineUserMessage(new Error("boom"))).toBe("boom");
    expect(toPipelineUserMessage("weird")).toBe("Unable to load Pipeline data.");
  });
});
