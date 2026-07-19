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

import { type KimaiConfiguration, validateKimaiConfiguration } from "./kimai-config";
import {
  getKimaiExtendedCapabilities,
  type KimaiBootstrapConfiguration,
} from "./kimai-bootstrap";
import {
  createKimaiVendorErrorMapper,
  mapKimaiUnknownError,
} from "./kimai-error-mapper";
import type { FetchFn } from "./internal/kimai-fetch-client";
import {
  KimaiRestClient,
  type KimaiConnectionTestResult,
  type KimaiRestAuth,
} from "./internal/kimai-rest-client";
import {
  KIMAI_CORE_SERVICE_CAPABILITIES,
  KIMAI_UNSUPPORTED_OPERATIONS,
} from "./capabilities/service-capabilities";
import { createKimaiCapabilityRegistration } from "./capabilities/capability-registration";
import {
  createKimaiOperationsService,
  mapOperationalHealthToSdkStatus,
  type KimaiOperationsService,
  type KimaiOperationalReport,
  type KimaiRuntimeDiagnosticsSnapshot,
} from "./operations";
import {
  createKimaiCoreServices,
  type KimaiCoreServices,
} from "./services/kimai-domain-services";
import { KIMAI_ADAPTER_VERSION } from "./version";

export { KIMAI_ADAPTER_VERSION };

export interface KimaiDiagnosticsExtension {
  readonly apiStatus: "reachable" | "degraded" | "unavailable" | "not_tested";
  readonly authenticationStatus: "valid" | "missing" | "invalid" | "unknown";
  readonly authMode: string;
  readonly kimaiVersion?: string;
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
  readonly operationsCapability: {
    readonly healthLevel: string;
    readonly healthReasons: readonly string[];
    readonly compatibilityStatus: string;
    readonly readinessClassification: string;
  };
}

export interface KimaiAdapterOptions {
  readonly fetchFn?: FetchFn;
  readonly secretProvider?: SecretProvider;
}

/**
 * Kimai CE Integration Adapter — extends IntegrationAdapterBase.
 * APZHUB-INTEGRATION-KIMAI-001 foundation + APZHUB-INTEGRATION-KIMAI-002 domain CE APIs.
 * Does not implement APZ Time Workbench or product UI.
 */
export class KimaiAdapter extends IntegrationAdapterBase {
  readonly kimaiConfig: KimaiConfiguration;
  readonly operations: KimaiOperationsService;
  /** Plane-style domain core — timesheets/activities/customers/projects/tags. */
  readonly core: KimaiCoreServices;
  private readonly restClient: KimaiRestClient;
  private readonly errorMapper = createKimaiVendorErrorMapper();
  private readonly secretProvider?: SecretProvider;
  private lastConnectionTest?: KimaiConnectionTestResult;
  private lastConnectionTestAt?: string;
  private apiStatus: KimaiDiagnosticsExtension["apiStatus"] = "not_tested";
  private authenticationStatus: KimaiDiagnosticsExtension["authenticationStatus"] =
    "unknown";
  private pingSucceeded = false;
  private versionSucceeded = false;
  private detectedVersion?: string;

  constructor(
    context: AdapterContext,
    configuration: KimaiBootstrapConfiguration,
    options: KimaiAdapterOptions = {},
  ) {
    super(context, configuration);
    this.kimaiConfig = configuration.kimai;
    this.secretProvider = options.secretProvider;

    const transport = createHttpIntegrationClient({
      apiBaseUrl: configuration.kimai.apiBaseUrl,
      timeoutMs: configuration.kimai.timeoutMs,
      defaultHeaders: configuration.kimai.defaultHeaders,
      fetchFn: options.fetchFn,
      errorLabel: "Kimai",
    });

    this.restClient = new KimaiRestClient({
      client: transport,
      getAuth: async () => this.resolveAuthMaterial(),
    });
    this.core = createKimaiCoreServices(this.restClient);

    this.operations = createKimaiOperationsService({
      getApiStatus: () => this.apiStatus,
      getAuthenticationStatus: () => this.authenticationStatus,
      getAuthMode: () => this.kimaiConfig.authMode,
      getLastLatencyMs: () =>
        this.lastConnectionTest?.latencyMs ?? this.restClient.getLastLatencyMs(),
      getDetectedVersion: () =>
        this.detectedVersion ?? this.restClient.getLastDetectedVersion(),
      getVersionMin: () => this.kimaiConfig.versionMin,
      getVersionMax: () => this.kimaiConfig.versionMax,
      getConfigurationValidation: () => {
        const validation = validateKimaiConfiguration(this.kimaiConfig);
        return validation.ok
          ? { ok: true, message: "Kimai configuration valid" }
          : {
              ok: false,
              message: "Kimai configuration validation failed",
              issues: validation.issues,
            };
      },
      isCircuitBreakerOpen: () => !this.circuitBreaker.allowRequest(),
      getClockNow: () => this.context.clock.now(),
      getPingSucceeded: () => this.pingSucceeded,
      getVersionSucceeded: () => this.versionSucceeded,
      metricsAvailable: () => true,
      loggerAvailable: () => true,
    });
  }

