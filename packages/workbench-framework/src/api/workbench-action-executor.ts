import type { WorkbenchRequestResult } from "../interfaces/requests";

/** Input for Workbench API → Action Executor delegation (AF-008). */
export interface WorkbenchActionExecutionInput {
  readonly actionId: string;
  readonly args?: Record<string, unknown>;
  readonly actor?: "user" | "system";
  readonly permission?: string;
}

/** Result from Action Executor adapter — mapped to WorkbenchRequestResult by the API. */
export interface WorkbenchActionExecutionResult {
  readonly ok: boolean;
  readonly code: string;
  readonly message?: string;
  readonly workbenchResult?: WorkbenchRequestResult;
}

/**
 * Minimal Action Executor surface for Workbench API integration.
 * Implemented by `@apzhub/command-framework` adapter — avoids package cycle.
 */
export interface WorkbenchActionExecutor {
  execute(input: WorkbenchActionExecutionInput): WorkbenchActionExecutionResult;
}
