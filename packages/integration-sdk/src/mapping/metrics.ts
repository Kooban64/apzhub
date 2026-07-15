import type {
  MappingDirection,
  MappingMetrics,
  MappingMetricsSnapshot,
  MappingProfile,
} from "./types";

export class DefaultMappingMetrics implements MappingMetrics {
  private executionsTotal = 0;
  private failuresTotal = 0;
  private totalLatencyMs = 0;
  private readonly byProfile: Record<string, number> = {};
  private readonly byDirection: Record<string, number> = {};
  private readonly byEntityType: Record<string, number> = {};
  private readonly byProvider: Record<string, number> = {};

  recordExecution(input: {
    readonly providerId: string;
    readonly entityType: string;
    readonly profile: MappingProfile;
    readonly direction: MappingDirection;
    readonly success: boolean;
    readonly durationMs: number;
  }): void {
    this.executionsTotal += 1;
    this.totalLatencyMs += input.durationMs;
    if (!input.success) {
      this.failuresTotal += 1;
    }
    this.byProfile[input.profile] = (this.byProfile[input.profile] ?? 0) + 1;
    this.byDirection[input.direction] = (this.byDirection[input.direction] ?? 0) + 1;
    this.byEntityType[input.entityType] = (this.byEntityType[input.entityType] ?? 0) + 1;
    this.byProvider[input.providerId] = (this.byProvider[input.providerId] ?? 0) + 1;
  }

  getSnapshot(): MappingMetricsSnapshot {
    return {
      executionsTotal: this.executionsTotal,
      failuresTotal: this.failuresTotal,
      totalLatencyMs: this.totalLatencyMs,
      averageLatencyMs:
        this.executionsTotal === 0 ? 0 : this.totalLatencyMs / this.executionsTotal,
      byProfile: { ...this.byProfile },
      byDirection: { ...this.byDirection },
      byEntityType: { ...this.byEntityType },
      byProvider: { ...this.byProvider },
    };
  }

  reset(): void {
    this.executionsTotal = 0;
    this.failuresTotal = 0;
    this.totalLatencyMs = 0;
    for (const key of Object.keys(this.byProfile)) delete this.byProfile[key];
    for (const key of Object.keys(this.byDirection)) delete this.byDirection[key];
    for (const key of Object.keys(this.byEntityType)) delete this.byEntityType[key];
    for (const key of Object.keys(this.byProvider)) delete this.byProvider[key];
  }
}

export function createMappingMetrics(): DefaultMappingMetrics {
  return new DefaultMappingMetrics();
}

export const STANDARD_MAPPING_METRIC_NAMES = {
  executionsTotal: "integration.mapping.executions.total",
  failuresTotal: "integration.mapping.failures.total",
  latencyMs: "integration.mapping.latency_ms",
} as const;
