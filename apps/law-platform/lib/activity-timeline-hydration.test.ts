import { describe, expect, it, beforeEach } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildActivityTimelineHydrationBundle } from "@apzhub/activity-timeline-framework/server";

import {
  loadActivityFrameworkHealthSummary,
  loadTimelineFrameworkHealthSummary,
} from "./activity-timeline-health";
import { loadSharedActivityTimelineContext } from "./load-shared-activity-timeline-context";
import { _resetRuntimeInitForTests, ensurePlatformRuntimeReady } from "./runtime-init";

const workspaceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

describe("activity timeline application integration", () => {
  beforeEach(() => {
    _resetRuntimeInitForTests();
  });

  it("loads shared context after runtime bootstrap", async () => {
    const bootstrap = await ensurePlatformRuntimeReady();
    expect(bootstrap.success).toBe(true);
    expect(workspaceRoot).toMatch(/apz-portal$/);

    const context = await loadSharedActivityTimelineContext();

    expect(context).not.toBeNull();
    expect(
      context?.registry.getDiagnostics().registeredActivityTypeCount,
    ).toBeGreaterThan(0);
    expect(
      context?.timelineRegistry.getDiagnostics().registeredTimelineCount,
    ).toBeGreaterThan(0);
    expect(context?.subscriberId).toBeDefined();
  });

  it("builds hydration bundle from shared server context", async () => {
    await ensurePlatformRuntimeReady();

    const context = await loadSharedActivityTimelineContext();
    expect(context).not.toBeNull();

    const bundle = buildActivityTimelineHydrationBundle({
      activityRegistry: context!.registry,
      timelineRegistry: context!.timelineRegistry,
    });

    expect(bundle.schemaVersion).toBe(1);
    expect(bundle.activityRegistry.types.length).toBeGreaterThan(0);
    expect(bundle.timelineRegistry.timelines.length).toBeGreaterThan(0);
  });

  it("builds activity and timeline health summaries for /api/health", async () => {
    await ensurePlatformRuntimeReady();

    const [activities, timelines] = await Promise.all([
      loadActivityFrameworkHealthSummary(),
      loadTimelineFrameworkHealthSummary(),
    ]);

    expect(activities).toMatchObject({
      status: expect.stringMatching(/healthy|degraded/),
      registeredTypeCount: expect.any(Number),
      mapperStatus: "ready",
      subscriberRegistered: true,
    });
    expect(timelines).toMatchObject({
      status: expect.stringMatching(/healthy|degraded/),
      registeredTimelineCount: expect.any(Number),
      hydrationStatus: expect.stringMatching(/empty|hydrated|invalid/),
    });
  });
});
