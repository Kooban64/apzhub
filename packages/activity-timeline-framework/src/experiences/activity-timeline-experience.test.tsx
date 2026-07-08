import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import {
  CommandRegistryProvider,
  type ActionRegistryDto,
} from "@apzhub/command-framework/react";
import { ActivityTimelineProvider, ActivityTimelineServiceProvider } from "../react";
import { createActivityTimelineServiceFromHydration } from "../client/service";
import { createActivityTimelineContextFromDto } from "../client";
import { sampleActivityTimelineHydrationBundle } from "../client/test-fixtures";

import { ActivityTimelineExperience } from "./activity-timeline-experience";
import { WorkbenchActivityTimeline } from "./workbench-activity-timeline";
import {
  seedActivityTimelineService,
  seedActivityTimelineServiceWithAction,
  seedEmptyActivityTimelineService,
} from "./test-fixtures";

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

function Providers({
  children,
  service = seedActivityTimelineService(),
}: {
  readonly children: ReactNode;
  readonly service?: ReturnType<typeof seedActivityTimelineService>;
}) {
  const bundle = sampleActivityTimelineHydrationBundle();
  const execute = vi.fn().mockResolvedValue({
    ok: true,
    code: "SUCCESS",
    actionId: "platform.theme.toggle",
    actor: "user",
    durationMs: 1,
  });

  return (
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
  );
}

describe("ActivityTimelineExperience", () => {
  it("renders grouped activity items from presentation layer", () => {
    render(
      <Providers>
        <ActivityTimelineExperience now="2026-07-04T12:05:00.000Z" />
      </Providers>,
    );

    expect(screen.getByText("Bootstrap complete")).toBeInTheDocument();
    expect(screen.getByTestId("activity-timeline-group-today")).toBeInTheDocument();
    expect(
      screen.getByTestId("activity-timeline-experience-diagnostics"),
    ).toHaveAttribute("data-rendered-item-count", "1");
  });

  it("shows empty state when service has no activities", () => {
    render(
      <Providers service={seedEmptyActivityTimelineService()}>
        <ActivityTimelineExperience />
      </Providers>,
    );

    expect(screen.getByTestId("activity-timeline-empty")).toBeInTheDocument();
    expect(
      screen.getByTestId("activity-timeline-experience-diagnostics"),
    ).toHaveAttribute("data-empty", "true");
  });

  it("shows loading state when hydration is invalid", () => {
    const invalidBundle = {
      schemaVersion: 99,
      activityRegistry: {},
      timelineRegistry: {},
    } as unknown as ReturnType<typeof sampleActivityTimelineHydrationBundle>;
    const context = createActivityTimelineContextFromDto(invalidBundle);
    const service = createActivityTimelineServiceFromHydration({ context });

    render(
      <Providers service={service}>
        <ActivityTimelineExperience />
      </Providers>,
    );

    expect(screen.getByTestId("activity-timeline-loading")).toBeInTheDocument();
  });

  it("delegates actionRef through Action Framework execute", async () => {
    const user = userEvent.setup();
    const execute = vi.fn().mockResolvedValue({
      ok: true,
      code: "SUCCESS",
      actionId: "platform.theme.toggle",
      actor: "user",
      durationMs: 1,
    });
    const bundle = sampleActivityTimelineHydrationBundle();

    render(
      <ActivityTimelineProvider bundle={bundle}>
        <ActivityTimelineServiceProvider
          service={seedActivityTimelineServiceWithAction()}
        >
          <CommandRegistryProvider
            dto={sampleDto}
            executor={{
              execute,
              executeSync: vi.fn(),
              getDiagnostics: () => ({ status: "ready" as const, executionCount: 0 }),
            }}
          >
            <ActivityTimelineExperience now="2026-07-04T12:05:00.000Z" />
          </CommandRegistryProvider>
        </ActivityTimelineServiceProvider>
      </ActivityTimelineProvider>,
    );

    await user.click(
      screen.getByTestId("activity-timeline-action-env-1:platform.action.executed"),
    );

    await waitFor(() => {
      expect(execute).toHaveBeenCalledWith("platform.theme.toggle", {
        actor: "user",
        args: { source: "activity" },
      });
    });
  });
});

describe("WorkbenchActivityTimeline", () => {
  it("renders panel variant with grouped content", () => {
    render(
      <Providers>
        <WorkbenchActivityTimeline
          variant="panel"
          panelOpen
          now="2026-07-04T12:05:00.000Z"
        />
      </Providers>,
    );

    expect(
      screen.getByTestId("activity-timeline-panel-experience"),
    ).toBeInTheDocument();
    expect(screen.getByText("Bootstrap complete")).toBeInTheDocument();
  });
});
