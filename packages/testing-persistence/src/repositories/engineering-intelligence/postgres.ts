import {
  testingEngineeringBaseline,
  testingEngineeringBenchmark,
  testingEngineeringHistoricalSnapshot,
  testingEngineeringQualitySummary,
  testingEngineeringSnapshot,
  testingEngineeringTrendSeries,
  type DatabaseExecutor,
} from "@apzhub/config";

import { assertRequiredString } from "../../validation/persistence-validation";
import type {
  CrudRepository,
  EngineeringBaselineCreate,
  EngineeringBaselineUpdate,
  EngineeringBenchmarkCreate,
  EngineeringBenchmarkUpdate,
  EngineeringHistoricalSnapshotCreate,
  EngineeringHistoricalSnapshotUpdate,
  EngineeringQualitySummaryCreate,
  EngineeringQualitySummaryUpdate,
  EngineeringSnapshotCreate,
  EngineeringSnapshotUpdate,
  EngineeringTrendSeriesCreate,
  EngineeringTrendSeriesUpdate,
} from "../interfaces";
import type {
  EngineeringBaselineRecord,
  EngineeringBenchmarkRecord,
  EngineeringHistoricalSnapshotRecord,
  EngineeringQualitySummaryRecord,
  EngineeringSnapshotRecord,
  EngineeringTrendSeriesRecord,
} from "../records";
import {
  dateFromIso,
  isoFromDate,
  metaFromRow,
} from "../mappers/row-mappers";
import { baseMeta } from "../in-memory/generic-crud";
import {
  createPostgresCrudRepository,
  type PostgresCrudTable,
} from "../postgres/generic-crud";

function asTable(table: unknown): PostgresCrudTable {
  return table as PostgresCrudTable;
}

function assertHistoricalImmutable(): never {
  throw new Error("Historical snapshots are immutable");
}

function metaFields(record: {
  id: string;
  tenantId: string;
  organisationId?: string;
  revision: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  archivedAt?: string;
}) {
  return {
    id: record.id,
    tenantId: record.tenantId,
    organisationId: record.organisationId ?? null,
    revision: record.revision,
    createdAt: dateFromIso(record.createdAt) ?? new Date(),
    updatedAt: dateFromIso(record.updatedAt) ?? new Date(),
    createdBy: record.createdBy ?? null,
    updatedBy: record.updatedBy ?? null,
    archivedAt: dateFromIso(record.archivedAt),
  };
}

function engineeringSnapshotToRow(record: EngineeringSnapshotRecord) {
  return {
    ...metaFields(record),
    scope: { ...record.scope },
    qualityScoreJson: { ...record.qualityScoreJson },
    healthJson: { ...record.healthJson },
    riskJson: { ...record.riskJson },
    indicatorsJson: [...record.indicatorsJson],
    trendsJson: [...record.trendsJson],
    computedAt: dateFromIso(record.computedAt) ?? new Date(),
    label: record.label ?? null,
  };
}

function rowToEngineeringSnapshot(
  row: Record<string, unknown>,
): EngineeringSnapshotRecord {
  const meta = metaFromRow(row as never);
  return {
    ...meta,
    scope: (row.scope as Record<string, unknown> | null) ?? {},
    qualityScoreJson:
      (row.qualityScoreJson as Record<string, unknown> | null) ?? {},
    healthJson: (row.healthJson as Record<string, unknown> | null) ?? {},
    riskJson: (row.riskJson as Record<string, unknown> | null) ?? {},
    indicatorsJson: Array.isArray(row.indicatorsJson)
      ? (row.indicatorsJson as unknown[])
      : [],
    trendsJson: Array.isArray(row.trendsJson)
      ? (row.trendsJson as unknown[])
      : [],
    computedAt: isoFromDate(row.computedAt as Date)!,
    label: (row.label as string | null) ?? undefined,
  };
}

