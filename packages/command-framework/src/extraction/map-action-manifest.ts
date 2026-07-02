import type { WorkbenchActionManifest } from "@apzhub/platform-runtime/manifest-engine";

import type { ActionHandlerKind, ActionDescriptor } from "../types";
import { ActionRegistryValidationError } from "../registry/registry-errors";

/** Infer handler routing kind from manifest handler string (ADR-0025). */
export function inferActionHandlerKind(handler: string): ActionHandlerKind {
  if (handler.startsWith("workbench-bridge:")) {
    return "workbench-bridge";
  }
  if (handler.startsWith("service:")) {
    return "service";
  }
  if (handler.startsWith("event:")) {
    return "event";
  }

  throw new ActionRegistryValidationError(
    `Handler "${handler}" must use workbench-bridge:, service:, or event: prefix`,
    "handler",
  );
}

/** Map validated manifest action row to ActionDescriptor. Action ids are immutable after registration. */
export function mapWorkbenchActionToDescriptor(
  action: WorkbenchActionManifest,
  capabilityId: string,
  capabilityVersion?: string,
): ActionDescriptor {
  return {
    id: action.id,
    label: action.label,
    handler: action.handler,
    handlerKind: inferActionHandlerKind(action.handler),
    permission: action.permission,
    shortcut: action.shortcut,
    description: action.description,
    palette: action.palette,
    icon: action.icon,
    disabled: action.disabled,
    group: action.group,
    order: action.order,
    contextWhen: action.contextWhen,
    source: "manifest",
    capabilityId,
    version: capabilityVersion,
  };
}
