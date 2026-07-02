import { resolveDiscoveryConfig } from "../discovery-engine/config";
import { Configuration } from "../configuration-manager";
import { Health } from "../health-manager";
import type {
  OrchestratorRuntimeContext,
  RuntimeConfigurationSummary,
  RuntimeDependencySummary,
  RuntimeDiagnostics,
  RuntimeDiscoverySummary,
  RuntimeHealthSummary,
  RuntimeLifecycleSummary,
  RuntimeManifestSummary,
  RuntimePlatformStatus,
} from "./types";

function emptyConfigurationSummary(): RuntimeConfigurationSummary {
  return {
    validationStatus: "not-loaded",
    platformVersion: "",
    runtimeMode: "development",
    failFast: true,
    workspaceRoot: "",
  };
}

function buildConfigurationSummary(
  context: OrchestratorRuntimeContext,
): RuntimeConfigurationSummary {
  const diagnostics = Configuration.getDiagnostics();

  return {
    validationStatus: diagnostics.validationStatus,
    platformVersion: context.configuration.platformVersion,
    runtimeMode: context.configuration.runtimeMode,
    failFast: context.configuration.failFast,
    workspaceRoot: context.configuration.workspaceRoot,
  };
}

function buildDiscoverySummary(
  context: OrchestratorRuntimeContext,
): RuntimeDiscoverySummary {
  const resolved = resolveDiscoveryConfig({
    workspaceRoot: context.configuration.workspaceRoot,
    ...context.configuration.discovery,
  });

  return {
    capabilityCount: context.capabilities.length,
    roots: resolved.roots,
    scannedRoots: context.scannedDiscoveryRoots,
  };
}

function buildManifestSummary(
  context: OrchestratorRuntimeContext,
): RuntimeManifestSummary {
  return {
    validatedCount: context.capabilities.length,
    rejectedCount: context.manifestRejectedCount,
  };
}

function buildDependencySummary(
  context: OrchestratorRuntimeContext,
): RuntimeDependencySummary {
  return {
    resolvedCount: context.capabilities.length,
    dependencyOrder: context.dependencyOrder,
  };
}

function buildLifecycleSummary(
  context: OrchestratorRuntimeContext,
): RuntimeLifecycleSummary {
  const snapshot = context.registry.snapshot();

  return {
    capabilityCount: snapshot.capabilityCount,
    stateSummary: snapshot.lifecycleSummary,
  };
}

function buildHealthSummary(): RuntimeHealthSummary {
  const diagnostics = Health.getDiagnostics();

  return {
    status: diagnostics.status,
    summary: diagnostics.summary,
    providerCount: diagnostics.registeredProviders.length,
    failedProviders: diagnostics.failedProviders,
  };
}

export function createEmptyRuntimeDiagnostics(
  status: RuntimePlatformStatus,
): RuntimeDiagnostics {
  return {
    status,
    steps: [],
    platformReady: false,
    capabilityCount: 0,
    registryCount: 0,
    lastBootstrap: undefined,
    placeholders: [],
    fatalErrors: [],
    startupDurationMs: 0,
    configuration: emptyConfigurationSummary(),
    discovery: { capabilityCount: 0, roots: [], scannedRoots: [] },
    manifest: { validatedCount: 0, rejectedCount: 0 },
    dependencies: { resolvedCount: 0, dependencyOrder: [] },
    lifecycle: { capabilityCount: 0, stateSummary: {} },
    health: {
      status: "unknown",
      summary: "Health check has not been executed",
      providerCount: 0,
      failedProviders: [],
    },
    warnings: [],
  };
}

export function buildRuntimeDiagnostics(
  status: RuntimePlatformStatus,
  context: OrchestratorRuntimeContext,
): RuntimeDiagnostics {
  const startupDurationMs = context.steps.reduce(
    (total, step) => total + step.durationMs,
    0,
  );

  return {
    status,
    steps: context.steps,
    platformReady: context.platformReady,
    capabilityCount: context.capabilities.length,
    registryCount: context.registry.count(),
    lastBootstrap: context.lastBootstrap,
    placeholders: context.placeholders,
    fatalErrors: context.fatalErrors,
    startupDurationMs,
    configuration: buildConfigurationSummary(context),
    discovery: buildDiscoverySummary(context),
    manifest: buildManifestSummary(context),
    dependencies: buildDependencySummary(context),
    lifecycle: buildLifecycleSummary(context),
    health: buildHealthSummary(),
    warnings: context.warnings,
  };
}
