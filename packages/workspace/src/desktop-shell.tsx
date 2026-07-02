"use client";

import type { ReactNode } from "react";

import { ShellLayout, type ActivityBarItem, type SidebarItem } from "@apzhub/ui";

import { WorkbenchCommandPalette } from "./command-palette/workbench-command-palette";
import { useCommandPaletteState } from "./command-palette/use-command-palette-state";
import {
  ContextMenuProvider,
  useContextMenuProvider,
  WorkbenchContextMenu,
  toActionContextSnapshot,
  toActionSelectionSnapshot,
  type WorkbenchContextMenuInput,
} from "./context-menu";
import { ToolbarProvider, WorkbenchToolbar } from "./toolbar";
import { useGlobalShortcuts } from "./desktop-shell/global-shortcuts";
import { useCommandPaletteShortcut } from "./desktop-shell/palette-shortcut";

export interface DesktopShellProps {
  userName?: string;
  environment?: string;
  activityBarItems: ActivityBarItem[];
  onActivityBarSelect?: (id: string) => void;
  sidebarItems: SidebarItem[];
  onSidebarSelect?: (id: string) => void;
  onSignOut?: () => void;
  children: ReactNode;
  /** Renders Command Palette surface — requires CommandRegistryProvider ancestor (AF-011). */
  enableCommandPalette?: boolean;
  commandPaletteOpen?: boolean;
  onCommandPaletteOpenChange?: (open: boolean) => void;
  /** Global shortcut listener — requires CommandRegistryProvider ancestor (AF-015). */
  enableGlobalShortcuts?: boolean;
  /** When true, global shortcuts are suppressed (e.g. open modal). */
  modalOpen?: boolean;
  readonly onShortcutExecuted?: (commandId: string) => void;
  /** Context Menu surface — requires CommandRegistryProvider ancestor (AF-016). */
  enableContextMenu?: boolean;
  readonly contextMenuSurface?: string;
  readonly contextMenuInput?: WorkbenchContextMenuInput;
  readonly onContextMenuExecuted?: (commandId: string) => void;
  /** Toolbar surface — requires CommandRegistryProvider ancestor (AF-017). */
  enableToolbar?: boolean;
  readonly toolbarRegion?: string;
  readonly onToolbarExecuted?: (commandId: string) => void;
}

function GlobalShortcutsLayer({
  modalOpen,
  onExecuted,
}: {
  readonly modalOpen: boolean;
  readonly onExecuted?: (commandId: string) => void;
}) {
  useGlobalShortcuts({
    enabled: true,
    modalOpen,
    onExecuted,
  });

  return null;
}

function ContextMenuShell({
  children,
  menuSurface,
  contextMenuInput,
  onExecuted,
}: {
  readonly children: ReactNode;
  readonly menuSurface?: string;
  readonly contextMenuInput?: WorkbenchContextMenuInput;
  readonly onExecuted?: (commandId: string) => void;
}) {
  const { openFromMouseEvent } = useContextMenuProvider();
  const selection = toActionSelectionSnapshot(contextMenuInput);
  const context = toActionContextSnapshot(contextMenuInput);

  return (
    <>
      <div
        className="contents"
        onContextMenu={openFromMouseEvent}
        data-testid="context-menu-target"
      >
        {children}
      </div>
      <WorkbenchContextMenu
        menuSurface={menuSurface}
        selection={selection}
        context={context}
        onExecuted={onExecuted}
      />
    </>
  );
}

export function DesktopShell({
  userName,
  environment,
  activityBarItems,
  onActivityBarSelect,
  sidebarItems,
  onSidebarSelect,
  onSignOut,
  children,
  enableCommandPalette = false,
  commandPaletteOpen,
  onCommandPaletteOpenChange,
  enableGlobalShortcuts = false,
  modalOpen = false,
  onShortcutExecuted,
  enableContextMenu = false,
  contextMenuSurface = "workspace",
  contextMenuInput,
  onContextMenuExecuted,
  enableToolbar = false,
  toolbarRegion = "workspace",
  onToolbarExecuted,
}: DesktopShellProps) {
  const paletteState = useCommandPaletteState({
    open: commandPaletteOpen,
    onOpenChange: onCommandPaletteOpenChange,
  });

  useCommandPaletteShortcut({
    enabled: enableCommandPalette,
    paletteOpen: paletteState.open,
    onOpen: paletteState.openPalette,
  });

  const workspaceContent = enableToolbar ? (
    <ToolbarProvider region={toolbarRegion}>
      <WorkbenchToolbar onExecuted={onToolbarExecuted} />
      {children}
    </ToolbarProvider>
  ) : (
    children
  );

  const shell = (
    <ShellLayout
      userName={userName}
      environment={environment}
      onSignOut={onSignOut}
      sidebarItems={sidebarItems}
      onSidebarSelect={onSidebarSelect}
      activityBarItems={activityBarItems}
      onActivityBarSelect={onActivityBarSelect}
    >
      {workspaceContent}
    </ShellLayout>
  );

  const shellWithContextMenu = enableContextMenu ? (
    <ContextMenuProvider>
      <ContextMenuShell
        menuSurface={contextMenuSurface}
        contextMenuInput={contextMenuInput}
        onExecuted={onContextMenuExecuted}
      >
        {shell}
      </ContextMenuShell>
    </ContextMenuProvider>
  ) : (
    shell
  );

  return (
    <>
      {shellWithContextMenu}
      {enableCommandPalette ? (
        <WorkbenchCommandPalette
          open={paletteState.open}
          onOpenChange={paletteState.onOpenChange}
        />
      ) : null}
      {enableGlobalShortcuts ? (
        <GlobalShortcutsLayer modalOpen={modalOpen} onExecuted={onShortcutExecuted} />
      ) : null}
    </>
  );
}
