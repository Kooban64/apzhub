import type {
  Benchmark,
  BenchmarkComparison,
  BenchmarkService,
  TrendDirection,
} from "@apzhub/testing-contracts";
import { asBenchmarkId } from "@apzhub/testing-contracts";
import type { EngineeringBenchmarkRecord } from "@apzhub/testing-persistence";

import { toRepositoryContext } from "../mapping/context";
import { requireFound } from "../services/errors";
import type { ServiceRuntime } from "../services/types";
import { computeTrendDirection, rollingAverage, round2 } from "./calculations";

function toDomain(row: EngineeringBenchmarkRecord): Benchmark {
  return {
    id: asBenchmarkId(row.id),
    tenantId: row.tenantId,
    scope: row.scope as Benchmark["scope"],
    metricKey: row.metricKey,
    comparison: row.comparisonJson as unknown as BenchmarkComparison,
    computedAt: row.computedAt,
    label: row.label,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
  };
}

export function createBenchmarkService(rt: ServiceRuntime): BenchmarkService {
  return {
    async compare(ctx, metricKey, values, baselineValue, scope, label) {
      const nums = values.filter((v) => Number.isFinite(v));
      const current = nums.length > 0 ? nums[nums.length - 1]! : 0;
      const previous = nums.length > 1 ? nums[nums.length - 2] : undefined;
      const points = nums.map((value) => ({ value }));
      const direction: TrendDirection = computeTrendDirection(points);
      const comparison: BenchmarkComparison = {
        current: round2(current),
        previous: previous !== undefined ? round2(previous) : undefined,
        rollingAverage: nums.length > 0 ? rollingAverage(nums) : undefined,
        baseline: baselineValue !== undefined ? round2(baselineValue) : undefined,
        best: nums.length > 0 ? round2(Math.max(...nums)) : undefined,
        worst: nums.length > 0 ? round2(Math.min(...nums)) : undefined,
        direction,
      };
      const row = await rt.persistence.engineeringBenchmarks.create(
        toRepositoryContext(ctx),
        {
          id: rt.id(),
          scope: { ...(scope ?? { tenantId: ctx.tenantId }) },
          metricKey,
          comparisonJson: { ...comparison },
          computedAt: rt.now(),
          label,
          organisationId: ctx.organisationId,
        },
      );
      rt.events.record({
        eventType: "benchmark.compared",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { benchmarkId: row.id, metricKey, direction },
      });
      return toDomain(row);
    },
    async list(ctx) {
      return (
        await rt.persistence.engineeringBenchmarks.list(toRepositoryContext(ctx))
      ).items.map(toDomain);
    },
    async get(ctx, id) {
      return toDomain(
        requireFound(
          await rt.persistence.engineeringBenchmarks.get(toRepositoryContext(ctx), id),
          "engineering_benchmark",
          id,
        ),
      );
    },
  };
}
