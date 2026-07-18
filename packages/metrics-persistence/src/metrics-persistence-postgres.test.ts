/**
 * Mocked PostgreSQL repository coverage (APZMETRICS-001).
 */

import { describe, expect, it, vi } from "vitest";

import type { DatabaseExecutor } from "@apzhub/config";
import {
  asMetricId,
  asMetricDefinitionId,
  asMetricVersionId,
  asMetricCategoryId,
  asMetricGroupId,
  asMetricDimensionId,
  asMetricLabelId,
  asMetricUnitId,
  asMetricFormulaId,
  asMetricAggregationId,
  asMetricThresholdId,
  asMetricOwnerId,
  asMetricConsumerId,
  asMetricRetentionPolicyId,
  asMetricClassificationId,
  asMetricDependencyId,
  asKPIId,
  asKPIGroupId,
  asKPITargetId,
  asMetricRelationshipId,
  asMetricMetadataId,
  type KPI,
  type KPIGroup,
  type KPITarget,
  type Metric,
  type MetricAggregation,
  type MetricCategory,
  type MetricClassification,
  type MetricConsumer,
  type MetricDefinition,
  type MetricDependency,
  type MetricDimension,
  type MetricFormula,
  type MetricGroup,
  type MetricLabel,
  type MetricMetadata,
  type MetricOwner,
  type MetricRelationship,
  type MetricRetentionPolicy,
  type MetricThreshold,
  type MetricUnit,
  type MetricVersion,
  type MetricsRequestContext,
} from "@apzhub/metrics-contracts";

import {
  createMetricsPersistenceForTest,
  createPostgresMetricsRepositories,
  createProductionMetricsPersistence,
} from "./index";

const ctx: MetricsRequestContext = {
  tenantId: "tenant_a",
  userId: "user_1",
};

function auditFromRow(row: {
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  revision: number;
}) {
  return {
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
    revision: row.revision,
  };
}

function chainable(result: unknown[] = []) {
  const api: Record<string, unknown> = {};
  const self = () => api;
  api.from = vi.fn(self);
  api.where = vi.fn(self);
  api.limit = vi.fn(async () => result);
  api.orderBy = vi.fn(async () => result);
  api.set = vi.fn(self);
  api.then = (resolve: (v: unknown) => unknown) =>
    Promise.resolve(result).then(resolve);
  return api;
}

function createMockDb(selectResults: unknown[][] = [[]]) {
  let selectCall = 0;
  const values = vi.fn(async () => undefined);
  const insertBuilder = { values };
  const insertFn = vi.fn(() => insertBuilder);
  const update = vi.fn(() => chainable());
  const select = vi.fn(() => {
    const rows = selectResults[selectCall] ?? selectResults[0] ?? [];
    selectCall += 1;
    return chainable(rows as unknown[]);
  });

  const db = {
    insert: insertFn,
    update,
    select,
  } as unknown as DatabaseExecutor;

  return { db, insertFn, values, update, select };
}

