import {
  SearchIntegrationAdapterBase,
  type SearchAdapterContext,
} from "@apzhub/integration-search-sdk";
import type {
  AdapterConfigurationValidationResult,
  AdapterDisposeReason,
  IntegrationHealthCheck,
  IntegrationRequestContext,
} from "@apzhub/integration-sdk";
import type { SecretProvider } from "@apzhub/integration-sdk/auth";
import { missingCredentialsError } from "@apzhub/integration-sdk/errors";
import type { ErrorTranslationContext } from "@apzhub/integration-sdk/errors";
import { createHttpIntegrationClient } from "@apzhub/integration-sdk/client";
import type {
  SearchProviderConfiguration,
  SearchQuery,
  SearchRequestContext,
  SearchResultPage,
} from "@apzhub/search-contracts";

import type { MeilisearchBootstrapConfiguration } from "./meilisearch-bootstrap";
import type { MeilisearchConfiguration } from "./meilisearch-config";
import {
  createMeilisearchErrorMapper,
  mapMeilisearchUnknownError,
} from "./meilisearch-error-mapper";
import type { FetchFn } from "./internal/meilisearch-fetch";
import { MeilisearchRestClient } from "./internal/meilisearch-rest-client";
import { MeilisearchOperationRunner } from "./meilisearch-operation-runner";
import {
  createMeilisearchCapabilityProvider,
  type MeilisearchCapabilityProvider,
} from "./capabilities/meilisearch-capability-provider";
import {
  createMeilisearchCompatibilityProvider,
  type MeilisearchCompatibilityProvider,
} from "./capabilities/meilisearch-compatibility-provider";
import {
  createMeilisearchHealthProvider,
  type MeilisearchHealthProvider,
} from "./health/meilisearch-health-provider";
import {
  createMeilisearchDiagnosticsProvider,
  type MeilisearchDiagnosticsProvider,
} from "./diagnostics/meilisearch-diagnostics-provider";
import {
  createMeilisearchConfigurationValidator,
  type MeilisearchConfigurationValidator,
} from "./lifecycle/meilisearch-configuration-validator";
import {
  createMeilisearchLogger,
  createMeilisearchMetrics,
  type MeilisearchLogger,
  type MeilisearchMetrics,
} from "./observability/meilisearch-observability";
import {
  MEILISEARCH_ADAPTER_VERSION,
  MEILISEARCH_INTEGRATION_ID,
} from "./version";
import {
  MEILISEARCH_UNSUPPORTED_OPERATIONS,
  NOT_SUPPORTED,
} from "./results/unsupported";
import type { SearchOperationResult } from "./results/search-operation-result";

export interface MeilisearchAdapterOptions {
  readonly fetchFn?: FetchFn;
  readonly secretProvider?: SecretProvider;
}

export interface MeilisearchDiagnosticsExtension {
  readonly adapterVersion: string;
  readonly apiStatus: "reachable" | "degraded" | "unavailable" | "not_tested";
  readonly authenticationStatus: "valid" | "missing" | "invalid" | "unknown";
  readonly engineVersion?: string;
  readonly unsupportedOperations: readonly string[];
  readonly defaultIndexUid?: string;
}

/**
 * Meilisearch reference search adapter — extends SearchIntegrationAdapterBase.
 * Engine ops run through MeilisearchOperationRunner + raw RestClient (no npm client).
 */
export class MeilisearchAdapter extends SearchIntegrationAdapterBase {
  readonly meilisearchConfig: MeilisearchConfiguration;
  readonly operations: MeilisearchOperationRunner;
  readonly capabilityProvider: MeilisearchCapabilityProvider;
  readonly compatibilityProvider: MeilisearchCompatibilityProvider;
  readonly healthProvider: MeilisearchHealthProvider;
  readonly diagnosticsProvider: MeilisearchDiagnosticsProvider;
  readonly configurationValidator: MeilisearchConfigurationValidator;
  readonly meilisearchMetrics: MeilisearchMetrics;
  readonly meilisearchLogger: MeilisearchLogger;

