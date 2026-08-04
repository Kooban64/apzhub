export interface OrchestrationKernelConfig {
  readonly orchestrationId?: string;
  readonly name?: string;
  readonly enableDiagnostics?: boolean;
  readonly metadata?: Readonly<Record<string, string>>;
}

export interface ValidatedOrchestrationKernelConfig {
  readonly orchestrationId: string;
  readonly name: string;
  readonly enableDiagnostics: boolean;
  readonly metadata: Readonly<Record<string, string>>;
}

export function validateOrchestrationKernelConfig(
  config: OrchestrationKernelConfig = {},
): ValidatedOrchestrationKernelConfig {
  const name = (config.name ?? "platform-orchestration").trim();
  if (!name) {
    throw new Error("Orchestration kernel name must be non-empty");
  }
  return {
    orchestrationId: config.orchestrationId?.trim() || `orch_default`,
    name,
    enableDiagnostics: config.enableDiagnostics ?? true,
    metadata: config.metadata ?? {},
  };
}
