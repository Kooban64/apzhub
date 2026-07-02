import type {
  WorkbenchActionExecutionResult,
  WorkbenchActionExecutor,
} from "@apzhub/workbench-framework";

import type { KeyboardEventLike, ShortcutRegistry } from "../shortcuts";

/**
 * Resolve a keyboard event to an action id.
 * ShortcutRegistry produces ids only — no execution.
 */
export function resolveShortcutActionId(
  registry: ShortcutRegistry,
  event: KeyboardEventLike,
): string | null {
  return registry.resolve(event);
}

export interface ExecuteShortcutViaWorkbenchApiOptions {
  readonly actor?: "user" | "system";
  readonly args?: Record<string, unknown>;
}

/**
 * Workbench API integration path:
 * ShortcutRegistry.resolve → WorkbenchActionExecutor.execute → Action Framework bridge.
 *
 * ShortcutRegistry itself never executes actions.
 */
export function executeShortcutViaWorkbenchApi(
  shortcuts: ShortcutRegistry,
  executor: WorkbenchActionExecutor,
  event: KeyboardEventLike,
  options: ExecuteShortcutViaWorkbenchApiOptions = {},
): WorkbenchActionExecutionResult | null {
  const actionId = shortcuts.resolve(event);
  if (!actionId) {
    return null;
  }

  return executor.execute({
    actionId,
    actor: options.actor ?? "user",
    args: options.args,
  });
}
