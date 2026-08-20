"use client";

import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  type ImperativePanelHandle,
} from "react-resizable-panels";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { resolveLucideIcon } from "../icons/resolve-lucide-icon";
import { cn } from "../lib/utils";
import type { ActivityBarItem } from "./shell-layout";
import type { SidebarItem } from "./sidebar";

export type WorkbenchShellLayoutState = {
  readonly sidebarCollapsed: boolean;
  readonly inspectorCollapsed: boolean;
  readonly bottomCollapsed: boolean;
  readonly bottomTab: WorkbenchBottomTabId;
};

export type WorkbenchBottomTabId = "problems" | "output" | "terminal" | "test-results";

export type WorkbenchStatusBarProps = {
  readonly organisationLabel?: string;
  readonly leftHint?: string;
  readonly rightLabel?: string;
};

export type WorkbenchShellLayoutProps = {
  readonly activityBarItems: readonly ActivityBarItem[];
  readonly onActivityBarSelect?: (id: string) => void;
  readonly activityBarFooterItems?: readonly ActivityBarItem[];
  readonly onActivityBarFooterSelect?: (id: string) => void;
  readonly sidebarTitle?: string;
  readonly sidebarItems: readonly SidebarItem[];
  readonly onSidebarSelect?: (id: string) => void;
  readonly header: ReactNode;
  readonly inspector?: ReactNode;
  readonly inspectorDefaultCollapsed?: boolean;
  /** When this value changes, expand the inspector panel (selection pattern). */
  readonly inspectorExpandToken?: string | number | null;
  readonly bottomDefaultCollapsed?: boolean;
  readonly sidebarDefaultCollapsed?: boolean;
  /** Optional content for bottom tabs. Terminal always stays "Not configured". */
  readonly bottomPanelContent?: Partial<Record<WorkbenchBottomTabId, ReactNode>>;
  /** Optional display labels (e.g. PEN: Tool Output / Evidence). */
  readonly bottomTabLabels?: Partial<Record<WorkbenchBottomTabId, string>>;
  readonly onLayoutStateChange?: (state: WorkbenchShellLayoutState) => void;
  readonly statusBar?: WorkbenchStatusBarProps;
  readonly children: ReactNode;
  readonly mobileNav?: ReactNode;
  /** Viewport width at which rail + context sidebar appear. Default 768. */
  readonly desktopMinWidth?: number;
  /** Hide the 52px activity rail (QEP uses a full product sidebar instead). */
  readonly hideActivityRail?: boolean;
  /** Navy product sidebar (APZQEP). */
  readonly sidebarTone?: "default" | "navy";
};

const BOTTOM_TABS: readonly { id: WorkbenchBottomTabId; label: string }[] = [
  { id: "problems", label: "Problems" },
  { id: "output", label: "Output" },
  { id: "terminal", label: "Terminal" },
  { id: "test-results", label: "Test Results" },
];

function RailButton({
  item,
  onSelect,
}: {
  readonly item: ActivityBarItem;
  readonly onSelect?: (id: string) => void;
}) {
  const Icon = resolveLucideIcon(item.icon);
  return (
    <button
      type="button"
      title={item.label}
      onClick={() => onSelect?.(item.id)}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-md text-[var(--color-foreground)] transition-colors",
        item.active
          ? "bg-[var(--color-muted)] text-[var(--color-foreground)]"
          : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)]/70 hover:text-[var(--color-foreground)]",
      )}
      aria-label={item.ariaLabel}
      aria-current={item.active ? "page" : undefined}
      data-testid={`workbench-rail-${item.id}`}
      data-active={item.active ? "true" : "false"}
    >
      {Icon ? (
        <Icon className="h-4 w-4" aria-hidden strokeWidth={1.75} />
      ) : (
        <span className="text-[11px] font-semibold">
          {item.label.charAt(0).toUpperCase()}
        </span>
      )}
    </button>
  );
}

function ResizeHandle({
  direction = "horizontal",
  onDoubleClick,
}: {
  readonly direction?: "horizontal" | "vertical";
  readonly onDoubleClick?: () => void;
}) {
  return (
    <PanelResizeHandle
      onDoubleClick={onDoubleClick}
      className={cn(
        "group relative shrink-0 bg-transparent",
        direction === "horizontal"
          ? "w-1.5 cursor-col-resize"
          : "h-1.5 cursor-row-resize",
      )}
      data-testid={
        direction === "horizontal"
          ? "workbench-resize-horizontal"
          : "workbench-resize-vertical"
      }
    >
      <span
        className={cn(
          "absolute bg-[var(--color-border)] transition-colors group-hover:bg-[var(--color-foreground)]/30 group-data-[resize-handle-active]:bg-[var(--color-foreground)]/40",
          direction === "horizontal"
            ? "inset-y-0 left-1/2 w-px -translate-x-1/2"
            : "inset-x-0 top-1/2 h-px -translate-y-1/2",
        )}
        aria-hidden
      />
    </PanelResizeHandle>
  );
}

