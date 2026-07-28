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
import type { VendorErrorInput } from "@apzhub/integration-sdk/errors";
import { createHttpIntegrationClient } from "@apzhub/integration-sdk/client";

import {
  type MetabaseConfiguration,
  validateMetabaseConfiguration,
} from "./metabase-config";
import {
  getMetabaseExtendedCapabilities,
  type MetabaseBootstrapConfiguration,
} from "./metabase-bootstrap";
import {
  createMetabaseVendorErrorMapper,
  mapMetabaseUnknownError,
} from "./metabase-error-mapper";
import type { FetchFn } from "./internal/metabase-api-types";
import {
  MetabaseRestClient,
  type MetabaseConnectionTestResult,
  type MetabaseRestAuth,
} from "./internal/metabase-rest-client";
import { MetabaseClient } from "./metabase-client";
import {
  METABASE_CORE_SERVICE_CAPABILITIES,
  METABASE_UNSUPPORTED_OPERATIONS,
} from "./capabilities/service-capabilities";
import { createMetabaseCapabilityRegistration } from "./capabilities/capability-registration";
import {
  createMetabaseOperationsService,
  mapOperationalHealthToSdkStatus,
  type MetabaseOperationsService,
  type MetabaseRuntimeDiagnosticsSnapshot,
} from "./operations";
import { METABASE_ADAPTER_VERSION } from "./version";

export { METABASE_ADAPTER_VERSION };

export interface MetabaseDiagnosticsExtension {
  readonly apiStatus: "reachable" | "degraded" | "unavailable" | "not_tested";
  readonly authenticationStatus: "valid" | "missing" | "invalid" | "unknown";
  readonly authMode: string;
  readonly extendedCapabilities: readonly string[];
  readonly coreServices: readonly {
    readonly serviceId: string;
    readonly available: boolean;
    readonly implemented: boolean;
  }[];
  readonly unsupportedOperations: readonly string[];
  readonly lastConnectionTestAt?: string;
  readonly lastConnectionLatencyMs?: number;
  readonly adapterVersion: string;
  readonly versionTag?: string;
  readonly embeddingEnabled?: boolean;
  readonly readiness: string;
  readonly operationsCapability: {
    readonly healthLevel: string;
    readonly healthReasons: readonly string[];
    readonly compatibilityStatus: string;
  };
}

export interface MetabaseAdapterOptions {
  readonly fetchFn?: FetchFn;
  readonly secretProvider?: SecretProvider;
}

/**
 * Metabase Integration Foundation Adapter — extends IntegrationAdapterBase.
 * APZHUB-INTEGRATION-METABASE-001: foundation ops only; no Analytics Services/UI.
 */
export class MetabaseAdapter extends IntegrationAdapterBase {
  readonly metabaseConfig: MetabaseConfiguration;
  readonly client: MetabaseClient;
  readonly operations: MetabaseOperationsService;
  private readonly restClient: MetabaseRestClient;
  private readonly errorMapper = createMetabaseVendorErrorMapper();
  private readonly secretProvider?: SecretProvider;
  private lastConnectionTest?: MetabaseConnectionTestResult;
  private lastConnectionTestAt?: string;
  private apiStatus: MetabaseDiagnosticsExtension["apiStatus"] = "not_tested";
  private authenticationStatus: MetabaseDiagnosticsExtension["authenticationStatus"] =
    "unknown";
  private detectedVersionTag?: string;
  private detectedEmbeddingEnabled?: boolean;

