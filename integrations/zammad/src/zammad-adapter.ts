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

import { type ZammadConfiguration, validateZammadConfiguration } from "./zammad-config";
import {
  getZammadExtendedCapabilities,
  type ZammadBootstrapConfiguration,
} from "./zammad-bootstrap";
import {
  createZammadVendorErrorMapper,
  mapZammadUnknownError,
  ZAMMAD_INTEGRATION_ID,
} from "./zammad-error-mapper";
import { createHttpIntegrationClient } from "@apzhub/integration-sdk/client";
import type { FetchFn } from "./internal/zammad-fetch-client";
import {
  ZammadRestClient,
  type ZammadConnectionTestResult,
} from "./internal/zammad-rest-client";
import {
  listRegisteredPlaceholderCapabilityIds,
  ZAMMAD_PLACEHOLDER_CAPABILITIES,
} from "./capabilities/placeholder-capabilities";
import {
  ZAMMAD_CORE_SERVICE_CAPABILITIES,
  getZammadCoreServiceCapability,
} from "./capabilities/service-capabilities";
import {
  createZammadCoreServices,
  type ZammadCoreServices,
} from "./services/zammad-core-services";
import { createZammadMappingRegistry } from "./mappers/zammad-mapping-registry";
import type { MappingRegistry } from "@apzhub/integration-sdk/mapping";
import {
  createZammadOperationsService,
  mapOperationalHealthToSdkStatus,
  type ZammadOperationalReport,
  type ZammadOperationsService,
  type ZammadRuntimeDiagnosticsSnapshot,
} from "./operations";

export const ZAMMAD_ADAPTER_VERSION = "0.6.0";

export interface ZammadDiagnosticsExtension {
  readonly zammadVersion?: string;
  readonly edition: "community" | "enterprise" | "unknown";
  readonly apiStatus: "reachable" | "degraded" | "unavailable" | "not_tested";
  readonly authenticationStatus: "valid" | "missing" | "invalid" | "unknown";
  readonly extendedCapabilities: readonly string[];
  readonly coreServices: readonly {
    readonly serviceId: string;
    readonly available: boolean;
    readonly implemented: true;
  }[];
  readonly supportServiceAvailable: boolean;
  readonly organizationServiceAvailable: boolean;
  readonly groupServiceAvailable: boolean;
  readonly userServiceAvailable: boolean;
  readonly articleServiceRegistered: boolean;
  readonly articleListingAvailable: boolean;
  readonly internalNoteCreationAvailable: boolean;
  readonly customerReplyCreationAvailable: boolean;
  readonly supportedArticleChannels: readonly string[];
  readonly attachmentMetadataSupport: boolean;
  readonly binaryAttachmentSupport: false;
  readonly unsupportedArticleMutations: readonly string[];
  readonly searchServiceAvailable: boolean;
  readonly historyServiceAvailable: boolean;
  readonly analyticsServiceAvailable: boolean;
  readonly searchLimitations: readonly string[];
  readonly historyLimitations: readonly string[];
  readonly analyticsLimitations: readonly string[];
  readonly syncEventsCapability: {
    readonly webhooksRegistered: boolean;
    readonly eventsRegistered: boolean;
    readonly synchronisationRegistered: boolean;
    readonly webhookCapability: boolean;
    readonly syncCapability: boolean;
    readonly syncReadiness: boolean;
    readonly webhookReadiness: boolean;
    readonly supportedEventTypes: readonly string[];
    readonly supportedWebhookOperations: readonly string[];
    readonly syncHealth: "healthy" | "degraded" | "unhealthy" | "unknown";
    readonly providerLatencyMs?: number;
    readonly configurationValid: boolean;
    readonly providerLimits: {
      readonly maxPageSize: number;
      readonly webhookEvents: readonly string[];
    };
  };
  readonly operationsCapability: {
    readonly adapterVersion: string;
    readonly sdkVersion: string;
    readonly healthLevel: string;
    readonly healthReasons: readonly string[];
    readonly compatibilityStatus: string;
    readonly certifiedCapabilityCount: number;
    readonly circuitBreakerState: string;
    readonly syncReadiness: string;
    readonly webhookHealth: string;
    readonly certificationOutcomeHint: string;
  };
  readonly placeholderCapabilities: readonly {
    readonly capabilityId: string;
    readonly registered: true;
    readonly implemented: false;
  }[];
  readonly connectedUserId?: number;
  readonly connectedUserLogin?: string;
  readonly lastConnectionTestAt?: string;
  readonly lastConnectionLatencyMs?: number;
  readonly adapterVersion: string;
  readonly oauthEnabled: boolean;
}

