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
import { SEED_DOCUMENTS } from "./documents/seed-documents";
import { SEED_MATTERS } from "./matters/seed-matters";
import { SEED_TASKS } from "./tasks/seed-tasks";
import { SEED_TIME_ATTORNEYS } from "./time/seed-attorneys";
import {
  TimeEntryWorkflowService,
  createEmptyTimeEntryFormValues,
  getTimeEntryWorkflowDiagnostics,
  getSharedTimeEntryRepository,
  timeEntryDetailRoute,
  timeEntryListRoute,
  registerTimeEntryNavigationHandler,
  resetTimeEntryWorkflowDiagnostics,
  resetSharedTimeEntryRepository,
  unregisterTimeEntryNavigationHandler,
} from "./time";
import { resetLegalTimeEventEnvelopeCounter } from "./publish-legal-time-event";

const workspaceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

describe("time entry workflow integration", () => {
  beforeEach(() => {
    resetSharedTimeEntryRepository();
    resetTimeEntryWorkflowDiagnostics();
    resetLegalTimeEventEnvelopeCounter();
    unregisterTimeEntryNavigationHandler();
  });

  it("runs create → open → edit → delete with events, notifications, activities, and relationships", async () => {
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
    registerTimeEntryNavigationHandler((path) => navigated.push(path));

    const bundle = createAppActionExecutorBundle({
      dto: actionBootstrap.dto,
      permissionAdapter: createAllowAllWorkbenchPermissionAdapter(),
      publish: () => workbenchRequestOk(),
      eventBus: eventContext.eventBus,
    });

    const matter = SEED_MATTERS[0]!;
    const task = SEED_TASKS[0]!;
    const document = SEED_DOCUMENTS[0]!;
    const attorney = SEED_TIME_ATTORNEYS[0]!;

    const created = bundle.timeEntryWorkflow.createTimeEntry({
      ...createEmptyTimeEntryFormValues(matter.matterId),
      narrative: "Workflow validation time entry",
      userId: attorney.userId,
      durationMinutes: "60",
      taskId: task.taskId,
      documentId: document.documentId,
    });

    expect(created.ok).toBe(true);
    expect(created.eventId).toBe("legal.time.created");
    expect(created.timeEntry?.matterId).toBe(matter.matterId);
    expect(created.timeEntry?.taskId).toBe(task.taskId);
    expect(created.timeEntry?.documentId).toBe(document.documentId);
    expect(eventContext.notificationService.getUnreadCount()).toBeGreaterThan(0);
    expect(activityContext.service.listActivities().length).toBeGreaterThan(0);

    const openResult = bundle.actionExecutor.executeSync("legal.time.open", {
      actor: "user",
      args: { timeEntryId: created.timeEntry!.timeEntryId },
    });
    expect(openResult.ok).toBe(true);
    expect(navigated).toContain(timeEntryDetailRoute(created.timeEntry!.timeEntryId));

    const editNav = bundle.actionExecutor.executeSync("legal.time.edit", {
      actor: "user",
      args: { timeEntryId: created.timeEntry!.timeEntryId },
    });
    expect(editNav.ok).toBe(true);

    const updated = bundle.timeEntryWorkflow.updateTimeEntry(
      created.timeEntry!.timeEntryId,
      {
        ...createEmptyTimeEntryFormValues(matter.matterId),
        narrative: "Workflow validation time entry (updated)",
        userId: attorney.userId,
        durationMinutes: "75",
        taskId: task.taskId,
        documentId: document.documentId,
      },
    );
    expect(updated.ok).toBe(true);
    expect(updated.eventId).toBe("legal.time.updated");

    const searchResult = bundle.actionExecutor.executeSync("legal.time.search", {
      actor: "user",
      args: { query: "Workflow" },
    });
    expect(searchResult.ok).toBe(true);
    expect(navigated.some((route) => route.startsWith(timeEntryListRoute()))).toBe(
      true,
    );

    const deleteResult = bundle.actionExecutor.executeSync("legal.time.delete", {
      actor: "user",
      args: { timeEntryId: created.timeEntry!.timeEntryId },
    });
    expect(deleteResult.ok).toBe(true);
    expect(
      getSharedTimeEntryRepository().getById(created.timeEntry!.timeEntryId),
    ).toBeUndefined();
    expect(navigated).toContain(timeEntryListRoute());

    const createNav = bundle.actionExecutor.executeSync("legal.time.create", {
      actor: "user",
      args: { matterId: matter.matterId },
    });
    expect(createNav.ok).toBe(true);
    expect(navigated.some((route) => route.includes("matterId"))).toBe(true);

    const summary = getTimeEntryWorkflowDiagnostics().getSummary();
    expect(summary.repositoryMutations).toBeGreaterThan(0);
    expect(summary.eventsRaised).toBeGreaterThan(0);
    expect(summary.commandsExecuted).toBeGreaterThan(0);
  });

  it("records validation failures when matter is missing", () => {
    const eventContext = createAppEventNotificationContext();
    createAppActivityTimelineContext({ eventBus: eventContext.eventBus });

    const workflow = new TimeEntryWorkflowService({
      repository: getSharedTimeEntryRepository(),
      eventBus: eventContext.eventBus,
    });

    const result = workflow.createTimeEntry(createEmptyTimeEntryFormValues());
    expect(result.ok).toBe(false);
    expect(result.validationErrors?.matterId).toBeDefined();
    expect(getTimeEntryWorkflowDiagnostics().getSummary().validationFailures).toBe(1);
  });

  it("records validation failures when task does not belong to matter", () => {
    const eventContext = createAppEventNotificationContext();
    createAppActivityTimelineContext({ eventBus: eventContext.eventBus });

    const workflow = new TimeEntryWorkflowService({
      repository: getSharedTimeEntryRepository(),
      eventBus: eventContext.eventBus,
    });

    const matter = SEED_MATTERS[1]!;
    const foreignTask = SEED_TASKS[0]!;

    const result = workflow.createTimeEntry({
      ...createEmptyTimeEntryFormValues(matter.matterId),
      narrative: "Invalid task link",
      userId: SEED_TIME_ATTORNEYS[0]!.userId,
      durationMinutes: "30",
      taskId: foreignTask.taskId,
    });

    expect(result.ok).toBe(false);
    expect(result.validationErrors?.taskId).toBeDefined();
  });
});