  constructor(
    context: AdapterContext,
    configuration: MetabaseBootstrapConfiguration,
    options: MetabaseAdapterOptions = {},
  ) {
    super(context, configuration);
    this.metabaseConfig = configuration.metabase;
    this.secretProvider = options.secretProvider;

    const transport = createHttpIntegrationClient({
      apiBaseUrl: configuration.metabase.apiBaseUrl,
      timeoutMs: configuration.metabase.timeoutMs,
      defaultHeaders: configuration.metabase.defaultHeaders,
      fetchFn: options.fetchFn,
      errorLabel: "metabase",
    });

    this.restClient = new MetabaseRestClient({
      client: transport,
      getAuth: async () => this.resolveAuthMaterial(),
    });
    this.client = new MetabaseClient(this.restClient);

    this.operations = createMetabaseOperationsService({
      getApiStatus: () => this.apiStatus,
      getAuthenticationStatus: () => this.authenticationStatus,
      getAuthMode: () => this.metabaseConfig.authMode,
      getLastLatencyMs: () =>
        this.lastConnectionTest?.latencyMs ?? this.client.getLastLatencyMs(),
      getVersionTag: () => this.detectedVersionTag,
      getEmbeddingEnabled: () => this.detectedEmbeddingEnabled,
    });
  }

  get diagnosticsExtension(): MetabaseDiagnosticsExtension {
    const coreAvailable = this.apiStatus === "reachable";
    const health = this.operations.classifyHealth();
    const compatibility = this.operations.getCompatibilityMatrix();

    return {
      apiStatus: this.apiStatus,
      authenticationStatus: this.authenticationStatus,
      authMode: this.metabaseConfig.authMode,
      extendedCapabilities: [
        ...getMetabaseExtendedCapabilities(
          this.configuration as MetabaseBootstrapConfiguration,
        ),
      ],
      coreServices: METABASE_CORE_SERVICE_CAPABILITIES.map((capability) => ({
        serviceId: capability.serviceId,
        available: coreAvailable && capability.implemented,
        implemented: capability.implemented,
      })),
      unsupportedOperations: [...METABASE_UNSUPPORTED_OPERATIONS],
      lastConnectionTestAt: this.lastConnectionTestAt,
      lastConnectionLatencyMs: this.lastConnectionTest?.latencyMs,
      adapterVersion: METABASE_ADAPTER_VERSION,
      versionTag: this.detectedVersionTag,
      embeddingEnabled: this.detectedEmbeddingEnabled,
      readiness: this.operations.classifyReadiness(),
      operationsCapability: {
        healthLevel: health.level,
        healthReasons: health.reasons,
        compatibilityStatus: compatibility.compatibilityStatus,
      },
    };
  }

  getRuntimeDiagnosticsSnapshot(): MetabaseRuntimeDiagnosticsSnapshot {
    return this.operations.buildRuntimeDiagnostics();
  }

  listCapabilityRegistration() {
    return createMetabaseCapabilityRegistration();
  }

