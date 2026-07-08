import type { ActivityActionRef } from "../presentation";

export interface ActivityActionExecutor {
  readonly execute: (
    actionId: string,
    args?: Record<string, unknown>,
  ) => Promise<{ readonly ok: boolean }>;
}

/** Delegate activity actionRef to Action Framework execute — no direct handler invocation. */
export async function delegateActivityActionRef(
  actionRef: ActivityActionRef | undefined,
  executor: ActivityActionExecutor,
): Promise<boolean> {
  if (!actionRef) {
    return false;
  }

  const args = actionRef.handlerContext ? { ...actionRef.handlerContext } : undefined;
  const result = await executor.execute(actionRef.actionId, args);
  return result.ok;
}