  private readonly restClient: MeilisearchRestClient;
  private readonly errorMapper = createMeilisearchErrorMapper();
  private readonly secretProvider?: SecretProvider;
  private apiStatus: MeilisearchDiagnosticsExtension["apiStatus"] = "not_tested";
  private authenticationStatus: MeilisearchDiagnosticsExtension["authenticationStatus"] =
    "unknown";
  private engineVersion?: string;

  constructor(
    context: SearchAdapterContext,
    configuration: MeilisearchBootstrapConfiguration,
    options: MeilisearchAdapterOptions = {},
  ) {
    super(context, configuration);
    this.meilisearchConfig = configuration.meilisearch;
    this.secretProvider = options.secretProvider;

    this.capabilityProvider = createMeilisearchCapabilityProvider(
      configuration.declaredSearchCapabilities,
    );
    this.compatibilityProvider = createMeilisearchCompatibilityProvider(
      this.capabilityProvider,
      context.clock,
    );
    this.configurationValidator = createMeilisearchConfigurationValidator();
    this.meilisearchMetrics = createMeilisearchMetrics(context.metrics);
    this.meilisearchLogger = createMeilisearchLogger(context.logger);

    const transport = createHttpIntegrationClient({
      apiBaseUrl: configuration.meilisearch.baseUrl,
      timeoutMs: configuration.meilisearch.timeoutMs,
      defaultHeaders: configuration.meilisearch.defaultHeaders,
      fetchFn: options.fetchFn,
      errorLabel: "Meilisearch",
    });

    this.restClient = new MeilisearchRestClient({
      client: transport,
      getAuth: async () => {
        const apiKey = await this.resolveApiKey({
          correlationId: "meilisearch-client-auth",
          tenantId: configuration.connection?.tenantId ?? "unknown",
        });
        return { apiKey };
      },
    });

    this.healthProvider = createMeilisearchHealthProvider(
      () => this.restClient,
      context.clock,
    );
    this.diagnosticsProvider = createMeilisearchDiagnosticsProvider(
      () => this.restClient,
      this.capabilityProvider,
      () => this.compatibilityProvider.evaluate(),
      () => this.apiStatus,
    );

    this.operations = new MeilisearchOperationRunner({
      adapterId: configuration.manifest.adapterId,
      config: configuration.meilisearch,
      client: this.restClient,
      circuitBreaker: context.circuitBreaker,
      metrics: this.meilisearchMetrics,
      logger: this.meilisearchLogger,
      errorSummary: context.errorSummary,
      clock: context.clock,
      health: this.healthProvider,
      diagnostics: this.diagnosticsProvider,
      capabilities: this.capabilityProvider,
      compatibility: this.compatibilityProvider,
      configurationValidator: this.configurationValidator,
    });
  }

  get diagnosticsExtension(): MeilisearchDiagnosticsExtension {
    return {
      adapterVersion: MEILISEARCH_ADAPTER_VERSION,
      apiStatus: this.apiStatus,
      authenticationStatus: this.authenticationStatus,
      engineVersion: this.engineVersion,
      unsupportedOperations: MEILISEARCH_UNSUPPORTED_OPERATIONS,
      defaultIndexUid: this.meilisearchConfig.defaultIndexUid,
    };
  }

  /** Engine-backed query — returns SearchOperationResult (OK / NOT_SUPPORTED / ERROR). */
  async search(
    context: SearchRequestContext,
    query: SearchQuery,
    indexUid?: string,
  ): Promise<SearchOperationResult<"query", SearchResultPage>> {
    this.assertNotDisposed();
    this.assertInitialised();
    return this.operations.executeQuery(context, query, indexUid);
  }

  async notSupportedFeature(feature: string) {
    this.assertNotDisposed();
    return this.operations.notSupported(feature);
  }

