import { withCapabilityLifecycleState } from "../capability/factory";
import type { Capability } from "../capability/types";
import { createCapabilityRegistry } from "../capability-registry/registry";
import { Configuration } from "../configuration-manager";
import type { ConfigurationError } from "../configuration-manager/validation/errors";
import type { RuntimeConfiguration } from "../configuration-manager/interfaces/types";
import {
  mapHealthStatusToCapabilityHealth,
  mapHealthStatusToLifecycleTarget,
} from "../health-manager/implementation/aggregate";
import { Health } from "../health-manager";
import { discoverCapabilities } from "../discovery-engine/discover";
import { createCapabilityLifecycleManager } from "../lifecycle-manager/manager";
import { validateCapabilityManifest } from "../manifest-engine/validate";
import { satisfiesPlatformVersion } from "../version-manager/semver";
import { resolveCapabilityDependencies } from "../dependency-graph/resolve";
import { buildRuntimeDiagnostics } from "./diagnostics";
import { orchestratorError } from "./errors";
import type {
  BootstrapOptions,
  BootstrapResult,
  OrchestratorRuntimeContext,
  OrchestratorStepResult,
  RuntimePlatformStatus,
} from "./types";

function measureStep(run: () => OrchestratorStepResult): OrchestratorStepResult {
  const start = performance.now();
  const result = run();
  return { ...result, durationMs: Math.round(performance.now() - start) };
}

function recordStep(
  context: OrchestratorRuntimeContext,
  result: OrchestratorStepResult,
): void {
  context.steps.push(result);
  if (!result.success && result.errors) {
    context.fatalErrors.push(...result.errors);
  }
}

function syncLifecycleAndRegistry(
  context: OrchestratorRuntimeContext,
  capabilityId: string,
  to: Capability["lifecycleState"],
  source: string,
): ReturnType<typeof orchestratorError> | null {
  const transition = context.lifecycle.transition(capabilityId, to, { source });
  if (!transition.success) {
    return orchestratorError(
      "ORCHESTRATOR_LIFECYCLE_FAILED",
      transition.errors[0]?.message ??
        `Failed to transition "${capabilityId}" to "${to}"`,
      { step: "lifecycle-manager", capabilityId, subsystem: "lifecycle-manager" },
    );
  }

  if (context.registry.exists(capabilityId)) {
    context.registry.updateLifecycleState(capabilityId, to);
  }

  return null;
}

function mapConfigurationErrors(
  errors: readonly ConfigurationError[],
): ReturnType<typeof orchestratorError>[] {
  return errors.map((error) =>
    orchestratorError("ORCHESTRATOR_CONFIGURATION_FAILED", error.message, {
      step: "configuration",
      subsystem: "configuration-manager",
      capabilityId: error.key,
    }),
  );
}

function runConfigurationStep(
  context: OrchestratorRuntimeContext,
  options: BootstrapOptions,
): OrchestratorStepResult {
  try {
    const loadResult = Configuration.load({
      overrides: {
        workspaceRoot: options.workspaceRoot,
        platformVersion: options.platformVersion,
        failFast: options.failFast,
        discovery: options.discovery,
      },
    });

    if (!loadResult.success || !loadResult.configuration) {
      return {
        step: "configuration",
        success: false,
        durationMs: 0,
        message: "Runtime Configuration Manager failed to load configuration",
        errors: mapConfigurationErrors(loadResult.errors ?? []),
      };
    }

    const validation = Configuration.validate();
    if (!validation.success) {
      return {
        step: "configuration",
        success: false,
        durationMs: 0,
        message: "Runtime configuration validation failed",
        errors: mapConfigurationErrors(validation.errors),
      };
    }

    context.configuration = loadResult.configuration;
    context.registry.setPlatformVersion(context.configuration.platformVersion);

    return {
      step: "configuration",
      success: true,
      durationMs: 0,
      message: `Loaded runtime configuration for ${context.configuration.workspaceRoot}`,
    };
  } catch (error) {
    return {
      step: "configuration",
      success: false,
      durationMs: 0,
      message: "Failed to load runtime configuration",
      errors: [
        orchestratorError(
          "ORCHESTRATOR_CONFIGURATION_FAILED",
          error instanceof Error ? error.message : "Configuration load failed",
          { step: "configuration", subsystem: "configuration-manager" },
        ),
      ],
    };
  }
}

