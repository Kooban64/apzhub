import type {
  HistoricalPeriodKind,
  TrendEngineService,
  TrendSeries,
  TrendSeriesKind,
} from "@apzhub/testing-contracts";
import { asTrendSeriesId } from "@apzhub/testing-contracts";
import type { EngineeringTrendSeriesRecord } from "@apzhub/testing-persistence";

import { toRepositoryContext } from "../mapping/context";
import { requireFound } from "../services/errors";
import type { ServiceRuntime } from "../services/types";
import { createEngineeringAggregationService } from "./aggregation-service";
import { computeTrendDelta, computeTrendDirection } from "./calculations";

function toDomain(row: EngineeringTrendSeriesRecord): TrendSeries {
  return {
    id: asTrendSeriesId(row.id),
    kind: row.kind as TrendSeriesKind,
    scope: row.scope as TrendSeries["scope"],
    periodKind: row.periodKind as HistoricalPeriodKind,
    points: row.pointsJson as TrendSeries["points"],
    direction: row.direction as TrendSeries["direction"],
    delta: row.delta,
    computedAt: row.computedAt,
  };
}

const KIND_TO_INPUT: Record<TrendSeriesKind, keyof Awaited<
  ReturnType<ReturnType<typeof createEngineeringAggregationService>["gatherInputs"]>
>> = {
  quality: "coverage",
  coverage: "coverage",
  execution: "manualExecution",
  automation: "automation",
  regression: "failedTests",
  release: "releaseReadiness",
  certification: "certification",
  defect: "openDefects",
  lead_time: "leadTime",
  stability: "stability",
  risk: "risk",
  velocity: "velocity",
};

export function createTrendEngineService(rt: ServiceRuntime): TrendEngineService {
  const aggregation = createEngineeringAggregationService(rt);
  return {
    computeDirection(points) {
      return computeTrendDirection(points);
    },
    async buildSeries(ctx, kind, scope, periodKind = "weekly") {
      const rctx = toRepositoryContext(ctx);
      const existing = (await rt.persistence.engineeringTrendSeries.list(rctx)).items
        .filter((s) => s.kind === kind)
        .sort((a, b) => a.computedAt.localeCompare(b.computedAt));

      const inputs = await aggregation.gatherInputs(ctx, scope);
      const metricKey = KIND_TO_INPUT[kind];
      const currentValue = Number(inputs[metricKey] ?? 0);

      const priorPoints = existing.flatMap((s) =>
        (s.pointsJson as TrendSeries["points"]).map((p) => ({
          at: p.at,
          value: p.value,
          label: p.label,
        })),
      );
      const points = [
        ...priorPoints.slice(-11),
        { at: rt.now(), value: currentValue, label: kind },
      ];
      const direction = computeTrendDirection(points);
      const delta = computeTrendDelta(points);
      const row = await rt.persistence.engineeringTrendSeries.create(rctx, {
        id: rt.id(),
        kind,
        scope: { ...(scope ?? { tenantId: ctx.tenantId }) },
        periodKind,
        pointsJson: points,
        direction,
        delta,
        computedAt: rt.now(),
        organisationId: ctx.organisationId,
      });
      rt.events.record({
        eventType: "trend.series_computed",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { seriesId: row.id, kind, direction, delta },
      });
      return toDomain(row);
    },
    async listSeries(ctx) {
      const rows = (
        await rt.persistence.engineeringTrendSeries.list(toRepositoryContext(ctx))
      ).items;
      return rows.map(toDomain);
    },
  };
}

export async function getTrendSeries(
  rt: ServiceRuntime,
  ctx: Parameters<TrendEngineService["listSeries"]>[0],
  id: string,
): Promise<TrendSeries> {
  return toDomain(
    requireFound(
      await rt.persistence.engineeringTrendSeries.get(toRepositoryContext(ctx), id),
      "engineering_trend_series",
      id,
    ),
  );
}
