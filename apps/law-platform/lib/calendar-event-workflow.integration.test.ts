import path from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, expect, it } from "vitest";

import {
  bootstrapActionRegistry,
  mapPlatformCapabilitiesToActionRecords,
} from "@apzhub/command-framework/server";
import { bootstrapKnowledgeRegistry } from "@apzhub/knowledge-discovery-framework/server";
import { createAllowAllWorkbenchPermissionAdapter } from "@apzhub/workbench-framework";
import { workbenchRequestOk } from "@apzhub/workbench-framework";
import { Runtime } from "@apzhub/platform-runtime/server";

import { createAppActionExecutorBundle } from "./create-app-action-executor";
import { createAppActivityTimelineContext } from "./create-app-activity-timeline-context";
import { createAppEventNotificationContext } from "./create-app-event-notification-context";
import { SEED_DOCUMENTS } from "./documents/seed-documents";
import { SEED_MATTERS } from "./matters/seed-matters";
import { SEED_TASKS } from "./tasks/seed-tasks";
import { SEED_TIME_ENTRIES } from "./time/seed-time-entries";
import { SEED_TIME_ATTORNEYS } from "./time/seed-attorneys";
import {
  CalendarEventWorkflowService,
  createEmptyCalendarEventFormValues,
  getCalendarEventWorkflowDiagnostics,
  getSharedCalendarEventRepository,
  calendarEventDetailRoute,
  calendarEventListRoute,
  registerCalendarEventNavigationHandler,
  resetCalendarEventWorkflowDiagnostics,
  resetSharedCalendarEventRepository,
  unregisterCalendarEventNavigationHandler,
} from "./calendar";
import { registerLegalSearchKnowledgeProviders } from "./knowledge/register-legal-search-knowledge";
import { resetLegalCalendarEventEnvelopeCounter } from "./publish-legal-calendar-event";

const workspaceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

