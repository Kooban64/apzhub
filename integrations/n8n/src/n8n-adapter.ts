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
import { createHttpIntegrationClient } from "@apzhub/integration-sdk/client";

import {
  type N8nConfiguration,
  validateN8nConfiguration,
} from "./n8n-config";
import {
  getN8nExtendedCapabilities,
  type N8nBootstrapConfiguration,
} from "./n8n-bootstrap";
import {
  createN8nVendorErrorMapper,
  mapN8nUnknownError,
} from "./n8n-error-mapper";
import type { FetchFn } from "./internal/n8n-fetch-client";
import {
  N8nRestClient,
  type N8nConnectionTestResult,
  type N8nRestAuth,
} from "./internal/n8n-rest-client";
import {
  N8N_CORE_SERVICE_CAPABILITIES,
  N8N_UNSUPPORTED_OPERATIONS,
} from "./capabilities/service-capabilities";
import { createN8nCapabilityRegistration } from "./capabilities/capability-registration";
import {
  createN8nCoreServices,
  type N8nCoreServices,
} from "./services/n8n-core-services";
import {
  createN8nOperationsService,
  mapOperationalHealthToSdkStatus,
  type N8nOperationsService,
  type N8nRuntimeDiagnosticsSnapshot,
} from "./operations";
import { N8N_ADAPTER_VERSION } from "./version";

export { N8N_ADAPTER_VERSION };

export interface N8nDiagnosticsExtension {
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
  readonly oauthEnabled: boolean;
  readonly operationsCapability: {
    readonly healthLevel: string;
    readonly healthReasons: readonly string[];
    readonly compatibilityStatus: string;
  };
}

export interface N8nAdapterOptions {
  readonly fetchFn?: FetchFn;
  readonly secretProvider?: SecretProvider;
}

/**
 * n8n Workflow Engine Reference Adapter — extends IntegrationAdapterBase.
 * APZWORKFLOW-006: metadata discovery only; no execute/create/update/delete.
 */
export class N8nAdapter extends IntegrationAdapterBase {
  readonly n8nConfig: N8nConfiguration;
  readonly core: N8nCoreServices;
  readonly operations: N8nOperationsService;
  private readonly restClient: N8nRestClient;
  private readonly errorMapper = createN8nVendorErrorMapper();
  private readonly secretProvider?: SecretProvider;
  private lastConnectionTest?: N8nConnectionTestResult;
  private lastConnectionTestAt?: string;
  private apiStatus: N8nDiagnosticsExtension["apiStatus"] = "not_tested";
  private authenticationStatus: N8nDiagnosticsExtension["authenticationStatus"] =
    "unknown";

  constructor(
    context: AdapterContext,
    configuration: N8nBootstrapConfiguration,
    options: N8nAdapterOptions = {},
  ) {
    super(context, configuration);
    this.n8nConfig = configuration.n8n;
    this.secretProvider = options.secretProvider;

    const transport = createHttpIntegrationClient({
      apiBaseUrl: configuration.n8n.apiBaseUrl,
      timeoutMs: configuration.n8n.timeoutMs,
      defaultHeaders: configuration.n8n.defaultHeaders,
      fetchFn: options.fetchFn,
      errorLabel: "n8n",
    });

    this.restClient = new N8nRestClient({
      client: transport,
      getAuth: async () => this.resolveAuthMaterial(),
    });

    this.core = createN8nCoreServices({ client: this.restClient });

    this.operations = createN8nOperationsService({
      getApiStatus: () => this.apiStatus,
      getAuthenticationStatus: () => this.authenticationStatus,
      getAuthMode: () => this.n8nConfig.authMode,
      getLastLatencyMs: () =>
        this.lastConnectionTest?.latencyMs ?? this.restClient.getLastLatencyMs(),
    });
  }

  get diagnosticsExtension(): N8nDiagnosticsExtension {
    const coreAvailable = this.apiStatus === "reachable";
    const health = this.operations.classifyHealth();
    const compatibility = this.operations.getCompatibilityMatrix();

    return {
      apiStatus: this.apiStatus,
      authenticationStatus: this.authenticationStatus,
      authMode: this.n8nConfig.authMode,
      extendedCapabilities: [
        ...getN8nExtendedCapabilities(
          this.configuration as N8nBootstrapConfiguration,
        ),
      ],
      coreServices: N8N_CORE_SERVICE_CAPABILITIES.map((capability) => ({
        serviceId: capability.serviceId,
        available: coreAvailable && capability.implemented,
        implemented: capability.implemented,
      })),
      unsupportedOperations: [...N8N_UNSUPPORTED_OPERATIONS],
      lastConnectionTestAt: this.lastConnectionTestAt,
      lastConnectionLatencyMs: this.lastConnectionTest?.latencyMs,
      adapterVersion: N8N_ADAPTER_VERSION,
      oauthEnabled: this.n8nConfig.oauth.enabled,
      operationsCapability: {
        healthLevel: health.level,
        healthReasons: health.reasons,
        compatibilityStatus: compatibility.compatibilityStatus,
      },
    };
  }

  getRuntimeDiagnosticsSnapshot(): N8nRuntimeDiagnosticsSnapshot {
    return this.operations.buildRuntimeDiagnostics();
  }

  listCapabilityRegistration() {
    return createN8nCapabilityRegistration();
  }

