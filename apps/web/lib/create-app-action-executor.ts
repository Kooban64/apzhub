import {
  createCommandRegistryFromDto,
  createDefaultActionExecutor,
  createDefaultWorkbenchCommandBridge,
  createWorkbenchActionExecutorFromActionExecutor,
} from "@apzhub/command-framework";
import type { ActionExecutor } from "@apzhub/command-framework";
import type { ActionRegistryDto } from "@apzhub/command-framework/server";
import type { WorkbenchPermissionAdapter } from "@apzhub/workbench-framework";
import { actionToRequest } from "@apzhub/workbench-framework";
import type {
  WorkbenchRequest,
  WorkbenchRequestResult,
} from "@apzhub/workbench-framework";
import type { WorkbenchActionExecutor } from "@apzhub/workbench-framework";

export interface CreateAppActionExecutorOptions {
  readonly dto: ActionRegistryDto;
  readonly permissionAdapter: WorkbenchPermissionAdapter;
  readonly publish: (request: WorkbenchRequest) => WorkbenchRequestResult;
}

export interface AppActionExecutorBundle {
  readonly actionExecutor: ActionExecutor;
  readonly workbenchActionExecutor: WorkbenchActionExecutor;
}

/** Hydrate executor stack for apps/web — shared by Workbench API and CommandRegistryProvider. */
export function createAppActionExecutorBundle(
  options: CreateAppActionExecutorOptions,
): AppActionExecutorBundle {
  const hydration = createCommandRegistryFromDto(options.dto);
  const actionExecutor = createDefaultActionExecutor({
    registry: hydration.registry,
    permissionAdapter: options.permissionAdapter,
    bridge: createDefaultWorkbenchCommandBridge(),
    workbenchExecute: (action) => options.publish(actionToRequest(action)),
  });

  return {
    actionExecutor,
    workbenchActionExecutor:
      createWorkbenchActionExecutorFromActionExecutor(actionExecutor),
  };
}
