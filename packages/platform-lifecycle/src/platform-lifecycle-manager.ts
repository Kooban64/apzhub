import { getAllowedLifecycleTransitions, pickHighestStartupState } from "./state-machine";
import type {
  LifecycleActionResult,
  LifecycleOperatorAction,
  PlatformLifecycleInput,
  PlatformLifecycleSnapshot,
  PlatformLifecycleState,
} from "./types";
import {
  buildLifecycleEvaluationContext,
  buildReadinessGates,
} from "./lifecycle-context-builder";
import {
  buildCapabilityParticipations,
  buildProductParticipations,
  evaluateVersionCompatibility,
} from "./participation-evaluator";
import { getStartupSequence } from "./registrations";

export interface PlatformLifecycleRuntimeState {
  maintenanceMode: boolean;
  explicitState: PlatformLifecycleState | null;
  previousState: PlatformLifecycleState | null;
  shutdownDraining: boolean;
  recoveryInProgress: boolean;
}

export function createInitialRuntimeState(): PlatformLifecycleRuntimeState {
  return {
    maintenanceMode: false,
    explicitState: null,
    previousState: null,
    shutdownDraining: false,
    recoveryInProgress: false,
  };
}

function deriveEvaluatedState(
  context: ReturnType<typeof buildLifecycleEvaluationContext>,
): PlatformLifecycleState {
  if (context.operationalReady) {
    return "operational";
  }

  const nearOperational =
    context.bootstrapReady &&
    context.configurationValid &&
    context.identityReady &&
    context.authorizationReady &&
    context.databaseHealthy &&
    context.redisHealthy;

  if (context.platformDegraded && nearOperational) {
    return "degraded";
  }

  return pickHighestStartupState(context.satisfiedGates);
}

function resolvePlatformState(
  runtime: PlatformLifecycleRuntimeState,
  evaluated: PlatformLifecycleState,
  healthStatus: ReturnType<typeof buildLifecycleEvaluationContext>["healthStatus"],
): PlatformLifecycleState {
  if (runtime.explicitState === "stopped") {
    return "stopped";
  }
  if (runtime.explicitState === "stopping" || runtime.shutdownDraining) {
    return "stopping";
  }
  if (runtime.recoveryInProgress || runtime.explicitState === "recovering") {
    if (evaluated === "operational") {
      return "operational";
    }
    if (healthStatus === "unhealthy") {
      return "degraded";
    }
    return "recovering";
  }
  if (runtime.maintenanceMode || runtime.explicitState === "maintenance") {
    return "maintenance";
  }
  if (runtime.explicitState) {
    return runtime.explicitState;
  }
  return evaluated;
}

