/**
 * EngineeringIntelligenceSearchMapper — EI / Engineering Score → SearchEntityDraft.
 * Engineering Score maps as `engineering_snapshot` (EngineeringSnapshot).
 */

import type { SearchEntityDraft } from "@apzhub/search-integration";
import type {
  Benchmark,
  EngineeringRiskSummary,
  EngineeringSnapshot,
  HistoricalSnapshot,
  TrendSeries,
} from "@apzhub/testing-contracts";

import type { TestingSearchPublicationContext } from "../context/testing-search-publication-context";
import {
  assertPlatformEntityId,
  assertTenant,
  navigationTarget,
  permissionTokens,
  resolveTestingClassification,
  type TestingSearchMappableEntity,
  type TestingSearchMappingExtras,
} from "./shared";

export type EngineeringIntelligenceMappableEntity = Extract<
  TestingSearchMappableEntity,
  {
    readonly entityType:
      | "engineering_snapshot"
      | "engineering_trend"
      | "benchmark"
      | "historical_snapshot"
      | "risk_summary";
  }
>;

export class EngineeringIntelligenceSearchMapper {
  map(
    context: TestingSearchPublicationContext,
    input: EngineeringIntelligenceMappableEntity,
  ): SearchEntityDraft {
    switch (input.entityType) {
      case "engineering_snapshot":
        return this.mapEngineeringSnapshot(context, input.entity, input.extras);
      case "engineering_trend":
        return this.mapEngineeringTrend(context, input.entity, input.extras);
      case "benchmark":
        return this.mapBenchmark(context, input.entity, input.extras);
      case "historical_snapshot":
        return this.mapHistoricalSnapshot(context, input.entity, input.extras);
      case "risk_summary":
        return this.mapRiskSummary(context, input.entity, input.extras);
    }
  }

  mapEngineeringSnapshot(
    context: TestingSearchPublicationContext,
    snapshot: EngineeringSnapshot,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(snapshot.id, "engineering_snapshot.id");
    assertTenant(snapshot.tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
      status: snapshot.health.status,
    });
    const title =
      snapshot.label?.trim() ||
      extras?.title ||
      `Engineering snapshot ${snapshot.id.slice(0, 12)}`;
    return {
      entityId: snapshot.id,
      entityType: "engineering_snapshot",
      title,
      organisationId:
        snapshot.scope.organisationId ??
        extras?.organisationId ??
        context.organisationId,
      classification,
      permissions: permissionTokens(
        context,
        extras,
        snapshot.health.status,
        classification,
      ),
      metadata: {
        status: snapshot.health.status,
        overallScore: String(snapshot.health.overallScore),
        overallLevel: snapshot.risk.overallLevel,
      },
      keywords: [title, snapshot.health.status],
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
      navigationTarget: navigationTarget("engineering_snapshot", snapshot.id),
      sourceId: "testing:engineering_snapshot",
      ownerUserId: snapshot.createdBy ?? context.actorUserId,
    };
  }

  mapEngineeringTrend(
    context: TestingSearchPublicationContext,
    series: TrendSeries,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(String(series.id), "engineering_trend.id");
    const tenantId = series.scope.tenantId ?? extras?.tenantId;
    if (!tenantId) {
      throw new Error(
        "tenantId is required via scope or extras when mapping engineering_trend",
      );
    }
    assertTenant(tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
    });
    const title = extras?.title ?? `Trend ${series.kind} (${series.direction})`;
    return {
      entityId: String(series.id),
      entityType: "engineering_trend",
      title,
      organisationId:
        series.scope.organisationId ?? extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, undefined, classification),
      metadata: {
        trendKind: series.kind,
        periodKind: series.periodKind,
        direction: series.direction,
      },
      keywords: [title, series.kind, series.direction],
      createdAt: series.computedAt,
      updatedAt: series.computedAt,
      navigationTarget: navigationTarget("engineering_trend", String(series.id)),
      sourceId: "testing:engineering_trend",
      ownerUserId: context.actorUserId,
    };
  }

  mapBenchmark(
    context: TestingSearchPublicationContext,
    benchmark: Benchmark,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(benchmark.id, "benchmark.id");
    assertTenant(benchmark.tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
    });
    const title =
      benchmark.label?.trim() || extras?.title || `Benchmark ${benchmark.metricKey}`;
    return {
      entityId: benchmark.id,
      entityType: "benchmark",
      title,
      organisationId:
        benchmark.scope.organisationId ??
        extras?.organisationId ??
        context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, undefined, classification),
      metadata: {
        metricKey: benchmark.metricKey,
        direction: benchmark.comparison.direction,
      },
      keywords: [title, benchmark.metricKey],
      createdAt: benchmark.createdAt,
      updatedAt: benchmark.updatedAt,
      navigationTarget: navigationTarget("benchmark", benchmark.id),
      sourceId: "testing:benchmark",
      ownerUserId: benchmark.createdBy ?? context.actorUserId,
    };
  }

  mapHistoricalSnapshot(
    context: TestingSearchPublicationContext,
    snapshot: HistoricalSnapshot,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(snapshot.id, "historical_snapshot.id");
    assertTenant(snapshot.tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
    });
    const title =
      snapshot.period.label?.trim() ||
      extras?.title ||
      `Historical ${snapshot.period.kind}`;
    return {
      entityId: snapshot.id,
      entityType: "historical_snapshot",
      title,
      organisationId:
        snapshot.scope.organisationId ??
        extras?.organisationId ??
        context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, undefined, classification),
      metadata: {
        periodKind: snapshot.period.kind,
        overallScore: String(snapshot.engineeringHealthScore),
        immutable: "true",
      },
      keywords: [title, snapshot.period.kind],
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
      navigationTarget: navigationTarget("historical_snapshot", snapshot.id),
      sourceId: "testing:historical_snapshot",
      ownerUserId: snapshot.createdBy ?? context.actorUserId,
      lifecycleState: "validated",
    };
  }

  mapRiskSummary(
    context: TestingSearchPublicationContext,
    risk: EngineeringRiskSummary,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    const id = extras?.entityId;
    if (!id) {
      throw new Error("extras.entityId is required when mapping risk_summary");
    }
    assertPlatformEntityId(id, "risk_summary.id");
    const tenantId = extras?.tenantId;
    if (!tenantId) {
      throw new Error("tenantId is required via extras when mapping risk_summary");
    }
    assertTenant(tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
      severity: risk.overallLevel,
    });
    const title = extras?.title ?? `Risk ${risk.overallLevel} (${risk.overallScore})`;
    return {
      entityId: id,
      entityType: "risk_summary",
      title,
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, risk.overallLevel, classification),
      metadata: {
        overallLevel: risk.overallLevel,
        overallScore: String(risk.overallScore),
      },
      keywords: [title, risk.overallLevel],
      createdAt: risk.computedAt,
      updatedAt: risk.computedAt,
      navigationTarget: navigationTarget("risk_summary", id),
      sourceId: "testing:risk_summary",
      ownerUserId: context.actorUserId,
    };
  }
}
