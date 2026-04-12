"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Group, Panel, Separator, useGroupRef, usePanelRef } from "react-resizable-panels";
import type { Layout } from "react-resizable-panels";
import { PanelLeft } from "lucide-react";

import { AppFooter } from "@/components/shell/app-footer";
import { AppHeader } from "@/components/shell/app-header";
import { MainCanvas } from "@/components/shell/main-canvas";
import { PrimaryRail } from "@/components/shell/primary-rail";
import {
  RightUtilityPanelBody,
  RightUtilityPanelHeader,
} from "@/components/shell/right-utility-panel";
import { Button } from "@/components/ui/button";
import { AdminInspectorProvider } from "@/features/admin/admin-inspector-context";
import {
  applyShellPatch,
  getSecondaryOpenForMode,
  getSplitLayoutRecord,
  readShellState,
  setSecondaryOpenForMode,
  setSplitLayout,
} from "@/lib/shell/state-model";
import type { AppShellProps } from "@/types/shell-config";

const FALLBACK_LAYOUT: Layout = { "main-canvas": 72, "right-utility": 28 };

function layoutFromState(splitId: string): Layout {
  const rec = getSplitLayoutRecord(splitId, readShellState());
  if (rec && Object.keys(rec).length > 0) {
    return rec as Layout;
  }
  return FALLBACK_LAYOUT;
}

export function AppShell({
  children,
  versionLabel,
  chrome,
  pathname,
  secondaryRail = null,
}: AppShellProps) {
  const rightPanelRef = usePanelRef();
  const groupRef = useGroupRef();
  const splitId = chrome.splitStorageId;

  const [primaryCollapsed, setPrimaryCollapsed] = useState(false);
  const [secondaryOpen, setSecondaryOpen] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  useEffect(() => {
    const s = readShellState();
    /* eslint-disable react-hooks/set-state-in-effect -- hydrate shell controls from persisted snapshot when shell mode changes */
    setPrimaryCollapsed(s.primaryRailCollapsed);
    setSecondaryOpen(getSecondaryOpenForMode(chrome.mode, s));
    setRightCollapsed(s.rightPanelCollapsed);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [chrome.mode]);

  useEffect(() => {
    const layout = layoutFromState(splitId);
    queueMicrotask(() => {
      groupRef.current?.setLayout(layout);
    });
  }, [groupRef, splitId]);

  useEffect(() => {
    const collapsed = readShellState().rightPanelCollapsed;
    queueMicrotask(() => {
      if (collapsed) {
        rightPanelRef.current?.collapse();
        setRightCollapsed(true);
      } else {
        rightPanelRef.current?.expand();
        setRightCollapsed(false);
      }
    });
  }, [chrome.mode, rightPanelRef]);

  const toggleSecondary = () => {
    const next = !secondaryOpen;
    setSecondaryOpen(next);
    setSecondaryOpenForMode(chrome.mode, next);
  };

  const setPrimaryCollapsedPersisted = useCallback((next: boolean) => {
    setPrimaryCollapsed(next);
    applyShellPatch({ primaryRailCollapsed: next });
  }, []);

  const collapseRight = useCallback(() => {
    rightPanelRef.current?.collapse();
    setRightCollapsed(true);
    applyShellPatch({ rightPanelCollapsed: true });
  }, [rightPanelRef]);

  const expandRight = useCallback(() => {
    rightPanelRef.current?.expand();
    setRightCollapsed(false);
    applyShellPatch({ rightPanelCollapsed: false });
  }, [rightPanelRef]);

  const onLayoutChanged = useCallback(
    (layout: Layout) => {
      setSplitLayout(splitId, layout);
    },
    [splitId],
  );

  const onRightResize = useCallback(() => {
    const collapsed = rightPanelRef.current?.isCollapsed() ?? false;
    setRightCollapsed((prev) => {
      if (prev === collapsed) {
        return prev;
      }
      applyShellPatch({ rightPanelCollapsed: collapsed });
      return collapsed;
    });
  }, [rightPanelRef]);

  const defaultLayout = useMemo(() => layoutFromState(splitId), [splitId]);

  const mobileQuick = chrome.mobileQuickSwitch;

  const bodyBelowHeader = (
    <div className="flex min-h-0 flex-1">
      <PrimaryRail
        items={chrome.primaryNav}
        pathname={pathname}
        collapsed={primaryCollapsed}
        onCollapsedChange={setPrimaryCollapsedPersisted}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2 border-b border-border bg-surface px-[var(--shell-pad)] py-1 text-xs text-muted-foreground md:hidden">
          <Button type="button" size="xs" variant="outline" onClick={toggleSecondary}>
            {secondaryOpen ? "Hide" : "Show"} local nav
          </Button>
          {mobileQuick ? (
            <Link
              href={mobileQuick.href}
              className="underline-offset-2 hover:underline"
            >
              Go to {mobileQuick.label}
            </Link>
          ) : null}
        </div>
        <div className="flex min-h-0 flex-1">
          {secondaryOpen && secondaryRail ? secondaryRail : null}
          <Group
            key={splitId}
            groupRef={groupRef}
            id={splitId}
            orientation="horizontal"
            defaultLayout={defaultLayout}
            onLayoutChanged={onLayoutChanged}
            className="flex min-w-0 flex-1"
          >
            <Panel defaultSize={72} minSize={45} className="min-w-0" id="main-canvas">
              <MainCanvas>{children}</MainCanvas>
            </Panel>
            <Separator className="group relative w-1.5 shrink-0 bg-border focus:outline-none data-[separator-state=drag]:bg-primary/30">
              <span className="absolute inset-y-0 -left-1 -right-1 w-3" />
            </Separator>
            <Panel
              panelRef={rightPanelRef}
              id="right-utility"
              defaultSize={28}
              minSize={16}
              maxSize={42}
              collapsible
              collapsedSize={3}
              className="flex min-w-0 flex-col border-l border-border bg-panel"
              onResize={onRightResize}
            >
              {rightCollapsed ? (
                <div className="flex h-full flex-col items-center gap-2 py-2">
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    onClick={expandRight}
                    aria-label={chrome.mode === "admin" ? "Show inspector panel" : "Show context panel"}
                    data-testid="right-panel-expand"
                    title={chrome.mode === "admin" ? "Show inspector panel" : "Show context panel"}
                  >
                    <PanelLeft className="size-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex h-full min-h-0 flex-col">
                  <RightUtilityPanelHeader mode={chrome.mode} onCollapse={collapseRight} />
                  <RightUtilityPanelBody mode={chrome.mode} />
                </div>
              )}
            </Panel>
          </Group>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-dvh flex-col bg-background" data-testid="app-shell">
      <AppHeader chrome={chrome} />
      {chrome.mode === "admin" ? (
        <AdminInspectorProvider>{bodyBelowHeader}</AdminInspectorProvider>
      ) : (
        bodyBelowHeader
      )}
      <AppFooter versionLabel={versionLabel} />
    </div>
  );
}
