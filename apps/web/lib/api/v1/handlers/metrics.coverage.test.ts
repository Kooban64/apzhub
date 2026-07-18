/**
 * APZMETRICS-003 — full handler surface coverage.
 */
import { NextRequest } from "next/server";
import { afterEach, describe, expect, it } from "vitest";

import * as handlers from "./metrics";
import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { resetPlatformApiGatewayBootstrap } from "../gateway/bootstrap";
import {
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
  } as ConstructorParameters<typeof NextRequest>[1]);
}

function makeContext(): PlatformApiRequestContext {
  return {
    tracing: {
      requestId: "req-metrics-cov",
      correlationId: "corr-metrics-cov",
      timestamp: "2026-07-17T12:00:00.000Z",
    },
    session: buildMockSession() as unknown as PlatformApiRequestContext["session"],
    serviceContext: buildTestServiceContext(),
  };
}

const p = (params: Record<string, string>) => ({
  params: Promise.resolve(params),
});

type FacetSpec = {
  list: keyof typeof handlers;
  create: keyof typeof handlers;
  get: keyof typeof handlers;
  update: keyof typeof handlers;
  path: string;
  param: string;
  sampleId: string;
  createBody: Record<string, unknown>;
  updateBody: Record<string, unknown>;
};

const FACETS: FacetSpec[] = [
  {
    list: "handleListMetrics",
    create: "handleCreateMetric",
    get: "handleGetMetric",
    update: "handleUpdateMetric",
    path: "metrics",
    param: "metricId",
    sampleId: "metrics_1",
    createBody: { key: "latency", name: "Latency", status: "active" },
    updateBody: { status: "inactive" },
  },
  {
    list: "handleListDefinitions",
    create: "handleCreateDefinition",
    get: "handleGetDefinition",
    update: "handleUpdateDefinition",
    path: "definitions",
    param: "definitionId",
    sampleId: "definitions_1",
    createBody: {
      metricId: "m_1",
      key: "def1",
      name: "Def",
      kind: "gauge",
      versionNumber: 1,
      status: "active",
    },
    updateBody: { status: "inactive" },
  },
  {
    list: "handleListVersions",
    create: "handleCreateVersion",
    get: "handleGetVersion",
    update: "handleUpdateVersion",
    path: "versions",
    param: "versionId",
    sampleId: "versions_1",
    createBody: { metricId: "m_1", versionNumber: 1, status: "active" },
    updateBody: { status: "inactive" },
  },
  {
    list: "handleListCategories",
    create: "handleCreateCategory",
    get: "handleGetCategory",
    update: "handleUpdateCategory",
    path: "categories",
    param: "categoryId",
    sampleId: "categories_1",
    createBody: { key: "ops", name: "Ops", status: "active" },
    updateBody: { status: "inactive" },
  },
  {
    list: "handleListGroups",
    create: "handleCreateGroup",
    get: "handleGetGroup",
    update: "handleUpdateGroup",
    path: "groups",
    param: "groupId",
    sampleId: "groups_1",
    createBody: { key: "g1", name: "Group", status: "active" },
    updateBody: { status: "inactive" },
  },
  {
    list: "handleListDimensions",
    create: "handleCreateDimension",
    get: "handleGetDimension",
    update: "handleUpdateDimension",
    path: "dimensions",
    param: "dimensionId",
    sampleId: "dimensions_1",
    createBody: { key: "region", name: "Region", dataType: "string", status: "active" },
    updateBody: { status: "inactive" },
  },
  {
    list: "handleListLabels",
    create: "handleCreateLabel",
    get: "handleGetLabel",
    update: "handleUpdateLabel",
    path: "labels",
    param: "labelId",
    sampleId: "labels_1",
    createBody: { key: "env", name: "Env", status: "active" },
    updateBody: { status: "inactive" },
  },
  {
    list: "handleListUnits",
    create: "handleCreateUnit",
    get: "handleGetUnit",
    update: "handleUpdateUnit",
    path: "units",
    param: "unitId",
    sampleId: "units_1",
    createBody: { key: "ms", name: "Milliseconds", status: "active" },
    updateBody: { status: "inactive" },
  },
  {
    list: "handleListFormulas",
    create: "handleCreateFormula",
    get: "handleGetFormula",
    update: "handleUpdateFormula",
    path: "formulas",
    param: "formulaId",
    sampleId: "formulas_1",
    createBody: { expression: "a + b", language: "expression", status: "draft" },
    updateBody: { status: "inactive" },
  },
  {
    list: "handleListAggregations",
    create: "handleCreateAggregation",
    get: "handleGetAggregation",
    update: "handleUpdateAggregation",
    path: "aggregations",
    param: "aggregationId",
    sampleId: "aggregations_1",
    createBody: { key: "avg", name: "Average", method: "avg", status: "active" },
    updateBody: { status: "inactive" },
  },
  {
    list: "handleListThresholds",
    create: "handleCreateThreshold",
    get: "handleGetThreshold",
    update: "handleUpdateThreshold",
    path: "thresholds",
    param: "thresholdId",
    sampleId: "thresholds_1",
    createBody: {
      metricId: "m_1",
      name: "High",
      operator: "gt",
      valueLabel: "100",
      severity: "warning",
      status: "active",
    },
    updateBody: { status: "inactive" },
  },
  {
    list: "handleListOwners",
    create: "handleCreateOwner",
    get: "handleGetOwner",
    update: "handleUpdateOwner",
    path: "owners",
    param: "ownerId",
    sampleId: "owners_1",
    createBody: {
      metricId: "m_1",
      ownerType: "team",
      ownerRef: "platform",
      status: "active",
    },
    updateBody: { status: "inactive" },
  },
  {
    list: "handleListConsumers",
    create: "handleCreateConsumer",
    get: "handleGetConsumer",
    update: "handleUpdateConsumer",
    path: "consumers",
    param: "consumerId",
    sampleId: "consumers_1",
    createBody: {
      metricId: "m_1",
      consumerType: "module",
      consumerRef: "reporting",
      status: "active",
    },
    updateBody: { status: "inactive" },
  },
  {
    list: "handleListRetentionPolicies",
    create: "handleCreateRetentionPolicy",
    get: "handleGetRetentionPolicy",
    update: "handleUpdateRetentionPolicy",
    path: "retention-policies",
    param: "retentionPolicyId",
    sampleId: "retention_policies_1",
    createBody: {
      key: "default",
      name: "Default",
      retentionDays: 90,
      status: "active",
    },
    updateBody: { status: "inactive" },
  },
  {
    list: "handleListClassifications",
    create: "handleCreateClassification",
    get: "handleGetClassification",
    update: "handleUpdateClassification",
    path: "classifications",
    param: "classificationId",
    sampleId: "classifications_1",
    createBody: {
      key: "ops",
      name: "Operational",
      level: "operational",
      status: "active",
    },
    updateBody: { status: "inactive" },
  },
  {
    list: "handleListDependencies",
    create: "handleCreateDependency",
    get: "handleGetDependency",
    update: "handleUpdateDependency",
    path: "dependencies",
    param: "dependencyId",
    sampleId: "dependencies_1",
    createBody: {
      metricId: "m_1",
      dependsOnMetricId: "m_2",
      dependencyKind: "uses",
      status: "active",
    },
    updateBody: { status: "inactive" },
  },
  {
    list: "handleListKPIs",
    create: "handleCreateKPI",
    get: "handleGetKPI",
    update: "handleUpdateKPI",
    path: "kpis",
    param: "kpiId",
    sampleId: "kpis_1",
    createBody: { key: "kpi1", name: "KPI One", metricId: "m_1", status: "active" },
    updateBody: { status: "inactive" },
  },
  {
    list: "handleListKPIGroups",
    create: "handleCreateKPIGroup",
    get: "handleGetKPIGroup",
    update: "handleUpdateKPIGroup",
    path: "kpi-groups",
    param: "kpiGroupId",
    sampleId: "kpi_groups_1",
    createBody: { key: "kg1", name: "KPI Group", status: "active" },
    updateBody: { status: "inactive" },
  },
  {
    list: "handleListKPITargets",
    create: "handleCreateKPITarget",
    get: "handleGetKPITarget",
    update: "handleUpdateKPITarget",
    path: "kpi-targets",
    param: "kpiTargetId",
    sampleId: "kpi_targets_1",
    createBody: {
      kpiId: "kpi_1",
      periodLabel: "2026-Q3",
      targetValueLabel: "99.9",
      status: "active",
    },
    updateBody: { status: "inactive" },
  },
  {
    list: "handleListRelationships",
    create: "handleCreateRelationship",
    get: "handleGetRelationship",
    update: "handleUpdateRelationship",
    path: "relationships",
    param: "relationshipId",
    sampleId: "relationships_1",
    createBody: {
      fromMetricId: "m_1",
      toMetricId: "m_2",
      relationshipKind: "correlates_with",
      status: "active",
    },
    updateBody: { status: "inactive" },
  },
  {
    list: "handleListMetadata",
    create: "handleCreateMetadata",
    get: "handleGetMetadata",
    update: "handleUpdateMetadata",
    path: "metadata",
    param: "metadataId",
    sampleId: "metadata_1",
    createBody: {
      subjectKind: "metric",
      subjectId: "m_1",
      key: "source",
      status: "active",
    },
    updateBody: { status: "inactive" },
  },
];

