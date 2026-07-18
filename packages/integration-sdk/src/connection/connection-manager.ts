import type { AuthenticationProvider } from "../auth/types";
import type { AuthCredentialReference } from "../auth/types";
import {
  connectionNotFoundError,
  integrationMismatchError,
  tenantMismatchError,
} from "../errors/codes";
import { sdkErr, sdkOk, type SdkResult } from "../errors/result";
import type { Clock } from "../auth/authentication-provider";
import { systemClock } from "../auth/authentication-provider";
import { ConnectionLifecycleService } from "./lifecycle-service";
import type { ConnectionRegistry } from "./registry";
import type { ConnectionDefinition, ConnectionRecord } from "./types";
import { validateConnectionDefinition } from "./validation";
import { buildConnectionDiagnostics } from "./connection-diagnostics";

export interface ConnectionManager {
  register(
    definition: ConnectionDefinition,
    correlationId: string,
  ): Promise<SdkResult<ConnectionRecord>>;
  open(
    connectionId: string,
    correlationId: string,
  ): Promise<SdkResult<ConnectionRecord>>;
  close(
    connectionId: string,
    correlationId: string,
  ): Promise<SdkResult<ConnectionRecord>>;
  getState(connectionId: string, correlationId: string): SdkResult<ConnectionRecord>;
  disable(connectionId: string, correlationId: string): SdkResult<ConnectionRecord>;
  getDiagnostics(tenantId?: string): ReturnType<typeof buildConnectionDiagnostics>;
}

export interface DefaultConnectionManagerOptions {
  readonly registry: ConnectionRegistry;
  readonly authenticationProvider: AuthenticationProvider;
  readonly lifecycleService?: ConnectionLifecycleService;
  readonly clock?: Clock;
}

export class DefaultConnectionManager implements ConnectionManager {
  private readonly registry: ConnectionRegistry;
  private readonly authenticationProvider: AuthenticationProvider;
  private readonly lifecycleService: ConnectionLifecycleService;
  private readonly clock: Clock;

  constructor(options: DefaultConnectionManagerOptions) {
    this.registry = options.registry;
    this.authenticationProvider = options.authenticationProvider;
    this.lifecycleService =
      options.lifecycleService ?? new ConnectionLifecycleService(options.clock);
    this.clock = options.clock ?? systemClock;
  }

  async register(
    definition: ConnectionDefinition,
    correlationId: string,
  ): Promise<SdkResult<ConnectionRecord>> {
    const validation = validateConnectionDefinition(definition, correlationId);
    if (!validation.ok) {
      return validation;
    }

    const now = this.clock.now();
    const record: ConnectionRecord = {
      connectionId: definition.connectionId,
      tenantId: definition.tenantId,
      integrationId: definition.integrationId,
      adapterId: definition.adapterId,
      displayName: definition.displayName,
      baseUrl: definition.baseUrl,
      authenticationMode: definition.authenticationMode,
      lifecycleState: definition.enabled === false ? "disabled" : "configured",
      enabled: definition.enabled ?? true,
      credentialRef: definition.credentialRef,
      usernameRef: definition.usernameRef,
      headerName: definition.headerName,
      queryParam: definition.queryParam,
      customScheme: definition.customScheme,
      configuredAt: now,
      lastValidatedAt: now,
      metadata: { ...(definition.metadata ?? {}) },
    };

    return this.registry.register(record, {}, correlationId);
  }

  async open(
    connectionId: string,
    correlationId: string,
  ): Promise<SdkResult<ConnectionRecord>> {
    const current = this.registry.get(connectionId, correlationId);
    if (!current.ok) {
      return current;
    }

    if (!current.value.enabled) {
      return sdkErr(
        connectionNotFoundError(
          { correlationId, details: { reason: "disabled" } },
          connectionId,
        ),
      );
    }

    const authenticating = this.lifecycleService.transition({
      connection: current.value,
      to: "authenticating",
      correlationId,
    });
    if (!authenticating.ok) {
      return authenticating;
    }

    this.registry.replace(authenticating.value, correlationId);

    const credential = this.toCredentialReference(authenticating.value);
    const authResult = await this.authenticationProvider.authenticate({
      tenantId: authenticating.value.tenantId,
      integrationId: authenticating.value.integrationId,
      connectionId: authenticating.value.connectionId,
      credential,
      correlationId,
    });

    const nextState = authResult.ok ? "connected" : "authentication_failed";
    const transitioned = this.lifecycleService.transition({
      connection: authenticating.value,
      to: nextState,
      correlationId,
    });

    if (!transitioned.ok) {
      return transitioned;
    }

    if (!authResult.ok) {
      this.registry.replace(transitioned.value, correlationId);
      return sdkErr(authResult.error);
    }

    return this.registry.replace(transitioned.value, correlationId);
  }

  async close(
    connectionId: string,
    correlationId: string,
  ): Promise<SdkResult<ConnectionRecord>> {
    const current = this.registry.get(connectionId, correlationId);
    if (!current.ok) {
      return current;
    }

    const closed = this.lifecycleService.transition({
      connection: current.value,
      to: "disconnected",
      correlationId,
    });
    if (!closed.ok) {
      return closed;
    }

    return this.registry.replace(closed.value, correlationId);
  }

  getState(connectionId: string, correlationId: string): SdkResult<ConnectionRecord> {
    return this.registry.get(connectionId, correlationId);
  }

  disable(connectionId: string, correlationId: string): SdkResult<ConnectionRecord> {
    const current = this.registry.get(connectionId, correlationId);
    if (!current.ok) {
      return current;
    }

    const disabled = this.lifecycleService.transition({
      connection: { ...current.value, enabled: false },
      to: "disabled",
      correlationId,
    });
    if (!disabled.ok) {
      return disabled;
    }

    return this.registry.replace({ ...disabled.value, enabled: false }, correlationId);
  }

  getDiagnostics(tenantId?: string) {
    const connections = tenantId
      ? this.registry.listByTenant(tenantId)
      : this.registry.list();

    return buildConnectionDiagnostics({ connections, tenantId });
  }

  assertScope(
    connection: ConnectionRecord,
    tenantId: string,
    integrationId: string,
    correlationId: string,
  ): SdkResult<void> {
    if (connection.tenantId !== tenantId) {
      return sdkErr(
        tenantMismatchError(
          { correlationId, details: { connectionId: connection.connectionId } },
          "Connection tenantId does not match request scope",
        ),
      );
    }

    if (connection.integrationId !== integrationId) {
      return sdkErr(
        integrationMismatchError(
          { correlationId, details: { connectionId: connection.connectionId } },
          "Connection integrationId does not match request scope",
        ),
      );
    }

    return sdkOk(undefined);
  }

  private toCredentialReference(record: ConnectionRecord): AuthCredentialReference {
    return {
      credentialRef: record.credentialRef,
      authenticationMode: record.authenticationMode,
      usernameRef: record.usernameRef,
      headerName: record.headerName,
      queryParam: record.queryParam,
      customScheme: record.customScheme,
    };
  }
}

export function createConnectionManager(
  options: DefaultConnectionManagerOptions,
): ConnectionManager {
  return new DefaultConnectionManager(options);
}
