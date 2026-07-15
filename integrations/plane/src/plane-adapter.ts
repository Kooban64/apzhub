import {
  IntegrationAdapterBase,
  type AdapterConfigurationValidationResult,
  type AdapterContext,
  type AdapterLifecycleResult,
} from "@apzhub/integration-sdk/adapter";
import type {
  IntegrationDiagnostics,
  IntegrationHealthCheck,
} from "@apzhub/integration-sdk/diagnostics";
import type { IntegrationRequestContext } from "@apzhub/integration-sdk";
import type { SecretProvider } from "@apzhub/integration-sdk/auth";
import { missingCredentialsError } from "@apzhub/integration-sdk/errors";
import type { ErrorTranslationContext } from "@apzhub/integration-sdk/errors";

import {
  type PlaneConfiguration,
  validatePlaneConfiguration,
} from "./plane-config";
import {
  getPlaneExtendedCapabilities,
  type PlaneBootstrapConfiguration,
} from "./plane-bootstrap";
import {
  createPlaneVendorErrorMapper,
  mapPlaneUnknownError,
  PLANE_INTEGRATION_ID,
} from "./plane-error-mapper";
import { createHttpIntegrationClient } from "@apzhub/integration-sdk/client";
import type { IntegrationClient } from "@apzhub/integration-sdk/client";
import type { FetchFn } from "./internal/plane-fetch-client";
import { PlaneClient } from "./internal/plane-client";
import type { PlaneConnectionTestResult } from "./internal/plane-api-types";
import { getPlaneServiceCapability } from "./capabilities/service-capabilities";
import { createPlaneCoreServices, type PlaneCoreServices } from "./services/plane-core-services";
import {
  createPlaneOperationsService,
  mapOperationalHealthToSdkStatus,
  type PlaneOperationsService,
  type PlaneOperationalHealthLevel,
  type PlaneOperationalReport,
  type PlaneRuntimeDiagnosticsSnapshot,
} from "./operations";
import {
  createPlaneMappingRegistry,
} from "./mappers/plane-mapping-registry";
import type { MappingRegistry } from "@apzhub/integration-sdk/mapping";

export interface PlaneDiagnosticsExtension {
  readonly planeVersion?: string;
  readonly workspaceSlug: string;
  readonly workspaceId?: string;
  readonly workspaceName?: string;
  readonly apiStatus: "reachable" | "degraded" | "unavailable" | "not_tested";
  readonly authenticationStatus: "valid" | "missing" | "invalid" | "unknown";
  readonly extendedCapabilities: readonly string[];
  /** Safe task-capability indicators — no workspace/task content. */
  readonly taskCapability: {
    readonly registered: boolean;
    readonly serviceAvailable: boolean;
    readonly supportedOperations: readonly string[];
    readonly apiAssumption: string;
  };
  /** Safe collaboration/intelligence indicators — no content payloads. */
  readonly collaborationCapability: {
    readonly commentsRegistered: boolean;
    readonly activityRegistered: boolean;
    readonly watchersRegistered: boolean;
    readonly analyticsRegistered: boolean;
  };
  /** Safe sync/events/webhook indicators — no secrets or payloads. */
  readonly syncEventsCapability: {
    readonly webhooksRegistered: boolean;
    readonly eventsRegistered: boolean;
    readonly synchronisationRegistered: boolean;
    readonly webhookCapability: boolean;
    readonly syncCapability: boolean;
    readonly supportedEventTypes: readonly string[];
    readonly supportedWebhookOperations: readonly string[];
    readonly syncHealth: "healthy" | "degraded" | "unhealthy" | "unknown";
    readonly providerLatencyMs?: number;
    readonly providerLimits: {
      readonly maxPageSize: number;
      readonly webhookEvents: readonly string[];
    };
  };
  /** OSS-101-09 operational certification snapshot — no secrets. */
  readonly operationsCapability: {
    readonly adapterVersion: string;
    readonly sdkVersion: string;
    readonly healthLevel: PlaneOperationalHealthLevel;
    readonly healthReasons: readonly string[];
    readonly compatibilityStatus: string;
    readonly certifiedCapabilityCount: number;
    readonly circuitBreakerState: string;
    readonly syncReadiness: string;
    readonly webhookHealth: PlaneOperationalHealthLevel;
  };
  readonly lastConnectionTestAt?: string;
  readonly lastConnectionLatencyMs?: number;
}

