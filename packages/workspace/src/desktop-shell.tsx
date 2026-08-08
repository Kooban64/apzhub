"use client";

import { useState, type ReactNode } from "react";

import { ShellLayout, type ActivityBarItem, type SidebarItem } from "@apzhub/ui";

import { WorkbenchCommandPalette } from "./command-palette/workbench-command-palette";
import type { CommandPaletteMode } from "./command-palette/command-palette-mode";
import { useCommandPaletteState } from "./command-palette/use-command-palette-state";
import { useWorkbenchKnowledgeSelectionHandlers } from "./knowledge-overlay/workbench-knowledge-overlay";
import {
  ContextMenuProvider,
  useContextMenuProvider,
  WorkbenchContextMenu,
  toActionContextSnapshot,
  toActionSelectionSnapshot,
  type WorkbenchContextMenuInput,
} from "./context-menu";
import { ToolbarProvider, WorkbenchToolbar } from "./toolbar";
import { WorkbenchNotifications } from "./notifications";
import { WorkbenchContextPanel } from "./context-panel";
import { useGlobalShortcuts } from "./desktop-shell/global-shortcuts";
import { useCommandPaletteShortcut } from "./desktop-shell/palette-shortcut";
import { GlobalSearchDialog } from "./global-search/global-search-dialog";
import { useGlobalSearchShortcut } from "./global-search/global-search-shortcut";

