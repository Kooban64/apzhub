/**
 * @apzhub/platform-runtime/server — server-side Runtime entry point.
 *
 * Public API: Runtime.bootstrap(), Runtime.registry(), etc.
 * Internal orchestration: Runtime Orchestrator.
 */

export { Runtime } from "./runtime-orchestrator/runtime";
export type {
  BootstrapOptions,
  BootstrapResult,
  RuntimeDiagnostics,
  RuntimePlatformStatus,
  ShutdownResult,
  RestartResult,
  RuntimeConfigurationSummary,
  RuntimeDiscoverySummary,
  RuntimeManifestSummary,
  RuntimeDependencySummary,
  RuntimeLifecycleSummary,
  RuntimeHealthSummary,
} from "./runtime-orchestrator/types";
export type { PlatformRegistry } from "./runtime-orchestrator/runtime";
export { RUNTIME_ORCHESTRATOR_STATUS } from "./runtime-orchestrator";