  get diagnosticsExtension(): KimaiDiagnosticsExtension {
    const coreAvailable = this.apiStatus === "reachable";
    const health = this.operations.classifyHealth();
    const compatibility = this.operations.getCompatibilityMatrix();
    const readiness = this.operations.evaluateReadiness();

    return {
      apiStatus: this.apiStatus,
      authenticationStatus: this.authenticationStatus,
      authMode: this.kimaiConfig.authMode,
      kimaiVersion: this.detectedVersion,
      extendedCapabilities: [
        ...getKimaiExtendedCapabilities(
          this.configuration as KimaiBootstrapConfiguration,
        ),
      ],
      coreServices: KIMAI_CORE_SERVICE_CAPABILITIES.map((capability) => ({
        serviceId: capability.serviceId,
        available: coreAvailable && capability.implemented,
        implemented: capability.implemented,
      })),
      unsupportedOperations: [...KIMAI_UNSUPPORTED_OPERATIONS],
      lastConnectionTestAt: this.lastConnectionTestAt,
      lastConnectionLatencyMs: this.lastConnectionTest?.latencyMs,
      adapterVersion: KIMAI_ADAPTER_VERSION,
      operationsCapability: {
        healthLevel: health.level,
        healthReasons: health.reasons,
        compatibilityStatus: compatibility.compatibilityStatus,
        readinessClassification: readiness.classification,
      },
    };
  }

  getRuntimeDiagnosticsSnapshot(): KimaiRuntimeDiagnosticsSnapshot {
    return this.operations.buildRuntimeDiagnostics();
  }

  buildOperationalReport(): KimaiOperationalReport {
    return this.operations.buildOperationalReport();
  }

  listCapabilityRegistration() {
    return createKimaiCapabilityRegistration();
  }

  async discoverVersion(
    context: IntegrationRequestContext,
  ): Promise<string | undefined> {
    this.assertNotDisposed();
    this.assertInitialised();
    const version = await this.restClient.getVersion(context);
    this.detectedVersion = version.version?.trim() || undefined;
    this.versionSucceeded = Boolean(this.detectedVersion);
    return this.detectedVersion;
  }

