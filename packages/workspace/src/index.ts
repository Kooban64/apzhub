export { DesktopShell } from "./desktop-shell";
export type { DesktopShellProps } from "./desktop-shell";
export { WorkbenchCommandPalette } from "./command-palette";
export {
  buildCommandPaletteDiagnostics,
  mapActionsToPaletteItems,
  COMMAND_PALETTE_SURFACE,
  CONTEXT_MENU_SURFACE,
  KEYBOARD_SHORTCUT_SURFACE,
  COMMAND_PALETTE_QUERY_DEBOUNCE_MS,
  PLANNED_WORKBENCH_SURFACES,
  WORKBENCH_SURFACES,
  useCommandPaletteState,
  useDebouncedValue,
  type WorkbenchCommandPaletteProps,
  type CommandPaletteState,
  type UseCommandPaletteStateOptions,
  type CommandPaletteSurfaceDiagnostics,
  type WorkbenchSurfaceDefinition,
  type WorkbenchSurfaceId,
  type WorkbenchSurfaceStatus,
} from "./command-palette";
export {
  ContextMenuProvider,
  WorkbenchContextMenu,
  buildContextMenuDiagnostics,
  mapActionsToContextMenuItems,
  toActionContextSnapshot,
  toActionSelectionSnapshot,
  useContextMenuProvider,
  type ContextMenuSurfaceDiagnostics,
  type WorkbenchContextMenuInput,
  type WorkbenchContextMenuProps,
} from "./context-menu";
export {
  ToolbarProvider,
  WorkbenchToolbar,
  buildToolbarDiagnostics,
  mapToolbarItems,
  TOOLBAR_SURFACE,
  useToolbarProvider,
  type ToolbarSurfaceDiagnostics,
  type WorkbenchToolbarProps,
} from "./toolbar";
export {
  COMMAND_PALETTE_SHORTCUT,
  isCommandPaletteShortcut,
  shouldIgnoreCommandPaletteShortcut,
  useCommandPaletteShortcut,
} from "./desktop-shell/palette-shortcut";
export {
  buildGlobalShortcutShellDiagnostics,
  GLOBAL_SHORTCUT_SURFACE,
  type GlobalShortcutShellDiagnostics,
} from "./desktop-shell/global-shortcut-diagnostics";
export {
  shouldIgnoreGlobalShortcut,
  useGlobalShortcuts,
  type UseGlobalShortcutsOptions,
} from "./desktop-shell/global-shortcuts";