function engineeringHistoricalSnapshotToRow(
  record: EngineeringHistoricalSnapshotRecord,
) {
  return {
    ...metaFields(record),
    scope: { ...record.scope },
    periodJson: { ...record.periodJson },
    qualityScore: record.qualityScore,
    engineeringHealthScore: record.engineeringHealthScore,
    indicatorsJson: [...record.indicatorsJson],
    metricsJson: { ...record.metricsJson },
    sourceRefsJson: { ...record.sourceRefsJson },
    computedAt: dateFromIso(record.computedAt) ?? new Date(),
    immutable: true,
  };
}

function rowToEngineeringHistoricalSnapshot(
  row: Record<string, unknown>,
): EngineeringHistoricalSnapshotRecord {
  const meta = metaFromRow(row as never);
  return {
    ...meta,
    scope: (row.scope as Record<string, unknown> | null) ?? {},
    periodJson: (row.periodJson as Record<string, unknown> | null) ?? {},
    qualityScore: Number(row.qualityScore ?? 0),
    engineeringHealthScore: Number(row.engineeringHealthScore ?? 0),
    indicatorsJson: Array.isArray(row.indicatorsJson)
      ? (row.indicatorsJson as unknown[])
      : [],
    metricsJson: (row.metricsJson as Record<string, unknown> | null) ?? {},
    sourceRefsJson: (row.sourceRefsJson as Record<string, unknown> | null) ?? {},
    computedAt: isoFromDate(row.computedAt as Date)!,
    immutable: true,
  };
}

function engineeringTrendSeriesToRow(record: EngineeringTrendSeriesRecord) {
  return {
    ...metaFields(record),
    kind: record.kind,
    scope: { ...record.scope },
    periodKind: record.periodKind,
    pointsJson: [...record.pointsJson],
    direction: record.direction,
    delta: record.delta,
    computedAt: dateFromIso(record.computedAt) ?? new Date(),
  };
}

function rowToEngineeringTrendSeries(
  row: Record<string, unknown>,
): EngineeringTrendSeriesRecord {
  const meta = metaFromRow(row as never);
  return {
    ...meta,
    kind: String(row.kind ?? ""),
    scope: (row.scope as Record<string, unknown> | null) ?? {},
    periodKind: String(row.periodKind ?? ""),
    pointsJson: Array.isArray(row.pointsJson)
      ? (row.pointsJson as unknown[])
      : [],
    direction: String(row.direction ?? ""),
    delta: Number(row.delta ?? 0),
    computedAt: isoFromDate(row.computedAt as Date)!,
  };
}

function engineeringBenchmarkToRow(record: EngineeringBenchmarkRecord) {
  return {
    ...metaFields(record),
    scope: { ...record.scope },
    metricKey: record.metricKey,
    comparisonJson: { ...record.comparisonJson },
    computedAt: dateFromIso(record.computedAt) ?? new Date(),
    label: record.label ?? null,
  };
}

function rowToEngineeringBenchmark(
  row: Record<string, unknown>,
): EngineeringBenchmarkRecord {
  const meta = metaFromRow(row as never);
  return {
    ...meta,
    scope: (row.scope as Record<string, unknown> | null) ?? {},
    metricKey: String(row.metricKey ?? ""),
    comparisonJson: (row.comparisonJson as Record<string, unknown> | null) ?? {},
    computedAt: isoFromDate(row.computedAt as Date)!,
    label: (row.label as string | null) ?? undefined,
  };
}

function engineeringBaselineToRow(record: EngineeringBaselineRecord) {
  return {
    ...metaFields(record),
    scope: { ...record.scope },
    kind: record.kind,
    metricKey: record.metricKey,
    value: record.value,
    sourceSnapshotId: record.sourceSnapshotId ?? null,
    periodJson: record.periodJson ? { ...record.periodJson } : null,
    computedAt: dateFromIso(record.computedAt) ?? new Date(),
    label: record.label ?? null,
  };
}

function rowToEngineeringBaseline(
  row: Record<string, unknown>,
): EngineeringBaselineRecord {
  const meta = metaFromRow(row as never);
  return {
    ...meta,
    scope: (row.scope as Record<string, unknown> | null) ?? {},
    kind: String(row.kind ?? ""),
    metricKey: String(row.metricKey ?? ""),
    value: Number(row.value ?? 0),
    sourceSnapshotId: (row.sourceSnapshotId as string | null) ?? undefined,
    periodJson: (row.periodJson as Record<string, unknown> | null) ?? undefined,
    computedAt: isoFromDate(row.computedAt as Date)!,
    label: (row.label as string | null) ?? undefined,
  };
}

