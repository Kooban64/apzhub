import type { ContextFocusType } from "@apzhub/platform-service-contracts";

export const contextQueryKeys = {
  all: ["enterprise-context"] as const,
  focus: (focusType: ContextFocusType, focusId: string) =>
    [...contextQueryKeys.all, focusType, focusId] as const,
  /** @deprecated Prefer contextQueryKeys.focus("project", projectId) */
  project: (projectId: string) => contextQueryKeys.focus("project", projectId),
};
