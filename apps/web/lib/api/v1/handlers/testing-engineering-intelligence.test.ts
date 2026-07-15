/**
 * Engineering Intelligence HTTP handler coverage (APZTCMS-022).
 */
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  handleBuildEngineeringTrend,
  handleCompareEngineeringBenchmark,
  handleComputeEngineeringSnapshot,
  handleGetEngineeringHealth,
  handleGetEngineeringQualityScore,
  handleGetEngineeringRiskSummary,
  handleGetEngineeringSnapshot,
  handleListEngineeringBaselines,
  handleListEngineeringBenchmarks,
  handleListEngineeringHistorical,
  handleListEngineeringSnapshots,
  handleListEngineeringTrends,
  handlePostEngineeringHealth,
  handlePostEngineeringQualityScore,
} from "./testing-engineering-intelligence";
import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { resetPlatformApiGatewayBootstrap } from "../gateway/bootstrap";
import {
  API_TEST_EI_SCORE,
  API_TEST_EI_SNAPSHOT_ID,
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
      timestamp: "2026-07-12T00:00:00.000Z",
    },
    session: buildMockSession() as unknown as PlatformApiRequestContext["session"],
    serviceContext: buildTestServiceContext(),
  };
}

describe("testing engineering intelligence handlers", () => {
  beforeEach(() => {
    installMockGateway();
  });

  afterEach(() => {
    resetPlatformApiGatewayBootstrap();
    vi.clearAllMocks();
  });

  it("covers score, health, and risk reads", async () => {
    const score = await handleGetEngineeringQualityScore(
      makeRequest("/api/v1/testing/engineering-intelligence/score"),
      makeContext(),
    );
    expect(score.status).toBe(200);
    expect((await score.json()).data.score).toBe(API_TEST_EI_SCORE);

    const scorePost = await handlePostEngineeringQualityScore(
      makeRequest("/api/v1/testing/engineering-intelligence/score", {
        method: "POST",
        body: JSON.stringify({ scope: { tenantId: "t1" } }),
      }),
      makeContext(),
    );
    expect(scorePost.status).toBe(200);

    const health = await handleGetEngineeringHealth(
      makeRequest("/api/v1/testing/engineering-intelligence/health"),
      makeContext(),
    );
    expect(health.status).toBe(200);

    const healthPost = await handlePostEngineeringHealth(
      makeRequest("/api/v1/testing/engineering-intelligence/health", {
        method: "POST",
        body: JSON.stringify({}),
      }),
      makeContext(),
    );
    expect(healthPost.status).toBe(200);

    const risk = await handleGetEngineeringRiskSummary(
      makeRequest("/api/v1/testing/engineering-intelligence/risk"),
      makeContext(),
    );
    expect(risk.status).toBe(200);
    expect((await risk.json()).data.overallLevel).toBe("low");
  });

  it("covers snapshots, trends, benchmarks, baselines, historical", async () => {
    const snaps = await handleListEngineeringSnapshots(
      makeRequest("/api/v1/testing/engineering-intelligence/snapshots"),
      makeContext(),
    );
    expect(snaps.status).toBe(200);
    expect((await snaps.json()).data[0].id).toBe(API_TEST_EI_SNAPSHOT_ID);

    const computed = await handleComputeEngineeringSnapshot(
      makeRequest("/api/v1/testing/engineering-intelligence/snapshots", {
        method: "POST",
        body: JSON.stringify({ label: "fixture" }),
      }),
      makeContext(),
    );
    expect(computed.status).toBe(200);

    const one = await handleGetEngineeringSnapshot(
      makeRequest(`/api/v1/testing/engineering-intelligence/snapshots/${API_TEST_EI_SNAPSHOT_ID}`),
      makeContext(),
      { params: Promise.resolve({ snapshotId: API_TEST_EI_SNAPSHOT_ID }) },
    );
    expect(one.status).toBe(200);

    const trends = await handleListEngineeringTrends(
      makeRequest("/api/v1/testing/engineering-intelligence/trends"),
      makeContext(),
    );
    expect(trends.status).toBe(200);

    const built = await handleBuildEngineeringTrend(
      makeRequest("/api/v1/testing/engineering-intelligence/trends", {
        method: "POST",
        body: JSON.stringify({ kind: "coverage", periodKind: "weekly" }),
      }),
      makeContext(),
    );
    expect(built.status).toBe(200);
    expect((await built.json()).data.kind).toBe("coverage");

    const benches = await handleListEngineeringBenchmarks(
      makeRequest("/api/v1/testing/engineering-intelligence/benchmarks"),
      makeContext(),
    );
    expect(benches.status).toBe(200);

    const compared = await handleCompareEngineeringBenchmark(
      makeRequest("/api/v1/testing/engineering-intelligence/benchmarks", {
        method: "POST",
        body: JSON.stringify({
          metricKey: "coverage",
          values: [70, 75, 80],
          baselineValue: 70,
        }),
      }),
      makeContext(),
    );
    expect(compared.status).toBe(200);

    const baselines = await handleListEngineeringBaselines(
      makeRequest("/api/v1/testing/engineering-intelligence/baselines"),
      makeContext(),
    );
    expect(baselines.status).toBe(200);

    const historical = await handleListEngineeringHistorical(
      makeRequest("/api/v1/testing/engineering-intelligence/historical"),
      makeContext(),
    );
    expect(historical.status).toBe(200);
    expect((await historical.json()).data[0].immutable).toBe(true);
  });
});
