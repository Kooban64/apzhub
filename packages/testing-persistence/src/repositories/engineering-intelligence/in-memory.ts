import {
  assertRequiredString,
} from "../../validation/persistence-validation";
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
  baseMeta,
  createInMemoryCrudRepository,
} from "../in-memory/generic-crud";

export interface EngineeringInMemoryStores {
  engineeringSnapshots: Map<string, EngineeringSnapshotRecord>;
  engineeringHistoricalSnapshots: Map<string, EngineeringHistoricalSnapshotRecord>;
  engineeringTrendSeries: Map<string, EngineeringTrendSeriesRecord>;
  engineeringBenchmarks: Map<string, EngineeringBenchmarkRecord>;
  engineeringBaselines: Map<string, EngineeringBaselineRecord>;
  engineeringQualitySummaries: Map<string, EngineeringQualitySummaryRecord>;
}

export function createEmptyEngineeringInMemoryStores(): EngineeringInMemoryStores {
  return {
    engineeringSnapshots: new Map(),
    engineeringHistoricalSnapshots: new Map(),
    engineeringTrendSeries: new Map(),
    engineeringBenchmarks: new Map(),
    engineeringBaselines: new Map(),
    engineeringQualitySummaries: new Map(),
  };
}

function assertHistoricalImmutable(): never {
  throw new Error("Historical snapshots are immutable");
}

