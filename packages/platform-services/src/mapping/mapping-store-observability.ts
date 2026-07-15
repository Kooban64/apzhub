/** Observability hooks for entity mapping persistence (OSS-110-05). */

export type MappingStoreOperation =
  | "create"
  | "getByPlatformId"
  | "getByProviderNativeId"
  | "resolveProviderNativeId"
  | "resolvePlatformId"
  | "list"
  | "update"
  | "deactivate"
  | "remove";

export interface MappingStoreLogEvent {
  readonly level: "debug" | "info" | "warn" | "error";
  readonly operation: MappingStoreOperation;
  readonly entityType?: string;
  readonly platformId?: string;
  readonly providerId?: string;
  readonly integrationId?: string;
  readonly tenantId?: string;
  readonly organisationId?: string;
  readonly result: "success" | "not_found" | "conflict" | "error";
  readonly classification?: string;
  readonly durationMs: number;
  readonly transactionOutcome?: "committed" | "rolled_back" | "none";
  readonly message: string;
}

export interface MappingStoreLogger {
  log(event: MappingStoreLogEvent): void;
}

export interface MappingStoreMetricEvent {
  readonly operation: MappingStoreOperation;
  readonly result: MappingStoreLogEvent["result"];
  readonly durationMs: number;
  readonly entityType?: string;
}

export interface MappingStoreMetrics {
  record(event: MappingStoreMetricEvent): void;
}

export const noopMappingStoreLogger: MappingStoreLogger = {
  log() {
    /* no-op */
  },
};

export const noopMappingStoreMetrics: MappingStoreMetrics = {
  record() {
    /* no-op */
  },
};

export class InMemoryMappingStoreLogger implements MappingStoreLogger {
  readonly events: MappingStoreLogEvent[] = [];

  log(event: MappingStoreLogEvent): void {
    this.events.push(event);
  }
}

export class InMemoryMappingStoreMetrics implements MappingStoreMetrics {
  readonly events: MappingStoreMetricEvent[] = [];

  record(event: MappingStoreMetricEvent): void {
    this.events.push(event);
  }
}