function runDiscoveryStep(context: OrchestratorRuntimeContext): OrchestratorStepResult {
  const discovery = discoverCapabilities({
    workspaceRoot: context.configuration.workspaceRoot,
    ...context.configuration.discovery,
  });

  if (discovery.diagnostics.length > 0 && context.configuration.failFast) {
    return {
      step: "discovery",
      success: false,
      durationMs: 0,
      message: `Discovery reported ${discovery.diagnostics.length} diagnostic(s)`,
      errors: discovery.diagnostics.map((diagnostic) =>
        orchestratorError("ORCHESTRATOR_DISCOVERY_FAILED", diagnostic.message, {
          step: "discovery",
          subsystem: "discovery-engine",
        }),
      ),
    };
  }

  if (discovery.capabilities.length === 0) {
    return {
      step: "discovery",
      success: false,
      durationMs: 0,
      message: "No capabilities discovered",
      errors: [
        orchestratorError(
          "ORCHESTRATOR_DISCOVERY_FAILED",
          "Discovery produced zero capabilities",
          {
            step: "discovery",
            subsystem: "discovery-engine",
          },
        ),
      ],
    };
  }

  context.capabilities = discovery.capabilities.map((capability) => {
    context.lifecycle.reset(capability.id);
    return capability;
  });
  context.scannedDiscoveryRoots = discovery.scannedRoots;

  return {
    step: "discovery",
    success: true,
    durationMs: 0,
    message: `Discovered ${context.capabilities.length} capability manifest(s)`,
  };
}

function runManifestEngineStep(
  context: OrchestratorRuntimeContext,
): OrchestratorStepResult {
  const validated: Capability[] = [];
  const errors = [];

  for (const capability of context.capabilities) {
    const manifestResult = validateCapabilityManifest(capability.manifest);
    if (!manifestResult.success) {
      errors.push(
        orchestratorError(
          "ORCHESTRATOR_MANIFEST_FAILED",
          manifestResult.errors[0]?.message ??
            `Manifest invalid for "${capability.id}"`,
          {
            step: "manifest-engine",
            capabilityId: capability.id,
            subsystem: "manifest-engine",
          },
        ),
      );
      continue;
    }

    const constraint =
      "compatibility" in capability.manifest
        ? capability.manifest.compatibility?.platformVersion
        : undefined;

    if (!satisfiesPlatformVersion(constraint, context.configuration.platformVersion)) {
      errors.push(
        orchestratorError(
          "ORCHESTRATOR_MANIFEST_FAILED",
          `Platform version "${context.configuration.platformVersion}" incompatible with capability "${capability.id}"`,
          {
            step: "manifest-engine",
            capabilityId: capability.id,
            subsystem: "version-manager",
          },
        ),
      );
      continue;
    }

    const next = withCapabilityLifecycleState(capability, "validated");
    const lifecycleError = syncLifecycleAndRegistry(
      context,
      capability.id,
      "validated",
      "manifest-engine",
    );
    if (lifecycleError) {
      errors.push(lifecycleError);
      continue;
    }

    validated.push(next);
  }

  if (errors.length > 0 && context.configuration.failFast) {
    return {
      step: "manifest-engine",
      success: false,
      durationMs: 0,
      message: `Manifest Engine rejected ${errors.length} capability(s)`,
      errors,
    };
  }

  if (validated.length === 0) {
    return {
      step: "manifest-engine",
      success: false,
      durationMs: 0,
      message: "No capabilities passed Manifest Engine validation",
      errors: errors.length
        ? errors
        : [
            orchestratorError(
              "ORCHESTRATOR_MANIFEST_FAILED",
              "Manifest Engine produced zero validated capabilities",
              { step: "manifest-engine", subsystem: "manifest-engine" },
            ),
          ],
    };
  }

  context.capabilities = validated;
  context.manifestRejectedCount = errors.length;
  if (errors.length > 0 && !context.configuration.failFast) {
    context.warnings.push(...errors);
  }

  return {
    step: "manifest-engine",
    success: true,
    durationMs: 0,
    message: `Validated ${validated.length} capability manifest(s)`,
    errors: errors.length > 0 ? errors : undefined,
  };
}