export function createInMemoryEngineeringRepos(
  stores: EngineeringInMemoryStores,
): {
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
    engineeringSnapshots: createInMemoryCrudRepository<
      EngineeringSnapshotCreate,
      EngineeringSnapshotUpdate,
      EngineeringSnapshotRecord
    >({
      kind: "engineering_snapshot",
      store: stores.engineeringSnapshots,
      searchFields: ["label"],
      validateCreate: (input) => {
        assertRequiredString(String(input.computedAt ?? ""), "computedAt");
      },
      toRecord: (ctx, input, existing) => {
        const meta = baseMeta(ctx, input, existing);
        return {
          ...meta,
          scope:
            (input.scope as Readonly<Record<string, unknown>>) ??
            existing?.scope ??
            {},
          qualityScoreJson:
            (input.qualityScoreJson as Readonly<Record<string, unknown>>) ??
            existing?.qualityScoreJson ??
            {},
          healthJson:
            (input.healthJson as Readonly<Record<string, unknown>>) ??
            existing?.healthJson ??
            {},
          riskJson:
            (input.riskJson as Readonly<Record<string, unknown>>) ??
            existing?.riskJson ??
            {},
          indicatorsJson:
            (input.indicatorsJson as readonly unknown[]) ??
            existing?.indicatorsJson ??
            [],
          trendsJson:
            (input.trendsJson as readonly unknown[]) ??
            existing?.trendsJson ??
            [],
          computedAt: String(
            input.computedAt ?? existing?.computedAt ?? new Date().toISOString(),
          ),
          label: (input.label as string | undefined) ?? existing?.label,
        };
      },
    }),

    engineeringHistoricalSnapshots: createInMemoryCrudRepository<
      EngineeringHistoricalSnapshotCreate,
      EngineeringHistoricalSnapshotUpdate,
      EngineeringHistoricalSnapshotRecord
    >({
      kind: "engineering_historical_snapshot",
      store: stores.engineeringHistoricalSnapshots,
      searchFields: [],
      validateCreate: (input) => {
        assertRequiredString(String(input.computedAt ?? ""), "computedAt");
      },
      validateUpdate: () => {
        assertHistoricalImmutable();
      },
      toRecord: (ctx, input, existing) => {
        const meta = baseMeta(ctx, input, existing);
        return {
          ...meta,
          scope:
            (input.scope as Readonly<Record<string, unknown>>) ??
            existing?.scope ??
            {},
          periodJson:
            (input.periodJson as Readonly<Record<string, unknown>>) ??
            existing?.periodJson ??
            {},
          qualityScore: Number(
            input.qualityScore ?? existing?.qualityScore ?? 0,
          ),
          engineeringHealthScore: Number(
            input.engineeringHealthScore ??
              existing?.engineeringHealthScore ??
              0,
          ),
          indicatorsJson:
            (input.indicatorsJson as readonly unknown[]) ??
            existing?.indicatorsJson ??
            [],
          metricsJson:
            (input.metricsJson as Readonly<Record<string, unknown>>) ??
            existing?.metricsJson ??
            {},
          sourceRefsJson:
            (input.sourceRefsJson as Readonly<Record<string, unknown>>) ??
            existing?.sourceRefsJson ??
            {},
          computedAt: String(
            input.computedAt ?? existing?.computedAt ?? new Date().toISOString(),
          ),
          immutable: true,
        };
      },
    }),

    engineeringTrendSeries: createInMemoryCrudRepository<
      EngineeringTrendSeriesCreate,
      EngineeringTrendSeriesUpdate,
      EngineeringTrendSeriesRecord
    >({
      kind: "engineering_trend_series",
      store: stores.engineeringTrendSeries,
      searchFields: ["kind", "periodKind", "direction"],
      validateCreate: (input) => {
        assertRequiredString(String(input.kind ?? ""), "kind");
        assertRequiredString(String(input.periodKind ?? ""), "periodKind");
        assertRequiredString(String(input.direction ?? ""), "direction");
        assertRequiredString(String(input.computedAt ?? ""), "computedAt");
      },
      toRecord: (ctx, input, existing) => {
        const meta = baseMeta(ctx, input, existing);
        return {
          ...meta,
          kind: String(input.kind ?? existing?.kind ?? ""),
          scope:
            (input.scope as Readonly<Record<string, unknown>>) ??
            existing?.scope ??
            {},
          periodKind: String(input.periodKind ?? existing?.periodKind ?? ""),
          pointsJson:
            (input.pointsJson as readonly unknown[]) ??
            existing?.pointsJson ??
            [],
          direction: String(input.direction ?? existing?.direction ?? ""),
          delta: Number(input.delta ?? existing?.delta ?? 0),
          computedAt: String(
            input.computedAt ?? existing?.computedAt ?? new Date().toISOString(),
          ),
        };
      },
    }),

    engineeringBenchmarks: createInMemoryCrudRepository<
      EngineeringBenchmarkCreate,
      EngineeringBenchmarkUpdate,
      EngineeringBenchmarkRecord
    >({
      kind: "engineering_benchmark",
      store: stores.engineeringBenchmarks,
      searchFields: ["metricKey", "label"],
      validateCreate: (input) => {
        assertRequiredString(String(input.metricKey ?? ""), "metricKey");
        assertRequiredString(String(input.computedAt ?? ""), "computedAt");
      },
      toRecord: (ctx, input, existing) => {
        const meta = baseMeta(ctx, input, existing);
        return {
          ...meta,
          scope:
            (input.scope as Readonly<Record<string, unknown>>) ??
            existing?.scope ??
            {},
          metricKey: String(input.metricKey ?? existing?.metricKey ?? ""),
          comparisonJson:
            (input.comparisonJson as Readonly<Record<string, unknown>>) ??
            existing?.comparisonJson ??
            {},
          computedAt: String(
            input.computedAt ?? existing?.computedAt ?? new Date().toISOString(),
          ),
          label: (input.label as string | undefined) ?? existing?.label,
        };
      },
    }),

    engineeringBaselines: createInMemoryCrudRepository<
      EngineeringBaselineCreate,
      EngineeringBaselineUpdate,
      EngineeringBaselineRecord
    >({
      kind: "engineering_baseline",
      store: stores.engineeringBaselines,
      searchFields: ["kind", "metricKey", "label"],
      validateCreate: (input) => {
        assertRequiredString(String(input.kind ?? ""), "kind");
        assertRequiredString(String(input.metricKey ?? ""), "metricKey");
        assertRequiredString(String(input.computedAt ?? ""), "computedAt");
      },
      toRecord: (ctx, input, existing) => {
        const meta = baseMeta(ctx, input, existing);
        return {
          ...meta,
          scope:
            (input.scope as Readonly<Record<string, unknown>>) ??
            existing?.scope ??
            {},
          kind: String(input.kind ?? existing?.kind ?? ""),
          metricKey: String(input.metricKey ?? existing?.metricKey ?? ""),
          value: Number(input.value ?? existing?.value ?? 0),
          sourceSnapshotId:
            (input.sourceSnapshotId as string | undefined) ??
            existing?.sourceSnapshotId,
          periodJson:
            (input.periodJson as Readonly<Record<string, unknown>> | undefined) ??
            existing?.periodJson,
          computedAt: String(
            input.computedAt ?? existing?.computedAt ?? new Date().toISOString(),
          ),
          label: (input.label as string | undefined) ?? existing?.label,
        };
      },
    }),

    engineeringQualitySummaries: createInMemoryCrudRepository<
      EngineeringQualitySummaryCreate,
      EngineeringQualitySummaryUpdate,
      EngineeringQualitySummaryRecord
    >({
      kind: "engineering_quality_summary",
      store: stores.engineeringQualitySummaries,
      searchFields: [],
      validateCreate: (input) => {
        assertRequiredString(String(input.computedAt ?? ""), "computedAt");
      },
      toRecord: (ctx, input, existing) => {
        const meta = baseMeta(ctx, input, existing);
        return {
          ...meta,
          scope:
            (input.scope as Readonly<Record<string, unknown>>) ??
            existing?.scope ??
            {},
          qualityScoreJson:
            (input.qualityScoreJson as Readonly<Record<string, unknown>>) ??
            existing?.qualityScoreJson ??
            {},
          indicatorsJson:
            (input.indicatorsJson as readonly unknown[]) ??
            existing?.indicatorsJson ??
            [],
          computedAt: String(
            input.computedAt ?? existing?.computedAt ?? new Date().toISOString(),
          ),
        };
      },
    }),
  };
}
