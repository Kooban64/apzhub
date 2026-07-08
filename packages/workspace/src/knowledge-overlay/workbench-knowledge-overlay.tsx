"use client";

import { useCommandRegistry } from "@apzhub/command-framework/react";
import { useWorkbenchNavigationActions } from "@apzhub/workbench-framework/react";
import { useMemo } from "react";

import {
  KnowledgeOverlayExperience,
  type KnowledgeOverlayExperienceProps,
} from "./knowledge-overlay-experience";
import { createWorkbenchKnowledgeSelectionHandlers } from "./knowledge-overlay-selection";

/** Default selection handlers — requires CommandRegistryProvider + WorkbenchProvider. */
export function useWorkbenchKnowledgeSelectionHandlers() {
  const { execute } = useCommandRegistry();
  const { activateViewForRoute } = useWorkbenchNavigationActions();

  return useMemo(
    () =>
      createWorkbenchKnowledgeSelectionHandlers({
        executeAction: async (actionId) => {
          await execute(actionId);
        },
        navigate: (target) => {
          if (target.type === "workbench-route") {
            activateViewForRoute(target.target);
          }
        },
      }),
    [execute, activateViewForRoute],
  );
}

export type WorkbenchKnowledgeOverlayProps = Omit<
  KnowledgeOverlayExperienceProps,
  "selectionHandlers"
> & {
  readonly selectionHandlers?: KnowledgeOverlayExperienceProps["selectionHandlers"];
};

/**
 * Workbench Surface: Knowledge Overlay with default Action + Navigation delegation.
 *
 * Requires `KnowledgeDiscoveryProvider`, `CommandRegistryProvider`, and `WorkbenchProvider`.
 */
export function WorkbenchKnowledgeOverlay({
  selectionHandlers,
  ...props
}: WorkbenchKnowledgeOverlayProps) {
  const defaultHandlers = useWorkbenchKnowledgeSelectionHandlers();

  return (
    <KnowledgeOverlayExperience
      selectionHandlers={selectionHandlers ?? defaultHandlers}
      {...props}
    />
  );
}
