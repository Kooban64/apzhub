import type {
  WorkbenchActionExecutionInput,
  WorkbenchActionExecutionResult,
  WorkbenchActionExecutor,
  WorkbenchRequestResult,
} from "@apzhub/workbench-framework";

import type { DefaultActionExecutorDependencies } from "../executor/default-action-executor";
import { createDefaultActionExecutor } from "../executor/default-action-executor";
import type { ActionResult } from "../types";

export function mapActionResultToWorkbenchExecutionResult(
  result: ActionResult,
): WorkbenchActionExecutionResult {
  const workbenchResult =
    result.payload && typeof result.payload === "object" && "ok" in result.payload
      ? (result.payload as WorkbenchRequestResult)
      : undefined;

  return {
    ok: result.ok,
    code: result.code,
    message: result.message,
    workbenchResult,
  };
}

/** Adapts {@link DefaultActionExecutor} to the Workbench API executor contract. */
export function createWorkbenchActionExecutorAdapter(
  dependencies: DefaultActionExecutorDependencies,
): WorkbenchActionExecutor {
  const executor = createDefaultActionExecutor(dependencies);

  return {
    execute(input: WorkbenchActionExecutionInput): WorkbenchActionExecutionResult {
      const result = executor.executeSync(input.actionId, {
        actor: input.actor ?? "user",
        args: input.args,
      });

      return mapActionResultToWorkbenchExecutionResult(result);
    },
  };
}

export type CreateWorkbenchActionExecutorStackOptions =
  DefaultActionExecutorDependencies;

/**
 * Create a Workbench-ready Action Executor with bridge and request-bus publication wiring.
 */
export function createWorkbenchActionExecutorStack(
  dependencies: CreateWorkbenchActionExecutorStackOptions,
): WorkbenchActionExecutor {
  return createWorkbenchActionExecutorAdapter(dependencies);
}
