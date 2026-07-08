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
import { SEED_TASK_ASSIGNEES } from "./tasks/seed-assignees";
import {
  TaskWorkflowService,
  createEmptyTaskFormValues,
  getTaskWorkflowDiagnostics,
  getSharedTaskRepository,
  taskDetailRoute,
  taskListRoute,
  registerTaskNavigationHandler,
  resetTaskWorkflowDiagnostics,
  resetSharedTaskRepository,
  unregisterTaskNavigationHandler,
} from "./tasks";
import { resetLegalTaskEventEnvelopeCounter } from "./publish-legal-task-event";

const workspaceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

describe("task workflow integration", () => {
  beforeEach(() => {
    resetSharedTaskRepository();
    resetTaskWorkflowDiagnostics();
    resetLegalTaskEventEnvelopeCounter();
    unregisterTaskNavigationHandler();
  });

  it("runs create → open → edit → complete → archive with events, notifications, activities, and relationships", async () => {
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
    registerTaskNavigationHandler((path) => navigated.push(path));

    const bundle = createAppActionExecutorBundle({
      dto: actionBootstrap.dto,
      permissionAdapter: createAllowAllWorkbenchPermissionAdapter(),
      publish: () => workbenchRequestOk(),
      eventBus: eventContext.eventBus,
    });

    const matter = SEED_MATTERS[0]!;
    const document = SEED_DOCUMENTS[0]!;
    const assignee = SEED_TASK_ASSIGNEES[0]!;

    const created = bundle.taskWorkflow.createTask({
      ...createEmptyTaskFormValues(matter.matterId),
      title: "Workflow Validation Task",
      assigneeUserId: assignee.assigneeUserId,
      documentId: document.documentId,
    });

    expect(created.ok).toBe(true);
    expect(created.eventId).toBe("legal.task.created");
    expect(created.task?.matterId).toBe(matter.matterId);
    expect(created.task?.documentId).toBe(document.documentId);
    expect(eventContext.notificationService.getUnreadCount()).toBeGreaterThan(0);
    expect(activityContext.service.listActivities().length).toBeGreaterThan(0);

    const openResult = bundle.actionExecutor.executeSync("legal.task.open", {
      actor: "user",
      args: { taskId: created.task!.taskId },
    });
    expect(openResult.ok).toBe(true);
    expect(navigated).toContain(taskDetailRoute(created.task!.taskId));

    const editNav = bundle.actionExecutor.executeSync("legal.task.edit", {
      actor: "user",
      args: { taskId: created.task!.taskId },
    });
    expect(editNav.ok).toBe(true);

    const updated = bundle.taskWorkflow.updateTask(created.task!.taskId, {
      ...createEmptyTaskFormValues(matter.matterId),
      title: "Workflow Validation Task (updated)",
      assigneeUserId: assignee.assigneeUserId,
      documentId: document.documentId,
    });
    expect(updated.ok).toBe(true);
    expect(updated.eventId).toBe("legal.task.updated");

    const searchResult = bundle.actionExecutor.executeSync("legal.task.search", {
      actor: "user",
      args: { query: "Workflow" },
    });
    expect(searchResult.ok).toBe(true);
    expect(navigated.some((route) => route.startsWith(taskListRoute()))).toBe(true);

    const completeResult = bundle.actionExecutor.executeSync("legal.task.complete", {
      actor: "user",
      args: { taskId: created.task!.taskId },
    });
    expect(completeResult.ok).toBe(true);
    expect(getSharedTaskRepository().getById(created.task!.taskId)?.taskStatus).toBe(
      "completed",
    );
    expect(
      getSharedTaskRepository().getById(created.task!.taskId)?.completedAt,
    ).toBeDefined();

    const archiveResult = bundle.actionExecutor.executeSync("legal.task.archive", {
      actor: "user",
      args: { taskId: created.task!.taskId },
    });
    expect(archiveResult.ok).toBe(true);
    expect(getSharedTaskRepository().getById(created.task!.taskId)).toBeUndefined();
    expect(navigated).toContain(taskListRoute());

    const createNav = bundle.actionExecutor.executeSync("legal.task.create", {
      actor: "user",
      args: { matterId: matter.matterId },
    });
    expect(createNav.ok).toBe(true);
    expect(navigated.some((route) => route.includes("matterId"))).toBe(true);

    const summary = getTaskWorkflowDiagnostics().getSummary();
    expect(summary.repositoryMutations).toBeGreaterThan(0);
    expect(summary.eventsRaised).toBeGreaterThan(0);
    expect(summary.commandsExecuted).toBeGreaterThan(0);
  });

  it("records validation failures when matter is missing", () => {
    const eventContext = createAppEventNotificationContext();
    createAppActivityTimelineContext({ eventBus: eventContext.eventBus });

    const workflow = new TaskWorkflowService({
      repository: getSharedTaskRepository(),
      eventBus: eventContext.eventBus,
    });

    const result = workflow.createTask(createEmptyTaskFormValues());
    expect(result.ok).toBe(false);
    expect(result.validationErrors?.matterId).toBeDefined();
    expect(getTaskWorkflowDiagnostics().getSummary().validationFailures).toBe(1);
  });

  it("records validation failures when document does not belong to matter", () => {
    const eventContext = createAppEventNotificationContext();
    createAppActivityTimelineContext({ eventBus: eventContext.eventBus });

    const workflow = new TaskWorkflowService({
      repository: getSharedTaskRepository(),
      eventBus: eventContext.eventBus,
    });

    const matter = SEED_MATTERS[1]!;
    const foreignDocument = SEED_DOCUMENTS[0]!;

    const result = workflow.createTask({
      ...createEmptyTaskFormValues(matter.matterId),
      title: "Invalid document link",
      assigneeUserId: SEED_TASK_ASSIGNEES[0]!.assigneeUserId,
      documentId: foreignDocument.documentId,
    });

    expect(result.ok).toBe(false);
    expect(result.validationErrors?.documentId).toBeDefined();
  });
});