export function buildPlatformLifecycleSnapshot(
  input: PlatformLifecycleInput,
  runtime: PlatformLifecycleRuntimeState = createInitialRuntimeState(),
): PlatformLifecycleSnapshot {
  const context = buildLifecycleEvaluationContext(input);
  const evaluated = deriveEvaluatedState(context);
  const currentState = resolvePlatformState(runtime, evaluated, context.healthStatus);
  const shutdownStatus =
    currentState === "stopped" ? "complete" : currentState === "stopping" ? "draining" : "none";
  const recoveryStatus =
    currentState === "recovering"
      ? "in-progress"
      : currentState === "operational"
        ? "complete"
        : "none";

  const versionCompatibility = evaluateVersionCompatibility(input.platformVersion);
  const capabilities = buildCapabilityParticipations({
    consolidated: input.consolidated,
    context,
    platformState: currentState,
    platformVersion: input.platformVersion,
    productStatuses: input.productStatuses,
    shutdownStatus,
    recoveryStatus,
  });
  const products = buildProductParticipations({
    consolidated: input.consolidated,
    context,
    platformState: currentState,
    platformVersion: input.platformVersion,
    productStatuses: input.productStatuses,
    shutdownStatus,
    recoveryStatus,
  });

  const warnings: string[] = [];
  const recommendations: string[] = [];

  if (!versionCompatibility.compatible) {
    warnings.push("One or more registered capabilities/products fail version compatibility checks.");
    recommendations.push("Review version compatibility report before production deployment.");
  }
  if (currentState === "degraded") {
    warnings.push("Platform lifecycle is degraded.");
    recommendations.push("Review dependency health and capability readiness in the control plane.");
  }
  if (!context.operationalReady && !context.platformCoreReady && !context.databaseHealthy) {
    recommendations.push("Restore database connectivity before advancing lifecycle gates.");
  }
  if (currentState === "maintenance") {
    recommendations.push("Exit maintenance mode when work is complete.");
  }
  if (currentState === "stopping" || currentState === "stopped") {
    recommendations.push("Restart platform bootstrap to return to service.");
  }

  return {
    generatedAt: input.consolidated.generatedAt,
    platformVersion: input.platformVersion,
    buildNumber: input.buildNumber,
    environment: input.environment,
    currentState,
    previousState: runtime.previousState,
    maintenanceMode: runtime.maintenanceMode,
    shutdownStatus,
    recoveryStatus,
    allowedTransitions: getAllowedLifecycleTransitions(currentState),
    startupSequence: getStartupSequence(),
    capabilities,
    products,
    versionCompatibility,
    readinessGates: buildReadinessGates(context),
    warnings,
    recommendations,
  };
}

export class PlatformLifecycleManager {
  private runtime: PlatformLifecycleRuntimeState = createInitialRuntimeState();

  private readonly now: () => string;

  constructor(options: { now?: () => string } = {}) {
    this.now = options.now ?? (() => new Date().toISOString());
  }

  reset(): void {
    this.runtime = createInitialRuntimeState();
  }

  getRuntimeState(): PlatformLifecycleRuntimeState {
    return { ...this.runtime };
  }

  snapshot(input: PlatformLifecycleInput): PlatformLifecycleSnapshot {
    const snapshot = buildPlatformLifecycleSnapshot(input, this.runtime);

    if (snapshot.currentState === "operational" && this.runtime.recoveryInProgress) {
      this.runtime.recoveryInProgress = false;
      this.runtime.explicitState = null;
      return buildPlatformLifecycleSnapshot(input, this.runtime);
    }

    return snapshot;
  }

  applyAction(
    action: LifecycleOperatorAction,
    input: PlatformLifecycleInput,
  ): LifecycleActionResult {
    const before = buildPlatformLifecycleSnapshot(input, this.runtime);
    const timestamp = this.now();
    let message = "";

    switch (action) {
      case "enter-maintenance":
        this.runtime.maintenanceMode = true;
        this.runtime.explicitState = "maintenance";
        message = "Maintenance mode enabled.";
        break;
      case "exit-maintenance":
        this.runtime.maintenanceMode = false;
        this.runtime.explicitState = null;
        message = "Maintenance mode disabled.";
        break;
      case "begin-shutdown":
        this.runtime.shutdownDraining = true;
        this.runtime.explicitState = "stopping";
        message = "Graceful shutdown initiated.";
        break;
      case "complete-shutdown":
        this.runtime.shutdownDraining = false;
        this.runtime.explicitState = "stopped";
        message = "Platform lifecycle marked stopped.";
        break;
      case "begin-recovery":
        this.runtime.recoveryInProgress = true;
        this.runtime.explicitState = "recovering";
        this.runtime.shutdownDraining = false;
        message = "Recovery initiated.";
        break;
      default:
        message = "Unknown lifecycle action.";
    }

    this.runtime.previousState = before.currentState;
    const after = buildPlatformLifecycleSnapshot(input, this.runtime);

    return {
      success: true,
      action,
      previousState: before.currentState,
      currentState: after.currentState,
      message,
      timestamp,
    };
  }
}

export function createPlatformLifecycleManager(
  options: { now?: () => string } = {},
): PlatformLifecycleManager {
  return new PlatformLifecycleManager(options);
}
