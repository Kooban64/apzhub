/**
 * Trend Engine — synthesises trend series from current metrics + history samples.
 * Trends are derived; Cap F does not store business history as SoR.
 */

import type { MetricKey, MetricValue, TrendPoint, TrendSeries } from "./types";

export type TrendSample = {
  readonly at: string;
  readonly metrics: readonly MetricValue[];
};

function valueAt(sample: TrendSample, key: MetricKey): number | undefined {
  return sample.metrics.find((m) => m.key === key)?.value;
}

/**
 * Build trend series for keys from chronological samples.
 * When only one sample exists, emits a single-point series (current).
 */
export function buildTrends(
  samples: readonly TrendSample[],
  keys: readonly MetricKey[],
  labels: Readonly<Partial<Record<MetricKey, string>>> = {},
): readonly TrendSeries[] {
  const ordered = [...samples].sort((a, b) => a.at.localeCompare(b.at));
  return keys.map((key) => {
    const points: TrendPoint[] = [];
    for (const sample of ordered) {
      const value = valueAt(sample, key);
      if (value !== undefined) {
        points.push({ at: sample.at, value });
      }
    }
    return {
      key,
      label: labels[key] ?? key.replace(/_/g, " "),
      points,
    };
  });
}

/** Convenience: project current bundle into a one-point "trend" for UX. */
export function currentAsTrend(
  metrics: readonly MetricValue[],
  keys: readonly MetricKey[],
  at: string,
): readonly TrendSeries[] {
  return buildTrends([{ at, metrics }], keys);
}
