import type { AdapterConfigurationValidationResult } from "@apzhub/integration-sdk/adapter";
import type { IntegrationRequestContext } from "@apzhub/integration-sdk";
import type { IntegrationMetricsSummary } from "@apzhub/integration-sdk/observability";

import { ZAMMAD_INTEGRATION_ID } from "../zammad-error-mapper";
import type { ZammadCoreServices } from "../services/zammad-core-services";
import {
  certifyAttachmentPlaceholder,
  certifyZammadCapabilities,
} from "./capability-certification";
import {
  decideZammadCertificationOutcome,
  ZAMMAD_KNOWN_LIMITATIONS,
} from "./certification-outcome";
import { buildZammadCompatibilityMatrix } from "./compatibility-matrix";
import { detectZammadFeatures } from "./feature-detection";
import {
  classifyZammadOperationalHealth,
  mapOperationalHealthToSdkStatus,
} from "./health-classification";
import { evaluateZammadReadiness } from "./readiness";
import { defaultZammadReferenceCompliance } from "./reference-compliance";
import type {
  ZammadCapabilityCertification,
  ZammadCompatibilityMatrix,
  ZammadEdition,
  ZammadFeatureDetectionResult,
  ZammadOperationalReport,
  ZammadReadinessResult,
  ZammadRuntimeDiagnosticsSnapshot,
} from "./types";

const ADAPTER_VERSION = "0.6.0";
const SDK_VERSION = "0.5.0";

export const ZAMMAD_REFERENCE_ADAPTER_PATTERNS = [
  "Extend IntegrationAdapterBase — never bypass the Integration SDK",
  "Expose domain services via adapter.core; keep ZammadRestClient internal",
  "Register capabilities through the capability registration framework",
  "Translate vendor errors via VendorErrorMapper — never leak raw backend errors",
  "Publish diagnostics without secrets (refs and booleans only)",
  "Optional capabilities degrade; required capabilities limit or unavailable",
  "Feature-detect optional endpoints as metadata — do not fail startup for optional gaps",
  "Use ZammadOperationRunner for logging, metrics, and circuit-breaker participation",
  "Expose operational reports for future administration tooling — no UI required in adapter",
  "Keep PlatformService / HTTP / UI out of the adapter package boundary",
  "Binary attachments, webhook ingress, and Platform Event Bus remain explicitly unimplemented",
] as const;

export interface ZammadOperationsContext {
  readonly core: ZammadCoreServices;
  readonly getRestClient: () => import("../internal/zammad-rest-client").ZammadRestClient;
  readonly clock: { now(): string; nowMs(): number };
  readonly validateConfiguration: () => Promise<AdapterConfigurationValidationResult>;
  readonly getAuthenticationStatus: () => "valid" | "missing" | "invalid" | "unknown";
  readonly getApiStatus: () => "reachable" | "degraded" | "unavailable" | "not_tested";
  readonly getProviderVersion: () => string | undefined;
  readonly getVersionRange: () => { min: string; max: string };
  readonly getLastConnectionLatencyMs: () => number | undefined;
  readonly getAuthenticationMode: () => string;
  readonly getConnectionMode: () => string;
  readonly getCircuitBreakerState: () => string;
  readonly getMetricsSummary: () => IntegrationMetricsSummary;
  readonly getRecentFailures: () => readonly string[];
  readonly loggerAvailable: boolean;
  readonly metricsAvailable: boolean;
  readonly diagnosticsAvailable: boolean;
  readonly edition?: ZammadEdition;
}

/**
 * Zammad operations facade — certification, compatibility, readiness, health, reports.
 */
export class ZammadOperationsService {
  private featureDetection?: ZammadFeatureDetectionResult;

  constructor(private readonly deps: ZammadOperationsContext) {}

  getLastFeatureDetection(): ZammadFeatureDetectionResult | undefined {
    return this.featureDetection;
  }