  async testConnection(
    context: IntegrationRequestContext,
  ): Promise<AdapterLifecycleResult> {
    this.assertNotDisposed();
    this.assertInitialised();

    if (!this.circuitBreaker.allowRequest()) {
      return {
        ok: false,
        message: "Circuit breaker open — n8n connection test rejected",
      };
    }

    if (this.n8nConfig.authMode === "oauth") {
      return {
        ok: false,
        message:
          "OAuth authentication is not implemented in APZWORKFLOW-006 — use api_key, personal_access_token, or basic",
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

      this.metrics.recordRequest({
        durationMs: result.latencyMs,
        success: true,
        operation: "connection_test",
      });
      this.circuitBreaker.recordSuccess();

      this.logger.info("n8n connection test succeeded", {
        correlationId: context.correlationId,
        tenantId: context.tenantId,
        operation: "connection_test",
        durationMs: result.latencyMs,
        result: "success",
      });

      return {
        ok: true,
        message: `n8n connection verified (${result.versionHint ?? "api"})`,
      };
    } catch (error) {
      const translated = mapN8nUnknownError(
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

      this.logger.error("n8n connection test failed", {
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
    const validation = validateN8nConfiguration(this.n8nConfig);
    if (!validation.ok) {
      return {
        ok: false,
        message: "n8n configuration validation failed",
        issues: validation.issues,
      };
    }
    return { ok: true, message: "n8n configuration valid" };
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
    const health = this.operations.classifyHealth();
    const sdkStatus = mapOperationalHealthToSdkStatus(health.level);

    return [
      {
        name: "n8n_api",
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
            ? "n8n API reachable"
            : this.apiStatus === "not_tested"
              ? "n8n API not tested yet"
              : `n8n API status: ${this.apiStatus}`,
      },
      {
        name: "n8n_authentication",
        status:
          this.authenticationStatus === "valid"
            ? "pass"
            : this.authenticationStatus === "missing" ||
                this.authenticationStatus === "invalid"
              ? "fail"
              : "warn",
        message: `n8n authentication: ${this.authenticationStatus}`,
      },
      {
        name: "n8n_configuration",
        status: "pass",
        message: "n8n configuration present",
      },
      {
        name: "n8n_capabilities",
        status: "pass",
        message: `Core services: ${N8N_CORE_SERVICE_CAPABILITIES.length}`,
      },
      {
        name: "n8n_operational_health",
        status:
          sdkStatus === "healthy"
            ? "pass"
            : sdkStatus === "degraded"
              ? "warn"
              : "fail",
        message: `Operational health: ${health.level} (${sdkStatus})`,
      },
      {
        name: "n8n_execution_surface",
        status: "pass",
        message: "Execution operations unavailable by design",
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
      warnings.push("n8n API has not been verified as reachable");
    }
    if (extension.oauthEnabled) {
      warnings.push("OAuth is configured but not implemented");
    }
    for (const reason of snapshot.reasons) {
      warnings.push(`operational:${reason}`);
    }

    // Never include secrets in diagnostics
    return {
      ...diagnostics,
      engineVersion: "n8n-public-api-v1",
      healthStatus: mapOperationalHealthToSdkStatus(snapshot.healthLevel),
      warnings,
      recommendations: [
        ...diagnostics.recommendations,
        ...(extension.authenticationStatus !== "valid"
          ? ["Verify n8n API key / credentials via SecretProvider"]
          : []),
        "Execute, activate, deactivate, schedule, and webhook management are not supported",
        `Unsupported operations: ${extension.unsupportedOperations.join(", ")}`,
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
    this.apiStatus = "not_tested";
    this.authenticationStatus = "unknown";
    this.lastConnectionTest = undefined;
    this.lastConnectionTestAt = undefined;
  }

  private async validateAuthentication(
    context: IntegrationRequestContext,
  ): Promise<AdapterLifecycleResult> {
    try {
      await this.resolveAuthMaterial(context);
      this.authenticationStatus = "valid";
      return { ok: true, message: "n8n credentials resolved" };
    } catch {
      this.authenticationStatus = "missing";
      const missing = missingCredentialsError(
        { correlationId: context.correlationId },
        "n8n credentials are missing",
      );
      return { ok: false, message: missing.message };
    }
  }

  private async resolveAuthMaterial(
    context?: IntegrationRequestContext,
  ): Promise<N8nRestAuth> {
    if (!this.secretProvider) {
      this.authenticationStatus = "missing";
      throw new Error("Secret provider is required for n8n authentication");
    }

    const tenantId =
      context?.tenantId ??
      this.configuration.connection?.tenantId ??
      "unknown";
    const correlationId = context?.correlationId ?? "n8n-client-auth";

    if (this.n8nConfig.authMode === "basic") {
      const usernameRef = this.n8nConfig.basicUsernameRef;
      const passwordRef = this.n8nConfig.basicPasswordRef;
      if (!usernameRef || !passwordRef) {
        this.authenticationStatus = "missing";
        throw new Error("basicUsernameRef and basicPasswordRef are required");
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
        throw new Error("Basic auth secrets could not be resolved");
      }
      return {
        kind: "basic",
        username: username.value.value,
        password: password.value.value,
      };
    }

    const ref =
      this.n8nConfig.apiKeyRef ?? this.n8nConfig.personalAccessTokenRef;
    if (!ref) {
      this.authenticationStatus = "missing";
      throw new Error("apiKeyRef / personalAccessTokenRef is required");
    }
    const token = await this.secretProvider.resolve({
      credentialRef: ref,
      tenantId,
      correlationId,
    });
    if (!token.ok) {
      this.authenticationStatus = "missing";
      throw new Error("API key / PAT secret could not be resolved");
    }
    return { kind: "api_key", token: token.value.value };
  }

  private buildErrorContext(
    context: IntegrationRequestContext,
    operation: string,
  ): ErrorTranslationContext {
    return {
      correlationId: context.correlationId,
      tenantId: context.tenantId,
      operation,
      integrationId: this.integrationId,
      adapterId: this.context.adapterId,
    };
  }
}
