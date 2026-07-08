import type { LawPlatformHealthSummary } from "@apzhub/types";

import {
  LAW_PLATFORM_MODULES,
  LAW_PLATFORM_NAME,
  LAW_PLATFORM_VERSION,
  LAW_WORKSPACE_ID,
} from "./law-platform-constants";

export interface BuildLawPlatformHealthSummaryInput {
  readonly registeredCommandCount?: number;
  readonly registeredKnowledgeSourceCount?: number;
  readonly registeredNotificationRouteCount?: number;
  readonly registeredActivityTypeCount?: number;
}

export function buildLawPlatformHealthSummary(
  input: BuildLawPlatformHealthSummaryInput = {},
): LawPlatformHealthSummary {
  const moduleCount = LAW_PLATFORM_MODULES.length;

  return {
    status: "healthy",
    applicationVersion: LAW_PLATFORM_VERSION,
    applicationName: LAW_PLATFORM_NAME,
    moduleCount,
    placeholderModuleCount: moduleCount,
    registeredCommandCount: input.registeredCommandCount ?? LAW_PLATFORM_MODULES.length,
    registeredKnowledgeSourceCount:
      input.registeredKnowledgeSourceCount ?? LAW_PLATFORM_MODULES.length,
    registeredNotificationRouteCount: input.registeredNotificationRouteCount ?? 2,
    registeredActivityTypeCount: input.registeredActivityTypeCount ?? 3,
    workspaceId: LAW_WORKSPACE_ID,
  };
}
