export { orchestratorError } from "./errors";
export type { OrchestratorError, OrchestratorErrorCode } from "./errors";
export { buildRuntimeDiagnostics, runStartupPipeline } from "./pipeline";
export { Runtime, createRuntimeOrchestratorState } from "./runtime";
export type {
  BootstrapOptions,
  BootstrapResult,
  OrchestratorRuntimeContext,
  OrchestratorStepId,
  OrchestratorStepResult,
  RestartResult,
  RuntimeDiagnostics,
  RuntimePlatformStatus,
  ShutdownResult,
  STARTUP_STEP_ORDER,
} from "./types";

export const RUNTIME_ORCHESTRATOR_STATUS = "active" as const;

/** @deprecated Use RUNTIME_ORCHESTRATOR_STATUS */
export const BOOTSTRAP_ENGINE_STATUS = RUNTIME_ORCHESTRATOR_STATUS;
