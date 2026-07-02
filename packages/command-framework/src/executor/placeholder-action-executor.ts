import type { ActionContext, ActionExecutionRequest, ActionResult } from "../types";
import type { ActionExecutor, ActionExecutorDiagnostics } from "./action-executor";

const SCAFFOLD_DIAGNOSTICS: ActionExecutorDiagnostics = {
  status: "scaffold",
  executionCount: 0,
  message: "Placeholder executor — AF-006 implements dispatch",
};

function scaffoldResult(request: ActionExecutionRequest): ActionResult {
  return {
    status: "failure",
    ok: false,
    actionId: request.actionId,
    actor: request.context.actor,
    code: "SCAFFOLD",
    message: "Action execution not implemented until AF-006",
    durationMs: 0,
  };
}

/**
 * Scaffold executor — returns SCAFFOLD for all requests.
 * AF-006 replaces with DefaultActionExecutor.
 */
export class PlaceholderActionExecutor implements ActionExecutor {
  execute(request: ActionExecutionRequest): Promise<ActionResult>;
  execute(actionId: string, context: ActionContext): Promise<ActionResult>;
  execute(
    actionIdOrRequest: string | ActionExecutionRequest,
    context?: ActionContext,
  ): Promise<ActionResult> {
    return Promise.resolve(this.executeSync(actionIdOrRequest, context));
  }

  executeSync(
    actionIdOrRequest: string | ActionExecutionRequest,
    context?: ActionContext,
  ): ActionResult {
    const request: ActionExecutionRequest =
      typeof actionIdOrRequest === "string"
        ? {
            actionId: actionIdOrRequest,
            context: context ?? { actor: "user" },
          }
        : actionIdOrRequest;

    return scaffoldResult(request);
  }

  getDiagnostics(): ActionExecutorDiagnostics {
    return SCAFFOLD_DIAGNOSTICS;
  }
}

export function createPlaceholderActionExecutor(): ActionExecutor {
  return new PlaceholderActionExecutor();
}
