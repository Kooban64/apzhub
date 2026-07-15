import type { AdapterConfigurationValidationResult } from "@apzhub/integration-sdk/adapter";
import type { IntegrationRequestContext } from "@apzhub/integration-sdk";
import type { IntegrationMetricsSummary } from "@apzhub/integration-sdk/observability";

import { PLANE_INTEGRATION_ID } from "../plane-error-mapper";
import type { PlaneCoreServices } from "../services/plane-core-services";
import { certifyPlaneCapabilities } from "./capability-certification";
import { buildPlaneCompatibilityMatrix } from "./compatibility-matrix";
import { detectPlaneFeatures } from "./feature-detection";
import {
  classifyPlaneOperationalHealth,
  mapOperationalHealthToSdkStatus,
} from "./health-classification";
import { evaluatePlaneReadiness } from "./readiness";
import type {
  PlaneCapabilityCertification,
  PlaneCompatibilityMatrix,
  PlaneEdition,
  PlaneFeatureDetectionResult,
  PlaneOperationalReport,
  PlaneReadinessResult,
  PlaneRuntimeDiagnosticsSnapshot,
} from "./types";

const ADAPTER_VERSION = "0.6.0";
const SDK_VERSION = "0.5.0";

export const PLANE_REFERENCE_ADAPTER_PATTERNS = [
  "Extend IntegrationAdapterBase — never bypass the Integration SDK",
  "Expose domain services via adapter.core; keep PlaneClient/RestClient internal",
  "Register capabilities through the capability registration framework",
  "Translate vendor errors via VendorErrorMapper — never leak raw backend errors",
  "Publish diagnostics without secrets (refs and booleans only)",
  "Optional capabilities degrade; required capabilities limit or unavailable",
  "Feature-detect optional endpoints as metadata — do not fail startup for optional gaps",
  "Use PlaneOperationRunner for logging, metrics, and circuit-breaker participation",
  "Expose operational reports for future administration tooling — no UI required in adapter",
  "Keep PlatformService / HTTP / UI out of the adapter package boundary",
] as const;

export interface PlaneOperationsContext {
  readonly core: PlaneCoreServices;
  readonly getRestClient: () => import("../internal/plane-rest-client").PlaneRestClient;
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
  readonly edition?: PlaneEdition;
}

/**
 * Plane operations facade — certification, compatibility, readiness, health, reports.
 */
export class PlaneOperationsService {
  private featureDetection?: PlaneFeatureDetectionResult;

  constructor(private readonly deps: PlaneOperationsContext) {}

  getLastFeatureDetection(): PlaneFeatureDetectionResult | undefined {
    return this.featureDetection;
  }

  certifyCapabilities(): readonly PlaneCapabilityCertification[] {
    return certifyPlaneCapabilities({
      serviceAvailable: (serviceId) => {
        const core = this.deps.core as unknown as Record<string, unknown>;
        const key =
          serviceId === "project_states"
            ? "projectStates"
            : serviceId === "synchronisation"
              ? "synchronisation"
              : serviceId;
        return Boolean(core[key]);
      },
      featureDetection: this.featureDetection,
      providerReachable: this.deps.getApiStatus() === "reachable",
      authenticationValid: this.deps.getAuthenticationStatus() === "valid",
    });
  }

  getCompatibilityMatrix(): PlaneCompatibilityMatrix {
    const range = this.deps.getVersionRange();
    return buildPlaneCompatibilityMatrix({
      detectedPlaneVersion: this.deps.getProviderVersion(),
      versionMin: range.min,
      versionMax: range.max.endsWith(".x") ? range.max.replace(/\.x$/, ".99") : range.max,
      edition: this.deps.edition ?? "community",
      featureDetection: this.featureDetection,
    });
  }

  async detectFeatures(context: IntegrationRequestContext): Promise<PlaneFeatureDetectionResult> {
    this.featureDetection = await detectPlaneFeatures(context, {
      client: this.deps.getRestClient(),
      clock: this.deps.clock,
    });
    return this.featureDetection;
  }

