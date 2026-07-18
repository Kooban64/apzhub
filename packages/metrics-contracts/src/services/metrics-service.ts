/**
 * Metrics service port stubs (APZMETRICS-001).
 * Full Platform Services / Gateway wiring deferred to APZMETRICS-002.
 */

import type { KPI, Metric, MetricDefinition } from "../domain/metrics";
import type { MetricsRequestContext } from "../common/context";

/** Foundation-era service surface — metadata CRUD ports composed later via Core. */
export type PlatformMetricsService = {
  readonly listMetrics: (ctx: MetricsRequestContext) => Promise<readonly Metric[]>;
  readonly listDefinitions: (
    ctx: MetricsRequestContext,
  ) => Promise<readonly MetricDefinition[]>;
  readonly listKPIs: (ctx: MetricsRequestContext) => Promise<readonly KPI[]>;
};

export type { Metric, MetricDefinition, KPI };
