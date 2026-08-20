"use client";

import { useState, type ReactNode } from "react";

import {
  WorkbenchShellLayout,
  type ActivityBarItem,
  type SidebarItem,
  type WorkbenchBottomTabId,
  type WorkbenchShellLayoutState,
  type WorkbenchStatusBarProps,
} from "@apzhub/ui";

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
import { WorkbenchContextPanelActivityTab } from "./context-panel";
import { useGlobalShortcuts } from "./desktop-shell/global-shortcuts";
import { useCommandPaletteShortcut } from "./desktop-shell/palette-shortcut";
import { GlobalSearchDialog } from "./global-search/global-search-dialog";
import { useGlobalSearchShortcut } from "./global-search/global-search-shortcut";
import { GlobalQuickActionsDialog } from "./global-quick-actions/global-quick-actions-dialog";
import { useGlobalQuickActionsShortcut } from "./global-quick-actions/global-quick-actions-shortcut";
import { useNotificationCentreShortcut } from "./notifications/notification-centre-shortcut";

export interface DesktopShellProps {
  userName?: string;
  environment?: string;
  activityBarItems: ActivityBarItem[];
  onActivityBarSelect?: (id: string) => void;
  activityBarFooterItems?: ActivityBarItem[];
  onActivityBarFooterSelect?: (id: string) => void;
  sidebarItems: SidebarItem[];
  onSidebarSelect?: (id: string) => void;
  sidebarTitle?: string;
  onSignOut?: () => void;
  children: ReactNode;
  /** Full header override (User Workbench compact chrome). */
  header?: ReactNode;
  /** Legacy: org / product switchers when header not provided. */
  headerLeading?: ReactNode;
  statusBar?: WorkbenchStatusBarProps;
  mobileNav?: ReactNode;
  onLayoutStateChange?: (state: WorkbenchShellLayoutState) => void;
  /** Hide the 52px activity rail (QEP uses a full product sidebar instead). */
  hideActivityRail?: boolean;
  /** Navy product sidebar (APZQEP). */
  sidebarTone?: "default" | "navy";
  inspectorDefaultCollapsed?: boolean;
  /** Viewport width at which rail + context sidebar appear. Default 768. */
  desktopMinWidth?: number;
  /** Selection content for the shell Inspector (task, ticket, document, …). */
  inspectorContent?: ReactNode;
  inspectorTitle?: string;
  /** When set/changed, expand the inspector (selection pattern). */
  inspectorExpandToken?: string | number | null;
  bottomDefaultCollapsed?: boolean;
  sidebarDefaultCollapsed?: boolean;
  /** Optional content for bottom tabs (Terminal stays Not configured). */
  bottomPanelContent?: Partial<Record<WorkbenchBottomTabId, ReactNode>>;
  bottomTabLabels?: Partial<Record<WorkbenchBottomTabId, string>>;
  enableGlobalSearch?: boolean;
  globalSearchOpen?: boolean;
  onGlobalSearchOpenChange?: (open: boolean) => void;
  onGlobalSearchNavigate?: (href: string) => void;
  enableGlobalQuickActions?: boolean;
  globalQuickActionsOpen?: boolean;
  onGlobalQuickActionsOpenChange?: (open: boolean) => void;
  onGlobalQuickActionsNavigate?: (href: string) => void;
  enableNotificationCentreShortcut?: boolean;
  onOpenNotificationCentre?: () => void;
  enableCommandPalette?: boolean;
  commandPaletteMode?: import("./command-palette/command-palette-mode").CommandPaletteMode;
  commandPaletteOpen?: boolean;
  onCommandPaletteOpenChange?: (open: boolean) => void;
  enableGlobalShortcuts?: boolean;
  modalOpen?: boolean;
  readonly onShortcutExecuted?: (commandId: string) => void;
  enableContextMenu?: boolean;
  readonly contextMenuSurface?: string;
  readonly contextMenuInput?: WorkbenchContextMenuInput;
  readonly onContextMenuExecuted?: (commandId: string) => void;
  enableToolbar?: boolean;
  readonly toolbarRegion?: string;
  readonly onToolbarExecuted?: (commandId: string) => void;
  enableNotificationBadge?: boolean;
  enableNotificationPanel?: boolean;
  notificationPanelOpen?: boolean;
  onNotificationPanelOpenChange?: (open: boolean) => void;
  readonly onNotificationActionExecuted?: (actionId: string) => void;
  enableActivityTimeline?: boolean;
  enableActivityTimelinePanel?: boolean;
  contextPanelOpen?: boolean;
  onContextPanelOpenChange?: (open: boolean) => void;
  readonly onActivityActionExecuted?: (actionId: string) => void;
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
  activityBarItems,
  onActivityBarSelect,
  activityBarFooterItems,
  onActivityBarFooterSelect,
  sidebarItems,
  onSidebarSelect,
  sidebarTitle,
  children,
  header,
  headerLeading,
  statusBar,
  mobileNav,
  onLayoutStateChange,
  inspectorDefaultCollapsed = true,
  desktopMinWidth,
  hideActivityRail = false,
  sidebarTone = "default",
  inspectorContent,
  inspectorTitle = "Inspector",
  inspectorExpandToken = null,
  bottomDefaultCollapsed = true,
  sidebarDefaultCollapsed = false,
  bottomPanelContent,
  bottomTabLabels,
  enableGlobalSearch = false,
  globalSearchOpen,
  onGlobalSearchOpenChange,
  onGlobalSearchNavigate,
  enableGlobalQuickActions = false,
  globalQuickActionsOpen,
  onGlobalQuickActionsOpenChange,
  onGlobalQuickActionsNavigate,
  enableNotificationCentreShortcut = false,
  onOpenNotificationCentre,
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
  onContextPanelOpenChange: _onContextPanelOpenChange,
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

