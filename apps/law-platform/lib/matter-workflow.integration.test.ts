import path from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, expect, it } from "vitest";

import {
  bootstrapActionRegistry,
  mapPlatformCapabilitiesToActionRecords,
} from "@apzhub/command-framework/server";
import { createAllowAllWorkbenchPermissionAdapter } from "@apzhub/workbench-framework";
import { workbenchRequestOk } from "@apzhub/workbench-framework";
import { Runtime } from "@apzhub/platform-runtime/server";

import { createAppActionExecutorBundle } from "./create-app-action-executor";
import { createAppActivityTimelineContext } from "./create-app-activity-timeline-context";
import { createAppEventNotificationContext } from "./create-app-event-notification-context";
import {
  MatterWorkflowService,
  createEmptyMatterFormValues,
  getMatterWorkflowDiagnostics,
  getSharedMatterRepository,
  matterCreateRoute,
  matterDetailRoute,
  matterListRoute,
  registerMatterNavigationHandler,
  resetMatterWorkflowDiagnostics,
  resetSharedMatterRepository,
  unregisterMatterNavigationHandler,
} from "./matters";
import { resetLegalMatterEventEnvelopeCounter } from "./publish-legal-matter-event";
import { SEED_CLIENTS } from "./clients/seed-clients";

const workspaceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

describe("matter workflow integration", () => {
  beforeEach(() => {
    resetSharedMatterRepository();
    resetMatterWorkflowDiagnostics();
    resetLegalMatterEventEnvelopeCounter();
    unregisterMatterNavigationHandler();
  });

  it("runs the full create → open → search → archive pipeline with events, notifications, and activities", async () => {
    await Runtime.bootstrap({ workspaceRoot, failFast: false });
    const capabilities = Runtime.registry().findAll();
    const actionBootstrap = bootstrapActionRegistry({
      capabilityRecords: mapPlatformCapabilitiesToActionRecords(capabilities),
    });

    const eventContext = createAppEventNotificationContext();
    const activityContext = createAppActivityTimelineContext({
      eventBus: eventContext.eventBus,
    });

    const navigated: string[] = [];
    registerMatterNavigationHandler((path) => navigated.push(path));

    const bundle = createAppActionExecutorBundle({
      dto: actionBootstrap.dto,
      permissionAdapter: createAllowAllWorkbenchPermissionAdapter(),
      publish: () => workbenchRequestOk(),
      eventBus: eventContext.eventBus,
    });

    const created = bundle.matterWorkflow.createMatter({
      ...createEmptyMatterFormValues(),
      title: "Workflow Validation Matter",
      clientId: SEED_CLIENTS[0]!.clientId,
      leadAttorneyId: "a1000001-0001-4000-8000-000000000001",
    });

    expect(created.ok).toBe(true);
    expect(created.eventId).toBe("legal.matter.created");
    expect(created.matter?.title).toBe("Workflow Validation Matter");
    expect(eventContext.notificationService.getUnreadCount()).toBeGreaterThan(0);
    expect(activityContext.service.listActivities().length).toBeGreaterThan(0);

    const openResult = bundle.actionExecutor.executeSync("legal.matter.open", {
      actor: "user",
      args: { matterId: created.matter!.matterId },
    });
    expect(openResult.ok).toBe(true);
    expect(navigated).toContain(matterDetailRoute(created.matter!.matterId));

    const searchResult = bundle.actionExecutor.executeSync("legal.matter.search", {
      actor: "user",
      args: { query: "Workflow" },
    });
    expect(searchResult.ok).toBe(true);
    expect(navigated.some((route) => route.startsWith(matterListRoute()))).toBe(true);

    const archiveResult = bundle.actionExecutor.executeSync("legal.matter.archive", {
      actor: "user",
      args: { matterId: created.matter!.matterId },
    });
    expect(archiveResult.ok).toBe(true);
    expect(
      getSharedMatterRepository().getById(created.matter!.matterId),
    ).toBeUndefined();
    expect(navigated).toContain(matterListRoute());

    const createNav = bundle.actionExecutor.executeSync("legal.matter.create", {
      actor: "user",
    });
    expect(createNav.ok).toBe(true);
    expect(navigated).toContain(matterCreateRoute());

    const summary = getMatterWorkflowDiagnostics().getSummary();
    expect(summary.repositoryMutations).toBeGreaterThan(0);
    expect(summary.eventsRaised).toBeGreaterThan(0);
    expect(summary.commandsExecuted).toBeGreaterThan(0);
  });

  it("records validation failures in workflow diagnostics", () => {
    const eventContext = createAppEventNotificationContext();
    createAppActivityTimelineContext({ eventBus: eventContext.eventBus });

    const workflow = new MatterWorkflowService({
      repository: getSharedMatterRepository(),
      eventBus: eventContext.eventBus,
    });

    const result = workflow.createMatter(createEmptyMatterFormValues());
    expect(result.ok).toBe(false);
    expect(result.validationErrors?.title).toBeDefined();
    expect(getMatterWorkflowDiagnostics().getSummary().validationFailures).toBe(1);
  });
});