export interface ZammadAdapterOptions {
  readonly fetchFn?: FetchFn;
  readonly secretProvider?: SecretProvider;
}

/**
 * Zammad CE adapter — extends IntegrationAdapterBase.
 * Core Support + articles + search/history/analytics + sync/events/webhooks + operations (OSS-102-07).
 */
export class ZammadAdapter extends IntegrationAdapterBase {
  readonly zammadConfig: ZammadConfiguration;
  readonly core: ZammadCoreServices;
  readonly operations: ZammadOperationsService;
  readonly mappingRegistry: MappingRegistry;
  private readonly restClient: ZammadRestClient;
  private readonly zammadErrorMapper = createZammadVendorErrorMapper();
  private readonly secretProvider?: SecretProvider;
  private lastConnectionTest?: ZammadConnectionTestResult;
  private lastConnectionTestAt?: string;
  private apiStatus: ZammadDiagnosticsExtension["apiStatus"] = "not_tested";
  private authenticationStatus: ZammadDiagnosticsExtension["authenticationStatus"] =
    "unknown";
  private detectedEdition: ZammadDiagnosticsExtension["edition"] = "unknown";

  constructor(
    context: AdapterContext,
    configuration: ZammadBootstrapConfiguration,
    options: ZammadAdapterOptions = {},
  ) {
    super(context, configuration);
    this.zammadConfig = configuration.zammad;
    this.secretProvider = options.secretProvider;
    this.mappingRegistry = createZammadMappingRegistry();

    const transport = createHttpIntegrationClient({
      apiBaseUrl: configuration.zammad.apiBaseUrl,
      timeoutMs: configuration.zammad.timeoutMs,
      defaultHeaders: configuration.zammad.defaultHeaders,
      fetchFn: options.fetchFn,
      errorLabel: "Zammad",
    });

    this.restClient = new ZammadRestClient({
      client: transport,
      getAuth: async () => {
        const apiToken = await this.resolveApiToken(configuration.zammad.apiTokenRef, {
          correlationId: "zammad-client-auth",
          tenantId: configuration.connection?.tenantId ?? "unknown",
        });
        return { apiToken };
      },
    });

    this.core = createZammadCoreServices({
      context,
      configuration,
      client: transport,
      resolveApiToken: async (credentialRef, tenantId, correlationId) =>
        this.resolveApiToken(credentialRef, { correlationId, tenantId }),
    });

    const configuredEdition = configuration.connection?.metadata?.edition;
    if (
      configuredEdition === "community" ||
      configuredEdition === "enterprise" ||
      configuredEdition === "unknown"
    ) {
      this.detectedEdition = configuredEdition;
    }

    this.operations = createZammadOperationsService({
      core: this.core,
      getRestClient: () => this.restClient,
      clock: context.clock,
      validateConfiguration: () => this.validateConfiguration(),
      getAuthenticationStatus: () => this.authenticationStatus,
      getApiStatus: () => this.apiStatus,
      getProviderVersion: () => this.lastConnectionTest?.engineVersion,
      getVersionRange: () => ({
        min: configuration.connection?.metadata?.engineVersionMin ?? "6.3.0",
        max: configuration.connection?.metadata?.engineVersionMax ?? "6.5.x",
      }),
      getLastConnectionLatencyMs: () => this.lastConnectionTest?.latencyMs,
      getAuthenticationMode: () =>
        configuration.connection?.authenticationMode ?? "api_token",
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
      diagnosticsAvailable: true,
      edition: this.detectedEdition === "unknown" ? "community" : this.detectedEdition,
    });
  }