  async evaluateReadiness(context: IntegrationRequestContext): Promise<PlaneReadinessResult> {
    void context;
    const configurationValidation = await this.deps.validateConfiguration();
    const capabilities = this.certifyCapabilities();
    const compatibility = this.getCompatibilityMatrix();
    const syncHealth = this.deps.core.synchronisation.getDiagnostics().syncHealth;

    return evaluatePlaneReadiness({
      checkedAt: this.deps.clock.now(),
      configurationValidation,
      authenticationValid: this.deps.getAuthenticationStatus() === "valid",
      providerReachable: this.deps.getApiStatus() === "reachable",
      capabilitiesRegistered: capabilities.length > 0,
      registeredCapabilityCount: capabilities.length,
      compatibility,
      syncServiceAvailable: Boolean(this.deps.core.synchronisation),
      webhookServiceAvailable: Boolean(this.deps.core.webhooks),
      metricsAvailable: this.deps.metricsAvailable,
      loggerAvailable: this.deps.loggerAvailable,
      capabilities,
      circuitBreakerOpen: this.deps.getCircuitBreakerState() === "open",
      syncUnhealthy: syncHealth === "unhealthy",
      webhookUnhealthy: this.featureDetection?.unavailableCapabilities.includes("webhooks"),
    });
  }

  classifyHealth(): ReturnType<typeof classifyPlaneOperationalHealth> {
    const capabilities = this.certifyCapabilities();
    const compatibility = this.getCompatibilityMatrix();
    const syncHealth = this.deps.core.synchronisation.getDiagnostics().syncHealth;

    return classifyPlaneOperationalHealth({
      providerReachable: this.deps.getApiStatus() === "reachable",
      authenticationValid: this.deps.getAuthenticationStatus() === "valid",
      circuitBreakerOpen: this.deps.getCircuitBreakerState() === "open",
      compatibility,
      capabilities,
      featureDetection: this.featureDetection,
      syncUnhealthy: syncHealth === "unhealthy",
      webhookUnhealthy: this.featureDetection?.unavailableCapabilities.includes("webhooks"),
    });
  }

  buildRuntimeDiagnostics(): PlaneRuntimeDiagnosticsSnapshot {
    const health = this.classifyHealth();
    const metrics = this.deps.getMetricsSummary();
    const syncHealth = this.deps.core.synchronisation.getDiagnostics().syncHealth;
    const webhookUnavailable =
      this.featureDetection?.unavailableCapabilities.includes("webhooks") ?? false;

    return {
      adapterVersion: ADAPTER_VERSION,
      sdkVersion: SDK_VERSION,
      providerVersion: this.deps.getProviderVersion(),
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
      authenticationMode: this.deps.getAuthenticationMode(),
      connectionMode: this.deps.getConnectionMode(),
      apiLatencySummary: {
        lastConnectionLatencyMs: this.deps.getLastConnectionLatencyMs(),
        p95Ms: metrics.latencyP95Ms,
        requestsTotal: metrics.requestsTotal,
        errorsTotal: metrics.errorsTotal,
      },
      recentOperationalFailures: this.deps.getRecentFailures(),
      circuitBreakerState: this.deps.getCircuitBreakerState(),
      configurationValidationStatus: "not_checked",
      healthLevel: health.level,
      healthReasons: health.reasons,
    };
  }

  async buildOperationalReport(
    context: IntegrationRequestContext,
  ): Promise<PlaneOperationalReport> {
    const configurationValidation = await this.deps.validateConfiguration();
    const readiness = await this.evaluateReadiness(context);
    const capabilities = this.certifyCapabilities();
    const compatibility = this.getCompatibilityMatrix();
    const health = this.classifyHealth();
    const diagnostics = {
      ...this.buildRuntimeDiagnostics(),
      configurationValidationStatus: configurationValidation.ok
        ? ("valid" as const)
        : ("invalid" as const),
    };

    return {
      reportId: `plane-ops-${this.deps.clock.nowMs()}`,
      integrationId: PLANE_INTEGRATION_ID,
      generatedAt: this.deps.clock.now(),
      correlationId: context.correlationId,
      tenantId: context.tenantId,
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
      referencePatterns: [...PLANE_REFERENCE_ADAPTER_PATTERNS],
    };
  }
}

export function createPlaneOperationsService(
  deps: PlaneOperationsContext,
): PlaneOperationsService {
  return new PlaneOperationsService(deps);
}

export { mapOperationalHealthToSdkStatus, ADAPTER_VERSION as PLANE_OPERATIONS_ADAPTER_VERSION };
