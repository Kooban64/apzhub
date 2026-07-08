import type { NotificationActionRef } from "@apzhub/event-notification-framework";

export interface NotificationActionExecutor {
  readonly execute: (
    actionId: string,
    args?: Record<string, unknown>,
  ) => Promise<{ readonly ok: boolean }>;
}

/** Delegate notification actionRef to Action Framework execute — no direct handler invocation. */
export async function delegateNotificationActionRef(
  actionRef: NotificationActionRef | undefined,
  executor: NotificationActionExecutor,
): Promise<boolean> {
  if (!actionRef) {
    return false;
  }

  const args = actionRef.handlerContext ? { ...actionRef.handlerContext } : undefined;

  const result = await executor.execute(actionRef.actionId, args);
  return result.ok;
}
