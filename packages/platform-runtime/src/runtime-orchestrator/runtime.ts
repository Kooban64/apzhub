import {
  createPlatformRegistry,
  type PlatformRegistry,
} from "../capability-registry/platform-registry";
import { Configuration } from "../configuration-manager";
import type { ConfigurationDiagnostics } from "../configuration-manager/interfaces/types";
import { Health } from "../health-manager";
import type { HealthDiagnostics } from "../health-manager/interfaces/types";
import { orchestratorError } from "./errors";
import { buildRuntimeDiagnostics, createEmptyRuntimeDiagnostics } from "./diagnostics";
import { runStartupPipeline } from "./pipeline";
import type {
  BootstrapOptions,
  BootstrapResult,
  OrchestratorRuntimeContext,
  RestartResult,
  RuntimeDiagnostics,
  RuntimePlatformStatus,
  ShutdownResult,
} from "./types";

interface RuntimeState {
  status: RuntimePlatformStatus;
  context: OrchestratorRuntimeContext | null;
  registryFacade: PlatformRegistry | null;
}

let runtimeState: RuntimeState = {
  status: "idle",
  context: null,
  registryFacade: null,
};

function requireContext(): OrchestratorRuntimeContext {
  if (!runtimeState.context) {
    throw orchestratorError(
      "ORCHESTRATOR_NOT_READY",
      "Runtime has not been bootstrapped",
      { subsystem: "runtime-orchestrator" },
    );
  }

  return runtimeState.context;
}

function requireRegistryFacade(): PlatformRegistry {
  if (!runtimeState.registryFacade) {
    throw orchestratorError(
      "ORCHESTRATOR_NOT_READY",
      "Runtime has not been bootstrapped",
      { subsystem: "runtime-orchestrator" },
    );
  }

  return runtimeState.registryFacade;
}

export const Runtime = {
  async bootstrap(options: BootstrapOptions = {}): Promise<BootstrapResult> {
    runtimeState.status = "initialising";

    const { result, context } = runStartupPipeline(
      options,
      runtimeState.context ?? undefined,
    );

    runtimeState.status = result.status;
    runtimeState.context = context;
    runtimeState.registryFacade = createPlatformRegistry(context.registry);

    return result;
  },

  async initialise(options: BootstrapOptions = {}): Promise<BootstrapResult> {
    if (runtimeState.status === "ready" || runtimeState.status === "degraded") {
      return {
        success: true,
        status: runtimeState.status,
        diagnostics: Runtime.getDiagnostics(),
      };
    }

    return Runtime.bootstrap(options);
  },

  async shutdown(): Promise<ShutdownResult> {
    runtimeState.status = "shutting-down";

    if (runtimeState.context) {
      runtimeState.context.registry.clear();
      runtimeState.context.lifecycle.clear();
      runtimeState.context.capabilities = [];
      runtimeState.context.platformReady = false;
    }

    runtimeState.status = "idle";
    runtimeState.context = null;
    runtimeState.registryFacade = null;
    Configuration._resetForTests();
    Health._resetForTests();

    return {
      success: true,
      status: "idle",
      message: "Runtime shutdown placeholder — state cleared",
    };
  },

  async restart(options: BootstrapOptions = {}): Promise<RestartResult> {
    const shutdown = await Runtime.shutdown();
    const bootstrap = await Runtime.bootstrap(options);

    return {
      ...bootstrap,
      shutdownMessage: shutdown.message,
    };
  },

  getStatus(): RuntimePlatformStatus {
    return runtimeState.status;
  },

  getDiagnostics(): RuntimeDiagnostics {
    if (!runtimeState.context) {
      return createEmptyRuntimeDiagnostics(runtimeState.status);
    }

    return buildRuntimeDiagnostics(runtimeState.status, runtimeState.context);
  },

  registry(): PlatformRegistry {
    return requireRegistryFacade();
  },

  health(): HealthDiagnostics {
    requireContext();
    return Health.getDiagnostics();
  },

  configuration(): ConfigurationDiagnostics {
    requireContext();
    return Configuration.getDiagnostics();
  },

  /** @internal Resets singleton state for tests. */
  _resetForTests(): void {
    runtimeState = { status: "idle", context: null, registryFacade: null };
    Configuration._resetForTests();
    Health._resetForTests();
  },
};

export function createRuntimeOrchestratorState(): RuntimeState {
  return { status: "idle", context: null, registryFacade: null };
}

export type { PlatformRegistry };
