import type {
  ServiceRequestContext,
  TestingEngineeringIntelligenceService,
} from "@apzhub/platform-service-contracts";
import type { TestingDomainServices } from "@apzhub/testing-services";

import { assertTestingContext } from "./assert-testing-context";
import { withTestingErrorMapping } from "./map-testing-error";

async function runTestingOperation<T>(
  ctx: ServiceRequestContext,
  fn: () => Promise<T>,
): Promise<T> {
  assertTestingContext(ctx);
  return withTestingErrorMapping(fn, ctx.correlationId);
}

export class TestingEngineeringIntelligenceServiceImpl implements TestingEngineeringIntelligenceService {
  constructor(private readonly domain: TestingDomainServices) {}

  score(
    ctx: ServiceRequestContext,
    scope?: Parameters<TestingEngineeringIntelligenceService["score"]>[1],
    weights?: Parameters<TestingEngineeringIntelligenceService["score"]>[2],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.engineeringIntelligence.scoring.scoreFromScope(ctx, scope, weights),
    );
  }

  assessHealth(
    ctx: ServiceRequestContext,
    scope?: Parameters<TestingEngineeringIntelligenceService["assessHealth"]>[1],
    weights?: Parameters<TestingEngineeringIntelligenceService["assessHealth"]>[2],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.engineeringIntelligence.health.assess(ctx, scope, weights),
    );
  }

  computeSnapshot(
    ctx: ServiceRequestContext,
    scope?: Parameters<TestingEngineeringIntelligenceService["computeSnapshot"]>[1],
    label?: string,
    weights?: Parameters<TestingEngineeringIntelligenceService["computeSnapshot"]>[3],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.engineeringIntelligence.intelligence.computeSnapshot(
        ctx,
        scope,
        label,
        weights,
      ),
    );
  }

  getSnapshot(ctx: ServiceRequestContext, id: string) {
    return runTestingOperation(ctx, () =>
      this.domain.engineeringIntelligence.intelligence.getSnapshot(ctx, id),
    );
  }

  listSnapshots(ctx: ServiceRequestContext) {
    return runTestingOperation(ctx, () =>
      this.domain.engineeringIntelligence.intelligence.listSnapshots(ctx),
    );
  }

  buildTrend(
    ctx: ServiceRequestContext,
    kind: Parameters<TestingEngineeringIntelligenceService["buildTrend"]>[1],
    scope?: Parameters<TestingEngineeringIntelligenceService["buildTrend"]>[2],
    periodKind?: Parameters<TestingEngineeringIntelligenceService["buildTrend"]>[3],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.engineeringIntelligence.trends.buildSeries(
        ctx,
        kind,
        scope,
        periodKind,
      ),
    );
  }

  listTrends(ctx: ServiceRequestContext) {
    return runTestingOperation(ctx, () =>
      this.domain.engineeringIntelligence.trends.listSeries(ctx),
    );
  }

  compareBenchmark(
    ctx: ServiceRequestContext,
    metricKey: string,
    values: readonly number[],
    baselineValue?: number,
    scope?: Parameters<TestingEngineeringIntelligenceService["compareBenchmark"]>[4],
    label?: string,
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.engineeringIntelligence.benchmarks.compare(
        ctx,
        metricKey,
        values,
        baselineValue,
        scope,
        label,
      ),
    );
  }

  listBenchmarks(ctx: ServiceRequestContext) {
    return runTestingOperation(ctx, () =>
      this.domain.engineeringIntelligence.benchmarks.list(ctx),
    );
  }

  recordBaseline(
    ctx: ServiceRequestContext,
    input: Parameters<TestingEngineeringIntelligenceService["recordBaseline"]>[1],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.engineeringIntelligence.baselines.record(ctx, input),
    );
  }

  listBaselines(ctx: ServiceRequestContext) {
    return runTestingOperation(ctx, () =>
      this.domain.engineeringIntelligence.baselines.list(ctx),
    );
  }

  captureHistorical(
    ctx: ServiceRequestContext,
    period: Parameters<TestingEngineeringIntelligenceService["captureHistorical"]>[1],
    scope?: Parameters<TestingEngineeringIntelligenceService["captureHistorical"]>[2],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.engineeringIntelligence.historical.capture(ctx, period, scope),
    );
  }

  listHistorical(ctx: ServiceRequestContext) {
    return runTestingOperation(ctx, () =>
      this.domain.engineeringIntelligence.historical.list(ctx),
    );
  }
}