  const [internalQuickActionsOpen, setInternalQuickActionsOpen] = useState(false);
  const quickActionsIsOpen = globalQuickActionsOpen ?? internalQuickActionsOpen;
  const setQuickActionsOpen =
    onGlobalQuickActionsOpenChange ?? setInternalQuickActionsOpen;

  useCommandPaletteShortcut({
    enabled: enableCommandPalette,
    paletteOpen: paletteState.open || globalSearchIsOpen || quickActionsIsOpen,
    onOpen: paletteState.openPalette,
  });

  useGlobalSearchShortcut({
    enabled: enableGlobalSearch,
    open: globalSearchIsOpen,
    onOpen: () => setGlobalSearchOpen(true),
  });

  useGlobalQuickActionsShortcut({
    enabled: enableGlobalQuickActions,
    open: quickActionsIsOpen,
    onOpen: () => setQuickActionsOpen(true),
  });

  useNotificationCentreShortcut({
    enabled: enableNotificationCentreShortcut && Boolean(onOpenNotificationCentre),
    onOpen: () => onOpenNotificationCentre?.(),
  });

  const workspaceContent = enableToolbar ? (
    <ToolbarProvider region={toolbarRegion}>
      <WorkbenchToolbar onExecuted={onToolbarExecuted} />
      {children}
    </ToolbarProvider>
  ) : (
    children
  );

  const inspector =
    inspectorContent != null ? (
      <div
        className="flex h-full min-h-0 flex-col"
        data-testid="workbench-inspector-selection"
      >
        {inspectorTitle ? (
          <div className="border-b border-[var(--color-border)] px-3 py-2 text-[11px] font-semibold tracking-wide uppercase">
            {inspectorTitle}
          </div>
        ) : null}
        <div className="min-h-0 flex-1 overflow-auto p-3">{inspectorContent}</div>
      </div>
    ) : enableActivityTimeline && enableActivityTimelinePanel ? (
      <div
        className="flex h-full min-h-0 flex-col"
        data-testid="workbench-context-panel"
      >
        <div className="border-b border-[var(--color-border)] px-3 py-2 text-[11px] font-semibold tracking-wide uppercase">
          Activity
        </div>
        <div
          className="min-h-0 flex-1 overflow-auto p-3"
          key={activityTimelineRenderKey}
        >
          <WorkbenchContextPanelActivityTab
            open={contextPanelOpen ?? true}
            onActionExecuted={onActivityActionExecuted}
          />
        </div>
      </div>
    ) : (
      <div
        className="p-3 text-xs text-[var(--color-muted-foreground)]"
        data-testid="workbench-inspector-empty"
      >
        <p className="font-medium text-[var(--color-foreground)]">Inspector</p>
        <p className="mt-1">
          Contextual details appear here when you select work items. Collapsed by
          default.
        </p>
      </div>
    );

  const notificationsSlot =
    enableNotificationBadge || enableNotificationPanel ? (
      <WorkbenchNotifications
        enableBadge={enableNotificationBadge}
        enablePanel={enableNotificationPanel}
        panelOpen={notificationPanelOpen}
        onPanelOpenChange={onNotificationPanelOpenChange}
        onNotificationActionExecuted={onNotificationActionExecuted}
      />
    ) : null;

  const resolvedHeader = header ?? (
    <div
      className="flex h-11 items-center gap-2 border-b border-[var(--color-border)] px-3"
      data-testid="workbench-header-fallback"
    >
      <span className="text-sm font-semibold">APZ</span>
      {headerLeading}
      <div className="ml-auto flex items-center gap-2">
        {enableGlobalSearch ? (
          <button
            type="button"
            data-testid="global-search-trigger"
            className="rounded border border-[var(--color-border)] px-2 py-1 text-xs"
            onClick={() => setGlobalSearchOpen(true)}
          >
            Search APZ... <kbd className="ml-1">Ctrl+K</kbd>
          </button>
        ) : null}
        {notificationsSlot}
      </div>
    </div>
  );

  const shell = (
    <WorkbenchShellLayout
      activityBarItems={activityBarItems}
      onActivityBarSelect={onActivityBarSelect}
      activityBarFooterItems={activityBarFooterItems}
      onActivityBarFooterSelect={onActivityBarFooterSelect}
      sidebarTitle={sidebarTitle}
      sidebarItems={sidebarItems}
      onSidebarSelect={onSidebarSelect}
      header={resolvedHeader}
      inspector={inspector}
      inspectorDefaultCollapsed={inspectorDefaultCollapsed}
      inspectorExpandToken={inspectorExpandToken}
      bottomDefaultCollapsed={bottomDefaultCollapsed}
      sidebarDefaultCollapsed={sidebarDefaultCollapsed}
      bottomPanelContent={bottomPanelContent}
      bottomTabLabels={bottomTabLabels}
      onLayoutStateChange={onLayoutStateChange}
      statusBar={statusBar}
      mobileNav={mobileNav}
      desktopMinWidth={desktopMinWidth}
      hideActivityRail={hideActivityRail}
      sidebarTone={sidebarTone}
    >
      {workspaceContent}
    </WorkbenchShellLayout>
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
      {enableGlobalQuickActions ? (
        <GlobalQuickActionsDialog
          open={quickActionsIsOpen}
          onOpenChange={setQuickActionsOpen}
          onNavigate={(href) => onGlobalQuickActionsNavigate?.(href)}
        />
      ) : null}
      {enableGlobalShortcuts ? (
        <GlobalShortcutsLayer
          modalOpen={modalOpen || globalSearchIsOpen || quickActionsIsOpen}
          onExecuted={onShortcutExecuted}
        />
      ) : null}
    </>
  );
}
