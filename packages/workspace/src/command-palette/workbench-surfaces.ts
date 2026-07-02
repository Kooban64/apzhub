/**
 * Workbench Surface catalogue — Action Framework presentation layers.
 *
 * Each surface consumes the read-only Action Registry via `useCommandRegistry()`.
 * Surfaces present actions and invoke execution; they do not register actions,
 * evaluate permissions, or implement business logic.
 */

import { CONTEXT_MENU_SURFACE } from "../context-menu/workbench-surfaces";
import { TOOLBAR_SURFACE } from "../toolbar/workbench-surfaces";

export type WorkbenchSurfaceId =
  | "command-palette"
  | "toolbar"
  | "context-menu"
  | "keyboard-shortcut"
  | "ai-assistant"
  | "voice-interface";

export type WorkbenchSurfaceStatus = "implemented" | "planned";

export interface WorkbenchSurfaceDefinition {
  readonly id: WorkbenchSurfaceId;
  readonly label: string;
  readonly status: WorkbenchSurfaceStatus;
  readonly consumes: "read-only-action-registry";
  readonly description: string;
}

/** Command Palette — first implemented Workbench Surface (AF-011). */
export const COMMAND_PALETTE_SURFACE: WorkbenchSurfaceDefinition = Object.freeze({
  id: "command-palette",
  label: "Command Palette",
  status: "implemented",
  consumes: "read-only-action-registry",
  description:
    "Modal command list for discovering and invoking registered actions. Presentation only.",
});

/** Global keyboard shortcuts — shell listener (AF-015). */
export const KEYBOARD_SHORTCUT_SURFACE: WorkbenchSurfaceDefinition = Object.freeze({
  id: "keyboard-shortcut",
  label: "Keyboard Shortcut",
  status: "implemented",
  consumes: "read-only-action-registry",
  description: "Global shell shortcut listener via ShortcutRegistry (AF-015).",
});

/** Planned surfaces — documented for architecture continuity. */
export const PLANNED_WORKBENCH_SURFACES = Object.freeze([
  {
    id: "ai-assistant",
    label: "AI Assistant",
    status: "planned",
    consumes: "read-only-action-registry",
    description: "AI-mediated action discovery and execution (future).",
  },
  {
    id: "voice-interface",
    label: "Voice Interface",
    status: "planned",
    consumes: "read-only-action-registry",
    description: "Voice-triggered action invocation (future).",
  },
] satisfies readonly WorkbenchSurfaceDefinition[]);

export const WORKBENCH_SURFACES = Object.freeze([
  COMMAND_PALETTE_SURFACE,
  KEYBOARD_SHORTCUT_SURFACE,
  CONTEXT_MENU_SURFACE,
  TOOLBAR_SURFACE,
  ...PLANNED_WORKBENCH_SURFACES,
] satisfies readonly WorkbenchSurfaceDefinition[]);

export { CONTEXT_MENU_SURFACE, TOOLBAR_SURFACE };
