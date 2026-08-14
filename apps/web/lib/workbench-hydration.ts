import { headers } from "next/headers";

import { getValidatedSession } from "@apzhub/auth/server";
import { isDevRegistrationAllowed } from "@apzhub/config";
import { Runtime } from "@apzhub/platform-runtime/server";
import {
  createEmptyWorkbenchRegistryDto,
  filterWorkbenchRegistryDto,
  mapWorkbenchRegistryDto,
  type WorkbenchRegistryDto,
} from "@apzhub/workbench-framework/server";
import { createWorkbenchPermissionAdapter } from "@apzhub/workbench-framework";

import {
  filterWorkbenchItemsByProducts,
  resolveEffectiveProductKeys,
} from "@/lib/commercial/product-access";
import type { ProductKey } from "@/lib/commercial/catalogue";

import { ensurePlatformRuntimeReady } from "./runtime-init";
import { createPlatformAuthPermissionContext } from "./session-permission-context";

function filterWorkbenchByProductAccess(
  dto: WorkbenchRegistryDto,
  allowedProducts: ReadonlySet<ProductKey>,
): WorkbenchRegistryDto {
  return {
    schemaVersion: dto.schemaVersion,
    navItems: filterWorkbenchItemsByProducts(dto.navItems, allowedProducts),
    views: filterWorkbenchItemsByProducts(
      dto.views.map((item) => ({
        ...item,
        id: item.viewId,
      })),
      allowedProducts,
    ),
  };
}

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
  const authContext = await createPlatformAuthPermissionContext(session);
  const permissionAdapter = createWorkbenchPermissionAdapter({
    authContext,
    nodeEnv: process.env.NODE_ENV,
    allowDevRegistration: isDevRegistrationAllowed(),
  });

  const rbacFiltered = filterWorkbenchRegistryDto(dto, permissionAdapter);

  const organisationId =
    session?.tenantId?.trim() ||
    session?.user?.tenantId?.trim() ||
    session?.user?.activeTenantId?.trim() ||
    "";
  const userId = session?.user?.id?.trim() || "";

  if (!organisationId || !userId) {
    return filterWorkbenchByProductAccess(rbacFiltered, new Set());
  }

  const effective = resolveEffectiveProductKeys({ organisationId, userId });
  return filterWorkbenchByProductAccess(rbacFiltered, new Set(effective));
}
