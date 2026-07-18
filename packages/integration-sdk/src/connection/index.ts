export type {
  ConnectionDefinition,
  ConnectionLifecycleState,
  ConnectionRecord,
  ConnectionRegistrySnapshot,
} from "./types";
export { CONNECTION_LIFECYCLE_STATES } from "./types";

export {
  canTransitionConnectionLifecycle,
  getAllowedConnectionLifecycleTransitions,
  isActiveConnectionLifecycleState,
  isTerminalConnectionLifecycleState,
} from "./lifecycle-transitions";

export { ConnectionLifecycleService } from "./lifecycle-service";
export type { LifecycleTransitionInput } from "./lifecycle-service";

export type { ValidationIssue, ValidationResult } from "./validation";
export { assertTenantScope, validateConnectionDefinition } from "./validation";

export type { ConnectionRegistry, RegisterConnectionOptions } from "./registry";
export { InMemoryConnectionRegistry } from "./registry";

export type {
  ConnectionManager,
  DefaultConnectionManagerOptions,
} from "./connection-manager";
export {
  DefaultConnectionManager,
  createConnectionManager,
} from "./connection-manager";

export type {
  BuildConnectionDiagnosticsInput,
  ConnectionDiagnostics,
} from "./connection-diagnostics";
export {
  buildConnectionDiagnostics,
  buildConnectionRecordDiagnostics,
} from "./connection-diagnostics";
