"use client";

import { Suspense } from "react";

import { ActivityFeed } from "@/features/workspace/activity-feed";
import { AppLauncher } from "@/features/workspace/app-launcher";
import { AttentionCards } from "@/features/workspace/attention-cards";
import { MyAppsGrid } from "@/features/workspace/my-apps-grid";
import { MyWorkLists } from "@/features/workspace/my-work-lists";
import { TodaySummaryStrip } from "@/features/workspace/today-summary-strip";
import { WorkspaceDenialBanner } from "@/features/workspace/workspace-denial-banner";
import { buildWorkspaceModuleDescriptors } from "@/lib/workspace/module-contract";
import type { WorkspaceModuleDescriptor } from "@/lib/workspace/module-contract";
import {
  defaultWorkspaceConfig,
  type WorkspaceConfig,
} from "@/lib/workspace/workspace-config";

function ModuleRegion({ descriptor, children }: { descriptor: WorkspaceModuleDescriptor; children: React.ReactNode }) {
  return (
    <div
      role="region"
      data-testid={`workspace-module-${descriptor.id}`}
      data-module-kind={descriptor.kind}
      data-module-state={descriptor.dataState}
      aria-label={descriptor.title}
    >
      {children}
    </div>
  );
}

function renderModule(descriptor: WorkspaceModuleDescriptor, config: WorkspaceConfig) {
  switch (descriptor.id) {
    case "today_summary":
      return <TodaySummaryStrip />;
    case "attention":
      return <AttentionCards />;
    case "my_work":
      return <MyWorkLists />;
    case "my_apps":
      return <MyAppsGrid />;
    case "activity":
      return <ActivityFeed />;
    case "launcher":
      return <AppLauncher config={config} />;
    default:
      return null;
  }
}

function WorkspaceHomeInner({ config }: { config: WorkspaceConfig }) {
  const descriptors = buildWorkspaceModuleDescriptors(config)
    .filter((d) => d.visible)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col gap-4" data-testid="workspace-home-root">
      <Suspense fallback={null}>
        <WorkspaceDenialBanner />
      </Suspense>
      <h1 className="text-xl font-semibold tracking-tight text-foreground">Workspace</h1>
      {descriptors.map((d) => (
        <ModuleRegion key={d.id} descriptor={d}>
          {renderModule(d, config)}
        </ModuleRegion>
      ))}
    </div>
  );
}

export function WorkspaceHome({ config = defaultWorkspaceConfig }: { config?: WorkspaceConfig }) {
  return <WorkspaceHomeInner config={config} />;
}
