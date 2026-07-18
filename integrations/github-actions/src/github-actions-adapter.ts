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
import type { MappingRegistry } from "@apzhub/integration-sdk/mapping";

import {
  type GitHubActionsConfiguration,
  validateGitHubActionsConfiguration,
} from "./github-actions-config";
import {
  getGitHubActionsExtendedCapabilities,
  type GitHubActionsBootstrapConfiguration,
} from "./github-actions-bootstrap";
import {
  createGitHubActionsVendorErrorMapper,
  mapGitHubActionsUnknownError,
  GITHUB_ACTIONS_INTEGRATION_ID,
} from "./github-actions-error-mapper";
import type { FetchFn } from "./internal/github-actions-fetch-client";
import {
  GitHubActionsRestClient,
  type GitHubActionsConnectionTestResult,
} from "./internal/github-actions-rest-client";
import {
  GITHUB_ACTIONS_CORE_SERVICE_CAPABILITIES,
  GITHUB_ACTIONS_UNSUPPORTED_OPERATIONS,
} from "./capabilities/service-capabilities";
import { createGitHubActionsCapabilityRegistration } from "./capabilities/capability-registration";
import {
  createGitHubActionsCoreServices,
  type GitHubActionsCoreServices,
} from "./services/github-actions-core-services";
import { GitHubActionsOperationRunner } from "./services/github-actions-operation-runner";
import { createGitHubActionsMappingRegistry } from "./mappers/github-actions-mapping-registry";
import {
  createGitHubActionsOperationsService,
  mapOperationalHealthToSdkStatus,
  type GitHubActionsOperationsService,
  type GitHubActionsRuntimeDiagnosticsSnapshot,
} from "./operations";

export const GITHUB_ACTIONS_ADAPTER_VERSION = "0.1.0";

export interface GitHubActionsDiagnosticsExtension {
  readonly apiVersion: string;
  readonly apiStatus: "reachable" | "degraded" | "unavailable" | "not_tested";
  readonly authenticationStatus: "valid" | "missing" | "invalid" | "unknown";
  readonly authMode: string;
  readonly extendedCapabilities: readonly string[];
  readonly coreServices: readonly {
    readonly serviceId: string;
    readonly available: boolean;
    readonly implemented: true;
  }[];
  readonly unsupportedOperations: readonly string[];
  readonly rateLimitRemaining?: number;
  readonly rateLimitLimit?: number;
  readonly rateLimitReset?: number;
  readonly connectedLogin?: string;
  readonly connectedUserId?: number;
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

export interface GitHubActionsAdapterOptions {
  readonly fetchFn?: FetchFn;
  readonly secretProvider?: SecretProvider;
}

/**
 * GitHub Actions read-only reference adapter — extends IntegrationAdapterBase.
 * APZTCMS-016: metadata retrieval only; no dispatch/rerun/cancel/download.
 */
export class GitHubActionsAdapter extends IntegrationAdapterBase {
  readonly githubActionsConfig: GitHubActionsConfiguration;
  readonly core: GitHubActionsCoreServices;
  readonly operations: GitHubActionsOperationsService;
  readonly mappingRegistry: MappingRegistry;
  private readonly restClient: GitHubActionsRestClient;
  private readonly errorMapper = createGitHubActionsVendorErrorMapper();
  private readonly secretProvider?: SecretProvider;
  private lastConnectionTest?: GitHubActionsConnectionTestResult;
  private lastConnectionTestAt?: string;
  private apiStatus: GitHubActionsDiagnosticsExtension["apiStatus"] = "not_tested";
  private authenticationStatus: GitHubActionsDiagnosticsExtension["authenticationStatus"] =
    "unknown";

  constructor(
    context: AdapterContext,
    configuration: GitHubActionsBootstrapConfiguration,
    options: GitHubActionsAdapterOptions = {},
  ) {
    super(context, configuration);
    this.githubActionsConfig = configuration.githubActions;
    this.secretProvider = options.secretProvider;
    this.mappingRegistry = createGitHubActionsMappingRegistry();

    const transport = createHttpIntegrationClient({
      apiBaseUrl: configuration.githubActions.apiBaseUrl,
      timeoutMs: configuration.githubActions.timeoutMs,
      defaultHeaders: configuration.githubActions.defaultHeaders,
      fetchFn: options.fetchFn,
      errorLabel: "GitHub Actions",
    });

    this.restClient = new GitHubActionsRestClient({
      client: transport,
      apiVersion: configuration.githubActions.apiVersion,
      getAuth: async () => {
        const token = await this.resolveAccessToken({
          correlationId: "github-actions-client-auth",
          tenantId: configuration.connection?.tenantId ?? "unknown",
        });
        return { token };
      },
    });

    const runner = new GitHubActionsOperationRunner({
      adapterId: configuration.manifest.adapterId,
      circuitBreaker: context.circuitBreaker,
      metrics: context.metrics,
      logger: context.logger,
      errorSummary: context.errorSummary,
      clock: context.clock,
    });

    this.core = createGitHubActionsCoreServices({
      runner,
      client: this.restClient,
      tenantId: configuration.connection?.tenantId ?? "unknown",
      defaultOwner: configuration.githubActions.owner,
      defaultRepo: configuration.githubActions.repo,
    });

    this.operations = createGitHubActionsOperationsService({
      core: this.core,
      getRestClient: () => this.restClient,
      clock: context.clock,
      validateConfiguration: () => this.validateConfiguration(),
      getAuthenticationStatus: () => this.authenticationStatus,
      getApiStatus: () => this.apiStatus,
      getLastConnectionLatencyMs: () => this.lastConnectionTest?.latencyMs,
      getConnectedLogin: () => this.lastConnectionTest?.login,
      getAuthMode: () => this.githubActionsConfig.authMode,
      getAuthenticationMode: () =>
        configuration.connection?.authenticationMode ?? "api_token",
      getCircuitBreakerState: () => context.circuitBreaker.state,
      oauthEnabled: this.githubActionsConfig.oauth.enabled,
      defaultOwner: configuration.githubActions.owner,
      defaultRepo: configuration.githubActions.repo,
    });
  }