  certifyCapabilities(): readonly ZammadCapabilityCertification[] {
    const certified = certifyZammadCapabilities({
      serviceAvailable: (serviceId) => {
        const core = this.deps.core as unknown as Record<string, unknown>;
        return Boolean(core[serviceId]);
      },
      featureDetection: this.featureDetection,
      providerReachable: this.deps.getApiStatus() === "reachable",
      authenticationValid: this.deps.getAuthenticationStatus() === "valid",
    });
    return [...certified, certifyAttachmentPlaceholder()];
  }

  getCompatibilityMatrix(): ZammadCompatibilityMatrix {
    const range = this.deps.getVersionRange();
    return buildZammadCompatibilityMatrix({
      detectedZammadVersion: this.deps.getProviderVersion(),
      versionMin: range.min,
      versionMax: range.max,
      edition: this.deps.edition ?? "community",
      featureDetection: this.featureDetection,
    });
  }

  async detectFeatures(
    context: IntegrationRequestContext,
  ): Promise<ZammadFeatureDetectionResult> {
    this.featureDetection = await detectZammadFeatures(context, {
      client: this.deps.getRestClient(),
      clock: this.deps.clock,
    });
    return this.featureDetection;
  }

  async evaluateReadiness(
    context: IntegrationRequestContext,
  ): Promise<ZammadReadinessResult> {
    void context;
    const configurationValidation = await this.deps.validateConfiguration();
    const capabilities = this.certifyCapabilities().filter(
      (c) => c.capabilityId !== "attachments",
    );
    const compatibility = this.getCompatibilityMatrix();
    const syncHealth = this.deps.core.synchronisation.getDiagnostics().syncHealth;

    return evaluateZammadReadiness({
      checkedAt: this.deps.clock.now(),
      configurationValidation,
      authenticationValid: this.deps.getAuthenticationStatus() === "valid",
      providerReachable: this.deps.getApiStatus() === "reachable",
      capabilitiesRegistered: capabilities.length > 0,
      registeredCapabilityCount: capabilities.filter((c) => c.registered).length,
      compatibility,
      coreSupportAvailable: Boolean(
        this.deps.core.support &&
        this.deps.core.organizations &&
        this.deps.core.groups &&
        this.deps.core.users,
      ),
      articleServiceAvailable: Boolean(this.deps.core.articles),
      syncServiceAvailable: Boolean(this.deps.core.synchronisation),
      webhookServiceAvailable: Boolean(this.deps.core.webhooks),
      diagnosticsAvailable: this.deps.diagnosticsAvailable,
      metricsAvailable: this.deps.metricsAvailable,
      loggerAvailable: this.deps.loggerAvailable,
      capabilities,
      circuitBreakerOpen: this.deps.getCircuitBreakerState() === "open",
      syncUnhealthy: syncHealth === "unhealthy",
      webhookUnhealthy:
        this.featureDetection?.unavailableCapabilities.includes("webhooks"),
      featureDetection: this.featureDetection,
    });
  }

  classifyHealth(): ReturnType<typeof classifyZammadOperationalHealth> {
    const capabilities = this.certifyCapabilities().filter(
      (c) => c.capabilityId !== "attachments",
    );
    const compatibility = this.getCompatibilityMatrix();
    const syncHealth = this.deps.core.synchronisation.getDiagnostics().syncHealth;

    return classifyZammadOperationalHealth({
      providerReachable: this.deps.getApiStatus() === "reachable",
      authenticationValid: this.deps.getAuthenticationStatus() === "valid",
      circuitBreakerOpen: this.deps.getCircuitBreakerState() === "open",
      compatibility,
      capabilities,
      featureDetection: this.featureDetection,
      syncUnhealthy: syncHealth === "unhealthy",
      webhookUnhealthy:
        this.featureDetection?.unavailableCapabilities.includes("webhooks"),
    });
  }

