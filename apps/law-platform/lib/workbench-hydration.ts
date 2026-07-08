import { headers } from "next/headers";

import { getValidatedSession } from "@apzhub/auth/server";
import { isDevRegistrationAllowed } from "@apzhub/config";
import { Runtime } from "@apzhub/platform-runtime/server";
import {
  createAuthPermissionContextFromUser,
  createEmptyWorkbenchRegistryDto,
  filterWorkbenchRegistryDto,
  mapWorkbenchRegistryDto,
  type WorkbenchRegistryDto,
} from "@apzhub/workbench-framework/server";
import { createWorkbenchPermissionAdapter } from "@apzhub/workbench-framework";

import { ensurePlatformRuntimeReady } from "./runtime-init";

export async function loadWorkbenchRegistryDto(): Promise<WorkbenchRegistryDto> {
  const bootstrap = await ensurePlatformRuntimeReady();

  if (!bootstrap.success) {
    return createEmptyWorkbenchRegistryDto();
  }

  const registry = Runtime.registry();
  const { contributions } = registry.getWorkbenchNavigationContributions();
  const { descriptors } = registry.getWorkbenchViewDescriptors();
  const dto = mapWorkbenchRegistryDto(contributions, descriptors);

  const session = await getValidatedSession(await headers());
  const permissionAdapter = createWorkbenchPermissionAdapter({
    authContext: createAuthPermissionContextFromUser(session?.user),
    nodeEnv: process.env.NODE_ENV,
    allowDevRegistration: isDevRegistrationAllowed(),
  });

  return filterWorkbenchRegistryDto(dto, permissionAdapter);
}