function engineeringQualitySummaryToRow(
  record: EngineeringQualitySummaryRecord,
) {
  return {
    ...metaFields(record),
    scope: { ...record.scope },
    qualityScoreJson: { ...record.qualityScoreJson },
    indicatorsJson: [...record.indicatorsJson],
    computedAt: dateFromIso(record.computedAt) ?? new Date(),
  };
}

function rowToEngineeringQualitySummary(
  row: Record<string, unknown>,
): EngineeringQualitySummaryRecord {
  const meta = metaFromRow(row as never);
  return {
    ...meta,
    scope: (row.scope as Record<string, unknown> | null) ?? {},
    qualityScoreJson:
      (row.qualityScoreJson as Record<string, unknown> | null) ?? {},
    indicatorsJson: Array.isArray(row.indicatorsJson)
      ? (row.indicatorsJson as unknown[])
      : [],
    computedAt: isoFromDate(row.computedAt as Date)!,
  };
}

export function createPostgresEngineeringRepos(db: DatabaseExecutor): {
  engineeringSnapshots: CrudRepository<
    EngineeringSnapshotCreate,
    EngineeringSnapshotUpdate,
    EngineeringSnapshotRecord
  >;
  engineeringHistoricalSnapshots: CrudRepository<
    EngineeringHistoricalSnapshotCreate,
    EngineeringHistoricalSnapshotUpdate,
    EngineeringHistoricalSnapshotRecord
  >;
  engineeringTrendSeries: CrudRepository<
    EngineeringTrendSeriesCreate,
    EngineeringTrendSeriesUpdate,
    EngineeringTrendSeriesRecord
  >;
  engineeringBenchmarks: CrudRepository<
    EngineeringBenchmarkCreate,
    EngineeringBenchmarkUpdate,
    EngineeringBenchmarkRecord
  >;
  engineeringBaselines: CrudRepository<
    EngineeringBaselineCreate,
    EngineeringBaselineUpdate,
    EngineeringBaselineRecord
  >;
  engineeringQualitySummaries: CrudRepository<
    EngineeringQualitySummaryCreate,
    EngineeringQualitySummaryUpdate,
    EngineeringQualitySummaryRecord
  >;
} {
  return {
    engineeringSnapshots: createPostgresCrudRepository<
      EngineeringSnapshotCreate,
      EngineeringSnapshotUpdate,
      EngineeringSnapshotRecord
    >({
      kind: "engineering_snapshot",
      db,
      table: asTable(testingEngineeringSnapshot),
      searchFields: ["label"],
      validateCreate: (input) => {
        assertRequiredString(String(input.computedAt ?? ""), "computedAt");
      },
      toRecord: (ctx, input, existing) => {
        const meta = baseMeta(
          ctx,
          input as { id?: string; organisationId?: string },
          existing,
        );
        const data = input as Partial<EngineeringSnapshotRecord>;
        return {
          ...meta,
          scope: data.scope ?? existing?.scope ?? {},
          qualityScoreJson:
            data.qualityScoreJson ?? existing?.qualityScoreJson ?? {},
          healthJson: data.healthJson ?? existing?.healthJson ?? {},
          riskJson: data.riskJson ?? existing?.riskJson ?? {},
          indicatorsJson: data.indicatorsJson ?? existing?.indicatorsJson ?? [],
          trendsJson: data.trendsJson ?? existing?.trendsJson ?? [],
          computedAt: String(
            data.computedAt ?? existing?.computedAt ?? new Date().toISOString(),
          ),
          label: data.label ?? existing?.label,
        };
      },
      toRow: (record) => engineeringSnapshotToRow(record),
      rowToRecord: (row) => rowToEngineeringSnapshot(row as never),
    }),

    engineeringHistoricalSnapshots: createPostgresCrudRepository<
      EngineeringHistoricalSnapshotCreate,
      EngineeringHistoricalSnapshotUpdate,
      EngineeringHistoricalSnapshotRecord
    >({
      kind: "engineering_historical_snapshot",
      db,
      table: asTable(testingEngineeringHistoricalSnapshot),
      searchFields: [],
      validateCreate: (input) => {
        assertRequiredString(String(input.computedAt ?? ""), "computedAt");
      },
      validateUpdate: () => {
        assertHistoricalImmutable();
      },
      toRecord: (ctx, input, existing) => {
        const meta = baseMeta(
          ctx,
          input as { id?: string; organisationId?: string },
          existing,
        );
        const data = input as Partial<EngineeringHistoricalSnapshotRecord>;
        return {
          ...meta,
          scope: data.scope ?? existing?.scope ?? {},
          periodJson: data.periodJson ?? existing?.periodJson ?? {},
          qualityScore: Number(data.qualityScore ?? existing?.qualityScore ?? 0),
          engineeringHealthScore: Number(
            data.engineeringHealthScore ??
              existing?.engineeringHealthScore ??
              0,
          ),
          indicatorsJson: data.indicatorsJson ?? existing?.indicatorsJson ?? [],
          metricsJson: data.metricsJson ?? existing?.metricsJson ?? {},
          sourceRefsJson: data.sourceRefsJson ?? existing?.sourceRefsJson ?? {},
          computedAt: String(
            data.computedAt ?? existing?.computedAt ?? new Date().toISOString(),
          ),
          immutable: true,
        };
      },
      toRow: (record) => engineeringHistoricalSnapshotToRow(record),
      rowToRecord: (row) => rowToEngineeringHistoricalSnapshot(row as never),
    }),

    engineeringTrendSeries: createPostgresCrudRepository<
      EngineeringTrendSeriesCreate,
      EngineeringTrendSeriesUpdate,
      EngineeringTrendSeriesRecord
    >({
      kind: "engineering_trend_series",
      db,
      table: asTable(testingEngineeringTrendSeries),
      searchFields: ["kind", "periodKind", "direction"],
      validateCreate: (input) => {
        assertRequiredString(String(input.kind ?? ""), "kind");
        assertRequiredString(String(input.periodKind ?? ""), "periodKind");
        assertRequiredString(String(input.direction ?? ""), "direction");
        assertRequiredString(String(input.computedAt ?? ""), "computedAt");
      },
      toRecord: (ctx, input, existing) => {
        const meta = baseMeta(
          ctx,
          input as { id?: string; organisationId?: string },
          existing,
        );
        const data = input as Partial<EngineeringTrendSeriesRecord>;
        return {
          ...meta,
          kind: String(data.kind ?? existing?.kind ?? ""),
          scope: data.scope ?? existing?.scope ?? {},
          periodKind: String(data.periodKind ?? existing?.periodKind ?? ""),
          pointsJson: data.pointsJson ?? existing?.pointsJson ?? [],
          direction: String(data.direction ?? existing?.direction ?? ""),
          delta: Number(data.delta ?? existing?.delta ?? 0),
          computedAt: String(
            data.computedAt ?? existing?.computedAt ?? new Date().toISOString(),
          ),
        };
      },
      toRow: (record) => engineeringTrendSeriesToRow(record),
      rowToRecord: (row) => rowToEngineeringTrendSeries(row as never),
    }),

    engineeringBenchmarks: createPostgresCrudRepository<
      EngineeringBenchmarkCreate,
      EngineeringBenchmarkUpdate,
      EngineeringBenchmarkRecord
    >({
      kind: "engineering_benchmark",
      db,
      table: asTable(testingEngineeringBenchmark),
      searchFields: ["metricKey", "label"],
      validateCreate: (input) => {
        assertRequiredString(String(input.metricKey ?? ""), "metricKey");
        assertRequiredString(String(input.computedAt ?? ""), "computedAt");
      },
      toRecord: (ctx, input, existing) => {
        const meta = baseMeta(
          ctx,
          input as { id?: string; organisationId?: string },
          existing,
        );
        const data = input as Partial<EngineeringBenchmarkRecord>;
        return {
          ...meta,
          scope: data.scope ?? existing?.scope ?? {},
          metricKey: String(data.metricKey ?? existing?.metricKey ?? ""),
          comparisonJson: data.comparisonJson ?? existing?.comparisonJson ?? {},
          computedAt: String(
            data.computedAt ?? existing?.computedAt ?? new Date().toISOString(),
          ),
          label: data.label ?? existing?.label,
        };
      },
      toRow: (record) => engineeringBenchmarkToRow(record),
      rowToRecord: (row) => rowToEngineeringBenchmark(row as never),
    }),

    engineeringBaselines: createPostgresCrudRepository<
      EngineeringBaselineCreate,
      EngineeringBaselineUpdate,
      EngineeringBaselineRecord
    >({
      kind: "engineering_baseline",
      db,
      table: asTable(testingEngineeringBaseline),
      searchFields: ["kind", "metricKey", "label"],
      validateCreate: (input) => {
        assertRequiredString(String(input.kind ?? ""), "kind");
        assertRequiredString(String(input.metricKey ?? ""), "metricKey");
        assertRequiredString(String(input.computedAt ?? ""), "computedAt");
      },
      toRecord: (ctx, input, existing) => {
        const meta = baseMeta(
          ctx,
          input as { id?: string; organisationId?: string },
          existing,
        );
        const data = input as Partial<EngineeringBaselineRecord>;
        return {
          ...meta,
          scope: data.scope ?? existing?.scope ?? {},
          kind: String(data.kind ?? existing?.kind ?? ""),
          metricKey: String(data.metricKey ?? existing?.metricKey ?? ""),
          value: Number(data.value ?? existing?.value ?? 0),
          sourceSnapshotId:
            data.sourceSnapshotId ?? existing?.sourceSnapshotId,
          periodJson: data.periodJson ?? existing?.periodJson,
          computedAt: String(
            data.computedAt ?? existing?.computedAt ?? new Date().toISOString(),
          ),
          label: data.label ?? existing?.label,
        };
      },
      toRow: (record) => engineeringBaselineToRow(record),
      rowToRecord: (row) => rowToEngineeringBaseline(row as never),
    }),

    engineeringQualitySummaries: createPostgresCrudRepository<
      EngineeringQualitySummaryCreate,
      EngineeringQualitySummaryUpdate,
      EngineeringQualitySummaryRecord
    >({
      kind: "engineering_quality_summary",
      db,
      table: asTable(testingEngineeringQualitySummary),
      searchFields: [],
      validateCreate: (input) => {
        assertRequiredString(String(input.computedAt ?? ""), "computedAt");
      },
      toRecord: (ctx, input, existing) => {
        const meta = baseMeta(
          ctx,
          input as { id?: string; organisationId?: string },
          existing,
        );
        const data = input as Partial<EngineeringQualitySummaryRecord>;
        return {
          ...meta,
          scope: data.scope ?? existing?.scope ?? {},
          qualityScoreJson:
            data.qualityScoreJson ?? existing?.qualityScoreJson ?? {},
          indicatorsJson: data.indicatorsJson ?? existing?.indicatorsJson ?? [],
          computedAt: String(
            data.computedAt ?? existing?.computedAt ?? new Date().toISOString(),
          ),
        };
      },
      toRow: (record) => engineeringQualitySummaryToRow(record),
      rowToRecord: (row) => rowToEngineeringQualitySummary(row as never),
    }),
  };
}

export {
  engineeringSnapshotToRow,
  rowToEngineeringSnapshot,
  engineeringHistoricalSnapshotToRow,
  rowToEngineeringHistoricalSnapshot,
  engineeringTrendSeriesToRow,
  rowToEngineeringTrendSeries,
  engineeringBenchmarkToRow,
  rowToEngineeringBenchmark,
  engineeringBaselineToRow,
  rowToEngineeringBaseline,
  engineeringQualitySummaryToRow,
  rowToEngineeringQualitySummary,
};