export interface DesktopShellProps {
  userName?: string;
  environment?: string;
  activityBarItems: ActivityBarItem[];
  onActivityBarSelect?: (id: string) => void;
  sidebarItems: SidebarItem[];
  onSidebarSelect?: (id: string) => void;
  onSignOut?: () => void;
  children: ReactNode;
  /** Global Search (Ctrl+K) — APS-Search capability surface. */
  enableGlobalSearch?: boolean;
  globalSearchOpen?: boolean;
  onGlobalSearchOpenChange?: (open: boolean) => void;
  onGlobalSearchNavigate?: (href: string) => void;
  /** Renders Command Palette surface — requires CommandRegistryProvider ancestor (AF-011). */
  enableCommandPalette?: boolean;
  /** Palette mode — knowledge mode queries via Knowledge Service (DF-013). */
  commandPaletteMode?: import("./command-palette/command-palette-mode").CommandPaletteMode;
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
  /** Notification badge — requires NotificationServiceProvider ancestor (EN-013). */
  enableNotificationBadge?: boolean;
  /** Notification panel popover — requires NotificationServiceProvider + CommandRegistryProvider (EN-013). */
  enableNotificationPanel?: boolean;
  notificationPanelOpen?: boolean;
  onNotificationPanelOpenChange?: (open: boolean) => void;
  readonly onNotificationActionExecuted?: (actionId: string) => void;
  /** Activity timeline feature — requires ActivityTimeline providers (AT-013). */
  enableActivityTimeline?: boolean;
  /** Context Panel Activity tab — requires ActivityTimeline + CommandRegistry providers (AT-013). */
  enableActivityTimelinePanel?: boolean;
  contextPanelOpen?: boolean;
  onContextPanelOpenChange?: (open: boolean) => void;
  readonly onActivityActionExecuted?: (actionId: string) => void;
  /** E2E-only — forces Timeline Experience remount after Activity Service mutations. */
  readonly activityTimelineRenderKey?: number;
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

function CommandPaletteCommandsSurface({
  paletteState,
}: {
  readonly paletteState: ReturnType<typeof useCommandPaletteState>;
}) {
  return (
    <WorkbenchCommandPalette
      open={paletteState.open}
      onOpenChange={paletteState.onOpenChange}
      mode="commands"
    />
  );
}

function CommandPaletteKnowledgeSurface({
  paletteState,
}: {
  readonly paletteState: ReturnType<typeof useCommandPaletteState>;
}) {
  const knowledgeSelectionHandlers = useWorkbenchKnowledgeSelectionHandlers();

  return (
    <WorkbenchCommandPalette
      open={paletteState.open}
      onOpenChange={paletteState.onOpenChange}
      mode="knowledge"
      knowledgeSelectionHandlers={knowledgeSelectionHandlers}
    />
  );
}

function CommandPaletteSurface({
  paletteState,
  mode,
}: {
  readonly paletteState: ReturnType<typeof useCommandPaletteState>;
  readonly mode: CommandPaletteMode;
}) {
  if (mode === "knowledge") {
    return <CommandPaletteKnowledgeSurface paletteState={paletteState} />;
  }

  return <CommandPaletteCommandsSurface paletteState={paletteState} />;
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
  enableGlobalSearch = false,
  globalSearchOpen,
  onGlobalSearchOpenChange,
  onGlobalSearchNavigate,
  enableCommandPalette = false,
  commandPaletteMode = "commands",
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
  enableNotificationBadge = false,
  enableNotificationPanel = false,
  notificationPanelOpen,
  onNotificationPanelOpenChange,
  onNotificationActionExecuted,
  enableActivityTimeline = false,
  enableActivityTimelinePanel = false,
  contextPanelOpen,
  onContextPanelOpenChange,
  onActivityActionExecuted,
  activityTimelineRenderKey,
}: DesktopShellProps) {
  const paletteState = useCommandPaletteState({
    open: commandPaletteOpen,
    onOpenChange: onCommandPaletteOpenChange,
  });

  const [internalGlobalSearchOpen, setInternalGlobalSearchOpen] = useState(false);
  const globalSearchIsOpen = globalSearchOpen ?? internalGlobalSearchOpen;
  const setGlobalSearchOpen = onGlobalSearchOpenChange ?? setInternalGlobalSearchOpen;

  useCommandPaletteShortcut({
    enabled: enableCommandPalette,
    paletteOpen: paletteState.open || globalSearchIsOpen,
    onOpen: paletteState.openPalette,
  });

  useGlobalSearchShortcut({
    enabled: enableGlobalSearch,
    open: globalSearchIsOpen,
    onOpen: () => setGlobalSearchOpen(true),
  });

  const workspaceContent = enableToolbar ? (
    <ToolbarProvider region={toolbarRegion}>
      <WorkbenchToolbar onExecuted={onToolbarExecuted} />
      {children}
    </ToolbarProvider>
  ) : (
    children
  );

  const workspaceWithContextPanel =
    enableActivityTimeline && enableActivityTimelinePanel ? (
      <div
        className="flex min-h-0 flex-1"
        data-testid="workbench-layout-with-context-panel"
      >
        <div className="min-w-0 flex-1 overflow-auto">{workspaceContent}</div>
        <WorkbenchContextPanel
          enableActivityTab={enableActivityTimeline}
          panelOpen={contextPanelOpen}
          onPanelOpenChange={onContextPanelOpenChange}
          onActivityActionExecuted={onActivityActionExecuted}
          activityTimelineRenderKey={activityTimelineRenderKey}
        />
      </div>
    ) : (
      workspaceContent
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
      headerTrailing={
        <>
          {enableGlobalSearch ? (
            <button
              type="button"
              data-testid="global-search-trigger"
              className="mr-2 rounded-md border border-[var(--color-border)] px-2 py-1 text-xs text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)]"
              onClick={() => setGlobalSearchOpen(true)}
              aria-label="Open global search"
            >
              Search
              <kbd className="ml-2 hidden sm:inline">Ctrl+K</kbd>
            </button>
          ) : null}
          {enableNotificationBadge || enableNotificationPanel ? (
            <WorkbenchNotifications
              enableBadge={enableNotificationBadge}
              enablePanel={enableNotificationPanel}
              panelOpen={notificationPanelOpen}
              onPanelOpenChange={onNotificationPanelOpenChange}
              onNotificationActionExecuted={onNotificationActionExecuted}
            />
          ) : null}
        </>
      }
    >
      {workspaceWithContextPanel}
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
        <CommandPaletteSurface paletteState={paletteState} mode={commandPaletteMode} />
      ) : null}
      {enableGlobalSearch ? (
        <GlobalSearchDialog
          open={globalSearchIsOpen}
          onOpenChange={setGlobalSearchOpen}
          onNavigate={onGlobalSearchNavigate}
        />
      ) : null}
      {enableGlobalShortcuts ? (
        <GlobalShortcutsLayer
          modalOpen={modalOpen || globalSearchIsOpen}
          onExecuted={onShortcutExecuted}
        />
      ) : null}
    </>
  );
}
