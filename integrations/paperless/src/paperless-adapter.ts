import type { IntegrationRequestContext } from "@apzhub/integration-sdk";
import {
  IntegrationAdapterBase,
  type AdapterConfigurationValidationResult,
  type AdapterContext,
  type AdapterLifecycleResult,
} from "@apzhub/integration-sdk/adapter";
import type { SecretProvider } from "@apzhub/integration-sdk/auth";
import { createHttpIntegrationClient } from "@apzhub/integration-sdk/client";
import type {
  IntegrationDiagnostics,
  IntegrationHealthCheck,
} from "@apzhub/integration-sdk/diagnostics";

import type { PaperlessBootstrapConfiguration } from "./paperless-bootstrap";
import {
  validatePaperlessConfiguration,
  type PaperlessConfiguration,
} from "./paperless-config";
import { PaperlessClient } from "./paperless-client";
import {
  createPaperlessVendorErrorMapper,
  mapPaperlessUnknownError,
} from "./paperless-error-mapper";
import type { FetchFn } from "./internal/paperless-fetch-client";
import { PaperlessRestClient } from "./internal/paperless-rest-client";
import {
  classifyPaperlessOperationalHealth,
  mapPaperlessOperationalHealthToSdkStatus,
} from "./operations";
import { PAPERLESS_ADAPTER_VERSION } from "./version";

export interface PaperlessDiagnosticsExtension {
  readonly apiStatus: "reachable" | "degraded" | "unavailable" | "not_tested";
  readonly authenticationStatus: "valid" | "missing" | "invalid" | "unknown";
  readonly lastConnectionTestAt?: string;
  readonly lastConnectionLatencyMs?: number;
  readonly adapterVersion: string;
}

export interface PaperlessAdapterOptions {
  readonly fetchFn?: FetchFn;
  readonly secretProvider?: SecretProvider;
}

export class PaperlessAdapter extends IntegrationAdapterBase {
  readonly paperlessConfig: PaperlessConfiguration;
  readonly client: PaperlessClient;
  private readonly secretProvider?: SecretProvider;
  private readonly errorMapper = createPaperlessVendorErrorMapper();
  private apiStatus: PaperlessDiagnosticsExtension["apiStatus"] = "not_tested";
  private authenticationStatus: PaperlessDiagnosticsExtension["authenticationStatus"] =
    "unknown";
  private lastConnectionTestAt?: string;
  private lastConnectionLatencyMs?: number;

  constructor(
    context: AdapterContext,
    configuration: PaperlessBootstrapConfiguration,
    options: PaperlessAdapterOptions = {},
  ) {
    super(context, configuration);
    this.paperlessConfig = configuration.paperless;
    this.secretProvider = options.secretProvider;
    const transport = createHttpIntegrationClient({
      apiBaseUrl: configuration.paperless.apiBaseUrl,
      timeoutMs: configuration.paperless.timeoutMs,
      defaultHeaders: configuration.paperless.defaultHeaders,
      fetchFn: options.fetchFn,
      errorLabel: "documents-dms",
    });
    this.client = new PaperlessClient(
      new PaperlessRestClient({
        client: transport,
        getToken: () => this.resolveToken(),
        apiBaseUrl: configuration.paperless.apiBaseUrl,
        timeoutMs: configuration.paperless.timeoutMs,
        fetchFn: options.fetchFn,
      }),
    );
  }

  get diagnosticsExtension(): PaperlessDiagnosticsExtension {
    return {
      apiStatus: this.apiStatus,
      authenticationStatus: this.authenticationStatus,
      lastConnectionTestAt: this.lastConnectionTestAt,
      lastConnectionLatencyMs: this.lastConnectionLatencyMs,
      adapterVersion: PAPERLESS_ADAPTER_VERSION,
    };
  }

  async listDocuments(
    context: IntegrationRequestContext,
    query?: { readonly page?: number; readonly pageSize?: number },
  ) {
    this.assertNotDisposed();
    this.assertInitialised();
    try {
      return await this.client.listDocuments(context, query);
    } catch (error) {
      const translated = mapPaperlessUnknownError(error, {
        correlationId: context.correlationId,
        tenantId: context.tenantId,
        operation: "list_documents",
        integrationId: this.integrationId,
        adapterId: this.context.adapterId,
      });
      throw new Error(translated.error.message);
    }
  }