function runDependencyGraphStep(
  context: OrchestratorRuntimeContext,
): OrchestratorStepResult {
  const resolved = resolveCapabilityDependencies(context.capabilities);

  if (!resolved.success) {
    return {
      step: "dependency-graph",
      success: false,
      durationMs: 0,
      message: "Dependency Graph resolution failed",
      errors: resolved.errors.map((error) =>
        orchestratorError("ORCHESTRATOR_DEPENDENCY_FAILED", error.message, {
          step: "dependency-graph",
          capabilityId: error.capabilityId,
          subsystem: "dependency-graph",
        }),
      ),
    };
  }

  for (const capability of resolved.capabilities) {
    const lifecycleError = syncLifecycleAndRegistry(
      context,
      capability.id,
      "dependencies-resolved",
      "dependency-graph",
    );
    if (lifecycleError) {
      return {
        step: "dependency-graph",
        success: false,
        durationMs: 0,
        message: lifecycleError.message,
        errors: [lifecycleError],
      };
    }
  }

  context.capabilities = [...resolved.capabilities];
  context.dependencyOrder = resolved.order;

  return {
    step: "dependency-graph",
    success: true,
    durationMs: 0,
    message: `Resolved dependencies for ${resolved.capabilities.length} capability(s)`,
  };
}

function runCapabilityRegistryStep(
  context: OrchestratorRuntimeContext,
): OrchestratorStepResult {
  const registration = context.registry.registerMany(
    context.capabilities,
    { platformVersion: context.configuration.platformVersion },
    context.dependencyOrder,
  );

  if (!registration.success) {
    return {
      step: "capability-registry",
      success: false,
      durationMs: 0,
      message: "Capability Registry registration failed",
      errors: registration.errors.map((error) =>
        orchestratorError("ORCHESTRATOR_REGISTRY_FAILED", error.message, {
          step: "capability-registry",
          capabilityId: error.capabilityId,
          subsystem: "capability-registry",
        }),
      ),
    };
  }

  for (const capability of context.capabilities) {
    const lifecycleError = syncLifecycleAndRegistry(
      context,
      capability.id,
      "registered",
      "capability-registry",
    );
    if (lifecycleError) {
      return {
        step: "capability-registry",
        success: false,
        durationMs: 0,
        message: lifecycleError.message,
        errors: [lifecycleError],
      };
    }
  }

  return {
    step: "capability-registry",
    success: true,
    durationMs: 0,
    message: `Registered ${context.registry.count()} capability(s)`,
  };
}

function runLifecycleManagerStep(
  context: OrchestratorRuntimeContext,
): OrchestratorStepResult {
  const errors = [];

  for (const capability of context.registry.findAll()) {
    const lifecycleError = syncLifecycleAndRegistry(
      context,
      capability.id,
      "initialised",
      "lifecycle-manager",
    );
    if (lifecycleError) {
      errors.push(lifecycleError);
    }
  }

  if (errors.length > 0) {
    return {
      step: "lifecycle-manager",
      success: false,
      durationMs: 0,
      message: "Lifecycle Manager failed to initialise capabilities",
      errors,
    };
  }

  return {
    step: "lifecycle-manager",
    success: true,
    durationMs: 0,
    message: `Initialised ${context.registry.count()} capability lifecycle record(s)`,
  };
}

function runHealthManagerStep(
  context: OrchestratorRuntimeContext,
): OrchestratorStepResult {
  const checkResult = Health.check({
    configuration: context.configuration,
    registry: context.registry,
    lifecycle: context.lifecycle,
    capabilities: context.capabilities,
  });

  const lifecycleTarget = mapHealthStatusToLifecycleTarget(checkResult.status);
  const healthTarget = mapHealthStatusToCapabilityHealth(checkResult.status);
  const errors = [];

  for (const capability of context.registry.findAll()) {
    if (
      lifecycleTarget &&
      context.lifecycle.getState(capability.id) === "initialised"
    ) {
      const lifecycleError = syncLifecycleAndRegistry(
        context,
        capability.id,
        lifecycleTarget,
        "health-manager",
      );
      if (lifecycleError) {
        errors.push(lifecycleError);
      }
    }

    context.registry.updateHealth(capability.id, healthTarget);
  }

  if (errors.length > 0) {
    return {
      step: "health-manager",
      success: false,
      durationMs: 0,
      message: "Health Manager failed to update capability health state",
      errors,
    };
  }

  if (checkResult.status === "unhealthy" && context.configuration.failFast) {
    return {
      step: "health-manager",
      success: false,
      durationMs: 0,
      message: checkResult.summary,
      errors: [
        orchestratorError("ORCHESTRATOR_HEALTH_FAILED", checkResult.summary, {
          step: "health-manager",
          subsystem: "health-manager",
        }),
      ],
    };
  }

  return {
    step: "health-manager",
    success: true,
    durationMs: 0,
    message: checkResult.summary,
  };
}

