import {
  workbenchRequestError,
  workbenchRequestFail,
  workbenchRequestOk,
  type WorkbenchRequestErrorCode,
  type WorkbenchRequestResult,
} from "../interfaces/requests";
import type { WorkbenchActionExecutionResult } from "./workbench-action-executor";

function mapCodeToWorkbenchError(code: string): WorkbenchRequestErrorCode {
  switch (code) {
    case "FORBIDDEN":
      return "FORBIDDEN";
    case "NOT_IMPLEMENTED":
      return "NOT_IMPLEMENTED";
    case "HANDLER_ERROR":
      return "ENGINE_ERROR";
    case "INVALID_ARGS":
    case "NOT_FOUND":
      return "INVALID_REQUEST";
    default:
      return "ENGINE_ERROR";
  }
}

export function mapActionExecutorResultToWorkbenchResult(
  result: WorkbenchActionExecutionResult,
): WorkbenchRequestResult {
  if (result.ok) {
    return result.workbenchResult ?? workbenchRequestOk();
  }

  return workbenchRequestFail(
    workbenchRequestError(
      mapCodeToWorkbenchError(result.code),
      result.message ?? `Action execution failed (${result.code})`,
    ),
  );
}
