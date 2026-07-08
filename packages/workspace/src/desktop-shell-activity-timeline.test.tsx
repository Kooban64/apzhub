import "@testing-library/jest-dom/vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import {
  ActivityTimelineProvider,
  ActivityTimelineServiceProvider,
  createActivityTimelineContextFromDto,
  createActivityTimelineServiceFromHydration,
  sampleActivityTimelineHydrationBundle,
  type ActivityDocument,
} from "@apzhub/activity-timeline-framework/react";
import {
  CommandRegistryProvider,
  type ActionRegistryDto,
} from "@apzhub/command-framework/react";
import { ThemeProvider } from "@apzhub/theme";

import { DesktopShell } from "./desktop-shell";

const sampleDto = {
  actions: [
    {
      id: "platform.theme.toggle",
      label: "Toggle Theme",
      handler: "service:theme:toggle",
      handlerKind: "service" as const,
      source: "manifest" as const,
    },
  ],
  toolbar: [],
} satisfies ActionRegistryDto;

function ShellProviders({ children }: { readonly children: ReactNode }) {
  const execute = vi.fn().mockResolvedValue({
    ok: true,
    code: "SUCCESS",
    actionId: "platform.theme.toggle",
    actor: "user",
    durationMs: 1,
  });
  const bundle = sampleActivityTimelineHydrationBundle();
  const context = createActivityTimelineContextFromDto(bundle);
  const service = createActivityTimelineServiceFromHydration({
    context,
    initialActivities: [
      Object.freeze({
        activityId: "env-1:platform.action.executed",
        activityTypeId: "platform.action.executed",
        sourceEventId: "capability.action.executed",
        title: "Bootstrap complete",
        description: "Action executed description",
        timelineScope: "timeline.personal",
        category: "capability",
        timestamp: "2026-07-04T12:00:00.000Z",
        actor: Object.freeze({ id: "user-1" }),
        metadata: Object.freeze({
          templateRef: "activity.platform.action.executed",
          sourceEnvelopeId: "env-1",
          correlationId: "corr-1",
          publisher: "command-framework",
          timelineScopes: Object.freeze(["timeline.personal"]),
          severity: "info",
        }),
        diagnostics: Object.freeze({
          renderedAt: "2026-07-04T12:00:00.000Z",
          matchedActivityTypeId: "platform.action.executed",
          eventPattern: "capability.action.executed",
          typeStatus: "active",
          templateStatus: "ok",
          message: "test",
        }),
      }) as ActivityDocument,
    ],
  });

  return (
    <ThemeProvider>
      <ActivityTimelineProvider bundle={bundle}>
        <ActivityTimelineServiceProvider service={service}>
          <CommandRegistryProvider
            dto={sampleDto}
            executor={{
              execute,
              executeSync: vi.fn(),
              getDiagnostics: () => ({ status: "ready" as const, executionCount: 0 }),
            }}
          >
            {children}
          </CommandRegistryProvider>
        </ActivityTimelineServiceProvider>
      </ActivityTimelineProvider>
    </ThemeProvider>
  );
}

describe("DesktopShell activity timeline", () => {
  it("registers Context Panel Activity tab when enable flags are set", () => {
    render(
      <ShellProviders>
        <DesktopShell
          enableActivityTimeline
          enableActivityTimelinePanel
          activityBarItems={[]}
          sidebarItems={[]}
        >
          <p>Workspace</p>
        </DesktopShell>
      </ShellProviders>,
    );

    expect(
      screen.getByTestId("workbench-layout-with-context-panel"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("workbench-context-panel")).toBeInTheDocument();
    expect(screen.getByTestId("context-panel-tab-activity")).toHaveTextContent(
      "Activity",
    );
    expect(
      screen.getByTestId("activity-timeline-panel-experience"),
    ).toBeInTheDocument();
    expect(screen.getByText("Bootstrap complete")).toBeInTheDocument();
  });

  it("hides context panel when flags are disabled", () => {
    render(
      <ShellProviders>
        <DesktopShell activityBarItems={[]} sidebarItems={[]}>
          <p>Workspace</p>
        </DesktopShell>
      </ShellProviders>,
    );

    expect(screen.queryByTestId("workbench-context-panel")).not.toBeInTheDocument();
  });

  it("toggles context panel visibility", async () => {
    const user = userEvent.setup();

    render(
      <ShellProviders>
        <DesktopShell
          enableActivityTimeline
          enableActivityTimelinePanel
          activityBarItems={[]}
          sidebarItems={[]}
        >
          <p>Workspace</p>
        </DesktopShell>
      </ShellProviders>,
    );

    const panel = screen.getByTestId("workbench-context-panel");
    expect(
      within(panel).getByTestId("activity-timeline-panel-experience"),
    ).toBeInTheDocument();

    await user.click(screen.getByTestId("context-panel-toggle"));

    expect(
      within(panel).queryByTestId("activity-timeline-panel-experience"),
    ).not.toBeInTheDocument();
  });
});
