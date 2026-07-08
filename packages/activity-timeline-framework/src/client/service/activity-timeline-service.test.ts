import { describe, expect, it, vi } from "vitest";

import { createDefaultActivityService } from "../../service/default-activity-service";
import { ACTIVITY_TIMELINE_FRAMEWORK_STATUS } from "../../status";
import { TIMELINE_SCOPE_PERSONAL } from "../../types/timeline-scope";
import { createActivityTimelineContextFromDto } from "../create-activity-timeline-context-from-dto";
import { sampleActivityTimelineHydrationBundle } from "../test-fixtures";
import { createActivityTimelineService } from "./create-activity-timeline-service";
import { createActivityTimelineServiceFromHydration } from "./create-activity-timeline-service-from-hydration";
import { DefaultActivityTimelineService } from "./default-activity-timeline-service";
import { sampleActivityDocument } from "./test-fixtures";

describe("DefaultActivityTimelineService", () => {
  it("delegates list, get, and queryTimeline to the internal activity service", () => {
    const activityService = createDefaultActivityService();
    const item = sampleActivityDocument({
      activityId: "env-1:platform.action.executed",
    });
    activityService.addActivities([item]);

    const service = createActivityTimelineService({
      activityService,
      registryReady: true,
    });

    expect(service).toBeInstanceOf(DefaultActivityTimelineService);
    expect(service.listActivities()).toHaveLength(1);
    expect(service.getActivity(item.activityId)?.title).toBe("Action executed");
    expect(service.queryTimeline({ scopeId: TIMELINE_SCOPE_PERSONAL })).toMatchObject({
      scopeId: TIMELINE_SCOPE_PERSONAL,
      items: [item.activityId],
      status: "ok",
    });
  });

  it("does not expose addActivities on the public service", () => {
    const service = createActivityTimelineService();
    const publicService = service as unknown as Record<string, unknown>;

    expect(publicService.addActivities).toBeUndefined();
    expect(publicService.clearActivities).toBeUndefined();
  });

  it("reports empty service diagnostics when registry is ready", () => {
    const service = createActivityTimelineService({ registryReady: true });
    const diagnostics = service.getDiagnostics();

    expect(diagnostics).toMatchObject({
      frameworkStatus: ACTIVITY_TIMELINE_FRAMEWORK_STATUS,
      serviceStatus: "empty",
      registryReady: true,
      activityCount: 0,
      timelineDefinitionCount: 0,
    });
  });

  it("reports unavailable diagnostics when registry hydration failed", () => {
    const service = createActivityTimelineService({
      registryReady: false,
      activityRegistryDiagnostics: {
        status: "invalid",
        schemaVersion: 1,
        typeCount: 0,
        activeTypeCount: 0,
        platformTypeCount: 0,
        capabilityTypeCount: 0,
        source: "server-dto",
        synchronisation: { mode: "hydration" },
      },
    });

    expect(service.getDiagnostics().serviceStatus).toBe("unavailable");
    expect(service.getDiagnostics().registryStatus).toBe("invalid");
  });

  it("reports ready diagnostics with activity and timeline counts", () => {
    const activityService = createDefaultActivityService();
    activityService.addActivities([
      sampleActivityDocument({ activityId: "env-1:platform.action.executed" }),
    ]);

    const service = createActivityTimelineService({
      activityService,
      registryReady: true,
      timelineRegistryDiagnostics: {
        status: "hydrated",
        schemaVersion: 1,
        timelineCount: 2,
        activeTimelineCount: 2,
        scopeCounts: { [TIMELINE_SCOPE_PERSONAL]: 1 },
        source: "server-dto",
        synchronisation: { mode: "hydration" },
      },
      hydrationDiagnostics: {
        hydrationStatus: "hydrated",
        activityRegistryStatus: "hydrated",
        timelineRegistryStatus: "hydrated",
        schemaVersion: 1,
        activityTypeCount: 2,
        timelineDefinitionCount: 2,
        synchronisation: { mode: "hydration" },
      },
    });

    expect(service.getDiagnostics()).toMatchObject({
      serviceStatus: "ready",
      activityCount: 1,
      timelineDefinitionCount: 2,
      hydrationStatus: "hydrated",
    });
  });
});

describe("createActivityTimelineServiceFromHydration", () => {
  it("wires activity service behind the public boundary from hydration context", () => {
    const context = createActivityTimelineContextFromDto(
      sampleActivityTimelineHydrationBundle(),
    );
    const item = sampleActivityDocument({
      activityId: "env-1:platform.action.executed",
    });

    const service = createActivityTimelineServiceFromHydration({
      context,
      initialActivities: [item],
    });

    expect(service.getDiagnostics().registryReady).toBe(true);
    expect(service.getDiagnostics().timelineDefinitionCount).toBe(2);
    expect(service.listActivities()).toHaveLength(1);
    expect(service.queryTimeline({ scopeId: TIMELINE_SCOPE_PERSONAL }).status).toBe(
      "ok",
    );
  });

  it("marks service unavailable when hydration context failed", () => {
    const context = createActivityTimelineContextFromDto({
      schemaVersion: 99,
      activityRegistry: {},
      timelineRegistry: {},
    });

    const service = createActivityTimelineServiceFromHydration({ context });

    expect(context.ok).toBe(false);
    expect(service.getDiagnostics().serviceStatus).toBe("unavailable");
    expect(service.listActivities()).toEqual([]);
  });

  it("uses injected activity service without exposing mutations publicly", () => {
    const activityService = createDefaultActivityService();
    const addActivities = vi.spyOn(activityService, "addActivities");
    const context = createActivityTimelineContextFromDto(
      sampleActivityTimelineHydrationBundle(),
    );
    const item = sampleActivityDocument({
      activityId: "env-2:platform.action.executed",
    });

    createActivityTimelineServiceFromHydration({
      context,
      activityService,
      initialActivities: [item],
    });

    expect(addActivities).toHaveBeenCalledWith([item]);
  });
});