  async testConnection(
    context: IntegrationRequestContext,
  ): Promise<AdapterLifecycleResult> {
    this.assertNotDisposed();
    this.assertInitialised();

    if (!this.circuitBreaker.allowRequest()) {
      return {
        ok: false,
        message: "Circuit breaker open — Kimai connection test rejected",
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
      this.pingSucceeded = true;
      this.versionSucceeded = Boolean(result.engineVersion);
      this.detectedVersion = result.engineVersion;

      this.metrics.recordRequest({
        durationMs: result.latencyMs,
        success: true,
        operation: "connection_test",
      });
      this.circuitBreaker.recordSuccess();

      this.logger.info("Kimai connection test succeeded", {
        correlationId: context.correlationId,
        tenantId: context.tenantId,
        operation: "connection_test",
        durationMs: result.latencyMs,
        result: "success",
      });

      return {
        ok: true,
        message: `Kimai connection verified (${result.engineVersion ?? "version-unknown"})`,
      };
    } catch (error) {
      const translated = mapKimaiUnknownError(
        error,
        this.buildErrorContext(context, "connection_test"),
      );
      this.errorSummary.record(translated.error);
      this.circuitBreaker.recordFailure(translated.error);
      this.apiStatus = "unavailable";
      this.pingSucceeded = false;
      this.versionSucceeded = false;
      this.authenticationStatus =
        translated.error.category === "authentication"
          ? "invalid"
          : this.authenticationStatus;

      this.metrics.recordRequest({
        durationMs: Date.now() - new Date(startedAt).getTime(),
        success: false,
        operation: "connection_test",
      });

      this.logger.error("Kimai connection test failed", {
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
    const validation = validateKimaiConfiguration(this.kimaiConfig);
    if (!validation.ok) {
      return {
        ok: false,
        message: "Kimai configuration validation failed",
        issues: validation.issues,
      };
    }
    return { ok: true, message: "Kimai configuration valid" };
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
    const compatibility = this.operations.getCompatibilityMatrix();
    const readiness = this.operations.evaluateReadiness();

    return [
      {
        name: "kimai_api",
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
            ? "Kimai API reachable"
            : this.apiStatus === "not_tested"
              ? "Kimai API not tested yet"
              : `Kimai API status: ${this.apiStatus}`,
      },
      {
        name: "kimai_authentication",
        status:
          this.authenticationStatus === "valid"
            ? "pass"
            : this.authenticationStatus === "missing" ||
                this.authenticationStatus === "invalid"
              ? "fail"
              : "warn",
        message: `Kimai authentication: ${this.authenticationStatus}`,
      },
      {
        name: "kimai_version",
        status: this.detectedVersion ? "pass" : "warn",
        message: this.detectedVersion
          ? `Kimai version: ${this.detectedVersion}`
          : "Kimai version not detected",
      },
      {
        name: "kimai_compatibility",
        status:
          compatibility.compatibilityStatus === "compatible"
            ? "pass"
            : compatibility.compatibilityStatus === "incompatible"
              ? "fail"
              : "warn",
        message: `Compatibility: ${compatibility.compatibilityStatus}`,
      },
      {
        name: "kimai_readiness",
        status: readiness.ready ? "pass" : "fail",
        message: `Readiness: ${readiness.classification}`,
      },
      {
        name: "kimai_operational_health",
        status:
          sdkStatus === "healthy" ? "pass" : sdkStatus === "degraded" ? "warn" : "fail",
        message: `Operational health: ${health.level} (${sdkStatus})`,
      },
      {
        name: "kimai_domain_scope",
        status: "pass",
        message:
          "Domain CE APIs available (timesheets/activities/customers/projects/tags) — APZ Time Workbench remains out of scope",
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
      warnings.push("Kimai API has not been verified as reachable");
    }
    for (const reason of snapshot.reasons) {
      warnings.push(`operational:${reason}`);
    }
    for (const warning of snapshot.readiness.warnings) {
      warnings.push(`readiness:${warning}`);
    }

    return {
      ...diagnostics,
      engineVersion: extension.kimaiVersion,
      healthStatus: mapOperationalHealthToSdkStatus(snapshot.healthLevel),
      warnings,
      recommendations: [
        ...diagnostics.recommendations,
        ...(extension.authenticationStatus !== "valid"
          ? ["Verify Kimai API token via SecretProvider (Bearer preferred)"]
          : []),
        "APZHUB-INTEGRATION-KIMAI-002 provides Kimai CE domain APIs — APZ Time Workbench remains unauthorised",
        `Out-of-scope operations: ${extension.unsupportedOperations.join(", ")}`,
      ],
      connection: diagnostics.connection
        ? {
            ...diagnostics.connection,
            warnings: [
              ...diagnostics.connection.warnings,
              `Adapter version: ${extension.adapterVersion}`,
              `Auth mode: ${extension.authMode}`,
              `Operations health: ${extension.operationsCapability.healthLevel}`,
              `Readiness: ${extension.operationsCapability.readinessClassification}`,
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
    this.pingSucceeded = false;
    this.versionSucceeded = false;
    this.detectedVersion = undefined;
  }

  private async validateAuthentication(
    context: IntegrationRequestContext,
  ): Promise<AdapterLifecycleResult> {
    try {
      await this.resolveAuthMaterial(context);
      this.authenticationStatus = "valid";
      return { ok: true, message: "Kimai credentials resolved" };
    } catch {
      this.authenticationStatus = "missing";
      const missing = missingCredentialsError(
        { correlationId: context.correlationId },
        "Kimai credentials are missing",
      );
      return { ok: false, message: missing.message };
    }
  }

  private async resolveAuthMaterial(
    context?: IntegrationRequestContext,
  ): Promise<KimaiRestAuth> {
    if (!this.secretProvider) {
      this.authenticationStatus = "missing";
      throw new Error("Secret provider is required for Kimai authentication");
    }

    const tenantId =
      context?.tenantId ?? this.configuration.connection?.tenantId ?? "unknown";
    const correlationId = context?.correlationId ?? "kimai-client-auth";

    if (this.kimaiConfig.authMode === "legacy_headers") {
      const userRef = this.kimaiConfig.apiUserRef;
      const passwordRef = this.kimaiConfig.apiPasswordRef;
      if (!userRef || !passwordRef) {
        this.authenticationStatus = "missing";
        throw new Error("apiUserRef and apiPasswordRef are required");
      }
      const username = await this.secretProvider.resolve({
        credentialRef: userRef,
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
        throw new Error("Legacy Kimai auth secrets could not be resolved");
      }
      return {
        kind: "legacy_headers",
        username: username.value.value,
        apiPassword: password.value.value,
      };
    }

    const ref = this.kimaiConfig.apiTokenRef;
    if (!ref) {
      this.authenticationStatus = "missing";
      throw new Error("apiTokenRef is required");
    }
    const token = await this.secretProvider.resolve({
      credentialRef: ref,
      tenantId,
      correlationId,
    });
    if (!token.ok) {
      this.authenticationStatus = "missing";
      throw new Error("Kimai API token secret could not be resolved");
    }
    return { kind: "bearer", token: token.value.value };
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
