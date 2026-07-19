import type { AdapterConfigurationValidationResult } from "@apzhub/integration-sdk/adapter";

import { KIMAI_CORE_SERVICE_CAPABILITIES } from "../capabilities/service-capabilities";
import { KIMAI_ADAPTER_VERSION } from "../version";
import { certifyKimaiCapabilities } from "./capability-certification";
import { buildKimaiCompatibilityMatrix } from "./compatibility-matrix";
import { detectKimaiFeatures } from "./feature-detection";
import { classifyKimaiOperationalHealth } from "./health-classification";
import { evaluateKimaiReadiness } from "./readiness";
import type { KimaiOperationalReport, KimaiRuntimeDiagnosticsSnapshot } from "./types";

export interface KimaiOperationsServiceDeps {
  readonly getApiStatus: () => string;
  readonly getAuthenticationStatus: () => string;
  readonly getAuthMode: () => string;
  readonly getLastLatencyMs: () => number | undefined;
  readonly getDetectedVersion: () => string | undefined;
  readonly getVersionMin: () => string;
  readonly getVersionMax: () => string;
  readonly getConfigurationValidation: () => AdapterConfigurationValidationResult;
  readonly isCircuitBreakerOpen: () => boolean;
  readonly getClockNow: () => string;
  readonly getPingSucceeded: () => boolean;
  readonly getVersionSucceeded: () => boolean;
  readonly metricsAvailable: () => boolean;
  readonly loggerAvailable: () => boolean;
}

export interface KimaiOperationsService {
  classifyHealth(): {
    readonly level: ReturnType<typeof classifyKimaiOperationalHealth>["level"];
    readonly reasons: readonly string[];
  };
  getCompatibilityMatrix(): ReturnType<typeof buildKimaiCompatibilityMatrix>;
  detectFeatures(): ReturnType<typeof detectKimaiFeatures>;
  evaluateReadiness(): ReturnType<typeof evaluateKimaiReadiness>;
  certifyCapabilities(): ReturnType<typeof certifyKimaiCapabilities>;
  buildRuntimeDiagnostics(): KimaiRuntimeDiagnosticsSnapshot;
  buildOperationalReport(): KimaiOperationalReport;
}

export function createKimaiOperationsService(
  deps: KimaiOperationsServiceDeps,
): KimaiOperationsService {
  const service: KimaiOperationsService = {
    classifyHealth() {
      const compatibility = this.getCompatibilityMatrix();
      return classifyKimaiOperationalHealth({
        apiStatus: deps.getApiStatus(),
        authenticationStatus: deps.getAuthenticationStatus(),
        compatibilityStatus: compatibility.compatibilityStatus,
        circuitBreakerOpen: deps.isCircuitBreakerOpen(),
      });
    },
    getCompatibilityMatrix() {
      return buildKimaiCompatibilityMatrix({
        detectedKimaiVersion: deps.getDetectedVersion(),
        versionMin: deps.getVersionMin(),
        versionMax: deps.getVersionMax(),
        featureDetection: detectKimaiFeatures({
          checkedAt: deps.getClockNow(),
          pingSucceeded: deps.getPingSucceeded(),
          versionSucceeded: deps.getVersionSucceeded(),
          detectedVersion: deps.getDetectedVersion(),
        }),
      });
    },
    detectFeatures() {
      return detectKimaiFeatures({
        checkedAt: deps.getClockNow(),
        pingSucceeded: deps.getPingSucceeded(),
        versionSucceeded: deps.getVersionSucceeded(),
        detectedVersion: deps.getDetectedVersion(),
      });
    },
    certifyCapabilities() {
      return certifyKimaiCapabilities({
        providerReachable: deps.getApiStatus() === "reachable",
        authenticationValid: deps.getAuthenticationStatus() === "valid",
        featureDetection: this.detectFeatures(),
      });
    },
    evaluateReadiness() {
      const certifications = this.certifyCapabilities();
      return evaluateKimaiReadiness({
        checkedAt: deps.getClockNow(),
        configurationValidation: deps.getConfigurationValidation(),
        authenticationValid: deps.getAuthenticationStatus() === "valid",
        providerReachable: deps.getApiStatus() === "reachable",
        capabilitiesRegistered: certifications.length > 0,
        registeredCapabilityCount: certifications.length,
        compatibility: this.getCompatibilityMatrix(),
        metricsAvailable: deps.metricsAvailable(),
        loggerAvailable: deps.loggerAvailable(),
        capabilities: certifications,
        circuitBreakerOpen: deps.isCircuitBreakerOpen(),
      });
    },
    buildRuntimeDiagnostics() {
      const health = this.classifyHealth();
      return {
        adapterVersion: KIMAI_ADAPTER_VERSION,
        healthLevel: health.level,
        reasons: health.reasons,
        compatibility: this.getCompatibilityMatrix(),
        readiness: this.evaluateReadiness(),
        featureDetection: this.detectFeatures(),
        certifications: this.certifyCapabilities(),
        apiStatus: deps.getApiStatus(),
        authenticationStatus: deps.getAuthenticationStatus(),
        authMode: deps.getAuthMode(),
        detectedKimaiVersion: deps.getDetectedVersion(),
        lastLatencyMs: deps.getLastLatencyMs(),
        coreServiceCount: KIMAI_CORE_SERVICE_CAPABILITIES.length,
      };
    },
    buildOperationalReport() {
      const diagnostics = this.buildRuntimeDiagnostics();
      return {
        generatedAt: deps.getClockNow(),
        healthLevel: diagnostics.healthLevel,
        readiness: diagnostics.readiness,
        compatibility: diagnostics.compatibility,
        featureDetection: diagnostics.featureDetection,
        certifications: diagnostics.certifications,
        diagnostics,
      };
    },
  };
  return service;
}
