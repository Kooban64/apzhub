import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
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

import { ActivityTimelineDiagnostics } from "./activity-timeline-diagnostics";

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

describe("ActivityTimelineDiagnostics", () => {
  it("exposes hydration and service counts in non-production builds", () => {
    render(
      <ShellProviders>
        <ActivityTimelineDiagnostics
          activityDiagnostics={{
            registeredCount: 4,
            filteredCount: 4,
            builtinCount: 4,
            manifestCount: 0,
            filteredBuiltinCount: 4,
            filteredManifestCount: 0,
            schemaVersion: 1,
            manifestCapabilityCount: 0,
            manifestCapabilities: [],
          }}
          timelineDiagnostics={{
            registeredCount: 3,
            filteredCount: 3,
            builtinCount: 3,
            manifestCount: 0,
            filteredBuiltinCount: 3,
            filteredManifestCount: 0,
            schemaVersion: 1,
            manifestCapabilityCount: 0,
            manifestCapabilities: [],
          }}
        />
      </ShellProviders>,
    );

    const diagnostics = screen.getByTestId("activity-timeline-diagnostics");
    expect(diagnostics).toHaveAttribute("data-activity-registered-count", "4");
    expect(diagnostics).toHaveAttribute("data-timeline-registered-count", "3");
    expect(diagnostics).toHaveAttribute("data-service-stored-count", "1");
  });
});