  get diagnosticsExtension(): GitHubActionsDiagnosticsExtension {
    const coreAvailable = this.apiStatus === "reachable";
    const rateLimit = this.restClient.getLastRateLimit();
    const health = this.operations.classifyHealth();
    const compatibility = this.operations.getCompatibilityMatrix();

    return {
      apiVersion: this.githubActionsConfig.apiVersion,
      apiStatus: this.apiStatus,
      authenticationStatus: this.authenticationStatus,
      authMode: this.githubActionsConfig.authMode,
      extendedCapabilities: getGitHubActionsExtendedCapabilities(
        this.configuration as GitHubActionsBootstrapConfiguration,
      ),
      coreServices: GITHUB_ACTIONS_CORE_SERVICE_CAPABILITIES.map((capability) => ({
        serviceId: capability.serviceId,
        available: coreAvailable,
        implemented: true as const,
      })),
      unsupportedOperations: [...GITHUB_ACTIONS_UNSUPPORTED_OPERATIONS],
      rateLimitRemaining: rateLimit?.remaining,
      rateLimitLimit: rateLimit?.limit,
      rateLimitReset: rateLimit?.reset,
      connectedLogin: this.lastConnectionTest?.login,
      connectedUserId: this.lastConnectionTest?.userId,
      lastConnectionTestAt: this.lastConnectionTestAt,
      lastConnectionLatencyMs: this.lastConnectionTest?.latencyMs,
      adapterVersion: GITHUB_ACTIONS_ADAPTER_VERSION,
      oauthEnabled: this.githubActionsConfig.oauth.enabled,
      operationsCapability: {
        healthLevel: health.level,
        healthReasons: health.reasons,
        compatibilityStatus: compatibility.compatibilityStatus,
      },
    };
  }

  getRuntimeDiagnosticsSnapshot(): GitHubActionsRuntimeDiagnosticsSnapshot {
    return this.operations.buildRuntimeDiagnostics();
  }

  listCapabilityRegistration() {
    return createGitHubActionsCapabilityRegistration();
  }