export interface PlaneAdapterOptions {
  readonly fetchFn?: FetchFn;
  readonly secretProvider?: SecretProvider;
}

/**
 * Production Plane CE adapter — extends IntegrationAdapterBase.
 * All Plane-specific logic remains in this package.
 */
export class PlaneAdapter extends IntegrationAdapterBase {
  readonly planeConfig: PlaneConfiguration;
  readonly core: PlaneCoreServices;
  readonly operations: PlaneOperationsService;
  readonly mappingRegistry: MappingRegistry;
  private readonly planeClient: PlaneClient;
  private readonly transport: IntegrationClient;
  private readonly planeErrorMapper = createPlaneVendorErrorMapper();
  private readonly secretProvider?: SecretProvider;
  private lastConnectionTest?: PlaneConnectionTestResult;
  private lastConnectionTestAt?: string;
  private apiStatus: PlaneDiagnosticsExtension["apiStatus"] = "not_tested";
  private authenticationStatus: PlaneDiagnosticsExtension["authenticationStatus"] = "unknown";

  constructor(
    context: AdapterContext,
    configuration: PlaneBootstrapConfiguration,
    options: PlaneAdapterOptions = {},
  ) {
    super(context, configuration);
    this.planeConfig = configuration.plane;
    this.secretProvider = options.secretProvider;
    this.mappingRegistry = createPlaneMappingRegistry();

    const transport = createHttpIntegrationClient({
      apiBaseUrl: configuration.plane.apiBaseUrl,
      timeoutMs: configuration.plane.timeoutMs,
      fetchFn: options.fetchFn,
      errorLabel: "Plane",
    });
    this.transport = transport;

    this.planeClient = new PlaneClient({
      client: transport,
      workspaceSlug: configuration.plane.workspaceSlug,
      getAuth: async () => {
        const apiKey = await this.resolveApiKey(
          configuration.plane.apiTokenRef,
          { correlationId: "plane-client-auth", tenantId: configuration.connection?.tenantId ?? "unknown" },
        );
        return { apiKey };
      },
    });

    this.core = createPlaneCoreServices({
      context,
      configuration,
      client: transport,
      workspaceId: undefined,
      resolveApiKey: async (credentialRef, tenantId, correlationId) =>
        this.resolveApiKey(credentialRef, { correlationId, tenantId }),
    });

    this.operations = createPlaneOperationsService({
      core: this.core,
      getRestClient: () => this.core.getRestClient(),
      clock: context.clock,
      validateConfiguration: () => this.validateConfiguration(),
      getAuthenticationStatus: () => this.authenticationStatus,
      getApiStatus: () => this.apiStatus,
      getProviderVersion: () => this.lastConnectionTest?.engineVersion,
      getVersionRange: () => ({
        min: configuration.connection?.metadata?.engineVersionMin ?? "0.23.0",
        max: configuration.connection?.metadata?.engineVersionMax ?? "0.24.x",
      }),
      getLastConnectionLatencyMs: () => this.lastConnectionTest?.latencyMs,
      getAuthenticationMode: () =>
        configuration.connection?.authenticationMode ?? "api_key_header",
      getConnectionMode: () => "http_rest",
      getCircuitBreakerState: () => context.circuitBreaker.state,
      getMetricsSummary: () => context.metrics.getSummary(),
      getRecentFailures: () => {
        const summary = context.errorSummary.getSummary();
        const failures: string[] = [];
        if (summary.lastErrorCode) {
          failures.push(`last_error:${summary.lastErrorCode}`);
        }
        for (const [category, count] of Object.entries(summary.errorsByCategory)) {
          if (count && count > 0) {
            failures.push(`${category}:${count}`);
          }
        }
        return failures;
      },
      loggerAvailable: Boolean(context.logger),
      metricsAvailable: Boolean(context.metrics) && Boolean(context.metricsProvider),
      edition: "community",
    });
  }