  async testConnection(context: IntegrationRequestContext) {
    this.assertNotDisposed();
    this.assertInitialised();

    if (!this.circuitBreaker.allowRequest()) {
      return {
        ok: false,
        message: "Circuit breaker open — Meilisearch connection test rejected",
      };
    }

    try {
      if (this.meilisearchConfig.apiKeyRef) {
        await this.resolveApiKey(context);
        this.authenticationStatus = "valid";
      } else {
        this.authenticationStatus = "unknown";
      }

      const result = await this.restClient.testConnection(context);
      this.apiStatus = result.ok ? "reachable" : "degraded";
      this.engineVersion = result.version;
      this.metrics.recordRequest({
        durationMs: result.latencyMs,
        success: true,
        operation: "connection_test",
      });
      this.circuitBreaker.recordSuccess();
      return {
        ok: result.ok,
        message: `Meilisearch connection ${result.ok ? "verified" : "degraded"} (status ${result.status ?? "unknown"})`,
      };
    } catch (error) {
      const translated = mapMeilisearchUnknownError(
        error,
        this.buildErrorContext(context, "connection_test"),
      );
      this.errorSummary.record(translated.error);
      this.circuitBreaker.recordFailure(translated.error);
      this.apiStatus = "unavailable";
      if (translated.error.category === "authentication") {
        this.authenticationStatus = "invalid";
      }
      return { ok: false, message: translated.error.message };
    }
  }

  protected override async onSearchInitialise(): Promise<void> {
    this.errorTranslator.registerMapper(this.errorMapper);
    this.searchContext.searchErrorTranslator.registerMapper(this.errorMapper);
  }

  protected override async onSearchDispose(_reason: AdapterDisposeReason): Promise<void> {
    this.errorTranslator.unregisterMapper(MEILISEARCH_INTEGRATION_ID);
    this.searchContext.searchErrorTranslator.unregisterMapper(MEILISEARCH_INTEGRATION_ID);
    this.apiStatus = "not_tested";
    this.authenticationStatus = "unknown";
    this.engineVersion = undefined;
  }

  protected override async onValidateConfiguration(): Promise<AdapterConfigurationValidationResult> {
    const base = await super.onValidateConfiguration();
    if (!base.ok) return base;
    const validation = this.configurationValidator.validate(this.meilisearchConfig);
    if (!validation.ok) {
      return {
        ok: false,
        message: "Meilisearch configuration validation failed",
        issues: validation.issues,
      };
    }
    return {
      ok: true,
      message: "Meilisearch configuration valid",
      warnings: validation.warnings,
    };
  }

  protected override async onSearchHealthChecks(
    _context: IntegrationRequestContext,
  ): Promise<IntegrationHealthCheck[]> {
    return [
      {
        name: "meilisearch_api",
        status:
          this.apiStatus === "reachable"
            ? "pass"
            : this.apiStatus === "degraded"
              ? "warn"
              : this.apiStatus === "unavailable"
                ? "fail"
                : "warn",
        message: `Meilisearch API status: ${this.apiStatus}`,
      },
      {
        name: "meilisearch_authentication",
        status:
          this.authenticationStatus === "valid"
            ? "pass"
            : this.authenticationStatus === "missing" ||
                this.authenticationStatus === "invalid"
              ? "fail"
              : "warn",
        message: `Meilisearch authentication: ${this.authenticationStatus}`,
      },
      {
        name: "meilisearch_unsupported",
        status: "pass",
        message: `Unsupported features return ${NOT_SUPPORTED}: ${MEILISEARCH_UNSUPPORTED_OPERATIONS.join(", ")}`,
      },
    ];
  }

  async validateProviderConfiguration(
    configuration: SearchProviderConfiguration,
  ) {
    return this.configurationValidator.validateProviderConfiguration(configuration);
  }

  private async resolveApiKey(context: IntegrationRequestContext): Promise<string | undefined> {
    const credentialRef = this.meilisearchConfig.apiKeyRef;
    if (!credentialRef) {
      return undefined;
    }

    if (!this.secretProvider) {
      throw missingCredentialsError(
        { correlationId: context.correlationId },
        "SecretProvider is required to materialize Meilisearch apiKeyRef",
      );
    }

    const material = await this.secretProvider.resolve({
      credentialRef,
      tenantId: context.tenantId,
      correlationId: context.correlationId,
    });

    if (!material.ok) {
      this.authenticationStatus = "missing";
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
      integrationId: MEILISEARCH_INTEGRATION_ID,
      adapterId: this.context.adapterId,
      operation,
      tenantId: context.tenantId,
    };
  }
}
