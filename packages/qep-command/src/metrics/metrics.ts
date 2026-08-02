export type CommandMetricsSnapshot = {
  readonly commandsExecuted: number;
  readonly commandsSucceeded: number;
  readonly commandsFailed: number;
  readonly validationErrors: number;
  readonly permissionFailures: number;
  readonly discoveryCalls: number;
  readonly totalDiscoveryLatencyMs: number;
  readonly averageDiscoveryLatencyMs: number;
  readonly averageExecutionDurationMs: number;
  readonly successRate: number;
  readonly usageByCommand: Readonly<Record<string, number>>;
};

export type CommandMetrics = {
  recordExecution(input: {
    readonly commandId: string;
    readonly outcome: string;
    readonly durationMs: number;
  }): void;
  recordDiscovery(latencyMs: number): void;
  snapshot(): CommandMetricsSnapshot;
};

export function createCommandMetrics(): CommandMetrics {
  let executed = 0;
  let succeeded = 0;
  let failed = 0;
  let validationErrors = 0;
  let permissionFailures = 0;
  let discoveryCalls = 0;
  let totalDiscoveryLatencyMs = 0;
  let totalExecutionMs = 0;
  const usageByCommand = new Map<string, number>();

  return {
    recordExecution(input) {
      executed += 1;
      totalExecutionMs += input.durationMs;
      usageByCommand.set(
        input.commandId,
        (usageByCommand.get(input.commandId) ?? 0) + 1,
      );
      if (input.outcome === "success") succeeded += 1;
      else if (input.outcome === "validation_error") validationErrors += 1;
      else if (input.outcome === "permission_denied") permissionFailures += 1;
      else failed += 1;
    },
    recordDiscovery(latencyMs) {
      discoveryCalls += 1;
      totalDiscoveryLatencyMs += latencyMs;
    },
    snapshot() {
      return {
        commandsExecuted: executed,
        commandsSucceeded: succeeded,
        commandsFailed: failed,
        validationErrors,
        permissionFailures,
        discoveryCalls,
        totalDiscoveryLatencyMs,
        averageDiscoveryLatencyMs:
          discoveryCalls === 0 ? 0 : totalDiscoveryLatencyMs / discoveryCalls,
        averageExecutionDurationMs: executed === 0 ? 0 : totalExecutionMs / executed,
        successRate: executed === 0 ? 1 : succeeded / executed,
        usageByCommand: Object.fromEntries(usageByCommand),
      };
    },
  };
}
