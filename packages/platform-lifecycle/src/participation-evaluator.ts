import { satisfiesPlatformVersion } from "./version-compat";

import {
  LIFECYCLE_CAPABILITY_REGISTRATIONS,
  LIFECYCLE_PRODUCT_REGISTRATIONS,
} from "./registrations";
import type {
  CapabilityLifecycleParticipation,
  LifecycleRecoveryStatus,
  LifecycleShutdownStatus,
  PlatformLifecycleState,
  ProductLifecycleParticipation,
  VersionCompatibilityReport,
} from "./types";
import type { LifecycleEvaluationContext } from "./lifecycle-context-builder";
import type { ConsolidatedOperationalDiagnostics, HealthSignalStatus } from "@apzhub/platform-security";
import { lifecycleStateIndex } from "./lifecycle-states";

function mapCapabilityLifecycleState(
  _capabilityId: string,
  readiness: HealthSignalStatus,
  platformState: PlatformLifecycleState,
): PlatformLifecycleState {
  if (readiness === "unhealthy") {
    return "degraded";
  }

  const platformIndex = lifecycleStateIndex(platformState);
  if (platformIndex < 0) {
    return platformState;
  }

  if (readiness === "degraded" && platformState === "operational") {
    return "degraded";
  }

  return platformState;
}

function readinessForCapability(
  capabilityId: string,
  consolidated: ConsolidatedOperationalDiagnostics,
  context: LifecycleEvaluationContext,
): HealthSignalStatus {
  switch (capabilityId) {
    case "platform.configuration":
      return context.configurationValid ? "healthy" : "unhealthy";
    case "platform.persistence":
      return context.databaseHealthy ? "healthy" : "unhealthy";
    case "platform.runtime":
      return consolidated.runtime ? "healthy" : "degraded";
    case "platform.bootstrap":
      return context.bootstrapReady ? "healthy" : "unhealthy";
    case "platform.identity":
      return context.identityReady && context.databaseHealthy ? "healthy" : "degraded";
    case "platform.authorization":
      return context.authorizationReady ? "healthy" : "degraded";
    case "platform.personalisation":
      return consolidated.personalisation ? "healthy" : "degraded";
    case "platform.governance":
      return consolidated.governance ? "healthy" : "degraded";
    case "platform.security":
      return consolidated.resilience.health.status;
    case "platform.traffic-governance":
      return consolidated.security.trafficGovernance.status.enabled ? "healthy" : "degraded";
    case "platform.session-security":
      return consolidated.security.session.sessionDiagnostics.healthy ? "healthy" : "degraded";
    case "platform.tenant-isolation":
      return consolidated.security.apiGuard.permissionEnforcement ? "healthy" : "degraded";
    case "platform.workbench":
      return consolidated.workbench ? "healthy" : "degraded";
    case "platform.api-framework":
      return consolidated.security.apiGuard.sessionRequired ? "healthy" : "degraded";
    case "platform.operations":
      return consolidated.operations ? "healthy" : "degraded";
    case "platform.provisioning":
      return "degraded";
    default:
      return "unknown";
  }
}

export function evaluateVersionCompatibility(
  platformVersion: string,
): VersionCompatibilityReport {
  const checks = [
    ...LIFECYCLE_CAPABILITY_REGISTRATIONS.map((registration) => ({
      id: registration.capabilityId,
      version: registration.version,
      constraint: registration.minPlatformVersion,
      compatible: satisfiesPlatformVersion(registration.minPlatformVersion, platformVersion),
      message: registration.minPlatformVersion
        ? `Requires platform ${registration.minPlatformVersion}`
        : "No platform version constraint.",
    })),
    ...LIFECYCLE_PRODUCT_REGISTRATIONS.map((registration) => ({
      id: registration.productId,
      version: registration.version,
      constraint: registration.minPlatformVersion,
      compatible: satisfiesPlatformVersion(registration.minPlatformVersion, platformVersion),
      message: registration.minPlatformVersion
        ? `Requires platform ${registration.minPlatformVersion}`
        : "No platform version constraint.",
    })),
  ];

  return {
    platformVersion,
    compatible: checks.every((check) => check.compatible),
    checks,
  };
}

export function buildCapabilityParticipations(input: {
  readonly consolidated: ConsolidatedOperationalDiagnostics;
  readonly context: LifecycleEvaluationContext;
  readonly platformState: PlatformLifecycleState;
  readonly platformVersion: string;
  readonly productStatuses?: Readonly<Record<string, HealthSignalStatus>>;
  readonly shutdownStatus: LifecycleShutdownStatus;
  readonly recoveryStatus: LifecycleRecoveryStatus;
}): readonly CapabilityLifecycleParticipation[] {
  const {
    consolidated,
    context,
    platformState,
    platformVersion,
    shutdownStatus,
    recoveryStatus,
  } = input;

  return LIFECYCLE_CAPABILITY_REGISTRATIONS.map((registration) => {
    const readiness = readinessForCapability(
      registration.capabilityId,
      consolidated,
      context,
    );
    const versionCompatible = satisfiesPlatformVersion(
      registration.minPlatformVersion,
      platformVersion,
    );
    const warnings: string[] = [];

    if (!versionCompatible) {
      warnings.push(`Version constraint ${registration.minPlatformVersion ?? "unknown"} not satisfied.`);
    }
    if (readiness === "degraded") {
      warnings.push("Capability readiness is degraded.");
    }

    return {
      capabilityId: registration.capabilityId,
      name: registration.name,
      owner: registration.owner,
      version: registration.version,
      lifecycleState: mapCapabilityLifecycleState(
        registration.capabilityId,
        readiness,
        platformState,
      ),
      dependencies: [...registration.dependencies],
      readiness,
      shutdownStatus,
      recoveryStatus,
      sequenceOrder: registration.sequenceOrder,
      versionCompatible,
      warnings,
    };
  });
}

export function buildProductParticipations(input: {
  readonly consolidated: ConsolidatedOperationalDiagnostics;
  readonly context: LifecycleEvaluationContext;
  readonly platformState: PlatformLifecycleState;
  readonly platformVersion: string;
  readonly productStatuses?: Readonly<Record<string, HealthSignalStatus>>;
  readonly shutdownStatus: LifecycleShutdownStatus;
  readonly recoveryStatus: LifecycleRecoveryStatus;
}): readonly ProductLifecycleParticipation[] {
  const {
    consolidated,
    context,
    platformState,
    platformVersion,
    productStatuses = {},
    shutdownStatus,
    recoveryStatus,
  } = input;

  return LIFECYCLE_PRODUCT_REGISTRATIONS.map((registration) => {
    const readiness =
      productStatuses[registration.productId] ??
      (registration.productId === "law-platform"
        ? consolidated.lawPlatform
          ? "healthy"
          : "degraded"
        : consolidated.trustAccounting
          ? "healthy"
          : "degraded");

    const versionCompatible = satisfiesPlatformVersion(
      registration.minPlatformVersion,
      platformVersion,
    );
    const warnings: string[] = [];

    if (!context.platformCoreReady) {
      warnings.push("Platform core is not ready — product participation is blocked.");
    }
    if (readiness !== "healthy") {
      warnings.push("Product readiness is not healthy.");
    }

    return {
      productId: registration.productId,
      name: registration.name,
      version: registration.version,
      lifecycleState: mapCapabilityLifecycleState(registration.productId, readiness, platformState),
      dependencies: [...registration.dependencies],
      readiness,
      shutdownStatus,
      recoveryStatus,
      versionCompatible,
      warnings,
    };
  });
}
