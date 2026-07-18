/**
 * Platform Testing HTTP API v1 tests (APZTCMS-012).
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PlatformServiceError } from "@apzhub/platform-service-contracts";

import { mapPlatformErrorToHttpStatus } from "./errors";
import { resetPlatformApiGatewayBootstrap } from "./gateway/bootstrap";
import {
  handleApproveTestingCertification,
  handleArchiveTestingRequirement,
  handleCloneTestingPlan,
  handleCreateTestingPlan,
  handleGetTestingDashboardSummary,
  handleGetTestingPlan,
  handleImportTestingAutomationResult,
  handleListTestingCoverageMetrics,
  handleListTestingPlans,
  handleRegisterTestingEvidence,
  handleReleaseReadiness,
  handleRecomputeTestingCoverage,
  handleStartTestingExecution,
  handleTestingQualityRisk,
  handleValidateTestingAutomationImport,
  handleGetPipelineRepository,
  handleListLivePipelineRuns,
  handleListSorPipelines,
  handleGetSorPipelineRunLinks,
  handleImportPipelineFromProvider,
  handleListPipelineProviders,
} from "./handlers/testing";
import { loadPlatformOpenApiSpecObject } from "./openapi";
import type { PlatformApiRequestContext } from "./auth/with-platform-api-auth";
import {
  API_TEST_CERT_ID,
  API_TEST_COVERAGE_ID,
  API_TEST_EXEC_ID,
  API_TEST_PIPELINE_LIVE_RUN_ID,
  API_TEST_PIPELINE_OWNER,
  API_TEST_PIPELINE_REPO,
  API_TEST_PIPELINE_RUN_ID,
  API_TEST_PLAN_ID,
  API_TEST_REQ_ID,
  buildMockSession,
  buildTestPlan,
  buildTestServiceContext,
  installMockGateway,
} from "./testing/fixtures";

vi.mock("@apzhub/auth/server", () => ({
  getValidatedSession: vi.fn(),
}));

import { getValidatedSession } from "@apzhub/auth/server";
import { GET as getTestingDashboardRoute } from "@/app/api/v1/testing/dashboard/route";

function makeRequest(
  url: string,
  init?: {
    readonly method?: string;
    readonly body?: string;
    readonly headers?: Record<string, string>;
  },
): NextRequest {
  return new NextRequest(new URL(url, "http://localhost:3300"), {
    method: init?.method ?? "GET",
    body: init?.body,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

function makeContext(
  overrides: Partial<PlatformApiRequestContext["serviceContext"]> = {},
): PlatformApiRequestContext {
  const session = buildMockSession() as unknown as PlatformApiRequestContext["session"];
  const tracing = {
    requestId: "req-test-0001",
    correlationId: "corr-test-0001",
    timestamp: "2026-07-10T00:00:00.000Z",
  };
  return {
    tracing,
    session,
    serviceContext: buildTestServiceContext(overrides),
  };
}

function canonicalAutomationResult() {
  return {
    adapterKind: "playwright",
    externalRunRef: "run-apztcms-012",
    environment: { framework: "playwright" },
    suites: [
      {
        name: "Testing API",
        cases: [{ title: "lists plans", status: "pass" }],
        status: "pass",
      },
    ],
    evidence: [
      {
        type: "note",
        title: "Result metadata",
        storageRef: "metadata:run-apztcms-012",
      },
    ],
    coverage: { covered: 1, total: 1, percentage: 100, kind: "requirement" },
    overallStatus: "pass",
  };
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue;
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(entry) && !entry.endsWith(".d.ts")) out.push(full);
  }
  return out;
}

describe("APZTCMS-012 Testing HTTP API", () => {
  beforeEach(() => {
    resetPlatformApiGatewayBootstrap();
    vi.mocked(getValidatedSession).mockResolvedValue(buildMockSession() as never);
  });

  afterEach(() => {
    resetPlatformApiGatewayBootstrap();
    vi.clearAllMocks();
  });

  describe("plans", () => {
    it("lists, creates, and gets plans through the testing gateway", async () => {
      const onCall = vi.fn();
      installMockGateway({ onCall });

      const listed = await handleListTestingPlans(
        makeRequest("/api/v1/testing/plans"),
        makeContext(),
      );
      expect(listed.status).toBe(200);
      expect((await listed.json()).data[0].id).toBe(API_TEST_PLAN_ID);

      const created = await handleCreateTestingPlan(
        makeRequest("/api/v1/testing/plans", {
          method: "POST",
          body: JSON.stringify({
            key: "PLAN-NEW",
            name: "New Testing Plan",
            status: "draft",
          }),
        }),
        makeContext(),
      );
      expect(created.status).toBe(201);
      expect((await created.json()).data.name).toBe("New Testing Plan");

      const got = await handleGetTestingPlan(
        makeRequest(`/api/v1/testing/plans/${API_TEST_PLAN_ID}`),
        makeContext(),
        { params: Promise.resolve({ planId: API_TEST_PLAN_ID }) },
      );
      expect(got.status).toBe(200);
      expect((await got.json()).data.id).toBe(API_TEST_PLAN_ID);

      expect(onCall).toHaveBeenCalledWith("testing.plans", "list", expect.any(Object));
      expect(onCall).toHaveBeenCalledWith(
        "testing.plans",
        "create",
        expect.any(Object),
      );
      expect(onCall).toHaveBeenCalledWith("testing.plans", "get", expect.any(Object));
    });

    it("clones a plan", async () => {
      const onCall = vi.fn();
      installMockGateway({ onCall });

      const response = await handleCloneTestingPlan(
        makeRequest(`/api/v1/testing/plans/${API_TEST_PLAN_ID}/clone`, {
          method: "POST",
          body: JSON.stringify({ key: "PLAN-CLONE", name: "Clone" }),
        }),
        makeContext(),
        { params: Promise.resolve({ planId: API_TEST_PLAN_ID }) },
      );

      expect(response.status).toBe(201);
      expect((await response.json()).data.name).toBe("Clone");
      expect(onCall).toHaveBeenCalledWith("testing.plans", "clone", expect.any(Object));
    });
  });

  it("archives a requirement", async () => {
    const onCall = vi.fn();
    installMockGateway({ onCall });

    const response = await handleArchiveTestingRequirement(
      makeRequest(`/api/v1/testing/requirements/${API_TEST_REQ_ID}`, {
        method: "DELETE",
      }),
      makeContext(),
      { params: Promise.resolve({ requirementId: API_TEST_REQ_ID }) },
    );

    expect(response.status).toBe(200);
    expect((await response.json()).data.id).toBe(API_TEST_REQ_ID);
    expect(onCall).toHaveBeenCalledWith(
      "testing.requirements",
      "archive",
      expect.any(Object),
    );
  });

  it("starts an execution and rejects invalid execution path IDs", async () => {
    const onCall = vi.fn();
    installMockGateway({ onCall });

    const response = await handleStartTestingExecution(
      makeRequest(`/api/v1/testing/executions/${API_TEST_EXEC_ID}/start`, {
        method: "POST",
      }),
      makeContext(),
      { params: Promise.resolve({ executionId: API_TEST_EXEC_ID }) },
    );
    expect(response.status).toBe(200);
    expect((await response.json()).data.status).toBe("in_progress");

    await expect(
      handleStartTestingExecution(
        makeRequest("/api/v1/testing/executions/%20/start", { method: "POST" }),
        makeContext(),
        { params: Promise.resolve({ executionId: " " }) },
      ),
    ).rejects.toMatchObject({ status: 400 });
    expect(onCall).toHaveBeenCalledWith(
      "testing.executions",
      "start",
      expect.any(Object),
    );
  });

  it("registers evidence metadata only", async () => {
    const onCall = vi.fn();
    installMockGateway({ onCall });

    const response = await handleRegisterTestingEvidence(
      makeRequest("/api/v1/testing/evidence", {
        method: "POST",
        body: JSON.stringify({
          type: "note",
          title: "Metadata evidence",
          storageRef: "metadata:exec-1",
          contentType: "text/plain",
          sizeBytes: 0,
          executionId: API_TEST_EXEC_ID,
        }),
      }),
      makeContext(),
    );

    expect(response.status).toBe(201);
    expect((await response.json()).data.storageRef).toBe("metadata:exec-1");
    expect(onCall).toHaveBeenCalledWith(
      "testing.evidence",
      "registerEvidence",
      expect.any(Object),
    );
  });

  it("validates and imports automation results without running tests", async () => {
    const onCall = vi.fn();
    installMockGateway({ onCall });

    const validated = await handleValidateTestingAutomationImport(
      makeRequest("/api/v1/testing/automation/imports/validate", {
        method: "POST",
        body: JSON.stringify(canonicalAutomationResult()),
      }),
      makeContext(),
    );
    expect(validated.status).toBe(200);
    expect((await validated.json()).data.valid).toBe(true);

    const imported = await handleImportTestingAutomationResult(
      makeRequest("/api/v1/testing/automation/imports", {
        method: "POST",
        body: JSON.stringify({
          adapterKind: "playwright",
          payload: canonicalAutomationResult(),
          contentType: "application/json",
          fileNameHint: "results.json",
        }),
      }),
      makeContext(),
    );
    expect(imported.status).toBe(201);
    expect((await imported.json()).data.importRecord.id).toBeTruthy();
    expect(onCall).toHaveBeenCalledWith(
      "testing.automation",
      "validateImport",
      expect.any(Object),
    );
    expect(onCall).toHaveBeenCalledWith(
      "testing.automation",
      "importResult",
      expect.any(Object),
    );
  });

  it("lists coverage and accepts recompute requests", async () => {
    const onCall = vi.fn();
    installMockGateway({ onCall });

    const listed = await handleListTestingCoverageMetrics(
      makeRequest("/api/v1/testing/coverage?kind=requirement"),
      makeContext(),
    );
    expect(listed.status).toBe(200);
    expect((await listed.json()).data[0].id).toBe(API_TEST_COVERAGE_ID);

    const recompute = await handleRecomputeTestingCoverage(
      makeRequest("/api/v1/testing/coverage/recompute", {
        method: "POST",
        body: JSON.stringify({ planId: API_TEST_PLAN_ID }),
      }),
      makeContext(),
    );
    expect(recompute.status).toBe(202);
    expect((await recompute.json()).data.accepted).toBe(true);
    expect(onCall).toHaveBeenCalledWith(
      "testing.coverage",
      "listMetricsByKind",
      expect.any(Object),
    );
    expect(onCall).toHaveBeenCalledWith(
      "testing.coverage",
      "requestRecompute",
      expect.any(Object),
    );
  });

  it("approves certifications and returns advisory release readiness", async () => {
    const onCall = vi.fn();
    installMockGateway({ onCall });

    const approved = await handleApproveTestingCertification(
      makeRequest(`/api/v1/testing/certifications/${API_TEST_CERT_ID}/approve`, {
        method: "POST",
        body: JSON.stringify({ reason: "Approved for APZTCMS-012 closeout." }),
      }),
      makeContext(),
      { params: Promise.resolve({ certificationId: API_TEST_CERT_ID }) },
    );
    expect(approved.status).toBe(200);
    expect((await approved.json()).data.status).toBe("approved");

    const readiness = await handleReleaseReadiness(
      makeRequest(`/api/v1/testing/releases/${API_TEST_PLAN_ID}/readiness`),
      makeContext(),
      { params: Promise.resolve({ releaseId: API_TEST_PLAN_ID }) },
    );
    expect(readiness.status).toBe(200);
    expect((await readiness.json()).data.isDecision).toBe(false);
    expect(onCall).toHaveBeenCalledWith(
      "testing.certification",
      "approve",
      expect.any(Object),
    );
    expect(onCall).toHaveBeenCalledWith(
      "testing.releaseReadiness",
      "calculateForPlan",
      expect.any(Object),
    );
  });

  it("returns dashboard data", async () => {
    const onCall = vi.fn();
    installMockGateway({ onCall });

    const response = await handleGetTestingDashboardSummary(
      makeRequest("/api/v1/testing/dashboard"),
      makeContext(),
    );

    expect(response.status).toBe(200);
    expect((await response.json()).data.totals.plans).toBe(1);
    expect(onCall).toHaveBeenCalledWith(
      "testing.dashboard",
      "getDashboardSummary",
      expect.any(Object),
    );
  });

  it("maps quality risk to 501 capability unsupported", async () => {
    installMockGateway();
    await expect(
      handleTestingQualityRisk(
        makeRequest("/api/v1/testing/quality/risk"),
        makeContext(),
      ),
    ).rejects.toMatchObject({ code: "PROVIDER_CAPABILITY_UNSUPPORTED" });
    expect(
      mapPlatformErrorToHttpStatus(
        new PlatformServiceError({
          category: "configuration",
          code: "PROVIDER_CAPABILITY_UNSUPPORTED",
          message: "unsupported",
          correlationId: "corr-test-0001",
          retryable: false,
        }),
      ),
    ).toBe(501);
  });

  it("denies anonymous route access before gateway invocation", async () => {
    installMockGateway();
    vi.mocked(getValidatedSession).mockResolvedValue(null as never);

    const response = await getTestingDashboardRoute(
      makeRequest("/api/v1/testing/dashboard"),
    );
    expect(response.status).toBe(401);
    expect((await response.json()).error.code).toBe("AUTHENTICATION_REQUIRED");
  });

  it("documents key Testing paths in the OpenAPI spec", () => {
    const spec = loadPlatformOpenApiSpecObject() as { paths: Record<string, unknown> };
    for (const apiPath of [
      "/testing/dashboard",
      "/testing/plans",
      "/testing/plans/{planId}",
      "/testing/plans/{planId}/clone",
      "/testing/requirements",
      "/testing/requirements/{requirementId}",
      "/testing/executions/{executionId}/start",
      "/testing/evidence",
      "/testing/automation/imports",
      "/testing/automation/imports/validate",
      "/testing/coverage",
      "/testing/coverage/recompute",
      "/testing/certifications/{certificationId}/approve",
      "/testing/releases/{releaseId}/readiness",
      "/testing/traceability",
      "/testing/pipelines",
      "/testing/pipelines/providers",
      "/testing/pipelines/{pipelineId}",
      "/testing/pipelines/{pipelineId}/runs",
      "/testing/pipelines/runs/{runId}",
      "/testing/pipelines/runs/{runId}/links",
      "/testing/pipelines/runs/{runId}/jobs",
      "/testing/pipelines/runs/{runId}/stages",
      "/testing/pipelines/repositories/{owner}/{repo}",
      "/testing/pipelines/repositories/{owner}/{repo}/workflows",
      "/testing/pipelines/repositories/{owner}/{repo}/workflows/{workflowId}",
      "/testing/pipelines/repositories/{owner}/{repo}/runs",
      "/testing/pipelines/repositories/{owner}/{repo}/runs/{runId}",
      "/testing/pipelines/repositories/{owner}/{repo}/runs/{runId}/jobs",
      "/testing/pipelines/repositories/{owner}/{repo}/runs/{runId}/jobs/{jobId}",
      "/testing/pipelines/repositories/{owner}/{repo}/runs/{runId}/jobs/{jobId}/steps",
      "/testing/pipelines/repositories/{owner}/{repo}/runs/{runId}/artifacts",
      "/testing/pipelines/repositories/{owner}/{repo}/runs/{runId}/summary",
      "/testing/engineering-intelligence/score",
      "/testing/engineering-intelligence/health",
      "/testing/engineering-intelligence/risk",
      "/testing/engineering-intelligence/snapshots",
      "/testing/engineering-intelligence/snapshots/{snapshotId}",
      "/testing/engineering-intelligence/trends",
      "/testing/engineering-intelligence/benchmarks",
      "/testing/engineering-intelligence/baselines",
      "/testing/engineering-intelligence/historical",
    ]) {
      expect(spec.paths[apiPath], apiPath).toBeTruthy();
    }
  });

  it("keeps Testing API routes behind platform services and JSON metadata boundaries", () => {
    const handlerSource = readFileSync(
      path.resolve(process.cwd(), "apps/web/lib/api/v1/handlers/testing.ts"),
      "utf8",
    );
    expect(handlerSource.includes("@apzhub/testing-services")).toBe(false);
    expect(handlerSource.includes("@apzhub/testing-persistence")).toBe(false);

    const routesRoot = path.resolve(process.cwd(), "apps/web/app/api/v1/testing");
    const violations: string[] = [];
    for (const file of walk(routesRoot)) {
      const source = readFileSync(file, "utf8");
      const rel = file.replace(`${process.cwd()}/`, "");
      if (source.includes("@apzhub/testing-services")) {
        violations.push(`${rel}: imports @apzhub/testing-services`);
      }
      if (source.includes("@apzhub/testing-persistence")) {
        violations.push(`${rel}: imports @apzhub/testing-persistence`);
      }
      if (
        /multipart|formData\(|request\.formData|Content-Type["']?\s*,\s*["']multipart/i.test(
          source,
        )
      ) {
        violations.push(`${rel}: exposes binary or multipart evidence handling`);
      }
    }

    expect(violations).toEqual([]);
  });

  it("allows gateway overrides for Testing facets", async () => {
    installMockGateway({
      testing: {
        plans: {
          list: vi.fn(async () => [buildTestPlan({ name: "Override Plan" })]),
        },
      },
    });

    const response = await handleListTestingPlans(
      makeRequest("/api/v1/testing/plans"),
      makeContext(),
    );
    expect((await response.json()).data[0].name).toBe("Override Plan");
  });

  it("routes pipeline live and SoR reads through gateway facets", async () => {
    const onCall = vi.fn();
    installMockGateway({ onCall });

    const repo = await handleGetPipelineRepository(
      makeRequest(
        `/api/v1/testing/pipelines/repositories/${API_TEST_PIPELINE_OWNER}/${API_TEST_PIPELINE_REPO}`,
      ),
      makeContext(),
      {
        params: Promise.resolve({
          owner: API_TEST_PIPELINE_OWNER,
          repo: API_TEST_PIPELINE_REPO,
        }),
      },
    );
    expect(repo.status).toBe(200);
    expect((await repo.json()).data.fullName).toBe(
      `${API_TEST_PIPELINE_OWNER}/${API_TEST_PIPELINE_REPO}`,
    );

    const liveRuns = await handleListLivePipelineRuns(
      makeRequest(
        `/api/v1/testing/pipelines/repositories/${API_TEST_PIPELINE_OWNER}/${API_TEST_PIPELINE_REPO}/runs?page=1&perPage=10`,
      ),
      makeContext(),
      {
        params: Promise.resolve({
          owner: API_TEST_PIPELINE_OWNER,
          repo: API_TEST_PIPELINE_REPO,
        }),
      },
    );
    expect(liveRuns.status).toBe(200);
    expect((await liveRuns.json()).data[0].id).toBe(API_TEST_PIPELINE_LIVE_RUN_ID);

    const sor = await handleListSorPipelines(
      makeRequest("/api/v1/testing/pipelines"),
      makeContext(),
    );
    expect(sor.status).toBe(200);
    expect((await sor.json()).data.length).toBeGreaterThan(0);

    const links = await handleGetSorPipelineRunLinks(
      makeRequest(`/api/v1/testing/pipelines/runs/${API_TEST_PIPELINE_RUN_ID}/links`),
      makeContext(),
      { params: Promise.resolve({ runId: API_TEST_PIPELINE_RUN_ID }) },
    );
    expect(links.status).toBe(200);

    const providers = await handleListPipelineProviders(
      makeRequest("/api/v1/testing/pipelines/providers"),
      makeContext(),
    );
    expect(providers.status).toBe(200);
    expect((await providers.json()).data[0]).toMatchObject({
      kind: "github_actions",
      version: "1.0.0",
    });

    const imported = await handleImportPipelineFromProvider(
      makeRequest("/api/v1/testing/pipelines", {
        method: "POST",
        body: JSON.stringify({
          owner: API_TEST_PIPELINE_OWNER,
          repo: API_TEST_PIPELINE_REPO,
          runId: API_TEST_PIPELINE_LIVE_RUN_ID,
        }),
      }),
      makeContext(),
    );
    expect(imported.status).toBe(201);

    expect(onCall).toHaveBeenCalledWith(
      "testing.pipelineRepositories",
      "getRepository",
      expect.any(Object),
    );
    expect(onCall).toHaveBeenCalledWith(
      "testing.pipelineRuns",
      "listRuns",
      expect.any(Object),
    );
    expect(onCall).toHaveBeenCalledWith(
      "testing.pipelines",
      "listPipelines",
      expect.any(Object),
    );
    expect(onCall).toHaveBeenCalledWith(
      "testing.pipelines",
      "importFromProvider",
      expect.any(Object),
    );
  });

  it("keeps pipeline handlers behind platform services boundaries", () => {
    const handlerSource = readFileSync(
      path.resolve(process.cwd(), "apps/web/lib/api/v1/handlers/testing-pipelines.ts"),
      "utf8",
    );
    expect(handlerSource.includes("@apzhub/testing-services")).toBe(false);
    expect(handlerSource.includes("@apzhub/testing-persistence")).toBe(false);
    expect(handlerSource.includes("integration-github-actions")).toBe(false);
    expect(handlerSource.includes("getPlatformServiceGateway")).toBe(true);
  });
});