  async uploadDocument(
    context: IntegrationRequestContext,
    input: {
      readonly fileName: string;
      readonly contentType: string;
      readonly bytes: Uint8Array;
      readonly title?: string;
    },
  ) {
    this.assertNotDisposed();
    this.assertInitialised();
    try {
      return await this.client.uploadDocument(context, input);
    } catch (error) {
      const translated = mapPaperlessUnknownError(error, {
        correlationId: context.correlationId,
        tenantId: context.tenantId,
        operation: "upload_document",
        integrationId: this.integrationId,
        adapterId: this.context.adapterId,
      });
      throw new Error(translated.error.message);
    }
  }

  async testConnection(
    context: IntegrationRequestContext,
  ): Promise<AdapterLifecycleResult> {
    this.assertNotDisposed();
    this.assertInitialised();
    try {
      const result = await this.client.testConnection(context);
      this.apiStatus = "reachable";
      this.authenticationStatus = "valid";
      this.lastConnectionTestAt = this.context.clock.now();
      this.lastConnectionLatencyMs = result.latencyMs;
      this.circuitBreaker.recordSuccess();
      return { ok: true, message: "Documents DMS engine connection verified" };
    } catch (error) {
      const translated = mapPaperlessUnknownError(error, {
        correlationId: context.correlationId,
        tenantId: context.tenantId,
        operation: "connection_test",
        integrationId: this.integrationId,
        adapterId: this.context.adapterId,
      });
      this.apiStatus = "unavailable";
      this.authenticationStatus =
        translated.error.category === "authentication"
          ? "invalid"
          : this.authenticationStatus;
      this.circuitBreaker.recordFailure(translated.error);
      return { ok: false, message: translated.error.message };
    }
  }

  protected override async onInitialise(): Promise<void> {
    this.errorTranslator.registerMapper(this.errorMapper);
  }

  protected override async onValidateConfiguration(): Promise<AdapterConfigurationValidationResult> {
    const validation = validatePaperlessConfiguration(this.paperlessConfig);
    return validation.ok
      ? { ok: true, message: "Documents DMS configuration valid" }
      : {
          ok: false,
          message: "Documents DMS configuration validation failed",
          issues: validation.issues,
        };
  }

  protected override async onConnect(
    context: IntegrationRequestContext,
  ): Promise<void> {
    const result = await this.testConnection(context);
    if (!result.ok) throw new Error(result.message);
  }

  protected override async onPerformHealthChecks(
    _context: IntegrationRequestContext,
  ): Promise<IntegrationHealthCheck[]> {
    return [
      {
        name: "documents_dms_api",
        status:
          this.apiStatus === "reachable"
            ? "pass"
            : this.apiStatus === "unavailable"
              ? "fail"
              : "warn",
        message: `Documents DMS API: ${this.apiStatus}`,
      },
      {
        name: "documents_dms_authentication",
        status:
          this.authenticationStatus === "valid"
            ? "pass"
            : this.authenticationStatus === "unknown"
              ? "warn"
              : "fail",
        message: `Documents DMS authentication: ${this.authenticationStatus}`,
      },
    ];
  }

  protected override async onCollectDiagnostics(
    _context: IntegrationRequestContext,
    diagnostics: IntegrationDiagnostics,
  ): Promise<IntegrationDiagnostics> {
    const operational = classifyPaperlessOperationalHealth(this.diagnosticsExtension);
    return {
      ...diagnostics,
      healthStatus: mapPaperlessOperationalHealthToSdkStatus(operational.level),
      warnings: [...diagnostics.warnings, ...operational.reasons],
      recommendations: [...diagnostics.recommendations],
    };
  }

  protected override async onDispose(): Promise<void> {
    this.errorTranslator.unregisterMapper(this.integrationId);
    this.apiStatus = "not_tested";
    this.authenticationStatus = "unknown";
  }

  private async resolveToken(): Promise<string> {
    if (!this.secretProvider) {
      this.authenticationStatus = "missing";
      throw new Error("Secret provider is required for Documents DMS authentication");
    }
    const resolved = await this.secretProvider.resolve({
      credentialRef: this.paperlessConfig.apiTokenRef,
      tenantId: this.configuration.connection?.tenantId ?? "unknown",
      correlationId: "documents-dms-auth",
    });
    if (!resolved.ok) {
      this.authenticationStatus = "missing";
      throw new Error("Documents DMS API token could not be resolved");
    }
    return resolved.value.value;
  }
}
