import type {
  ContextDiagnostics,
  NavigationDiagnostics,
  PermissionDiagnostics,
  SelectionDiagnostics,
  SessionDiagnostics,
  ViewDiagnostics,
} from "../interfaces/types";
import type { ActionExecutionDiagnostics } from "./action-execution-diagnostics";
import type { ActionInvocationDiagnostics } from "./action-invocation";

/** Aggregated diagnostics exposed by the public Workbench API. */
export interface WorkbenchDiagnosticsSnapshot {
  readonly navigation: NavigationDiagnostics;
  readonly view: ViewDiagnostics;
  readonly session: SessionDiagnostics;
  readonly context: ContextDiagnostics;
  readonly selection: SelectionDiagnostics;
  readonly permission: PermissionDiagnostics;
  readonly actionExecution: ActionExecutionDiagnostics;
  readonly actionInvocation: ActionInvocationDiagnostics;
}