  get planeDiagnosticsExtension(): PlaneDiagnosticsExtension {
    const taskCapability = getPlaneServiceCapability("tasks");
    return {
      planeVersion: this.lastConnectionTest?.engineVersion,
      workspaceSlug: this.planeConfig.workspaceSlug,
      workspaceId: this.lastConnectionTest?.workspaceId,
      workspaceName: this.lastConnectionTest?.workspaceName,
      apiStatus: this.apiStatus,
      authenticationStatus: this.authenticationStatus,
      extendedCapabilities: getPlaneExtendedCapabilities(this.configuration as PlaneBootstrapConfiguration),
      taskCapability: {
        registered: Boolean(taskCapability),
        serviceAvailable: Boolean(this.core?.tasks),
        supportedOperations: taskCapability?.operations ?? [],
        apiAssumption: "Plane CE issues API (soft-archive via archived_at)",
      },
      collaborationCapability: {
        commentsRegistered: Boolean(getPlaneServiceCapability("comments")),
        activityRegistered: Boolean(getPlaneServiceCapability("activity")),
        watchersRegistered: Boolean(getPlaneServiceCapability("watchers")),
        analyticsRegistered: Boolean(getPlaneServiceCapability("analytics")),
      },
      syncEventsCapability: {
        webhooksRegistered: Boolean(getPlaneServiceCapability("webhooks")),
        eventsRegistered: Boolean(getPlaneServiceCapability("events")),
        synchronisationRegistered: Boolean(getPlaneServiceCapability("synchronisation")),
        webhookCapability: Boolean(this.core?.webhooks),
        syncCapability: Boolean(this.core?.synchronisation),
        supportedEventTypes: this.core?.events.getDiagnostics().supportedEventTypes ?? [],
        supportedWebhookOperations: this.core?.webhooks.supportedOperations() ?? [],
        syncHealth: this.core?.synchronisation.getDiagnostics().syncHealth ?? "unknown",
        providerLatencyMs:
          this.core?.synchronisation.getSyncState().providerLatencyMs ??
          this.lastConnectionTest?.latencyMs,
        providerLimits: {
          maxPageSize: 100,
          webhookEvents: this.core?.webhooks.supportedEventTypes() ?? [],
        },
      },
      operationsCapability: (() => {
        const snapshot = this.operations.buildRuntimeDiagnostics();
        const compatibility = this.operations.getCompatibilityMatrix();
        return {
          adapterVersion: snapshot.adapterVersion,
          sdkVersion: snapshot.sdkVersion,
          healthLevel: snapshot.healthLevel,
          healthReasons: snapshot.healthReasons,
          compatibilityStatus: compatibility.compatibilityStatus,
          certifiedCapabilityCount: this.operations.certifyCapabilities().length,
          circuitBreakerState: snapshot.circuitBreakerState,
          syncReadiness: snapshot.syncReadiness,
          webhookHealth: snapshot.webhookHealth,
        };
      })(),
      lastConnectionTestAt: this.lastConnectionTestAt,
      lastConnectionLatencyMs: this.lastConnectionTest?.latencyMs,
    };
  }

  /** Run optional feature detection probes — never fails startup for optional gaps. */
  async detectFeatures(context: IntegrationRequestContext) {
    return this.operations.detectFeatures(context);
  }

  /** Structured operational readiness validation. */
  async evaluateReadiness(context: IntegrationRequestContext) {
    return this.operations.evaluateReadiness(context);
  }

  /** Full operational report for future administration tooling. */
  async buildOperationalReport(
    context: IntegrationRequestContext,
  ): Promise<PlaneOperationalReport> {
    return this.operations.buildOperationalReport(context);
  }

  /** Runtime diagnostics snapshot (no secrets). */
  getRuntimeDiagnosticsSnapshot(): PlaneRuntimeDiagnosticsSnapshot {
    return this.operations.buildRuntimeDiagnostics();
  }

