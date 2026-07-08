import type { ReadOnlyActionRegistry } from "@apzhub/command-framework";
import {
  createDefaultWorkbenchCommandBridge,
  type ActionWorkbenchCommandBridge,
} from "@apzhub/command-framework";
import { actionToRequest } from "@apzhub/workbench-framework";
import type { WorkbenchAction } from "@apzhub/workbench-framework";

const WORKBENCH_BRIDGE_PREFIX = "workbench-bridge:";

function readBridgeActionId(handler: string): string | undefined {
  if (!handler.startsWith(WORKBENCH_BRIDGE_PREFIX)) {
    return undefined;
  }

  const bridgeActionId = handler.slice(WORKBENCH_BRIDGE_PREFIX.length).trim();
  return bridgeActionId.length > 0 ? bridgeActionId : undefined;
}

function resolveDefaultBridgePayload(
  descriptor: NonNullable<ReturnType<ReadOnlyActionRegistry["get"]>>,
  bridgeActionId: string,
  payload?: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (payload && Object.keys(payload).length > 0) {
    return payload;
  }

  const capabilityId = descriptor.capabilityId;
  if (!capabilityId) {
    return payload;
  }

  switch (bridgeActionId) {
    case "workbench.view.open":
      return { viewId: capabilityId, workspace: "law" };
    case "workbench.navigation.reveal":
      return { navId: capabilityId };
    default:
      return payload;
  }
}

/**
 * Resolves manifest action ids to Workbench bridge commands (TD-AF20-01 workaround).
 * Law Platform consumes Platform 5.0 without modifying the command framework package.
 */
export function createManifestAwareWorkbenchCommandBridge(
  registry: ReadOnlyActionRegistry,
  delegate: ActionWorkbenchCommandBridge = createDefaultWorkbenchCommandBridge(),
): ActionWorkbenchCommandBridge {
  return {
    supports(actionId: string): boolean {
      const descriptor = registry.get(actionId);
      if (!descriptor) {
        return delegate.supports(actionId);
      }

      const bridgeActionId = readBridgeActionId(descriptor.handler);
      return bridgeActionId ? delegate.supports(bridgeActionId) : false;
    },

    toAction(
      commandId: string,
      payload?: Record<string, unknown>,
    ): WorkbenchAction | null {
      const descriptor = registry.get(commandId);
      if (!descriptor) {
        return delegate.toAction(commandId, payload);
      }

      const bridgeActionId = readBridgeActionId(descriptor.handler);
      if (!bridgeActionId) {
        return null;
      }

      return delegate.toAction(
        bridgeActionId,
        resolveDefaultBridgePayload(descriptor, bridgeActionId, payload),
      );
    },

    toRequest(
      commandId: string,
      payload?: Record<string, unknown>,
    ): ReturnType<ActionWorkbenchCommandBridge["toRequest"]> {
      const action = this.toAction(commandId, payload);
      return action ? actionToRequest(action) : null;
    },

    getDiagnostics() {
      return delegate.getDiagnostics();
    },
  };
}
