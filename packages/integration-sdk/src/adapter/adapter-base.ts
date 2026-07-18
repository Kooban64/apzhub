import type { IntegrationDiagnostics, IntegrationHealth } from "../diagnostics/types";
import type { IntegrationLifecycleState } from "../lifecycle/types";
import type { IntegrationRequestContext } from "../types";
import type { AdapterContext } from "./adapter-context";
import type {
  AdapterConfigurationValidationResult,
  AdapterDisposeReason,
  AdapterDisposeResult,
  AdapterLifecycleResult,
} from "./lifecycle-types";
import type { AdapterBootstrapConfiguration } from "./manifest-types";
import type { AdapterBase } from "./types";

/**
 * Abstract adapter foundation composing the complete Integration SDK.
 * Vendor adapters extend this class — never reimplement cross-cutting SDK behaviour.
 */
export abstract class IntegrationAdapterBase implements AdapterBase {
  readonly integrationId: string;
  protected readonly context: AdapterContext;
  protected readonly configuration: AdapterBootstrapConfiguration;

  private initialised = false;
  private connected = false;
  private disposed = false;

  constructor(context: AdapterContext, configuration: AdapterBootstrapConfiguration) {
    this.context = context;
    this.configuration = configuration;
    this.integrationId = context.integrationId;
  }

  get lifecycleState(): IntegrationLifecycleState {
    return this.context.lifecycleParticipant.lifecycleState;
  }

  /** Authentication provider — credential resolution and auth diagnostics. */
  protected get authenticationProvider() {
    return this.context.authenticationProvider;
  }

  /** Connection manager — register, open, close tenant connections. */
  protected get connectionManager() {
    return this.context.connectionManager;
  }

  /** Health manager — standard health check suite. */
  protected get healthManager() {
    return this.context.healthProvider;
  }

  /** Diagnostics manager — unified runtime diagnostics collection. */
  protected get diagnosticsManager() {
    return this.context.diagnosticsProvider;
  }

  /** Version manager — engine version probe and compatibility. */
  protected get versionManager() {
    return this.context.versionProvider;
  }

  /** Error translator — vendor error to platform category mapping. */
  protected get errorTranslator() {
    return this.context.errorTranslator;
  }

  /** Circuit breaker — fail-fast resilience with diagnostics. */
  protected get circuitBreaker() {
    return this.context.circuitBreaker;
  }

  /** Metrics recorder — request and error counters. */
  protected get metrics() {
    return this.context.metrics;
  }

  /** Metrics provider — low-level counter/gauge/histogram contracts. */
  protected get metricsProvider() {
    return this.context.metricsProvider;
  }

  /** Structured integration logger. */
  protected get logger() {
    return this.context.logger;
  }

  /** Error summary tracker for diagnostics aggregation. */
  protected get errorSummary() {
    return this.context.errorSummary;
  }

  protected get lifecycleParticipant() {
    return this.context.lifecycleParticipant;
  }

  get isInitialised(): boolean {
    return this.initialised;
  }

  get isConnected(): boolean {
    return this.connected;
  }

  get isDisposed(): boolean {
    return this.disposed;
  }

  /** Validates manifest and optional connection defaults before adapter use. */
  async validateConfiguration(): Promise<AdapterConfigurationValidationResult> {
    this.assertNotDisposed();

    const issues: string[] = [];
    const { manifest, connection } = this.configuration;

    if (!manifest.integrationId.trim()) {
      issues.push("integrationId is required");
    }
    if (!manifest.adapterId.trim()) {
      issues.push("adapterId is required");
    }
    if (!manifest.name.trim()) {
      issues.push("name is required");
    }
    if (!manifest.version.trim()) {
      issues.push("version is required");
    }
    if (manifest.declaredCapabilities.length === 0) {
      issues.push("At least one capability must be declared");
    }

    if (connection) {
      if (!connection.connectionId.trim()) {
        issues.push(
          "connection.connectionId is required when connection defaults are supplied",
        );
      }
      if (!connection.baseUrl.trim()) {
        issues.push(
          "connection.baseUrl is required when connection defaults are supplied",
        );
      }
      if (!connection.credentialRef.trim()) {
        issues.push(
          "connection.credentialRef is required when connection defaults are supplied",
        );
      }
    }

    const customValidation = await this.onValidateConfiguration();
    if (customValidation.issues?.length) {
      issues.push(...customValidation.issues);
    }

    if (issues.length > 0) {
      return {
        ok: false,
        message: "Adapter configuration validation failed",
        issues,
      };
    }

    return {
      ok: true,
      message: "Adapter configuration is valid",
      warnings: customValidation.warnings,
    };
  }

  /** Initialises the adapter — validates configuration and runs vendor hooks. */
  async initialise(): Promise<AdapterLifecycleResult> {
    this.assertNotDisposed();

    if (this.initialised) {
      return { ok: true, message: "Adapter already initialised" };
    }

    const validation = await this.validateConfiguration();
    if (!validation.ok) {
      return {
        ok: false,
        message: validation.message,
        warnings: validation.issues,
      };
    }

    await this.onInitialise();
    this.initialised = true;

    this.logger.info("Adapter initialised", {
      correlationId: "adapter-init",
      integrationId: this.integrationId,
      adapterId: this.context.adapterId,
      operation: "initialise",
      result: "success",
    });

    return {
      ok: true,
      message: "Adapter initialised",
      warnings: validation.warnings,
    };
  }