  buildRuntimeDiagnostics(): ZammadRuntimeDiagnosticsSnapshot {
    const capabilities = this.certifyCapabilities();
    const implemented = capabilities.filter((c) => c.implemented);
    const health = this.classifyHealth();
    const metrics = this.deps.getMetricsSummary();
    const syncHealth = this.deps.core.synchronisation.getDiagnostics().syncHealth;
    const webhookUnavailable =
      this.featureDetection?.unavailableCapabilities.includes("webhooks") ?? false;
    const range = this.deps.getVersionRange();

    return {
      adapterVersion: ADAPTER_VERSION,
      sdkVersion: SDK_VERSION,
      providerVersion: this.deps.getProviderVersion(),
      supportedVersionRange: { min: range.min, max: range.max },
      edition: this.deps.edition ?? "community",
      authenticationMode: this.deps.getAuthenticationMode(),
      connectionMode: this.deps.getConnectionMode(),
      configurationValidationStatus: "not_checked",
      capabilityCount: capabilities.length,
      implementedCapabilityCount: implemented.length,
      degradedCapabilityCount: capabilities.filter((c) => c.degraded).length,
      unavailableCapabilityCount: capabilities.filter(
        (c) =>
          !c.available ||
          c.status === "unavailable" ||
          c.status === "optional_unavailable",
      ).length,
      capabilityHealth: health.level,
      webhookHealth: webhookUnavailable
        ? "DEGRADED"
        : this.deps.getApiStatus() === "reachable"
          ? "HEALTHY"
          : "UNAVAILABLE",
      syncReadiness:
        syncHealth === "healthy"
          ? "ready"
          : syncHealth === "degraded"
            ? "degraded"
            : syncHealth === "unhealthy"
              ? "not_ready"
              : "unknown",
      eventTranslationReadiness: Boolean(this.deps.core.events),
      persistentSyncStateSupport: false,
      webhookIngressSupport: false,
      binaryAttachmentSupport: false,
      apiLatencySummary: {
        lastConnectionLatencyMs: this.deps.getLastConnectionLatencyMs(),
        p95Ms: metrics.latencyP95Ms,
        requestsTotal: metrics.requestsTotal,
        errorsTotal: metrics.errorsTotal,
      },
      recentOperationalFailures: this.deps.getRecentFailures(),
      circuitBreakerState: this.deps.getCircuitBreakerState(),
      healthLevel: health.level,
      healthReasons: health.reasons,
    };
  }

  async buildOperationalReport(
    context: IntegrationRequestContext,
  ): Promise<ZammadOperationalReport> {
    const configurationValidation = await this.deps.validateConfiguration();
    const readiness = await this.evaluateReadiness(context);
    const capabilities = this.certifyCapabilities();
    const compatibility = this.getCompatibilityMatrix();
    const health = this.classifyHealth();
    const referenceCompliance = defaultZammadReferenceCompliance();
    const diagnostics: ZammadRuntimeDiagnosticsSnapshot = {
      ...this.buildRuntimeDiagnostics(),
      configurationValidationStatus: configurationValidation.ok ? "valid" : "invalid",
      readinessSummary: readiness.ready
        ? "ready"
        : `not_ready:${readiness.blockingIssues.length}`,
    };

    const certificationOutcome = decideZammadCertificationOutcome({
      capabilities: capabilities.filter((c) => c.capabilityId !== "attachments"),
      compatibility,
      readiness,
      healthLevel: health.level,
      referenceCompliance,
    });

    return {
      reportId: `zammad-ops-${this.deps.clock.nowMs()}`,
      integrationId: ZAMMAD_INTEGRATION_ID,
      generatedAt: this.deps.clock.now(),
      correlationId: context.correlationId,
      tenantId: context.tenantId,
      certificationOutcome,
      health: {
        level: health.level,
        reasons: health.reasons,
      },
      capabilities,
      compatibility,
      readiness,
      diagnostics,
      featureDetection: this.featureDetection,
      configurationValidation: {
        ok: configurationValidation.ok,
        issues: configurationValidation.issues ?? [],
      },
      knownLimitations: [...ZAMMAD_KNOWN_LIMITATIONS],
      referenceCompliance,
      referencePatterns: [...ZAMMAD_REFERENCE_ADAPTER_PATTERNS],
    };
  }
}

export function createZammadOperationsService(
  deps: ZammadOperationsContext,
): ZammadOperationsService {
  return new ZammadOperationsService(deps);
}

export {
  mapOperationalHealthToSdkStatus,
  ADAPTER_VERSION as ZAMMAD_OPERATIONS_ADAPTER_VERSION,
};