  /** Tests Plane API connectivity and records version/workspace metadata. */
  async testConnection(context: IntegrationRequestContext): Promise<AdapterLifecycleResult> {
    this.assertNotDisposed();
    this.assertInitialised();

    if (!this.circuitBreaker.allowRequest()) {
      return { ok: false, message: "Circuit breaker open — Plane connection test rejected" };
    }

    const startedAt = this.context.clock.now();

    try {
      const authCheck = await this.validateAuthentication(context);
      if (!authCheck.ok) {
        return authCheck;
      }

      const result = await this.planeClient.testConnection(context);
      this.lastConnectionTest = result;
      this.lastConnectionTestAt = this.context.clock.now();
      this.apiStatus = "reachable";
      this.authenticationStatus = "valid";

      this.metrics.recordRequest({
        durationMs: result.latencyMs,
        success: true,
        operation: "connection_test",
      });
      this.circuitBreaker.recordSuccess();

      this.logger.info("Plane connection test succeeded", {
        correlationId: context.correlationId,
        tenantId: context.tenantId,
        operation: "connection_test",
        durationMs: result.latencyMs,
        result: "success",
      });

      return {
        ok: true,
        message: `Plane connection verified (version ${result.engineVersion ?? "unknown"})`,
      };
    } catch (error) {
      const translated = mapPlaneUnknownError(error, this.buildErrorContext(context, "connection_test"));
      this.errorSummary.record(translated.error);
      this.circuitBreaker.recordFailure(translated.error);
      this.apiStatus = "unavailable";
      this.authenticationStatus =
        translated.error.category === "authentication" ? "invalid" : this.authenticationStatus;

      this.metrics.recordRequest({
        durationMs: Date.now() - new Date(startedAt).getTime(),
        success: false,
        operation: "connection_test",
      });

      this.logger.error("Plane connection test failed", {
        correlationId: context.correlationId,
        tenantId: context.tenantId,
        operation: "connection_test",
        result: "failure",
        errorCode: translated.error.code,
        errorCategory: translated.error.category,
      });

      return { ok: false, message: translated.error.message };
    }
  }

  /** Discovers Plane engine version via instance endpoint. */
  async discoverVersion(context: IntegrationRequestContext): Promise<string | undefined> {
    this.assertNotDisposed();
    const instance = await this.planeClient.getInstance(context);
    return instance.instance.version;
  }

  protected override async onInitialise(): Promise<void> {
    this.errorTranslator.registerMapper(this.planeErrorMapper);
  }

  protected override async onValidateConfiguration(): Promise<AdapterConfigurationValidationResult> {
    const planeValidation = validatePlaneConfiguration(this.planeConfig);
    if (!planeValidation.ok) {
      return {
        ok: false,
        message: "Plane configuration validation failed",
        issues: planeValidation.issues,
      };
    }

    return { ok: true, message: "Plane configuration valid" };
  }

  protected override async onConnect(context: IntegrationRequestContext): Promise<void> {
    const test = await this.testConnection(context);
    if (!test.ok) {
      throw new Error(test.message);
    }
  }

  protected override async onPerformHealthChecks(
    _context: IntegrationRequestContext,
  ): Promise<IntegrationHealthCheck[]> {
    const checks: IntegrationHealthCheck[] = [
      {
        name: "plane_api",
        status:
          this.apiStatus === "reachable"
            ? "pass"
            : this.apiStatus === "degraded"
              ? "warn"
              : this.apiStatus === "unavailable"
                ? "fail"
                : "warn",
        message:
          this.apiStatus === "reachable"
            ? "Plane API reachable"
            : this.apiStatus === "not_tested"
              ? "Plane API not tested yet"
              : `Plane API status: ${this.apiStatus}`,
      },
      {
        name: "plane_authentication",
        status:
          this.authenticationStatus === "valid"
            ? "pass"
            : this.authenticationStatus === "missing" || this.authenticationStatus === "invalid"
              ? "fail"
              : "warn",
        message: `Plane authentication: ${this.authenticationStatus}`,
      },
      {
        name: "plane_workspace",
        status: this.lastConnectionTest?.workspaceId ? "pass" : "warn",
        message: this.lastConnectionTest?.workspaceId
          ? `Workspace "${this.planeConfig.workspaceSlug}" resolved`
          : "Workspace not verified",
      },
    ];

    if (this.lastConnectionTest?.engineVersion) {
      checks.push({
        name: "plane_version",
        status: "pass",
        message: `Plane version ${this.lastConnectionTest.engineVersion}`,
      });
    }

    const health = this.operations.classifyHealth();
    checks.push({
      name: "plane_operational_health",
      status:
        health.level === "HEALTHY"
          ? "pass"
          : health.level === "UNAVAILABLE"
            ? "fail"
            : "warn",
      message: `Operational health: ${health.level}${
        health.reasons.length > 0 ? ` (${health.reasons.join(", ")})` : ""
      }`,
    });

    return checks;
  }

