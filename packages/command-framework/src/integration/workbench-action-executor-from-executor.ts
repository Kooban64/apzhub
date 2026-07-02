import type {
  WorkbenchActionExecutionInput,
  WorkbenchActionExecutionResult,
  WorkbenchActionExecutor,
} from "@apzhub/workbench-framework";

import type { ActionExecutor } from "../executor/action-executor";
import { mapActionResultToWorkbenchExecutionResult } from "./workbench-action-executor-adapter";

/** Wrap a hydrated {@link ActionExecutor} for Workbench API integration (AF-020). */
export function createWorkbenchActionExecutorFromActionExecutor(
  executor: ActionExecutor,
): WorkbenchActionExecutor {
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