function ContextSidebar({
  sidebarTitle,
  sidebarItems,
  onSidebarSelect,
  tone = "default",
}: {
  readonly sidebarTitle?: string;
  readonly sidebarItems: readonly SidebarItem[];
  readonly onSidebarSelect?: (id: string) => void;
  readonly tone?: "default" | "navy";
}) {
  const navy = tone === "navy";
  return (
    <aside
      className={cn(
        "flex h-full min-h-0 flex-col border-r",
        navy
          ? "border-[var(--qep-nav-foreground)]/10 bg-[var(--qep-nav-background)] text-[var(--qep-nav-foreground)]"
          : "border-[var(--color-border)] bg-[var(--color-surface)]",
      )}
      data-testid="workbench-context-sidebar"
      aria-label="Context sidebar"
    >
      {sidebarTitle ? (
        <p
          className={cn(
            "border-b px-3 py-2.5 text-[11px] font-semibold tracking-wide uppercase",
            navy
              ? "border-[var(--qep-nav-foreground)]/10 text-[var(--qep-nav-foreground)]"
              : "border-[var(--color-border)] text-[var(--color-muted-foreground)]",
          )}
        >
          {sidebarTitle}
        </p>
      ) : null}
      <nav className="flex-1 overflow-y-auto p-2">
        {sidebarItems.length === 0 ? (
          <p
            className={cn(
              "px-2 py-3 text-xs",
              navy
                ? "text-[var(--qep-nav-muted)]"
                : "text-[var(--color-muted-foreground)]",
            )}
          >
            No items for this context.
          </p>
        ) : (
          <ul className="space-y-0.5">
            {sidebarItems.map((item) => {
              if (item.kind === "separator") {
                return (
                  <li
                    key={item.id}
                    className={cn(
                      "my-1.5 border-t",
                      navy
                        ? "border-[var(--qep-nav-foreground)]/10"
                        : "border-[var(--color-border)]",
                    )}
                    aria-hidden
                    data-testid={`workbench-sidebar-${item.id}`}
                  />
                );
              }
              if (item.kind === "section") {
                return (
                  <li
                    key={item.id}
                    className="px-2 pb-0.5 pt-2.5 first:pt-1"
                    data-testid={`workbench-sidebar-${item.id}`}
                  >
                    <p
                      className={cn(
                        "text-[10px] font-semibold uppercase tracking-wide",
                        navy
                          ? "text-[var(--qep-nav-muted)]"
                          : "text-[var(--color-muted-foreground)]",
                      )}
                    >
                      {item.label}
                    </p>
                  </li>
                );
              }
              const Icon = resolveLucideIcon(item.icon);
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSidebarSelect?.(item.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors",
                      item.active
                        ? navy
                          ? "bg-[var(--qep-nav-active)] font-medium text-[var(--qep-nav-active-foreground)]"
                          : "bg-[var(--color-muted)] font-medium"
                        : navy
                          ? "text-[var(--qep-nav-foreground)] hover:bg-[var(--qep-nav-foreground)]/10"
                          : "hover:bg-[var(--color-muted)]/60",
                    )}
                    data-testid={`workbench-sidebar-${item.id}`}
                  >
                    {Icon ? (
                      <Icon
                        className="h-3.5 w-3.5 shrink-0 opacity-90"
                        aria-hidden
                        strokeWidth={1.75}
                      />
                    ) : null}
                    <span className="truncate">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </nav>
    </aside>
  );
}

/**
 * User Workbench shell — dense IDE-like geometry (not Admin chrome).
 * Desktop uses react-resizable-panels; mobile uses a simple stack (no PanelGroup).
 */
export function WorkbenchShellLayout({
  activityBarItems,
  onActivityBarSelect,
  activityBarFooterItems = [],
  onActivityBarFooterSelect,
  sidebarTitle,
  sidebarItems,
  onSidebarSelect,
  header,
  inspector,
  inspectorDefaultCollapsed = true,
  inspectorExpandToken = null,
  bottomDefaultCollapsed = true,
  sidebarDefaultCollapsed = false,
  bottomPanelContent,
  bottomTabLabels,
  onLayoutStateChange,
  statusBar,
  children,
  mobileNav,
  desktopMinWidth = 768,
  hideActivityRail = false,
  sidebarTone = "default",
}: WorkbenchShellLayoutProps) {
  const sidebarRef = useRef<ImperativePanelHandle>(null);
  const inspectorRef = useRef<ImperativePanelHandle>(null);
  const bottomRef = useRef<ImperativePanelHandle>(null);

  const [isDesktop, setIsDesktop] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(sidebarDefaultCollapsed);
  const [inspectorCollapsed, setInspectorCollapsed] = useState(
    inspectorDefaultCollapsed,
  );
  const [bottomCollapsed, setBottomCollapsed] = useState(bottomDefaultCollapsed);
  const [bottomTab, setBottomTab] = useState<WorkbenchBottomTabId>("problems");

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${desktopMinWidth}px)`);
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [desktopMinWidth]);

  useEffect(() => {
    if (inspectorExpandToken == null || inspectorExpandToken === "") return;
    const panel = inspectorRef.current;
    if (!panel) return;
    if (panel.isCollapsed()) panel.expand();
    setInspectorCollapsed(false);
  }, [inspectorExpandToken]);

  useEffect(() => {
    onLayoutStateChange?.({
      sidebarCollapsed,
      inspectorCollapsed,
      bottomCollapsed,
      bottomTab,
    });
  }, [
    sidebarCollapsed,
    inspectorCollapsed,
    bottomCollapsed,
    bottomTab,
    onLayoutStateChange,
  ]);

  const toggleSidebar = useCallback(() => {
    const panel = sidebarRef.current;
    if (!panel) return;
    if (panel.isCollapsed()) panel.expand();
    else panel.collapse();
  }, []);

  const toggleInspector = useCallback(() => {
    const panel = inspectorRef.current;
    if (!panel) return;
    if (panel.isCollapsed()) panel.expand();
    else panel.collapse();
  }, []);

  const toggleBottom = useCallback(() => {
    const panel = bottomRef.current;
    if (!panel) return;
    if (panel.isCollapsed()) panel.expand();
    else panel.collapse();
  }, []);

  const resetSidebar = useCallback(() => {
    sidebarRef.current?.resize(18);
  }, []);

  const resetInspector = useCallback(() => {
    inspectorRef.current?.resize(22);
  }, []);

  if (!isDesktop) {
    return (
      <div
        className="flex h-dvh min-h-0 max-w-full flex-col overflow-hidden bg-[var(--color-background)] text-[var(--color-foreground)]"
        data-testid="workbench-shell"
      >
        {header}
        <main
          className="min-h-0 flex-1 overflow-auto"
          data-testid="workbench-main-workspace"
        >
          {children}
        </main>
        <div data-testid="workbench-mobile-chrome">{mobileNav}</div>
      </div>
    );
  }

  return (
    <div
      className="flex h-dvh min-h-0 max-w-full flex-col overflow-hidden bg-[var(--color-background)] text-[var(--color-foreground)]"
      data-testid="workbench-shell"
    >
      {header}

      <div
        className="flex min-h-0 flex-1 overflow-hidden"
        data-testid="workbench-desktop-chrome"
      >
        {!hideActivityRail ? (
          <nav
            className="flex w-[52px] shrink-0 flex-col items-center border-r border-[var(--color-border)] bg-[var(--color-surface)] py-2"
            aria-label="Activity rail"
            data-testid="workbench-activity-rail"
          >
            <div className="mb-2 flex h-8 w-8 items-center justify-center text-[11px] font-semibold tracking-wide">
              APZ
            </div>
            <div className="flex flex-1 flex-col items-center gap-0.5">
              {activityBarItems.map((item) => (
                <RailButton key={item.id} item={item} onSelect={onActivityBarSelect} />
              ))}
            </div>
            <div className="mt-auto flex flex-col items-center gap-0.5 border-t border-[var(--color-border)] pt-2">
              {activityBarFooterItems.map((item) => (
                <RailButton
                  key={item.id}
                  item={item}
                  onSelect={onActivityBarFooterSelect}
                />
              ))}
              <button
                type="button"
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                className="flex h-8 w-8 items-center justify-center text-[10px] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                onClick={toggleSidebar}
                data-testid="workbench-toggle-sidebar"
              >
                ‖
              </button>
              <button
                type="button"
                title={inspectorCollapsed ? "Show inspector" : "Hide inspector"}
                className="flex h-8 w-8 items-center justify-center text-[10px] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                onClick={toggleInspector}
                data-testid="workbench-toggle-inspector"
              >
                ▣
              </button>
              <button
                type="button"
                title={bottomCollapsed ? "Show bottom panel" : "Hide bottom panel"}
                className="flex h-8 w-8 items-center justify-center text-[10px] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                onClick={toggleBottom}
                data-testid="workbench-toggle-bottom"
              >
                ▭
              </button>
            </div>
          </nav>
        ) : null}

        <PanelGroup
          direction="vertical"
          className="min-h-0 min-w-0 flex-1"
          autoSaveId="apz-workbench-vertical"
        >
          <Panel defaultSize={bottomDefaultCollapsed ? 100 : 78} minSize={40} order={1}>
            <PanelGroup
              direction="horizontal"
              className="h-full min-h-0"
              autoSaveId="apz-workbench-horizontal"
            >
              <Panel
                ref={sidebarRef}
                id="workbench-sidebar"
                order={1}
                defaultSize={sidebarDefaultCollapsed ? 0 : hideActivityRail ? 22 : 18}
                minSize={hideActivityRail ? 16 : 14}
                maxSize={hideActivityRail ? 34 : 30}
                collapsible
                collapsedSize={0}
                onCollapse={() => setSidebarCollapsed(true)}
                onExpand={() => setSidebarCollapsed(false)}
              >
                <ContextSidebar
                  sidebarTitle={sidebarTitle}
                  sidebarItems={sidebarItems}
                  onSidebarSelect={onSidebarSelect}
                  tone={sidebarTone}
                />
              </Panel>

              <ResizeHandle direction="horizontal" onDoubleClick={resetSidebar} />

              <Panel id="workbench-main" order={2} defaultSize={60} minSize={30}>
                <main
                  className="h-full min-h-0 min-w-0 overflow-auto"
                  data-testid="workbench-main-workspace"
                >
                  {children}
                </main>
              </Panel>

              {inspector ? (
                <>
                  <ResizeHandle direction="horizontal" onDoubleClick={resetInspector} />
                  <Panel
                    ref={inspectorRef}
                    id="workbench-inspector"
                    order={3}
                    defaultSize={inspectorDefaultCollapsed ? 0 : 22}
                    minSize={18}
                    maxSize={32}
                    collapsible
                    collapsedSize={0}
                    onCollapse={() => setInspectorCollapsed(true)}
                    onExpand={() => setInspectorCollapsed(false)}
                  >
                    <aside
                      className="h-full overflow-y-auto border-l border-[var(--color-border)] bg-[var(--color-surface)]"
                      data-testid="workbench-context-inspector"
                      aria-label="Context inspector"
                    >
                      {inspector}
                    </aside>
                  </Panel>
                </>
              ) : null}
            </PanelGroup>
          </Panel>

          <ResizeHandle direction="vertical" />

          <Panel
            ref={bottomRef}
            id="workbench-bottom"
            order={2}
            defaultSize={bottomDefaultCollapsed ? 0 : 22}
            minSize={12}
            maxSize={45}
            collapsible
            collapsedSize={0}
            onCollapse={() => setBottomCollapsed(true)}
            onExpand={() => setBottomCollapsed(false)}
          >
            <div
              className="flex h-full flex-col border-t border-[var(--color-border)] bg-[var(--color-surface)]"
              data-testid="workbench-bottom-panel"
            >
              <div
                className="flex items-center gap-0 border-b border-[var(--color-border)] px-1"
                role="tablist"
                aria-label="Bottom panel"
              >
                {BOTTOM_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={bottomTab === tab.id}
                    className={cn(
                      "-mb-px border-b-2 px-3 py-1.5 text-[11px]",
                      bottomTab === tab.id
                        ? "border-[var(--color-foreground)] font-medium"
                        : "border-transparent text-[var(--color-muted-foreground)]",
                    )}
                    onClick={() => setBottomTab(tab.id)}
                    data-testid={`workbench-bottom-tab-${tab.id}`}
                  >
                    {bottomTabLabels?.[tab.id] ?? tab.label}
                  </button>
                ))}
                <button
                  type="button"
                  className="ml-auto px-2 py-1 text-[11px] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                  onClick={toggleBottom}
                  aria-label="Collapse bottom panel"
                >
                  ×
                </button>
              </div>
              <div className="flex-1 overflow-auto p-3 text-xs text-[var(--color-muted-foreground)]">
                {bottomTab === "terminal" || bottomPanelContent?.[bottomTab] == null ? (
                  <>
                    <p className="font-medium text-[var(--color-foreground)]">
                      Not configured
                    </p>
                    <p className="mt-1 max-w-xl">
                      {bottomTab === "terminal"
                        ? "Terminal is not configured for this workspace."
                        : `${BOTTOM_TABS.find((t) => t.id === bottomTab)?.label ?? "Panel"} content is not available in Workbench Slice 1.`}
                    </p>
                  </>
                ) : (
                  bottomPanelContent[bottomTab]
                )}
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </div>

      <footer
        className="flex h-7 shrink-0 items-center gap-3 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-[10px] text-[var(--color-muted-foreground)]"
        data-testid="workbench-status-bar"
      >
        <span className="font-medium text-[var(--color-foreground)]">
          {statusBar?.organisationLabel ?? "Organisation"}
        </span>
        {statusBar?.leftHint ? <span>{statusBar.leftHint}</span> : null}
        <span className="ml-auto">{statusBar?.rightLabel ?? "APZ Workbench"}</span>
      </footer>
    </div>
  );
}
