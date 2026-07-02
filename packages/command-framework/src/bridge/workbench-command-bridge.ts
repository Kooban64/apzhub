import type { WorkbenchCommandBridge } from "@apzhub/workbench-framework";
import type { WorkbenchRequest } from "@apzhub/workbench-framework";

import type { WorkbenchCommandBridgeDiagnostics } from "./bridge-diagnostics";

/**
 * Action Framework bridge contract — translates action ids to Workbench actions and requests.
 *
 * Implements {@link WorkbenchCommandBridge} from `@apzhub/workbench-framework`.
 * The bridge translates and routes only; it does not execute UI or evaluate permissions.
 */
export interface ActionWorkbenchCommandBridge extends WorkbenchCommandBridge {
  /** Whether the action id is supported by this bridge. */
  supports(actionId: string): boolean;
  /** Translate action id + payload to a Workbench request, or null when unsupported/invalid. */
  toRequest(
    commandId: string,
    payload?: Record<string, unknown>,
  ): WorkbenchRequest | null;
  getDiagnostics(): WorkbenchCommandBridgeDiagnostics;
}

export interface WorkbenchCommandBridgeFactory {
  create(): ActionWorkbenchCommandBridge;
}
