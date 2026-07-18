import { connectionNotFoundError, duplicateConnectionError } from "../errors/codes";
import { sdkErr, sdkOk, type SdkResult } from "../errors/result";
import type { ConnectionRecord, ConnectionRegistrySnapshot } from "./types";
import type { Clock } from "../auth/authentication-provider";
import { systemClock } from "../auth/authentication-provider";

export interface RegisterConnectionOptions {
  readonly allowReplace?: boolean;
}

export interface ConnectionRegistry {
  register(
    record: ConnectionRecord,
    options?: RegisterConnectionOptions,
    correlationId?: string,
  ): SdkResult<ConnectionRecord>;
  get(connectionId: string, correlationId: string): SdkResult<ConnectionRecord>;
  list(): readonly ConnectionRecord[];
  listByTenant(tenantId: string): readonly ConnectionRecord[];
  listByIntegration(integrationId: string): readonly ConnectionRecord[];
  remove(connectionId: string, correlationId: string): SdkResult<ConnectionRecord>;
  snapshot(): ConnectionRegistrySnapshot;
  replace(record: ConnectionRecord, correlationId: string): SdkResult<ConnectionRecord>;
}

export class InMemoryConnectionRegistry implements ConnectionRegistry {
  private readonly connections = new Map<string, ConnectionRecord>();
  private readonly clock: Clock;

  constructor(clock: Clock = systemClock) {
    this.clock = clock;
  }

  register(
    record: ConnectionRecord,
    options: RegisterConnectionOptions = {},
    correlationId = "registry",
  ): SdkResult<ConnectionRecord> {
    if (this.connections.has(record.connectionId) && !options.allowReplace) {
      return sdkErr(duplicateConnectionError({ correlationId }, record.connectionId));
    }

    this.connections.set(record.connectionId, { ...record });
    return sdkOk({ ...record });
  }

  replace(
    record: ConnectionRecord,
    correlationId: string,
  ): SdkResult<ConnectionRecord> {
    if (!this.connections.has(record.connectionId)) {
      return sdkErr(connectionNotFoundError({ correlationId }, record.connectionId));
    }

    this.connections.set(record.connectionId, { ...record });
    return sdkOk({ ...record });
  }

  get(connectionId: string, correlationId: string): SdkResult<ConnectionRecord> {
    const record = this.connections.get(connectionId);
    if (!record) {
      return sdkErr(connectionNotFoundError({ correlationId }, connectionId));
    }

    return sdkOk({ ...record });
  }

  list(): readonly ConnectionRecord[] {
    return [...this.connections.values()].map((record) => ({ ...record }));
  }

  listByTenant(tenantId: string): readonly ConnectionRecord[] {
    return this.list().filter((record) => record.tenantId === tenantId);
  }

  listByIntegration(integrationId: string): readonly ConnectionRecord[] {
    return this.list().filter((record) => record.integrationId === integrationId);
  }

  remove(connectionId: string, correlationId: string): SdkResult<ConnectionRecord> {
    const existing = this.get(connectionId, correlationId);
    if (!existing.ok) {
      return existing;
    }

    this.connections.delete(connectionId);
    return sdkOk(existing.value);
  }

  snapshot(): ConnectionRegistrySnapshot {
    return {
      connections: this.list(),
      capturedAt: this.clock.now(),
    };
  }
}
