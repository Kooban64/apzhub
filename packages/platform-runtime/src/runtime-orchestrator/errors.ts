export type OrchestratorErrorCode =
  | "ORCHESTRATOR_CONFIGURATION_FAILED"
  | "ORCHESTRATOR_DISCOVERY_FAILED"
  | "ORCHESTRATOR_MANIFEST_FAILED"
  | "ORCHESTRATOR_DEPENDENCY_FAILED"
  | "ORCHESTRATOR_REGISTRY_FAILED"
  | "ORCHESTRATOR_LIFECYCLE_FAILED"
  | "ORCHESTRATOR_HEALTH_FAILED"
  | "ORCHESTRATOR_STARTUP_FAILED"
  | "ORCHESTRATOR_NOT_READY";

export interface OrchestratorError {
  readonly code: OrchestratorErrorCode;
  readonly message: string;
  readonly step?: string;
  readonly capabilityId?: string;
  readonly subsystem?: string;
}

export function orchestratorError(
  code: OrchestratorErrorCode,
  message: string,
  details: Omit<OrchestratorError, "code" | "message"> = {},
): OrchestratorError {
  return { code, message, ...details };
}
