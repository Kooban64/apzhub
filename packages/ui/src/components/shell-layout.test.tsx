import { ThemeProvider } from "@apzhub/theme";
import { mapWorkbenchRegistryDto } from "@apzhub/workbench-framework/server";
import type {
  NavigationContribution,
  ViewDescriptor,
} from "@apzhub/workbench-framework";
import {
  useActivityBarPresentation,
  useSidebarPresentation,
  WorkbenchProvider,
} from "@apzhub/workbench-framework/react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ActivityBar, ShellLayout } from "./shell-layout";
import { Sidebar } from "./sidebar";

const contributions: NavigationContribution[] = [
  {
    id: "platform-home",
    capabilityId: "platform-home",
    capabilityKind: "module",
    level: "activity-bar",
    workspace: "home",
    label: "Home",
    order: 10,
    permission: "platform.nav.home.view",
    hidden: false,
  },
  {
    id: "platform-administration",
    capabilityId: "platform-administration",
    capabilityKind: "module",
    level: "activity-bar",
    workspace: "administration",
    label: "Administration",
    order: 20,
    permission: "platform.nav.administration.view",
    hidden: false,
  },
];

describe("ShellLayout", () => {
  it("renders shell regions and workspace content", () => {
    render(
      <ThemeProvider>
        <ShellLayout
          userName="Dev User"
          environment="development"
          sidebarItems={[]}
          activityBarItems={[
            {
              id: "platform-home",
              label: "Home",
              active: true,
              ariaLabel: "Home workspace",
            },
          ]}
        >
          <h1>Workspace</h1>
        </ShellLayout>
      </ThemeProvider>,
    );

    expect(screen.getByRole("heading", { name: "Workspace" })).toBeInTheDocument();
    expect(screen.getByLabelText("Activity bar")).toBeInTheDocument();
    expect(screen.getByLabelText("Workspace navigation")).toBeInTheDocument();
    expect(screen.getByText("Environment: development")).toBeInTheDocument();
  });
});

const views: ViewDescriptor[] = [
  {
    viewId: "platform-home",
    capabilityId: "platform-home",
    capabilityKind: "module",
    title: "Home",
    workspace: "home",
    route: "/workspace/home",
    default: true,
  },
  {
    viewId: "platform-home-overview",
    capabilityId: "platform-home-overview",
    capabilityKind: "module",
    title: "Overview",
    workspace: "home",
    route: "/workspace/home/overview",
  },
];

describe("ActivityBar", () => {
  it("renders manifest-driven activity bar items from navigation model", () => {
    const registry = mapWorkbenchRegistryDto(contributions, views);

    render(
      <WorkbenchProvider initialRegistry={registry}>
        <ActivityBarHarness />
      </WorkbenchProvider>,
    );

    expect(screen.getByLabelText("Home workspace")).toBeInTheDocument();
    expect(screen.getByLabelText("Administration workspace")).toBeInTheDocument();
  });
});

describe("Sidebar integration", () => {
  it("renders manifest-driven sidebar items from navigation model", () => {
    const sidebarContributions: NavigationContribution[] = [
      ...contributions,
      {
        id: "platform-home-overview",
        capabilityId: "platform-home-overview",
        capabilityKind: "module",
        level: "sidebar",
        workspace: "home",
        label: "Overview",
        order: 10,
        permission: "platform.nav.home.view",
        hidden: false,
      },
    ];
    const registry = mapWorkbenchRegistryDto(sidebarContributions, views);

    render(
      <WorkbenchProvider initialRegistry={registry}>
        <SidebarHarness />
      </WorkbenchProvider>,
    );

    expect(screen.getByRole("button", { name: "Overview" })).toBeInTheDocument();
  });
});

function SidebarHarness() {
  const sidebar = useSidebarPresentation();
  return (
    <Sidebar
      items={sidebar.map((item) => ({
        id: item.id,
        label: item.label,
        active: item.active,
      }))}
    />
  );
}

function ActivityBarHarness() {
  const presentation = useActivityBarPresentation();
  const items = presentation.map((item) => ({
    id: item.id,
    label: item.label,
    icon: item.icon,
    active: item.active,
    ariaLabel: item.ariaLabel,
  }));

  return <ActivityBar items={items} />;
}