  protected override async onCollectDiagnostics(
    _context: IntegrationRequestContext,
    diagnostics: IntegrationDiagnostics,
  ): Promise<IntegrationDiagnostics> {
    const extension = this.planeDiagnosticsExtension;
    const warnings = [...diagnostics.warnings];
    const operational = this.operations.buildRuntimeDiagnostics();
    const compatibility = this.operations.getCompatibilityMatrix();

    if (extension.apiStatus !== "reachable") {
      warnings.push("Plane API has not been verified as reachable");
    }
    for (const reason of operational.healthReasons) {
      warnings.push(`operational:${reason}`);
    }
    if (compatibility.unsupportedFeatures.length > 0) {
      warnings.push(
        `unsupported_features:${compatibility.unsupportedFeatures.length}`,
      );
    }

    return {
      ...diagnostics,
      engineVersion: extension.planeVersion ?? diagnostics.engineVersion,
      healthStatus: mapOperationalHealthToSdkStatus(operational.healthLevel),
      versionCompatibility:
        compatibility.compatibilityStatus === "not_checked"
          ? diagnostics.versionCompatibility
          : compatibility.compatibilityStatus,
      warnings,
      recommendations: [
        ...diagnostics.recommendations,
        ...(extension.authenticationStatus !== "valid"
          ? ["Verify Plane API token via SecretProvider"]
          : []),
        ...(compatibility.compatibilityStatus === "incompatible"
          ? ["Upgrade or pin Plane CE within the supported version range"]
          : []),
      ],
      connection: diagnostics.connection
        ? {
            ...diagnostics.connection,
            warnings: [
              ...diagnostics.connection.warnings,
              `Plane workspace: ${extension.workspaceSlug}`,
              `Adapter version: ${operational.adapterVersion}`,
              `SDK version: ${operational.sdkVersion}`,
            ],
          }
        : diagnostics.connection,
    };
  }

  protected override async onDispose(): Promise<void> {
    this.errorTranslator.unregisterMapper(PLANE_INTEGRATION_ID);
  }

  private async validateAuthentication(
    context: IntegrationRequestContext,
  ): Promise<AdapterLifecycleResult> {
    try {
      await this.resolveApiKey(this.planeConfig.apiTokenRef, context);
      this.authenticationStatus = "valid";
      return { ok: true, message: "Plane API token present" };
    } catch {
      this.authenticationStatus = "missing";
      const error = missingCredentialsError(
        { correlationId: context.correlationId },
        "Plane API token is missing",
      );
      return { ok: false, message: error.message };
    }
  }

  private async resolveApiKey(
    credentialRef: string,
    context: IntegrationRequestContext,
  ): Promise<string> {
    const authResult = await this.authenticationProvider.authenticate({
      tenantId: context.tenantId,
      correlationId: context.correlationId,
      integrationId: PLANE_INTEGRATION_ID,
      connectionId: this.configuration.connection?.connectionId ?? "plane-default-connection",
      credential: {
        credentialRef,
        authenticationMode: "api_key_header",
        headerName: "X-Api-Key",
      },
    });

    if (!authResult.ok) {
      throw new Error(authResult.error.message);
    }

    if (!this.secretProvider) {
      throw new Error("SecretProvider is required to materialize Plane API credentials");
    }

    const material = await this.secretProvider.resolve({
      credentialRef,
      tenantId: context.tenantId,
      correlationId: context.correlationId,
    });

    if (!material.ok) {
      throw new Error(material.error.message);
    }

    return material.value.value;
  }

  private buildErrorContext(
    context: IntegrationRequestContext,
    operation: string,
  ): ErrorTranslationContext {
    return {
      correlationId: context.correlationId,
      integrationId: PLANE_INTEGRATION_ID,
      adapterId: this.context.adapterId,
      operation,
      tenantId: context.tenantId,
    };
  }
}