  /** Opens the configured logical connection when defaults are supplied. */
  async connect(context: IntegrationRequestContext): Promise<AdapterLifecycleResult> {
    this.assertNotDisposed();
    this.assertInitialised();

    const connection = this.configuration.connection;
    if (!connection) {
      return {
        ok: false,
        message: "No connection defaults configured for this adapter",
      };
    }

    const registerResult = await this.connectionManager.register(
      {
        connectionId: connection.connectionId,
        tenantId: connection.tenantId,
        integrationId: this.integrationId,
        adapterId: this.context.adapterId,
        baseUrl: connection.baseUrl,
        authenticationMode: connection.authenticationMode,
        credentialRef: connection.credentialRef,
        usernameRef: connection.usernameRef,
        headerName: connection.headerName,
        queryParam: connection.queryParam,
        customScheme: connection.customScheme,
        enabled: connection.enabled ?? true,
        metadata: connection.metadata,
      },
      context.correlationId,
    );

    if (!registerResult.ok) {
      return {
        ok: false,
        message: registerResult.error.message,
      };
    }

    const openResult = await this.connectionManager.open(
      connection.connectionId,
      context.correlationId,
    );

    if (!openResult.ok) {
      return {
        ok: false,
        message: openResult.error.message,
      };
    }

    await this.onConnect(context);
    this.connected = true;

    this.metrics.recordRequest({
      durationMs: 0,
      success: true,
      operation: "connect",
    });

    return { ok: true, message: "Adapter connected" };
  }

  /** Closes the configured logical connection. */
  async disconnect(
    context: IntegrationRequestContext,
  ): Promise<AdapterLifecycleResult> {
    this.assertNotDisposed();

    const connection = this.configuration.connection;
    if (!connection) {
      this.connected = false;
      return { ok: true, message: "No connection configured" };
    }

    const closeResult = await this.connectionManager.close(
      connection.connectionId,
      context.correlationId,
    );

    if (!closeResult.ok) {
      return {
        ok: false,
        message: closeResult.error.message,
      };
    }

    await this.onDisconnect(context);
    this.connected = false;

    return { ok: true, message: "Adapter disconnected" };
  }

  /** Runs the standard health check suite — override to append vendor checks. */
  async performHealthCheck(
    context: IntegrationRequestContext,
  ): Promise<IntegrationHealth> {
    this.assertNotDisposed();

    const baseHealth = await this.healthManager.check({
      context,
      integrationId: this.integrationId,
      capabilityId: this.context.capabilityId,
    });

    const extraChecks = await this.onPerformHealthChecks(context);
    if (extraChecks.length === 0) {
      return baseHealth;
    }

    return {
      ...baseHealth,
      checks: [...baseHealth.checks, ...extraChecks],
    };
  }

  /** Collects unified runtime diagnostics. */
  async collectDiagnostics(
    context: IntegrationRequestContext,
  ): Promise<IntegrationDiagnostics> {
    this.assertNotDisposed();

    const diagnostics = await this.diagnosticsManager.collect({
      context,
      integrationId: this.integrationId,
      capabilityId: this.context.capabilityId,
    });

    return this.onCollectDiagnostics(context, diagnostics);
  }

  /** AdapterBase contract — delegates to performHealthCheck. */
  health(context: IntegrationRequestContext): Promise<IntegrationHealth> {
    return this.performHealthCheck(context);
  }

  /** AdapterBase contract — delegates to collectDiagnostics. */
  diagnostics(context: IntegrationRequestContext): Promise<IntegrationDiagnostics> {
    return this.collectDiagnostics(context);
  }

  /** Releases adapter resources — idempotent. */
  async dispose(
    reason: AdapterDisposeReason = "shutdown",
  ): Promise<AdapterDisposeResult> {
    if (this.disposed) {
      return { ok: true, message: "Adapter already disposed", reason };
    }

    await this.onDispose(reason);
    this.disposed = true;
    this.connected = false;
    this.initialised = false;

    this.logger.info("Adapter disposed", {
      correlationId: "adapter-dispose",
      integrationId: this.integrationId,
      adapterId: this.context.adapterId,
      operation: "dispose",
      result: "success",
    });

    return { ok: true, message: "Adapter disposed", reason };
  }

  /** Vendor hook — extend configuration validation. */
  protected async onValidateConfiguration(): Promise<AdapterConfigurationValidationResult> {
    return { ok: true, message: "No additional validation" };
  }

  /** Vendor hook — run after successful configuration validation. */
  protected async onInitialise(): Promise<void> {
    return undefined;
  }

  /** Vendor hook — run after connection open. */
  protected async onConnect(_context: IntegrationRequestContext): Promise<void> {
    return undefined;
  }

  /** Vendor hook — run after connection close. */
  protected async onDisconnect(_context: IntegrationRequestContext): Promise<void> {
    return undefined;
  }

  /** Vendor hook — append custom health checks to the standard suite. */
  protected async onPerformHealthChecks(
    _context: IntegrationRequestContext,
  ): Promise<IntegrationHealth["checks"]> {
    return [];
  }

  /** Vendor hook — transform or extend collected diagnostics. */
  protected async onCollectDiagnostics(
    _context: IntegrationRequestContext,
    diagnostics: IntegrationDiagnostics,
  ): Promise<IntegrationDiagnostics> {
    return diagnostics;
  }

  /** Vendor hook — cleanup before disposal. */
  protected async onDispose(_reason: AdapterDisposeReason): Promise<void> {
    return undefined;
  }

  protected assertNotDisposed(): void {
    if (this.disposed) {
      throw new Error(`Adapter "${this.integrationId}" has been disposed`);
    }
  }

  protected assertInitialised(): void {
    if (!this.initialised) {
      throw new Error(
        `Adapter "${this.integrationId}" must be initialised before this operation`,
      );
    }
  }
}