describe("calendar event workflow integration", () => {
  beforeEach(() => {
    resetSharedCalendarEventRepository();
    resetCalendarEventWorkflowDiagnostics();
    resetLegalCalendarEventEnvelopeCounter();
    unregisterCalendarEventNavigationHandler();
  });

  it("runs create → open → edit → cancel with events, notifications, activities, and relationships", async () => {
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
    registerCalendarEventNavigationHandler((path) => navigated.push(path));

    const bundle = createAppActionExecutorBundle({
      dto: actionBootstrap.dto,
      permissionAdapter: createAllowAllWorkbenchPermissionAdapter(),
      publish: () => workbenchRequestOk(),
      eventBus: eventContext.eventBus,
    });

    const matter = SEED_MATTERS[0]!;
    const task = SEED_TASKS[0]!;
    const document = SEED_DOCUMENTS[0]!;
    const timeEntry = SEED_TIME_ENTRIES[0]!;
    const attorney = SEED_TIME_ATTORNEYS[0]!;

    const created = bundle.calendarEventWorkflow.createCalendarEvent({
      ...createEmptyCalendarEventFormValues(matter.matterId),
      title: "Workflow validation calendar event",
      ownerUserId: attorney.userId,
      taskId: task.taskId,
      documentId: document.documentId,
      timeEntryId: timeEntry.timeEntryId,
    });

    expect(created.ok).toBe(true);
    expect(created.eventId).toBe("legal.calendar.created");
    expect(created.calendarEvent?.matterId).toBe(matter.matterId);
    expect(created.calendarEvent?.taskId).toBe(task.taskId);
    expect(created.calendarEvent?.documentId).toBe(document.documentId);
    expect(created.calendarEvent?.timeEntryId).toBe(timeEntry.timeEntryId);
    expect(eventContext.notificationService.getUnreadCount()).toBeGreaterThan(0);
    expect(activityContext.service.listActivities().length).toBeGreaterThan(0);

    const openResult = bundle.actionExecutor.executeSync("legal.calendar.open", {
      actor: "user",
      args: { calendarEventId: created.calendarEvent!.calendarEventId },
    });
    expect(openResult.ok).toBe(true);
    expect(navigated).toContain(
      calendarEventDetailRoute(created.calendarEvent!.calendarEventId),
    );

    const editNav = bundle.actionExecutor.executeSync("legal.calendar.edit", {
      actor: "user",
      args: { calendarEventId: created.calendarEvent!.calendarEventId },
    });
    expect(editNav.ok).toBe(true);

    const updated = bundle.calendarEventWorkflow.updateCalendarEvent(
      created.calendarEvent!.calendarEventId,
      {
        ...createEmptyCalendarEventFormValues(matter.matterId),
        title: "Workflow validation calendar event (updated)",
        ownerUserId: attorney.userId,
        taskId: task.taskId,
        documentId: document.documentId,
        timeEntryId: timeEntry.timeEntryId,
      },
    );
    expect(updated.ok).toBe(true);
    expect(updated.eventId).toBe("legal.calendar.updated");

    const searchResult = bundle.actionExecutor.executeSync("legal.calendar.search", {
      actor: "user",
      args: { query: "Workflow" },
    });
    expect(searchResult.ok).toBe(true);
    expect(navigated.some((route) => route.startsWith(calendarEventListRoute()))).toBe(
      true,
    );

    const filtered = getSharedCalendarEventRepository().list({
      matterId: matter.matterId,
      query: "Workflow",
    });
    expect(filtered.length).toBeGreaterThan(0);

    const cancelResult = bundle.actionExecutor.executeSync("legal.calendar.cancel", {
      actor: "user",
      args: { calendarEventId: created.calendarEvent!.calendarEventId },
    });
    expect(cancelResult.ok).toBe(true);
    expect(
      getSharedCalendarEventRepository().getById(created.calendarEvent!.calendarEventId)
        ?.calendarEventStatus,
    ).toBe("cancelled");
    expect(navigated).toContain(calendarEventListRoute());

    const createNav = bundle.actionExecutor.executeSync("legal.calendar.create", {
      actor: "user",
      args: { matterId: matter.matterId },
    });
    expect(createNav.ok).toBe(true);
    expect(navigated.some((route) => route.includes("matterId"))).toBe(true);

    const summary = getCalendarEventWorkflowDiagnostics().getSummary();
    expect(summary.repositoryMutations).toBeGreaterThan(0);
    expect(summary.eventsRaised).toBeGreaterThan(0);
    expect(summary.commandsExecuted).toBeGreaterThan(0);
  });

  it("includes calendar events in unified legal search providers", async () => {
    await Runtime.bootstrap({ workspaceRoot, failFast: false });
    const bootstrap = bootstrapKnowledgeRegistry();
    registerLegalSearchKnowledgeProviders(bootstrap.registry);

    const provider = bootstrap.registry.getProvider("legal.calendar.search");
    expect(provider).toBeDefined();

    const sample = getSharedCalendarEventRepository().list()[0]!;
    const result = await provider!.query({ text: sample.title.slice(0, 12) }, {});
    expect(result.status).toBe("ok");
    expect(result.documents.length).toBeGreaterThan(0);
    expect(result.documents[0]?.metadata?.entityType).toBe("calendar_event");
  });

  it("records validation failures when matter is missing", () => {
    const eventContext = createAppEventNotificationContext();
    createAppActivityTimelineContext({ eventBus: eventContext.eventBus });

    const workflow = new CalendarEventWorkflowService({
      repository: getSharedCalendarEventRepository(),
      eventBus: eventContext.eventBus,
    });

    const result = workflow.createCalendarEvent(createEmptyCalendarEventFormValues());
    expect(result.ok).toBe(false);
    expect(result.validationErrors?.matterId).toBeDefined();
    expect(getCalendarEventWorkflowDiagnostics().getSummary().validationFailures).toBe(
      1,
    );
  });
});
