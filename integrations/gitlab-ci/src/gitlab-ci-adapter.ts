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
import {
  createHttpIntegrationClient,
  type FetchFn,
} from "@apzhub/integration-sdk/client";
import { missingCredentialsError } from "@apzhub/integration-sdk/errors";

import {
  type GitLabCiConfiguration,
  validateGitLabCiConfiguration,
} from "./gitlab-ci-config";
import {
  getGitLabCiExtendedCapabilities,
  type GitLabCiBootstrapConfiguration,
} from "./gitlab-ci-bootstrap";
import { GITLAB_CI_INTEGRATION_ID } from "./gitlab-ci-error-mapper";
import {
  GitLabCiRestClient,
  type GitLabCiConnectionTestResult,
} from "./internal/gitlab-ci-rest-client";
import {
  GITLAB_CI_CORE_SERVICE_CAPABILITIES,
  GITLAB_CI_UNSUPPORTED_OPERATIONS,
} from "./capabilities/service-capabilities";
import {
  createGitLabCiCoreServices,
  type GitLabCiCoreServices,
} from "./services/gitlab-ci-core-services";

export const GITLAB_CI_ADAPTER_VERSION = "0.1.0";

export interface GitLabCiDiagnosticsExtension {
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
  readonly connectedUsername?: string;
  readonly connectedUserId?: number;
  readonly lastConnectionTestAt?: string;
  readonly lastConnectionLatencyMs?: number;
  readonly adapterVersion: string;
  readonly oauthEnabled: boolean;
}

export interface GitLabCiAdapterOptions {
  readonly fetchFn?: FetchFn;
  readonly secretProvider?: SecretProvider;
}

/**
 * GitLab CI read-only reference adapter — extends IntegrationAdapterBase.
 * Metadata retrieval only; no dispatch/rerun/cancel/download.
 */
export class GitLabCiAdapter extends IntegrationAdapterBase {
  readonly gitlabCiConfig: GitLabCiConfiguration;
  readonly core: GitLabCiCoreServices;
  private readonly restClient: GitLabCiRestClient;
  private readonly secretProvider?: SecretProvider;
  private lastConnectionTest?: GitLabCiConnectionTestResult;
  private lastConnectionTestAt?: string;
  private apiStatus: GitLabCiDiagnosticsExtension["apiStatus"] = "not_tested";
  private authenticationStatus: GitLabCiDiagnosticsExtension["authenticationStatus"] =
    "unknown";

  constructor(
    context: AdapterContext,
    configuration: GitLabCiBootstrapConfiguration,
    options: GitLabCiAdapterOptions = {},
  ) {
    super(context, configuration);
    this.gitlabCiConfig = configuration.gitlabCi;
    this.secretProvider = options.secretProvider;

    const transport = createHttpIntegrationClient({
      apiBaseUrl: configuration.gitlabCi.apiBaseUrl,
      timeoutMs: configuration.gitlabCi.timeoutMs,
      fetchFn: options.fetchFn,
      errorLabel: "GitLab CI",
    });

    this.restClient = new GitLabCiRestClient({
      client: transport,
      defaultProjectPath: configuration.gitlabCi.projectPath,
      defaultProjectId: configuration.gitlabCi.projectId,
      getToken: async () => {
        try {
          return await this.resolveAccessToken({
            correlationId: "gitlab-ci-client-auth",
            tenantId: configuration.connection?.tenantId ?? "unknown",
          });
        } catch {
          return undefined;
        }
      },
    });

    this.core = createGitLabCiCoreServices({
      client: this.restClient,
      tenantId: configuration.connection?.tenantId ?? "unknown",
      defaultProjectPath: configuration.gitlabCi.projectPath,
      defaultProjectId: configuration.gitlabCi.projectId,
    });
  }

  get diagnosticsExtension(): GitLabCiDiagnosticsExtension {
    const coreAvailable = this.apiStatus === "reachable";
    const rateLimit = this.restClient.getLastRateLimit();

    return {
      apiVersion: this.gitlabCiConfig.apiVersion,
      apiStatus: this.apiStatus,
      authenticationStatus: this.authenticationStatus,
      authMode: this.gitlabCiConfig.authMode,
      extendedCapabilities: getGitLabCiExtendedCapabilities(
        this.configuration as GitLabCiBootstrapConfiguration,
      ),
      coreServices: GITLAB_CI_CORE_SERVICE_CAPABILITIES.map((capability) => ({
        serviceId: capability.serviceId,
        available: coreAvailable,
        implemented: true as const,
      })),
      unsupportedOperations: [...GITLAB_CI_UNSUPPORTED_OPERATIONS],
      rateLimitRemaining: rateLimit?.remaining,
      rateLimitLimit: rateLimit?.limit,
      rateLimitReset: rateLimit?.reset,
      connectedUsername: this.lastConnectionTest?.username,
      connectedUserId: this.lastConnectionTest?.userId,
      lastConnectionTestAt: this.lastConnectionTestAt,
      lastConnectionLatencyMs: this.lastConnectionTest?.latencyMs,
      adapterVersion: GITLAB_CI_ADAPTER_VERSION,
      oauthEnabled: this.gitlabCiConfig.oauth.enabled,
    };
  }