  async testConnection(
    context: IntegrationRequestContext,
  ): Promise<AdapterLifecycleResult> {
    this.assertNotDisposed();
    this.assertInitialised();

    if (!this.circuitBreaker.allowRequest()) {
      return {
        ok: false,
        message: "Circuit breaker open — Metabase connection test rejected",
      };
    }

    const startedAt = this.context.clock.now();

    try {
      const authCheck = await this.validateAuthentication(context);
      if (!authCheck.ok) {
        return authCheck;
      }

      const result = await this.client.testConnection(context);
      this.lastConnectionTest = result;
      this.lastConnectionTestAt = this.context.clock.now();
      this.apiStatus = "reachable";
      this.authenticationStatus = "valid";
      this.detectedVersionTag = result.versionHint;

      try {
        const caps = await this.client.detectCapabilities(context);
        this.detectedEmbeddingEnabled = caps.embeddingEnabled;
        if (caps.versionTag) this.detectedVersionTag = caps.versionTag;
      } catch {
        this.detectedEmbeddingEnabled = undefined;
      }

      this.metrics.recordRequest({
        durationMs: result.latencyMs,
        success: true,
        operation: "connection_test",
      });
      this.circuitBreaker.recordSuccess();

      this.logger.info("Metabase connection test succeeded", {
        correlationId: context.correlationId,
        tenantId: context.tenantId,
        operation: "connection_test",
        durationMs: result.latencyMs,
        result: "success",
      });

      return {
        ok: true,
        message: `Metabase connection verified (${result.versionHint ?? result.healthStatus ?? "api"})`,
      };
    } catch (error) {
      const translated = mapMetabaseUnknownError(
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

      this.logger.error("Metabase connection test failed", {
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

  protected override async onInitialise(): Promise<void> {
    this.errorTranslator.registerMapper(this.errorMapper);
  }

  protected override async onValidateConfiguration(): Promise<AdapterConfigurationValidationResult> {
    const validation = validateMetabaseConfiguration(this.metabaseConfig);
    if (!validation.ok) {
      return {
        ok: false,
        message: "Metabase configuration validation failed",
        issues: validation.issues,
      };
    }
    return { ok: true, message: "Metabase configuration valid" };
  }

  protected override async onConnect(
    context: IntegrationRequestContext,
  ): Promise<void> {
    const test = await this.testConnection(context);
    if (!test.ok) {
      throw new Error(test.message);
    }
  }

  /** Convert connection probe failures into lifecycle results (SDK connect does not catch). */
  override async connect(
    context: IntegrationRequestContext,
  ): Promise<AdapterLifecycleResult> {
    try {
      return await super.connect(context);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Metabase connect failed";
      return { ok: false, message };
    }
  }

  protected override async onPerformHealthChecks(
    _context: IntegrationRequestContext,
  ): Promise<IntegrationHealthCheck[]> {
    const health = this.operations.classifyHealth();
    const sdkStatus = mapOperationalHealthToSdkStatus(health.level);
    const readiness = this.operations.classifyReadiness();

    return [
      {
        name: "metabase_api",
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
            ? "Metabase API reachable"
            : this.apiStatus === "not_tested"
              ? "Metabase API not tested yet"
              : `Metabase API status: ${this.apiStatus}`,
      },
      {
        name: "metabase_authentication",
        status:
          this.authenticationStatus === "valid"
            ? "pass"
            : this.authenticationStatus === "missing" ||
                this.authenticationStatus === "invalid"
              ? "fail"
              : "warn",
        message: `Metabase authentication: ${this.authenticationStatus}`,
      },
      {
        name: "metabase_configuration",
        status: "pass",
        message: "Metabase configuration present",
      },
      {
        name: "metabase_version",
        status: this.detectedVersionTag ? "pass" : "warn",
        message: this.detectedVersionTag
          ? `Metabase version: ${this.detectedVersionTag}`
          : "Metabase version not detected",
      },
      {
        name: "metabase_operational_health",
        status:
          sdkStatus === "healthy" ? "pass" : sdkStatus === "degraded" ? "warn" : "fail",
        message: `Operational health: ${health.level} (${sdkStatus})`,
      },
      {
        name: "metabase_readiness",
        status:
          readiness === "ready"
            ? "pass"
            : readiness === "ready_with_limitations"
              ? "warn"
              : "fail",
        message: `Readiness classification: ${readiness}`,
      },
      {
        name: "metabase_embed_surface",
        status: "pass",
        message: "Embed token issuance planned — not implemented in foundation",
      },
    ];
  }

  protected override async onCollectDiagnostics(
    _context: IntegrationRequestContext,
    diagnostics: IntegrationDiagnostics,
  ): Promise<IntegrationDiagnostics> {
    const extension = this.diagnosticsExtension;
    const snapshot = this.getRuntimeDiagnosticsSnapshot();
    const warnings = [...diagnostics.warnings];

    if (extension.apiStatus !== "reachable") {
      warnings.push("Metabase API has not been verified as reachable");
    }
    if (extension.embeddingEnabled !== true) {
      warnings.push("Metabase embedding may be disabled or undetected");
    }
    for (const reason of snapshot.reasons) {
      warnings.push(`operational:${reason}`);
    }

    return {
      ...diagnostics,
      engineVersion: extension.versionTag ?? "metabase-api",
      healthStatus: mapOperationalHealthToSdkStatus(snapshot.healthLevel),
      warnings,
      recommendations: [
        ...diagnostics.recommendations,
        ...(extension.authenticationStatus !== "valid"
          ? ["Verify Metabase API key / session credentials via SecretProvider"]
          : []),
        "Dashboard embed token issuance is not implemented in this foundation adapter",
        `Unsupported operations: ${extension.unsupportedOperations.join(", ")}`,
        `Readiness: ${extension.readiness}`,
      ],
      connection: diagnostics.connection
        ? {
            ...diagnostics.connection,
            warnings: [
              ...diagnostics.connection.warnings,
              `Adapter version: ${extension.adapterVersion}`,
              `Auth mode: ${extension.authMode}`,
              `Operations health: ${extension.operationsCapability.healthLevel}`,
            ],
          }
        : diagnostics.connection,
    };
  }

  protected override async onDispose(): Promise<void> {
    this.errorTranslator.unregisterMapper(this.integrationId);
    this.client.clearSession();
    this.apiStatus = "not_tested";
    this.authenticationStatus = "unknown";
    this.lastConnectionTest = undefined;
    this.lastConnectionTestAt = undefined;
    this.detectedVersionTag = undefined;
    this.detectedEmbeddingEnabled = undefined;
  }

  private async validateAuthentication(
    context: IntegrationRequestContext,
  ): Promise<AdapterLifecycleResult> {
    try {
      await this.resolveAuthMaterial(context);
      this.authenticationStatus = "valid";
      return { ok: true, message: "Metabase credentials resolved" };
    } catch {
      this.authenticationStatus = "missing";
      const missing = missingCredentialsError(
        { correlationId: context.correlationId },
        "Metabase credentials are missing",
      );
      return { ok: false, message: missing.message };
    }
  }

  private async resolveAuthMaterial(
    context?: IntegrationRequestContext,
  ): Promise<MetabaseRestAuth> {
    if (!this.secretProvider) {
      this.authenticationStatus = "missing";
      throw new Error("Secret provider is required for Metabase authentication");
    }

    const tenantId =
      context?.tenantId ?? this.configuration.connection?.tenantId ?? "unknown";
    const correlationId = context?.correlationId ?? "metabase-client-auth";

    if (this.metabaseConfig.authMode === "session") {
      const usernameRef = this.metabaseConfig.usernameRef;
      const passwordRef = this.metabaseConfig.passwordRef;
      if (!usernameRef || !passwordRef) {
        this.authenticationStatus = "missing";
        throw new Error("usernameRef and passwordRef are required for session auth");
      }
      const username = await this.secretProvider.resolve({
        credentialRef: usernameRef,
        tenantId,
        correlationId,
      });
      const password = await this.secretProvider.resolve({
        credentialRef: passwordRef,
        tenantId,
        correlationId,
      });
      if (!username.ok || !password.ok) {
        this.authenticationStatus = "missing";
        throw new Error("Session auth secrets could not be resolved");
      }
      return {
        kind: "session",
        username: username.value.value,
        password: password.value.value,
      };
    }

    const ref = this.metabaseConfig.apiKeyRef;
    if (!ref) {
      this.authenticationStatus = "missing";
      throw new Error("apiKeyRef is required");
    }
    const token = await this.secretProvider.resolve({
      credentialRef: ref,
      tenantId,
      correlationId,
    });
    if (!token.ok) {
      this.authenticationStatus = "missing";
      throw new Error("API key secret could not be resolved");
    }
    return { kind: "api_key", token: token.value.value };
  }

  private buildErrorContext(
    context: IntegrationRequestContext,
    operation: string,
  ): VendorErrorInput["context"] {
    return {
      correlationId: context.correlationId,
      tenantId: context.tenantId,
      operation,
      integrationId: this.integrationId,
      adapterId: this.context.adapterId,
    };
  }
}