  get zammadDiagnosticsExtension(): ZammadDiagnosticsExtension {
    const coreAvailable = this.apiStatus === "reachable";
    return {
      zammadVersion: this.lastConnectionTest?.engineVersion,
      edition: this.lastConnectionTest?.edition ?? this.detectedEdition,
      apiStatus: this.apiStatus,
      authenticationStatus: this.authenticationStatus,
      extendedCapabilities: getZammadExtendedCapabilities(
        this.configuration as ZammadBootstrapConfiguration,
      ),
      coreServices: ZAMMAD_CORE_SERVICE_CAPABILITIES.map((capability) => ({
        serviceId: capability.serviceId,
        available: coreAvailable,
        implemented: true as const,
      })),
      supportServiceAvailable: coreAvailable,
      organizationServiceAvailable: coreAvailable,
      groupServiceAvailable: coreAvailable,
      userServiceAvailable: coreAvailable,
      articleServiceRegistered: true,
      articleListingAvailable: coreAvailable,
      internalNoteCreationAvailable: coreAvailable,
      customerReplyCreationAvailable: coreAvailable,
      supportedArticleChannels: ["note", "email", "phone", "web", "chat", "sms", "fax"],
      attachmentMetadataSupport: true,
      binaryAttachmentSupport: false,
      unsupportedArticleMutations: ["update", "delete"],
      searchServiceAvailable: coreAvailable,
      historyServiceAvailable: coreAvailable,
      analyticsServiceAvailable: coreAvailable,
      searchLimitations: [
        "Zammad query syntax is not exposed publicly",
        "Group search uses list + client-side filter",
        "Article search scans articles for matching tickets",
      ],
      historyLimitations: [
        "Read-only timeline from ticket history API",
        "Unknown provider events map to action unknown",
      ],
      analyticsLimitations: [
        "Derived from ticket inventory (no dedicated CE stats API required)",
        "Overdue uses untouched open/new heuristic (>7 days) when SLA API absent",
        "averageFirstResponseMinutes omitted without engine signal",
      ],
      syncEventsCapability: {
        webhooksRegistered: Boolean(getZammadCoreServiceCapability("webhooks")),
        eventsRegistered: Boolean(getZammadCoreServiceCapability("events")),
        synchronisationRegistered: Boolean(
          getZammadCoreServiceCapability("synchronisation"),
        ),
        webhookCapability: Boolean(this.core.webhooks),
        syncCapability: Boolean(this.core.synchronisation),
        syncReadiness: coreAvailable,
        webhookReadiness: coreAvailable,
        supportedEventTypes: this.core.events.getDiagnostics().supportedEventTypes,
        supportedWebhookOperations: this.core.webhooks.supportedOperations(),
        syncHealth: this.core.synchronisation.getDiagnostics().syncHealth,
        providerLatencyMs:
          this.core.synchronisation.getSyncState().providerLatencyMs ??
          this.lastConnectionTest?.latencyMs,
        configurationValid: true,
        providerLimits: {
          maxPageSize: 100,
          webhookEvents: this.core.webhooks.supportedEventTypes(),
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
          certificationOutcomeHint:
            compatibility.blockingIncompatibilities.length > 0
              ? "INCOMPATIBLE"
              : snapshot.healthLevel === "HEALTHY"
                ? "CERTIFIED"
                : snapshot.healthLevel === "DEGRADED"
                  ? "CERTIFIED_WITH_LIMITATIONS"
                  : "NOT_CERTIFIED",
        };
      })(),
      placeholderCapabilities: ZAMMAD_PLACEHOLDER_CAPABILITIES.map((capability) => ({
        capabilityId: capability.capabilityId,
        registered: true as const,
        implemented: false as const,
      })),
      connectedUserId: this.lastConnectionTest?.userId,
      connectedUserLogin: this.lastConnectionTest?.userLogin,
      lastConnectionTestAt: this.lastConnectionTestAt,
      lastConnectionLatencyMs: this.lastConnectionTest?.latencyMs,
      adapterVersion: ZAMMAD_ADAPTER_VERSION,
      oauthEnabled: this.zammadConfig.oauth.enabled,
    };
  }

  /** Lists placeholder capability IDs registered for future milestones. */
  listPlaceholderCapabilities(): readonly string[] {
    return listRegisteredPlaceholderCapabilityIds();
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
  ): Promise<ZammadOperationalReport> {
    return this.operations.buildOperationalReport(context);
  }

  /** Runtime diagnostics snapshot (no secrets). */
  getRuntimeDiagnosticsSnapshot(): ZammadRuntimeDiagnosticsSnapshot {
    return this.operations.buildRuntimeDiagnostics();
  }

  /** Tests Zammad API connectivity via `/api/v1/users/me`. */
  async testConnection(
    context: IntegrationRequestContext,
  ): Promise<AdapterLifecycleResult> {
    this.assertNotDisposed();
    this.assertInitialised();

    if (!this.circuitBreaker.allowRequest()) {
      return {
        ok: false,
        message: "Circuit breaker open — Zammad connection test rejected",
      };
    }

    const startedAt = this.context.clock.now();

    try {
      const authCheck = await this.validateAuthentication(context);
      if (!authCheck.ok) {
        return authCheck;
      }

      const result = await this.restClient.testConnection(context);
      this.lastConnectionTest = result;
      this.lastConnectionTestAt = this.context.clock.now();
      this.apiStatus = "reachable";
      this.authenticationStatus = "valid";
      if (result.edition && result.edition !== "unknown") {
        this.detectedEdition = result.edition;
      }

      this.metrics.recordRequest({
        durationMs: result.latencyMs,
        success: true,
        operation: "connection_test",
      });
      this.circuitBreaker.recordSuccess();

      this.logger.info("Zammad connection test succeeded", {
        correlationId: context.correlationId,
        tenantId: context.tenantId,
        operation: "connection_test",
        durationMs: result.latencyMs,
        result: "success",
      });

      return {
        ok: true,
        message: `Zammad connection verified (version ${result.engineVersion ?? "unknown"})`,
      };
    } catch (error) {
      const translated = mapZammadUnknownError(
        error,
        this.buildErrorContext(context, "connection_test"),
      );
      this.errorSummary.record(translated.error);
      this.circuitBreaker.recordFailure(translated.error);
      this.apiStatus = "unavailable";
      this.authenticationStatus =
        translated.error.category === "authentication"
          ? "invalid"
          : this.authenticationStatus;

      this.metrics.recordRequest({
        durationMs: Date.now() - new Date(startedAt).getTime(),
        success: false,
        operation: "connection_test",
      });

      this.logger.error("Zammad connection test failed", {
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

  /** Discovers Zammad engine version from the last connection probe or a fresh probe. */
  async discoverVersion(
    context: IntegrationRequestContext,
  ): Promise<string | undefined> {
    this.assertNotDisposed();
    if (this.lastConnectionTest?.engineVersion) {
      return this.lastConnectionTest.engineVersion;
    }

    const result = await this.restClient.testConnection(context);
    this.lastConnectionTest = result;
    this.lastConnectionTestAt = this.context.clock.now();
    return result.engineVersion;
  }

  /** Returns detected or configured edition metadata. */
  getDetectedEdition(): "community" | "enterprise" | "unknown" {
    return this.lastConnectionTest?.edition ?? this.detectedEdition;
  }

  protected override async onInitialise(): Promise<void> {
    this.errorTranslator.registerMapper(this.zammadErrorMapper);
  }

  protected override async onValidateConfiguration(): Promise<AdapterConfigurationValidationResult> {
    const validation = validateZammadConfiguration(this.zammadConfig);
    if (!validation.ok) {
      return {
        ok: false,
        message: "Zammad configuration validation failed",
        issues: validation.issues,
      };
    }

    return { ok: true, message: "Zammad configuration valid" };
  }

  protected override async onConnect(
    context: IntegrationRequestContext,
  ): Promise<void> {
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
        name: "zammad_api",
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
            ? "Zammad API reachable"
            : this.apiStatus === "not_tested"
              ? "Zammad API not tested yet"
              : `Zammad API status: ${this.apiStatus}`,
      },
      {
        name: "zammad_authentication",
        status:
          this.authenticationStatus === "valid"
            ? "pass"
            : this.authenticationStatus === "missing" ||
                this.authenticationStatus === "invalid"
              ? "fail"
              : "warn",
        message: `Zammad authentication: ${this.authenticationStatus}`,
      },
      {
        name: "zammad_configuration",
        status: "pass",
        message: "Zammad configuration present",
      },
      {
        name: "zammad_capabilities",
        status: "pass",
        message: `Core services: ${ZAMMAD_CORE_SERVICE_CAPABILITIES.length}; placeholders: ${listRegisteredPlaceholderCapabilityIds().length}`,
      },
      {
        name: "zammad_support_service",
        status: this.apiStatus === "reachable" ? "pass" : "warn",
        message:
          this.apiStatus === "reachable"
            ? "Support service available"
            : "Support service availability unknown until API is reachable",
      },
      {
        name: "zammad_organization_service",
        status: this.apiStatus === "reachable" ? "pass" : "warn",
        message:
          this.apiStatus === "reachable"
            ? "Organization service available"
            : "Organization service availability unknown until API is reachable",
      },
      {
        name: "zammad_group_service",
        status: this.apiStatus === "reachable" ? "pass" : "warn",
        message:
          this.apiStatus === "reachable"
            ? "Group service available"
            : "Group service availability unknown until API is reachable",
      },
      {
        name: "zammad_user_service",
        status: this.apiStatus === "reachable" ? "pass" : "warn",
        message:
          this.apiStatus === "reachable"
            ? "User service available"
            : "User service availability unknown until API is reachable",
      },
      {
        name: "zammad_article_service",
        status: this.apiStatus === "reachable" ? "pass" : "warn",
        message:
          this.apiStatus === "reachable"
            ? "Article service available (metadata attachments only; no update/delete)"
            : "Article service availability unknown until API is reachable",
      },
      {
        name: "zammad_search_service",
        status: this.apiStatus === "reachable" ? "pass" : "warn",
        message:
          this.apiStatus === "reachable"
            ? "Search service available (canonical hits only)"
            : "Search service availability unknown until API is reachable",
      },
      {
        name: "zammad_history_service",
        status: this.apiStatus === "reachable" ? "pass" : "warn",
        message:
          this.apiStatus === "reachable"
            ? "History service available (read-only timeline)"
            : "History service availability unknown until API is reachable",
      },
      {
        name: "zammad_analytics_service",
        status: this.apiStatus === "reachable" ? "pass" : "warn",
        message:
          this.apiStatus === "reachable"
            ? "Analytics service available (read-only inventory metrics)"
            : "Analytics service availability unknown until API is reachable",
      },
      {
        name: "zammad_webhook_service",
        status: this.apiStatus === "reachable" ? "pass" : "warn",
        message:
          this.apiStatus === "reachable"
            ? "Webhook registration available (no HTTP ingress)"
            : "Webhook service availability unknown until API is reachable",
      },
      {
        name: "zammad_sync_service",
        status: this.apiStatus === "reachable" ? "pass" : "warn",
        message:
          this.apiStatus === "reachable"
            ? "Synchronisation available (in-memory; no scheduler)"
            : "Synchronisation availability unknown until API is reachable",
      },
      {
        name: "zammad_event_service",
        status: "pass",
        message: "Event translation available (no Platform Event Bus)",
      },
    ];

    if (this.lastConnectionTest?.engineVersion) {
      checks.push({
        name: "zammad_version",
        status: "pass",
        message: `Zammad version ${this.lastConnectionTest.engineVersion}`,
      });
    }

    const edition = this.getDetectedEdition();
    checks.push({
      name: "zammad_edition",
      status: edition === "unknown" ? "warn" : "pass",
      message: `Zammad edition: ${edition}`,
    });

    const health = this.operations.classifyHealth();
    checks.push({
      name: "zammad_operational_health",
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
    const extension = this.zammadDiagnosticsExtension;
    const warnings = [...diagnostics.warnings];
    const operational = this.operations.buildRuntimeDiagnostics();
    const compatibility = this.operations.getCompatibilityMatrix();

    if (extension.apiStatus !== "reachable") {
      warnings.push("Zammad API has not been verified as reachable");
    }
    if (extension.oauthEnabled) {
      warnings.push("OAuth is configured but not implemented");
    }
    for (const reason of operational.healthReasons) {
      warnings.push(`operational:${reason}`);
    }
    if (compatibility.unsupportedFeatures.length > 0) {
      warnings.push(`unsupported_features:${compatibility.unsupportedFeatures.length}`);
    }

    const sdkCompatibility =
      compatibility.compatibilityStatus === "unverified"
        ? ("warning" as const)
        : compatibility.compatibilityStatus === "not_checked"
          ? diagnostics.versionCompatibility
          : compatibility.compatibilityStatus;

    return {
      ...diagnostics,
      engineVersion: extension.zammadVersion ?? diagnostics.engineVersion,
      healthStatus: mapOperationalHealthToSdkStatus(operational.healthLevel),
      versionCompatibility: sdkCompatibility,
      warnings,
      recommendations: [
        ...diagnostics.recommendations,
        ...(extension.authenticationStatus !== "valid"
          ? ["Verify Zammad API token via SecretProvider"]
          : []),
        ...(compatibility.compatibilityStatus === "incompatible"
          ? ["Upgrade Zammad to the supported range 6.3.0–6.5.x"]
          : []),
        "Binary attachment transfer, webhook ingress, and Platform Event Bus remain deferred",
        ...(extension.searchLimitations.length
          ? [`Search limitations: ${extension.searchLimitations.join("; ")}`]
          : []),
        ...(extension.historyLimitations.length
          ? [`History limitations: ${extension.historyLimitations.join("; ")}`]
          : []),
      ],
      connection: diagnostics.connection
        ? {
            ...diagnostics.connection,
            warnings: [
              ...diagnostics.connection.warnings,
              `Adapter version: ${extension.adapterVersion}`,
              `Edition: ${extension.edition}`,
              `Core services: ${extension.coreServices.map((s) => s.serviceId).join(", ")}`,
              `Operations health: ${extension.operationsCapability.healthLevel}`,
              `Placeholder capabilities: ${extension.placeholderCapabilities.length}`,
            ],
          }
        : diagnostics.connection,
    };
  }

  protected override async onDispose(): Promise<void> {
    this.errorTranslator.unregisterMapper(ZAMMAD_INTEGRATION_ID);
  }

  private async validateAuthentication(
    context: IntegrationRequestContext,
  ): Promise<AdapterLifecycleResult> {
    try {
      await this.resolveApiToken(this.zammadConfig.apiTokenRef, context);
      this.authenticationStatus = "valid";
      return { ok: true, message: "Zammad API token present" };
    } catch {
      this.authenticationStatus = "missing";
      const error = missingCredentialsError(
        { correlationId: context.correlationId },
        "Zammad API token is missing",
      );
      return { ok: false, message: error.message };
    }
  }

  private async resolveApiToken(
    credentialRef: string,
    context: IntegrationRequestContext,
  ): Promise<string> {
    const authResult = await this.authenticationProvider.authenticate({
      tenantId: context.tenantId,
      correlationId: context.correlationId,
      integrationId: ZAMMAD_INTEGRATION_ID,
      connectionId:
        this.configuration.connection?.connectionId ?? "zammad-default-connection",
      credential: {
        credentialRef,
        authenticationMode: "api_token",
      },
    });

    if (!authResult.ok) {
      throw new Error(authResult.error.message);
    }

    if (!this.secretProvider) {
      throw new Error(
        "SecretProvider is required to materialize Zammad API credentials",
      );
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
      integrationId: ZAMMAD_INTEGRATION_ID,
      adapterId: this.context.adapterId,
      operation,
      tenantId: context.tenantId,
    };
  }
}