  async testConnection(
    context: IntegrationRequestContext,
  ): Promise<AdapterLifecycleResult> {
    this.assertNotDisposed();
    this.assertInitialised();

    if (!this.circuitBreaker.allowRequest()) {
      return {
        ok: false,
        message: "Circuit breaker open — GitHub Actions connection test rejected",
      };
    }

    if (this.githubActionsConfig.authMode === "github_app") {
      return {
        ok: false,
        message:
          "GitHub App authentication is not implemented in APZTCMS-016 — use personal_access_token",
      };
    }

    if (this.githubActionsConfig.authMode === "oauth") {
      return {
        ok: false,
        message:
          "OAuth authentication is not implemented in APZTCMS-016 — use personal_access_token",
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

      this.logger.info("GitHub Actions connection test succeeded", {
        correlationId: context.correlationId,
        tenantId: context.tenantId,
        operation: "connection_test",
        durationMs: result.latencyMs,
        result: "success",
      });

      return {
        ok: true,
        message: `GitHub Actions connection verified (user ${result.login ?? "unknown"})`,
      };
    } catch (error) {
      const translated = mapGitHubActionsUnknownError(
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

      this.logger.error("GitHub Actions connection test failed", {
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
    const validation = validateGitHubActionsConfiguration(this.githubActionsConfig);
    if (!validation.ok) {
      return {
        ok: false,
        message: "GitHub Actions configuration validation failed",
        issues: validation.issues,
      };
    }
    return { ok: true, message: "GitHub Actions configuration valid" };
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
        name: "github_actions_api",
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
            ? "GitHub Actions API reachable"
            : this.apiStatus === "not_tested"
              ? "GitHub Actions API not tested yet"
              : `GitHub Actions API status: ${this.apiStatus}`,
      },
      {
        name: "github_actions_authentication",
        status:
          this.authenticationStatus === "valid"
            ? "pass"
            : this.authenticationStatus === "missing" ||
                this.authenticationStatus === "invalid"
              ? "fail"
              : "warn",
        message: `GitHub Actions authentication: ${this.authenticationStatus}`,
      },
      {
        name: "github_actions_configuration",
        status: "pass",
        message: "GitHub Actions configuration present",
      },
      {
        name: "github_actions_capabilities",
        status: "pass",
        message: `Core services: ${GITHUB_ACTIONS_CORE_SERVICE_CAPABILITIES.length}`,
      },
      {
        name: "github_actions_operational_health",
        status:
          sdkStatus === "healthy" ? "pass" : sdkStatus === "degraded" ? "warn" : "fail",
        message: `Operational health: ${health.level}`,
      },
      {
        name: "github_actions_rate_limit",
        status: (() => {
          const remaining = this.restClient.getLastRateLimit()?.remaining;
          if (remaining === undefined) return "warn";
          if (remaining <= 0) return "fail";
          if (remaining < 100) return "warn";
          return "pass";
        })(),
        message: (() => {
          const rl = this.restClient.getLastRateLimit();
          if (!rl || rl.remaining === undefined) return "Rate limit not yet observed";
          return `Rate limit remaining: ${rl.remaining}/${rl.limit ?? "?"}`;
        })(),
      },
    ];
  }

  protected override async onCollectDiagnostics(
    _context: IntegrationRequestContext,
    diagnostics: IntegrationDiagnostics,
  ): Promise<IntegrationDiagnostics> {
    const extension = this.diagnosticsExtension;
    const snapshot = this.operations.buildRuntimeDiagnostics({
      configurationValidationStatus: "valid",
    });
    const warnings = [...diagnostics.warnings];

    if (extension.apiStatus !== "reachable") {
      warnings.push("GitHub Actions API has not been verified as reachable");
    }
    if (extension.oauthEnabled) {
      warnings.push("OAuth is configured but not implemented");
    }
    for (const reason of snapshot.healthReasons) {
      warnings.push(`operational:${reason}`);
    }
    if (extension.rateLimitRemaining !== undefined) {
      warnings.push(`rate_limit_remaining:${extension.rateLimitRemaining}`);
    }

    // Never include secrets in diagnostics
    return {
      ...diagnostics,
      engineVersion: extension.apiVersion,
      healthStatus: mapOperationalHealthToSdkStatus(snapshot.healthLevel),
      warnings,
      recommendations: [
        ...diagnostics.recommendations,
        ...(extension.authenticationStatus !== "valid"
          ? ["Verify GitHub personal access token via SecretProvider"]
          : []),
        "Workflow dispatch, rerun, cancel, and artifact/log downloads are not supported",
        `Unsupported operations: ${extension.unsupportedOperations.join(", ")}`,
      ],
      connection: diagnostics.connection
        ? {
            ...diagnostics.connection,
            warnings: [
              ...diagnostics.connection.warnings,
              `Adapter version: ${extension.adapterVersion}`,
              `Auth mode: ${extension.authMode}`,
              `API version: ${extension.apiVersion}`,
              `Operations health: ${extension.operationsCapability.healthLevel}`,
            ],
          }
        : diagnostics.connection,
    };
  }

  protected override async onDispose(): Promise<void> {
    this.errorTranslator.unregisterMapper(GITHUB_ACTIONS_INTEGRATION_ID);
    this.apiStatus = "not_tested";
    this.authenticationStatus = "unknown";
    this.lastConnectionTest = undefined;
    this.lastConnectionTestAt = undefined;
  }

  private async validateAuthentication(
    context: IntegrationRequestContext,
  ): Promise<AdapterLifecycleResult> {
    try {
      await this.resolveAccessToken(context);
      this.authenticationStatus = "valid";
      return { ok: true, message: "GitHub personal access token present" };
    } catch {
      this.authenticationStatus = "missing";
      const error = missingCredentialsError(
        { correlationId: context.correlationId },
        "GitHub personal access token is missing",
      );
      return { ok: false, message: error.message };
    }
  }

  private async resolveAccessToken(
    context: IntegrationRequestContext,
  ): Promise<string> {
    if (this.githubActionsConfig.authMode !== "personal_access_token") {
      throw Object.assign(
        new Error(
          `Auth mode ${this.githubActionsConfig.authMode} is not implemented for live token resolve`,
        ),
        { statusCode: 501, vendorCode: "NOT_IMPLEMENTED" },
      );
    }

    const credentialRef = this.githubActionsConfig.personalAccessTokenRef;
    if (!credentialRef) {
      throw missingCredentialsError(
        { correlationId: context.correlationId },
        "GitHub personalAccessTokenRef is missing",
      );
    }

    const authResult = await this.authenticationProvider.authenticate({
      tenantId: context.tenantId,
      correlationId: context.correlationId,
      integrationId: GITHUB_ACTIONS_INTEGRATION_ID,
      connectionId:
        this.configuration.connection?.connectionId ??
        "github-actions-default-connection",
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
        "SecretProvider is required to materialize GitHub Actions credentials",
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
      integrationId: GITHUB_ACTIONS_INTEGRATION_ID,
      adapterId: this.context.adapterId,
      operation,
      tenantId: context.tenantId,
    };
  }
}