function runPlatformReadyStep(
  context: OrchestratorRuntimeContext,
  options: BootstrapOptions,
): OrchestratorStepResult {
  const errors = [];

  for (const capability of context.registry.findAll()) {
    if (context.lifecycle.getState(capability.id) === "healthy") {
      const lifecycleError = syncLifecycleAndRegistry(
        context,
        capability.id,
        "active",
        "platform-ready",
      );
      if (lifecycleError) {
        errors.push(lifecycleError);
      }
    }
  }

  if (errors.length > 0) {
    return {
      step: "platform-ready",
      success: false,
      durationMs: 0,
      message: "Platform ready failed to activate capabilities",
      errors,
    };
  }

  context.platformReady = true;
  context.lastBootstrap = new Date().toISOString();
  options.onPlatformReady?.();

  return {
    step: "platform-ready",
    success: true,
    durationMs: 0,
    message: `Platform ready — ${context.registry.count()} capability(s) active`,
  };
}

export function createOrchestratorContext(
  options: BootstrapOptions = {},
): OrchestratorRuntimeContext {
  return createContext(options);
}

function createContext(options: BootstrapOptions): OrchestratorRuntimeContext {
  const loadResult = Configuration.load({
    overrides: {
      workspaceRoot: options.workspaceRoot,
      platformVersion: options.platformVersion,
      failFast: options.failFast,
      discovery: options.discovery,
    },
  });

  const configuration: RuntimeConfiguration =
    loadResult.configuration ??
    ({
      workspaceRoot: options.workspaceRoot ?? "",
      platformVersion: options.platformVersion ?? "0.2.0",
      failFast: options.failFast ?? true,
      runtimeMode: "development",
      discovery: options.discovery ?? {},
    } satisfies RuntimeConfiguration);

  return {
    configuration,
    registry: createCapabilityRegistry(configuration.platformVersion),
    lifecycle: createCapabilityLifecycleManager(),
    capabilities: [],
    dependencyOrder: [],
    steps: [],
    fatalErrors: [],
    platformReady: false,
    placeholders: [],
    lastBootstrap: undefined,
    scannedDiscoveryRoots: [],
    manifestRejectedCount: 0,
    warnings: [],
  };
}

export {
  runConfigurationStep,
  runDiscoveryStep,
  runManifestEngineStep,
  runDependencyGraphStep,
  runCapabilityRegistryStep,
  runLifecycleManagerStep,
  runHealthManagerStep,
  runPlatformReadyStep,
};

export { buildRuntimeDiagnostics, createEmptyRuntimeDiagnostics } from "./diagnostics";

export function runStartupPipeline(
  options: BootstrapOptions = {},
  existingContext?: OrchestratorRuntimeContext,
): { result: BootstrapResult; context: OrchestratorRuntimeContext } {
  const context = existingContext ?? createContext(options);
  context.steps = [];
  context.fatalErrors = [];
  context.platformReady = false;
  context.placeholders = [];
  context.warnings = [];
  context.manifestRejectedCount = 0;
  context.scannedDiscoveryRoots = [];

  const steps: Array<() => OrchestratorStepResult> = [
    () => runConfigurationStep(context, options),
    () => runDiscoveryStep(context),
    () => runManifestEngineStep(context),
    () => runDependencyGraphStep(context),
    () => runCapabilityRegistryStep(context),
    () => runLifecycleManagerStep(context),
    () => runHealthManagerStep(context),
    () => runPlatformReadyStep(context, options),
  ];

  for (const execute of steps) {
    const result = measureStep(execute);
    recordStep(context, result);

    if (!result.success) {
      return {
        result: {
          success: false,
          status: "failed",
          diagnostics: buildRuntimeDiagnostics("failed", context),
        },
        context,
      };
    }
  }

  const healthStatus = Health.getStatus();
  const platformStatus: RuntimePlatformStatus =
    healthStatus === "degraded" ? "degraded" : "ready";

  return {
    result: {
      success: true,
      status: platformStatus,
      diagnostics: buildRuntimeDiagnostics(platformStatus, context),
    },
    context,
  };
}
