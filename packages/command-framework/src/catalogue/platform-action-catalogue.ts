import type { WorkbenchBridgeActionId } from "../bridge/workbench-bridge-action-ids";

/** Declarative metadata for a built-in platform action (pre-registration). */
export interface PlatformActionCatalogueEntry {
  readonly id: WorkbenchBridgeActionId;
  readonly label: string;
  readonly group: string;
  readonly order: number;
  readonly palette: boolean;
}

/**
 * Built-in Platform Action Catalogue — one entry per `REQUEST_COMMAND_MAP` value.
 *
 * Platform actions use `source: "builtin"` and are versioned with the platform release.
 * Capability actions use `source: "manifest"` and are versioned per capability.
 */
export const PLATFORM_ACTION_CATALOGUE = Object.freeze([
  {
    id: "workbench.view.open",
    label: "Open View",
    group: "View",
    order: 10,
    palette: true,
  },
  {
    id: "workbench.view.close",
    label: "Close View",
    group: "View",
    order: 20,
    palette: true,
  },
  {
    id: "workbench.view.focus",
    label: "Focus View",
    group: "View",
    order: 30,
    palette: true,
  },
  {
    id: "workbench.panel.open",
    label: "Open Panel",
    group: "Panel",
    order: 40,
    palette: true,
  },
  {
    id: "workbench.panel.close",
    label: "Close Panel",
    group: "Panel",
    order: 50,
    palette: true,
  },
  {
    id: "workbench.navigation.reveal",
    label: "Reveal Navigation",
    group: "Navigation",
    order: 60,
    palette: true,
  },
  {
    id: "workbench.context.set",
    label: "Set Context",
    group: "Context",
    order: 70,
    palette: false,
  },
  {
    id: "workbench.selection.set",
    label: "Set Selection",
    group: "Selection",
    order: 80,
    palette: false,
  },
] satisfies readonly PlatformActionCatalogueEntry[]);
