import type {
  QualityTrendComparison,
  QualityTrendDelta,
  QualityTrendService,
} from "@apzhub/testing-contracts";

import { toRepositoryContext } from "../mapping/context";
import { requireFound } from "../services/errors";
import type { ServiceRuntime } from "../services/types";
import { numericDelta, stableSortIds } from "./calculations";

function compareMetricMaps(
  baseline: Readonly<Record<string, number>>,
  current: Readonly<Record<string, number>>,
): QualityTrendDelta[] {
  const keys = stableSortIds([
    ...new Set([...Object.keys(baseline), ...Object.keys(current)]),
  ]);
  return keys.map((metricKey) => {
    const baselineValue = baseline[metricKey] ?? 0;
    const currentValue = current[metricKey] ?? 0;
    return {
      metricKey,
      baselineValue,
      currentValue,
      delta: numericDelta(currentValue, baselineValue),
    };
  });
}

function flattenMetrics(
  metrics: Readonly<Record<string, unknown>>,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const key of Object.keys(metrics).sort()) {
    const value = metrics[key];
    if (typeof value === "number") out[key] = value;
  }
  return out;
}

export function createQualityTrendService(rt: ServiceRuntime): QualityTrendService {
  return {
    async compareSnapshots(ctx, baselineSnapshotId, currentSnapshotId) {
      const rctx = toRepositoryContext(ctx);
      const baseline = requireFound(
        await rt.persistence.qualitySnapshots.get(rctx, baselineSnapshotId),
        "quality_snapshot",
        baselineSnapshotId,
      );
      const current = requireFound(
        await rt.persistence.qualitySnapshots.get(rctx, currentSnapshotId),
        "quality_snapshot",
        currentSnapshotId,
      );
      const deltas = compareMetricMaps(
        flattenMetrics(baseline.metrics),
        flattenMetrics(current.metrics),
      );
      const result: QualityTrendComparison = {
        baselineSnapshotId,
        currentSnapshotId,
        deltas,
        computedAt: rt.now(),
      };
      rt.events.record({
        eventType: "quality.trend_compared",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { baselineSnapshotId, currentSnapshotId, deltaCount: deltas.length },
      });
      return result;
    },
    async compareWindows(ctx, baseline, current) {
      const deltas = compareMetricMaps(baseline.metrics, current.metrics);
      const result: QualityTrendComparison = {
        baselineWindowLabel: baseline.label,
        currentWindowLabel: current.label,
        deltas,
        computedAt: rt.now(),
      };
      rt.events.record({
        eventType: "quality.trend_compared",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: {
          baselineWindowLabel: baseline.label,
          currentWindowLabel: current.label,
          deltaCount: deltas.length,
        },
      });
      return result;
    },
  };
}