  async testConnection(
    context: IntegrationRequestContext,
  ): Promise<AdapterLifecycleResult> {
    this.assertNotDisposed();
    this.assertInitialised();

    if (!this.circuitBreaker.allowRequest()) {
      return {
        ok: false,
        message: "Circuit breaker open — GitLab CI connection test rejected",
      };
    }

    if (this.gitlabCiConfig.authMode === "oauth") {
      return {
        ok: false,
        message: "OAuth authentication is not implemented — use personal_access_token",
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

      this.logger.info("GitLab CI connection test succeeded", {
        correlationId: context.correlationId,
        tenantId: context.tenantId,
        operation: "connection_test",
        durationMs: result.latencyMs,
        result: "success",
      });

      return {
        ok: true,
        message: `GitLab CI connection verified (user ${result.username ?? "unknown"})`,
      };
    } catch (error) {
      const translated = this.errorTranslator.translateUnknown(error, {
        correlationId: context.correlationId,
        integrationId: GITLAB_CI_INTEGRATION_ID,
        adapterId: this.context.adapterId,
        operation: "connection_test",
        tenantId: context.tenantId,
      });
      this.errorSummary.record(translated.error);
      this.circuitBreaker.recordFailure(translated.error);
      this.apiStatus = "unavailable";
      if (translated.error.category === "authentication") {
        this.authenticationStatus = "invalid";
      }

      this.metrics.recordRequest({
        durationMs: Date.now() - new Date(startedAt).getTime(),
        success: false,
        operation: "connection_test",
      });

      this.logger.error("GitLab CI connection test failed", {
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

  protected override async onValidateConfiguration(): Promise<AdapterConfigurationValidationResult> {
    const validation = validateGitLabCiConfiguration(this.gitlabCiConfig);
    if (!validation.ok) {
      return {
        ok: false,
        message: "GitLab CI configuration validation failed",
        issues: validation.issues,
      };
    }
    return { ok: true, message: "GitLab CI configuration valid" };
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
    return [
      {
        name: "gitlab_ci_api",
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
            ? "GitLab CI API reachable"
            : this.apiStatus === "not_tested"
              ? "GitLab CI API not tested yet"
              : `GitLab CI API status: ${this.apiStatus}`,
      },
      {
        name: "gitlab_ci_authentication",
        status:
          this.authenticationStatus === "valid"
            ? "pass"
            : this.authenticationStatus === "missing" ||
                this.authenticationStatus === "invalid"
              ? "fail"
              : "warn",
        message: `GitLab CI authentication: ${this.authenticationStatus}`,
      },
      {
        name: "gitlab_ci_configuration",
        status: "pass",
        message: "GitLab CI configuration present",
      },
      {
        name: "gitlab_ci_capabilities",
        status: "pass",
        message: `Core services: ${GITLAB_CI_CORE_SERVICE_CAPABILITIES.length}`,
      },
      {
        name: "gitlab_ci_rate_limit",
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
    const warnings = [...diagnostics.warnings];

    if (extension.apiStatus !== "reachable") {
      warnings.push("GitLab CI API has not been verified as reachable");
    }
    if (extension.oauthEnabled) {
      warnings.push("OAuth is configured but not implemented");
    }
    if (extension.rateLimitRemaining !== undefined) {
      warnings.push(`rate_limit_remaining:${extension.rateLimitRemaining}`);
    }

    const healthStatus =
      extension.apiStatus === "reachable" && extension.authenticationStatus === "valid"
        ? "healthy"
        : extension.apiStatus === "unavailable" ||
            extension.authenticationStatus === "invalid" ||
            extension.authenticationStatus === "missing"
          ? "unavailable"
          : "degraded";

    return {
      ...diagnostics,
      engineVersion: extension.apiVersion,
      healthStatus,
      warnings,
      recommendations: [
        ...diagnostics.recommendations,
        ...(extension.authenticationStatus !== "valid"
          ? ["Verify GitLab personal access token via SecretProvider"]
          : []),
        "Pipeline dispatch, rerun, cancel, and artifact/log downloads are not supported",
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
            ],
          }
        : diagnostics.connection,
    };
  }

  protected override async onDispose(): Promise<void> {
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
      return { ok: true, message: "GitLab personal access token present" };
    } catch {
      this.authenticationStatus = "missing";
      const error = missingCredentialsError(
        { correlationId: context.correlationId },
        "GitLab personal access token is missing",
      );
      return { ok: false, message: error.message };
    }
  }

  private async resolveAccessToken(
    context: IntegrationRequestContext,
  ): Promise<string> {
    if (this.gitlabCiConfig.authMode !== "personal_access_token") {
      throw Object.assign(
        new Error(
          `Auth mode ${this.gitlabCiConfig.authMode} is not implemented for live token resolve`,
        ),
        { statusCode: 501, vendorCode: "NOT_IMPLEMENTED" },
      );
    }

    const credentialRef = this.gitlabCiConfig.personalAccessTokenRef;
    if (!credentialRef) {
      throw missingCredentialsError(
        { correlationId: context.correlationId },
        "GitLab personalAccessTokenRef is missing",
      );
    }

    const authResult = await this.authenticationProvider.authenticate({
      tenantId: context.tenantId,
      correlationId: context.correlationId,
      integrationId: GITLAB_CI_INTEGRATION_ID,
      connectionId:
        this.configuration.connection?.connectionId ?? "gitlab-ci-default-connection",
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
        "SecretProvider is required to materialize GitLab CI credentials",
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
}