describe("metrics-persistence postgres repositories", () => {
  it("maps all metrics entity rows through mocked drizzle executor", async () => {
    const now = new Date("2026-07-17T10:00:00.000Z");
    const metricsRow = {
      id: "metrics_pg",
      tenantId: "tenant_a",
      organisationId: "org_1",
      key: "k",
      name: "n",
      description: "d",
      categoryId: "cat1",
      groupId: null,
      classificationId: null,
      currentVersionId: null,
      ownerRef: "o",
      status: "active",
      metadata: { a: 1 },
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };
    const definitionsRow = {
      id: "definitions_pg",
      tenantId: "tenant_a",
      organisationId: "org_1",
      metricId: "m1",
      key: "k",
      name: "n",
      description: null,
      kind: "gauge",
      unitId: null,
      formulaId: null,
      aggregationId: null,
      versionNumber: 1,
      status: "active",
      metadata: { a: 1 },
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };
    const versionsRow = {
      id: "versions_pg",
      tenantId: "tenant_a",
      organisationId: "org_1",
      metricId: "m1",
      versionNumber: 1,
      status: "draft",
      changeSummary: "c",
      effectiveFrom: null,
      effectiveTo: null,
      metadata: { a: 1 },
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };
    const categoriesRow = {
      id: "categories_pg",
      tenantId: "tenant_a",
      organisationId: "org_1",
      key: "k",
      name: "n",
      description: null,
      parentCategoryId: null,
      status: "active",
      metadata: { a: 1 },
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };
    const groupsRow = {
      id: "groups_pg",
      tenantId: "tenant_a",
      organisationId: "org_1",
      key: "k",
      name: "n",
      description: null,
      categoryId: null,
      status: "active",
      metadata: { a: 1 },
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };
    const dimensionsRow = {
      id: "dimensions_pg",
      tenantId: "tenant_a",
      organisationId: "org_1",
      key: "k",
      name: "n",
      description: null,
      dataType: "string",
      metricId: null,
      status: "active",
      metadata: { a: 1 },
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };
    const labelsRow = {
      id: "labels_pg",
      tenantId: "tenant_a",
      organisationId: "org_1",
      key: "k",
      name: "n",
      description: null,
      metricId: null,
      status: "active",
      metadata: { a: 1 },
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };
    const unitsRow = {
      id: "units_pg",
      tenantId: "tenant_a",
      organisationId: "org_1",
      key: "k",
      name: "n",
      symbol: "%",
      quantityKind: "ratio",
      status: "active",
      metadata: { a: 1 },
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };
    const formulasRow = {
      id: "formulas_pg",
      tenantId: "tenant_a",
      organisationId: "org_1",
      metricId: "m1",
      expression: "a/b",
      description: null,
      language: "expression",
      status: "draft",
      metadata: { a: 1 },
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };
    const aggregationsRow = {
      id: "aggregations_pg",
      tenantId: "tenant_a",
      organisationId: "org_1",
      key: "k",
      name: "n",
      method: "avg",
      windowHint: "1h",
      status: "active",
      metadata: { a: 1 },
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };
    const thresholdsRow = {
      id: "thresholds_pg",
      tenantId: "tenant_a",
      organisationId: "org_1",
      metricId: "m1",
      name: "high",
      operator: "gt",
      valueLabel: "100",
      severity: "warning",
      status: "active",
      metadata: { a: 1 },
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };
    const ownersRow = {
      id: "owners_pg",
      tenantId: "tenant_a",
      organisationId: "org_1",
      metricId: "m1",
      ownerType: "team",
      ownerRef: "t1",
      displayName: "Team",
      status: "active",
      metadata: { a: 1 },
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };
    const consumersRow = {
      id: "consumers_pg",
      tenantId: "tenant_a",
      organisationId: "org_1",
      metricId: "m1",
      consumerType: "service",
      consumerRef: "s1",
      displayName: null,
      status: "active",
      metadata: { a: 1 },
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };
    const retentionPoliciesRow = {
      id: "retentionPolicies_pg",
      tenantId: "tenant_a",
      organisationId: "org_1",
      key: "k",
      name: "n",
      retentionDays: 90,
      metricId: null,
      status: "active",
      metadata: { a: 1 },
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };
    const classificationsRow = {
      id: "classifications_pg",
      tenantId: "tenant_a",
      organisationId: "org_1",
      key: "k",
      name: "n",
      level: "business",
      description: null,
      status: "active",
      metadata: { a: 1 },
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };
    const dependenciesRow = {
      id: "dependencies_pg",
      tenantId: "tenant_a",
      organisationId: "org_1",
      metricId: "m1",
      dependsOnMetricId: "m2",
      dependencyKind: "uses",
      status: "active",
      metadata: { a: 1 },
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };
    const kpisRow = {
      id: "kpis_pg",
      tenantId: "tenant_a",
      organisationId: "org_1",
      key: "k",
      name: "n",
      description: null,
      metricId: "m1",
      groupId: null,
      classificationId: null,
      status: "active",
      metadata: { a: 1 },
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };
    const kpiGroupsRow = {
      id: "kpiGroups_pg",
      tenantId: "tenant_a",
      organisationId: "org_1",
      key: "k",
      name: "n",
      description: null,
      status: "active",
      metadata: { a: 1 },
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };
    const kpiTargetsRow = {
      id: "kpiTargets_pg",
      tenantId: "tenant_a",
      organisationId: "org_1",
      kpiId: "kpi1",
      periodLabel: "Q1",
      targetValueLabel: "100",
      unitId: null,
      status: "active",
      metadata: { a: 1 },
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };
    const relationshipsRow = {
      id: "relationships_pg",
      tenantId: "tenant_a",
      organisationId: "org_1",
      fromMetricId: "m1",
      toMetricId: "m2",
      relationshipKind: "correlates_with",
      status: "active",
      metadata: { a: 1 },
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };
    const metadataRow = {
      id: "metadata_pg",
      tenantId: "tenant_a",
      organisationId: "org_1",
      subjectKind: "metric",
      subjectId: "m1",
      key: "k",
      valueLabel: "v",
      status: "active",
      metadata: { a: 1 },
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };

    const selectResults = [
      [metricsRow],
      [metricsRow],
      [definitionsRow],
      [definitionsRow],
      [versionsRow],
      [versionsRow],
      [categoriesRow],
      [categoriesRow],
      [groupsRow],
      [groupsRow],
      [dimensionsRow],
      [dimensionsRow],
      [labelsRow],
      [labelsRow],
      [unitsRow],
      [unitsRow],
      [formulasRow],
      [formulasRow],
      [aggregationsRow],
      [aggregationsRow],
      [thresholdsRow],
      [thresholdsRow],
      [ownersRow],
      [ownersRow],
      [consumersRow],
      [consumersRow],
      [retentionPoliciesRow],
      [retentionPoliciesRow],
      [classificationsRow],
      [classificationsRow],
      [dependenciesRow],
      [dependenciesRow],
      [kpisRow],
      [kpisRow],
      [kpiGroupsRow],
      [kpiGroupsRow],
      [kpiTargetsRow],
      [kpiTargetsRow],
      [relationshipsRow],
      [relationshipsRow],
      [metadataRow],
      [metadataRow],
    ];

    const { db, insertFn, values, update } = createMockDb(selectResults);
    const repos = createPostgresMetricsRepositories(db);

    const metricsEntity: Metric = {
      id: asMetricId(metricsRow.id),
      tenantId: metricsRow.tenantId,
      organisationId: metricsRow.organisationId,
      key: metricsRow.key,
      name: metricsRow.name,
      description: metricsRow.description ?? undefined,
      categoryId: asMetricCategoryId(metricsRow.categoryId),
      ownerRef: metricsRow.ownerRef,
      status: "active",
      metadata: metricsRow.metadata,
      ...auditFromRow(metricsRow),
    };
    await repos.metrics.create(ctx, metricsEntity);
    expect(await repos.metrics.get(ctx, asMetricId("metrics_pg"))).toMatchObject({
      id: "metrics_pg",
      tenantId: "tenant_a",
    });
    expect(await repos.metrics.list(ctx)).toHaveLength(1);
    await repos.metrics.update(ctx, { ...metricsEntity, revision: 2 });

    const definitionsEntity: MetricDefinition = {
      id: asMetricDefinitionId(definitionsRow.id),
      tenantId: definitionsRow.tenantId,
      organisationId: definitionsRow.organisationId,
      metricId: asMetricId(definitionsRow.metricId),
      key: definitionsRow.key,
      name: definitionsRow.name,
      kind: "gauge",
      versionNumber: definitionsRow.versionNumber,
      status: "active",
      metadata: definitionsRow.metadata,
      ...auditFromRow(definitionsRow),
    };
    await repos.definitions.create(ctx, definitionsEntity);
    expect(
      await repos.definitions.get(ctx, asMetricDefinitionId("definitions_pg")),
    ).toMatchObject({
      id: "definitions_pg",
      tenantId: "tenant_a",
    });
    expect(await repos.definitions.list(ctx)).toHaveLength(1);
    await repos.definitions.update(ctx, { ...definitionsEntity, revision: 2 });

    const versionsEntity: MetricVersion = {
      id: asMetricVersionId(versionsRow.id),
      tenantId: versionsRow.tenantId,
      organisationId: versionsRow.organisationId,
      metricId: asMetricId(versionsRow.metricId),
      versionNumber: versionsRow.versionNumber,
      status: "draft",
      changeSummary: versionsRow.changeSummary ?? undefined,
      metadata: versionsRow.metadata,
      ...auditFromRow(versionsRow),
    };
    await repos.versions.create(ctx, versionsEntity);
    expect(
      await repos.versions.get(ctx, asMetricVersionId("versions_pg")),
    ).toMatchObject({
      id: "versions_pg",
      tenantId: "tenant_a",
    });
    expect(await repos.versions.list(ctx)).toHaveLength(1);
    await repos.versions.update(ctx, { ...versionsEntity, revision: 2 });

    const categoriesEntity: MetricCategory = {
      id: asMetricCategoryId(categoriesRow.id),
      tenantId: categoriesRow.tenantId,
      organisationId: categoriesRow.organisationId,
      key: categoriesRow.key,
      name: categoriesRow.name,
      status: "active",
      metadata: categoriesRow.metadata,
      ...auditFromRow(categoriesRow),
    };
    await repos.categories.create(ctx, categoriesEntity);
    expect(
      await repos.categories.get(ctx, asMetricCategoryId("categories_pg")),
    ).toMatchObject({
      id: "categories_pg",
      tenantId: "tenant_a",
    });
    expect(await repos.categories.list(ctx)).toHaveLength(1);
    await repos.categories.update(ctx, { ...categoriesEntity, revision: 2 });

    const groupsEntity: MetricGroup = {
      id: asMetricGroupId(groupsRow.id),
      tenantId: groupsRow.tenantId,
      organisationId: groupsRow.organisationId,
      key: groupsRow.key,
      name: groupsRow.name,
      status: "active",
      metadata: groupsRow.metadata,
      ...auditFromRow(groupsRow),
    };
    await repos.groups.create(ctx, groupsEntity);
    expect(await repos.groups.get(ctx, asMetricGroupId("groups_pg"))).toMatchObject({
      id: "groups_pg",
      tenantId: "tenant_a",
    });
    expect(await repos.groups.list(ctx)).toHaveLength(1);
    await repos.groups.update(ctx, { ...groupsEntity, revision: 2 });

    const dimensionsEntity: MetricDimension = {
      id: asMetricDimensionId(dimensionsRow.id),
      tenantId: dimensionsRow.tenantId,
      organisationId: dimensionsRow.organisationId,
      key: dimensionsRow.key,
      name: dimensionsRow.name,
      dataType: "string",
      status: "active",
      metadata: dimensionsRow.metadata,
      ...auditFromRow(dimensionsRow),
    };
    await repos.dimensions.create(ctx, dimensionsEntity);
    expect(
      await repos.dimensions.get(ctx, asMetricDimensionId("dimensions_pg")),
    ).toMatchObject({
      id: "dimensions_pg",
      tenantId: "tenant_a",
    });
    expect(await repos.dimensions.list(ctx)).toHaveLength(1);
    await repos.dimensions.update(ctx, { ...dimensionsEntity, revision: 2 });

    const labelsEntity: MetricLabel = {
      id: asMetricLabelId(labelsRow.id),
      tenantId: labelsRow.tenantId,
      organisationId: labelsRow.organisationId,
      key: labelsRow.key,
      name: labelsRow.name,
      status: "active",
      metadata: labelsRow.metadata,
      ...auditFromRow(labelsRow),
    };
    await repos.labels.create(ctx, labelsEntity);
    expect(await repos.labels.get(ctx, asMetricLabelId("labels_pg"))).toMatchObject({
      id: "labels_pg",
      tenantId: "tenant_a",
    });
    expect(await repos.labels.list(ctx)).toHaveLength(1);
    await repos.labels.update(ctx, { ...labelsEntity, revision: 2 });

    const unitsEntity: MetricUnit = {
      id: asMetricUnitId(unitsRow.id),
      tenantId: unitsRow.tenantId,
      organisationId: unitsRow.organisationId,
      key: unitsRow.key,
      name: unitsRow.name,
      symbol: unitsRow.symbol,
      quantityKind: unitsRow.quantityKind,
      status: "active",
      metadata: unitsRow.metadata,
      ...auditFromRow(unitsRow),
    };
    await repos.units.create(ctx, unitsEntity);
    expect(await repos.units.get(ctx, asMetricUnitId("units_pg"))).toMatchObject({
      id: "units_pg",
      tenantId: "tenant_a",
    });
    expect(await repos.units.list(ctx)).toHaveLength(1);
    await repos.units.update(ctx, { ...unitsEntity, revision: 2 });

    const formulasEntity: MetricFormula = {
      id: asMetricFormulaId(formulasRow.id),
      tenantId: formulasRow.tenantId,
      organisationId: formulasRow.organisationId,
      metricId: asMetricId(formulasRow.metricId),
      expression: formulasRow.expression,
      language: "expression",
      status: "draft",
      metadata: formulasRow.metadata,
      ...auditFromRow(formulasRow),
    };
    await repos.formulas.create(ctx, formulasEntity);
    expect(
      await repos.formulas.get(ctx, asMetricFormulaId("formulas_pg")),
    ).toMatchObject({
      id: "formulas_pg",
      tenantId: "tenant_a",
    });
    expect(await repos.formulas.list(ctx)).toHaveLength(1);
    await repos.formulas.update(ctx, { ...formulasEntity, revision: 2 });

    const aggregationsEntity: MetricAggregation = {
      id: asMetricAggregationId(aggregationsRow.id),
      tenantId: aggregationsRow.tenantId,
      organisationId: aggregationsRow.organisationId,
      key: aggregationsRow.key,
      name: aggregationsRow.name,
      method: "avg",
      windowHint: aggregationsRow.windowHint,
      status: "active",
      metadata: aggregationsRow.metadata,
      ...auditFromRow(aggregationsRow),
    };
    await repos.aggregations.create(ctx, aggregationsEntity);
    expect(
      await repos.aggregations.get(ctx, asMetricAggregationId("aggregations_pg")),
    ).toMatchObject({
      id: "aggregations_pg",
      tenantId: "tenant_a",
    });
    expect(await repos.aggregations.list(ctx)).toHaveLength(1);
    await repos.aggregations.update(ctx, { ...aggregationsEntity, revision: 2 });

    const thresholdsEntity: MetricThreshold = {
      id: asMetricThresholdId(thresholdsRow.id),
      tenantId: thresholdsRow.tenantId,
      organisationId: thresholdsRow.organisationId,
      metricId: asMetricId(thresholdsRow.metricId),
      name: thresholdsRow.name,
      operator: "gt",
      valueLabel: thresholdsRow.valueLabel,
      severity: "warning",
      status: "active",
      metadata: thresholdsRow.metadata,
      ...auditFromRow(thresholdsRow),
    };
    await repos.thresholds.create(ctx, thresholdsEntity);
    expect(
      await repos.thresholds.get(ctx, asMetricThresholdId("thresholds_pg")),
    ).toMatchObject({
      id: "thresholds_pg",
      tenantId: "tenant_a",
    });
    expect(await repos.thresholds.list(ctx)).toHaveLength(1);
    await repos.thresholds.update(ctx, { ...thresholdsEntity, revision: 2 });

    const ownersEntity: MetricOwner = {
      id: asMetricOwnerId(ownersRow.id),
      tenantId: ownersRow.tenantId,
      organisationId: ownersRow.organisationId,
      metricId: asMetricId(ownersRow.metricId),
      ownerType: "team",
      ownerRef: ownersRow.ownerRef,
      displayName: ownersRow.displayName,
      status: "active",
      metadata: ownersRow.metadata,
      ...auditFromRow(ownersRow),
    };
    await repos.owners.create(ctx, ownersEntity);
    expect(await repos.owners.get(ctx, asMetricOwnerId("owners_pg"))).toMatchObject({
      id: "owners_pg",
      tenantId: "tenant_a",
    });
    expect(await repos.owners.list(ctx)).toHaveLength(1);
    await repos.owners.update(ctx, { ...ownersEntity, revision: 2 });

    const consumersEntity: MetricConsumer = {
      id: asMetricConsumerId(consumersRow.id),
      tenantId: consumersRow.tenantId,
      organisationId: consumersRow.organisationId,
      metricId: asMetricId(consumersRow.metricId),
      consumerType: "service",
      consumerRef: consumersRow.consumerRef,
      status: "active",
      metadata: consumersRow.metadata,
      ...auditFromRow(consumersRow),
    };
    await repos.consumers.create(ctx, consumersEntity);
    expect(
      await repos.consumers.get(ctx, asMetricConsumerId("consumers_pg")),
    ).toMatchObject({
      id: "consumers_pg",
      tenantId: "tenant_a",
    });
    expect(await repos.consumers.list(ctx)).toHaveLength(1);
    await repos.consumers.update(ctx, { ...consumersEntity, revision: 2 });

    const retentionPoliciesEntity: MetricRetentionPolicy = {
      id: asMetricRetentionPolicyId(retentionPoliciesRow.id),
      tenantId: retentionPoliciesRow.tenantId,
      organisationId: retentionPoliciesRow.organisationId,
      key: retentionPoliciesRow.key,
      name: retentionPoliciesRow.name,
      retentionDays: retentionPoliciesRow.retentionDays,
      status: "active",
      metadata: retentionPoliciesRow.metadata,
      ...auditFromRow(retentionPoliciesRow),
    };
    await repos.retentionPolicies.create(ctx, retentionPoliciesEntity);
    expect(
      await repos.retentionPolicies.get(
        ctx,
        asMetricRetentionPolicyId("retentionPolicies_pg"),
      ),
    ).toMatchObject({
      id: "retentionPolicies_pg",
      tenantId: "tenant_a",
    });
    expect(await repos.retentionPolicies.list(ctx)).toHaveLength(1);
    await repos.retentionPolicies.update(ctx, {
      ...retentionPoliciesEntity,
      revision: 2,
    });

    const classificationsEntity: MetricClassification = {
      id: asMetricClassificationId(classificationsRow.id),
      tenantId: classificationsRow.tenantId,
      organisationId: classificationsRow.organisationId,
      key: classificationsRow.key,
      name: classificationsRow.name,
      level: "business",
      status: "active",
      metadata: classificationsRow.metadata,
      ...auditFromRow(classificationsRow),
    };
    await repos.classifications.create(ctx, classificationsEntity);
    expect(
      await repos.classifications.get(
        ctx,
        asMetricClassificationId("classifications_pg"),
      ),
    ).toMatchObject({
      id: "classifications_pg",
      tenantId: "tenant_a",
    });
    expect(await repos.classifications.list(ctx)).toHaveLength(1);
    await repos.classifications.update(ctx, {
      ...classificationsEntity,
      revision: 2,
    });

    const dependenciesEntity: MetricDependency = {
      id: asMetricDependencyId(dependenciesRow.id),
      tenantId: dependenciesRow.tenantId,
      organisationId: dependenciesRow.organisationId,
      metricId: asMetricId(dependenciesRow.metricId),
      dependsOnMetricId: asMetricId(dependenciesRow.dependsOnMetricId),
      dependencyKind: "uses",
      status: "active",
      metadata: dependenciesRow.metadata,
      ...auditFromRow(dependenciesRow),
    };
    await repos.dependencies.create(ctx, dependenciesEntity);
    expect(
      await repos.dependencies.get(ctx, asMetricDependencyId("dependencies_pg")),
    ).toMatchObject({
      id: "dependencies_pg",
      tenantId: "tenant_a",
    });
    expect(await repos.dependencies.list(ctx)).toHaveLength(1);
    await repos.dependencies.update(ctx, { ...dependenciesEntity, revision: 2 });

    const kpisEntity: KPI = {
      id: asKPIId(kpisRow.id),
      tenantId: kpisRow.tenantId,
      organisationId: kpisRow.organisationId,
      key: kpisRow.key,
      name: kpisRow.name,
      metricId: asMetricId(kpisRow.metricId),
      status: "active",
      metadata: kpisRow.metadata,
      ...auditFromRow(kpisRow),
    };
    await repos.kpis.create(ctx, kpisEntity);
    expect(await repos.kpis.get(ctx, asKPIId("kpis_pg"))).toMatchObject({
      id: "kpis_pg",
      tenantId: "tenant_a",
    });
    expect(await repos.kpis.list(ctx)).toHaveLength(1);
    await repos.kpis.update(ctx, { ...kpisEntity, revision: 2 });

    const kpiGroupsEntity: KPIGroup = {
      id: asKPIGroupId(kpiGroupsRow.id),
      tenantId: kpiGroupsRow.tenantId,
      organisationId: kpiGroupsRow.organisationId,
      key: kpiGroupsRow.key,
      name: kpiGroupsRow.name,
      status: "active",
      metadata: kpiGroupsRow.metadata,
      ...auditFromRow(kpiGroupsRow),
    };
    await repos.kpiGroups.create(ctx, kpiGroupsEntity);
    expect(await repos.kpiGroups.get(ctx, asKPIGroupId("kpiGroups_pg"))).toMatchObject({
      id: "kpiGroups_pg",
      tenantId: "tenant_a",
    });
    expect(await repos.kpiGroups.list(ctx)).toHaveLength(1);
    await repos.kpiGroups.update(ctx, { ...kpiGroupsEntity, revision: 2 });

    const kpiTargetsEntity: KPITarget = {
      id: asKPITargetId(kpiTargetsRow.id),
      tenantId: kpiTargetsRow.tenantId,
      organisationId: kpiTargetsRow.organisationId,
      kpiId: asKPIId(kpiTargetsRow.kpiId),
      periodLabel: kpiTargetsRow.periodLabel,
      targetValueLabel: kpiTargetsRow.targetValueLabel,
      status: "active",
      metadata: kpiTargetsRow.metadata,
      ...auditFromRow(kpiTargetsRow),
    };
    await repos.kpiTargets.create(ctx, kpiTargetsEntity);
    expect(
      await repos.kpiTargets.get(ctx, asKPITargetId("kpiTargets_pg")),
    ).toMatchObject({
      id: "kpiTargets_pg",
      tenantId: "tenant_a",
    });
    expect(await repos.kpiTargets.list(ctx)).toHaveLength(1);
    await repos.kpiTargets.update(ctx, { ...kpiTargetsEntity, revision: 2 });

    const relationshipsEntity: MetricRelationship = {
      id: asMetricRelationshipId(relationshipsRow.id),
      tenantId: relationshipsRow.tenantId,
      organisationId: relationshipsRow.organisationId,
      fromMetricId: asMetricId(relationshipsRow.fromMetricId),
      toMetricId: asMetricId(relationshipsRow.toMetricId),
      relationshipKind: "correlates_with",
      status: "active",
      metadata: relationshipsRow.metadata,
      ...auditFromRow(relationshipsRow),
    };
    await repos.relationships.create(ctx, relationshipsEntity);
    expect(
      await repos.relationships.get(ctx, asMetricRelationshipId("relationships_pg")),
    ).toMatchObject({
      id: "relationships_pg",
      tenantId: "tenant_a",
    });
    expect(await repos.relationships.list(ctx)).toHaveLength(1);
    await repos.relationships.update(ctx, { ...relationshipsEntity, revision: 2 });

    const metadataEntity: MetricMetadata = {
      id: asMetricMetadataId(metadataRow.id),
      tenantId: metadataRow.tenantId,
      organisationId: metadataRow.organisationId,
      subjectKind: metadataRow.subjectKind,
      subjectId: metadataRow.subjectId,
      key: metadataRow.key,
      valueLabel: metadataRow.valueLabel,
      status: "active",
      metadata: metadataRow.metadata,
      ...auditFromRow(metadataRow),
    };
    await repos.metadata.create(ctx, metadataEntity);
    expect(
      await repos.metadata.get(ctx, asMetricMetadataId("metadata_pg")),
    ).toMatchObject({
      id: "metadata_pg",
      tenantId: "tenant_a",
    });
    expect(await repos.metadata.list(ctx)).toHaveLength(1);
    await repos.metadata.update(ctx, { ...metadataEntity, revision: 2 });

    expect(insertFn).toHaveBeenCalled();
    expect(values).toHaveBeenCalled();
    expect(update).toHaveBeenCalled();
  });

  it("wires production helper and test helper to postgres when db provided", () => {
    const { db } = createMockDb([[]]);
    expect(createProductionMetricsPersistence({ db })).toBeTruthy();
    expect(createMetricsPersistenceForTest({ postgresDb: db })).toBeTruthy();
  });

  it("returns null for missing get rows", async () => {
    const { db } = createMockDb([[]]);
    const repos = createPostgresMetricsRepositories(db);
    expect(await repos.metrics.get(ctx, asMetricId("missing"))).toBeNull();
  });
});
