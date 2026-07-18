import type { IntegrationRequestContext } from "@apzhub/integration-sdk";
import type { AdapterClock } from "@apzhub/integration-sdk/adapter";
import type { AdapterConfigurationValidationResult } from "@apzhub/integration-sdk/adapter";

import {
  GITHUB_ACTIONS_CORE_SERVICE_CAPABILITIES,
  GITHUB_ACTIONS_UNSUPPORTED_OPERATIONS,
} from "../capabilities/service-capabilities";
import { GITHUB_ACTIONS_API_VERSION } from "../github-actions-config";
import type { GitHubActionsRestClient } from "../internal/github-actions-rest-client";
import type { GitHubActionsCoreServices } from "../services/github-actions-core-services";
import { buildGitHubActionsCompatibilityMatrix } from "./compatibility-matrix";
import { detectGitHubActionsFeatures } from "./feature-detection";
import {
  classifyGitHubActionsOperationalHealth,
  mapOperationalHealthToSdkStatus,
} from "./health-classification";
import type {
  GitHubActionsCapabilityCertification,
  GitHubActionsCompatibilityMatrix,
  GitHubActionsFeatureDetectionResult,
  GitHubActionsOperationalHealthLevel,
  GitHubActionsRuntimeDiagnosticsSnapshot,
} from "./types";

export const GITHUB_ACTIONS_OPERATIONS_ADAPTER_VERSION = "0.1.0";

export interface GitHubActionsOperationsServiceDeps {
  readonly core: GitHubActionsCoreServices;
  readonly getRestClient: () => GitHubActionsRestClient;
  readonly clock: AdapterClock;
  readonly validateConfiguration: () => Promise<AdapterConfigurationValidationResult>;
  readonly getAuthenticationStatus: () => "valid" | "missing" | "invalid" | "unknown";
  readonly getApiStatus: () => "reachable" | "degraded" | "unavailable" | "not_tested";
  readonly getLastConnectionLatencyMs: () => number | undefined;
  readonly getConnectedLogin: () => string | undefined;
  readonly getAuthMode: () => string;
  readonly getAuthenticationMode: () => string;
  readonly getCircuitBreakerState: () => string;
  readonly oauthEnabled: boolean;
  readonly defaultOwner?: string;
  readonly defaultRepo?: string;
  readonly sdkVersion?: string;
}

export class GitHubActionsOperationsService {
  constructor(private readonly deps: GitHubActionsOperationsServiceDeps) {}

  certifyCapabilities(
    available: boolean = this.deps.getApiStatus() === "reachable",
  ): readonly GitHubActionsCapabilityCertification[] {
    return GITHUB_ACTIONS_CORE_SERVICE_CAPABILITIES.map((cap) => {
      const optional = cap.serviceId === "approvals";
      return {
        capabilityId: cap.serviceId,
        serviceId: cap.serviceId,
        implemented: true,
        available: optional ? available : available,
        optional,
        status: available ? "available" : "unavailable",
        supportedOperations: [...cap.operations],
        unsupportedOperations: [...GITHUB_ACTIONS_UNSUPPORTED_OPERATIONS],
        knownLimitations: cap.notes ?? [],
      };
    });
  }

  getCompatibilityMatrix(): GitHubActionsCompatibilityMatrix {
    return buildGitHubActionsCompatibilityMatrix({
      configuredApiVersion: GITHUB_ACTIONS_API_VERSION,
      checked: true,
    });
  }

  classifyHealth(input?: {
    readonly featureDetection?: GitHubActionsFeatureDetectionResult;
    readonly configurationInvalid?: boolean;
  }): {
    level: GitHubActionsOperationalHealthLevel;
    reasons: readonly string[];
  } {
    const rateLimit = this.deps.getRestClient().getLastRateLimit();
    return classifyGitHubActionsOperationalHealth({
      providerReachable: this.deps.getApiStatus() === "reachable",
      authenticationValid: this.deps.getAuthenticationStatus() === "valid",
      circuitBreakerOpen: this.deps.getCircuitBreakerState() === "open",
      compatibility: this.getCompatibilityMatrix(),
      capabilities: this.certifyCapabilities(),
      featureDetection: input?.featureDetection,
      configurationInvalid: input?.configurationInvalid,
      rateLimitExhausted:
        rateLimit?.remaining !== undefined && rateLimit.remaining <= 0,
    });
  }

  async detectFeatures(
    context: IntegrationRequestContext,
    sampleRunId?: string | number,
  ): Promise<GitHubActionsFeatureDetectionResult> {
    const owner = this.deps.defaultOwner;
    const repo = this.deps.defaultRepo;
    if (!owner || !repo) {
      return {
        probedAt: this.deps.clock.now(),
        approvalsAvailable: false,
        environmentsAvailable: false,
        detections: [
          {
            capabilityId: "feature_detection",
            endpoint: "n/a",
            available: false,
            optional: true,
            note: "owner/repo required for feature detection",
          },
        ],
      };
    }

    return detectGitHubActionsFeatures(context, {
      client: this.deps.getRestClient(),
      owner,
      repo,
      sampleRunId,
      clockNow: () => this.deps.clock.now(),
    });
  }

  buildRuntimeDiagnostics(input?: {
    readonly featureDetection?: GitHubActionsFeatureDetectionResult;
    readonly configurationValidationStatus?: "valid" | "invalid" | "not_checked";
  }): GitHubActionsRuntimeDiagnosticsSnapshot {
    const health = this.classifyHealth({
      featureDetection: input?.featureDetection,
      configurationInvalid: input?.configurationValidationStatus === "invalid",
    });
    const rateLimit = this.deps.getRestClient().getLastRateLimit();

    return {
      adapterVersion: GITHUB_ACTIONS_OPERATIONS_ADAPTER_VERSION,
      sdkVersion: this.deps.sdkVersion ?? "workspace",
      apiVersion: GITHUB_ACTIONS_API_VERSION,
      authenticationMode: this.deps.getAuthenticationMode(),
      authMode: this.deps.getAuthMode(),
      configurationValidationStatus:
        input?.configurationValidationStatus ?? "not_checked",
      apiStatus: this.deps.getApiStatus(),
      authenticationStatus: this.deps.getAuthenticationStatus(),
      rateLimitRemaining: rateLimit?.remaining,
      rateLimitLimit: rateLimit?.limit,
      rateLimitReset: rateLimit?.reset,
      lastConnectionLatencyMs: this.deps.getLastConnectionLatencyMs(),
      connectedLogin: this.deps.getConnectedLogin(),
      capabilityCount: GITHUB_ACTIONS_CORE_SERVICE_CAPABILITIES.length,
      healthLevel: health.level,
      healthReasons: health.reasons,
      circuitBreakerState: this.deps.getCircuitBreakerState(),
      oauthEnabled: this.deps.oauthEnabled,
      unsupportedOperations: [...GITHUB_ACTIONS_UNSUPPORTED_OPERATIONS],
    };
  }
}

export function createGitHubActionsOperationsService(
  deps: GitHubActionsOperationsServiceDeps,
): GitHubActionsOperationsService {
  return new GitHubActionsOperationsService(deps);
}

export { classifyGitHubActionsOperationalHealth, mapOperationalHealthToSdkStatus };