describe("APZMETRICS-003 full facet handler coverage", () => {
  afterEach(() => {
    resetPlatformApiGatewayBootstrap();
  });

  it("covers list/create/get/update for every metadata facet", async () => {
    installMockGateway();
    const ctx = makeContext();
    for (const facet of FACETS) {
      const listFn = handlers[facet.list] as (
        req: NextRequest,
        ctx: PlatformApiRequestContext,
      ) => Promise<Response>;
      const createFn = handlers[facet.create] as (
        req: NextRequest,
        ctx: PlatformApiRequestContext,
      ) => Promise<Response>;
      const getFn = handlers[facet.get] as (
        req: NextRequest,
        ctx: PlatformApiRequestContext,
        route?: { params: Promise<Record<string, string>> },
      ) => Promise<Response>;
      const updateFn = handlers[facet.update] as (
        req: NextRequest,
        ctx: PlatformApiRequestContext,
        route?: { params: Promise<Record<string, string>> },
      ) => Promise<Response>;

      const list = await listFn(
        makeRequest(`/api/v1/metrics/${facet.path}?limit=5`),
        ctx,
      );
      expect(list.status, facet.path).toBe(200);

      const created = await createFn(
        makeRequest(`/api/v1/metrics/${facet.path}`, {
          method: "POST",
          body: JSON.stringify(facet.createBody),
        }),
        ctx,
      );
      expect(created.status, facet.path).toBe(200);

      const got = await getFn(
        makeRequest(`/api/v1/metrics/${facet.path}/${facet.sampleId}`),
        ctx,
        p({ [facet.param]: facet.sampleId }),
      );
      expect(got.status, facet.path).toBe(200);

      const updated = await updateFn(
        makeRequest(`/api/v1/metrics/${facet.path}/${facet.sampleId}`, {
          method: "PATCH",
          body: JSON.stringify(facet.updateBody),
        }),
        ctx,
        p({ [facet.param]: facet.sampleId }),
      );
      expect(updated.status, facet.path).toBe(200);
    }
  });

  it("covers diagnostics aliases", async () => {
    installMockGateway();
    const ctx = makeContext();
    for (const name of [
      "handleGetMetricsDiagnosticsHealth",
      "handleGetMetricsDiagnosticsReadiness",
      "handleGetMetricsDiagnosticsCapabilities",
      "handleGetMetricsHealth",
      "handleGetMetricsReadiness",
      "handleGetMetricsCapabilities",
      "handleGetMetricsManagementDiagnostics",
    ] as const) {
      const fn = handlers[name];
      const res = await fn(makeRequest("/api/v1/metrics/diagnostics/health"), ctx);
      expect(res.status).toBe(200);
    }
  });
});
