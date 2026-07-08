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
import { SEED_MATTERS } from "./matters/seed-matters";
import {
  DocumentWorkflowService,
  createEmptyDocumentFormValues,
  getDocumentWorkflowDiagnostics,
  getSharedDocumentRepository,
  documentDetailRoute,
  documentListRoute,
  registerDocumentNavigationHandler,
  resetDocumentWorkflowDiagnostics,
  resetSharedDocumentRepository,
  unregisterDocumentNavigationHandler,
} from "./documents";
import { resetLegalDocumentEventEnvelopeCounter } from "./publish-legal-document-event";

const workspaceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

describe("document workflow integration", () => {
  beforeEach(() => {
    resetSharedDocumentRepository();
    resetDocumentWorkflowDiagnostics();
    resetLegalDocumentEventEnvelopeCounter();
    unregisterDocumentNavigationHandler();
  });

  it("runs create → open → search → archive with events, notifications, activities, and matter relationship", async () => {
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
    registerDocumentNavigationHandler((path) => navigated.push(path));

    const bundle = createAppActionExecutorBundle({
      dto: actionBootstrap.dto,
      permissionAdapter: createAllowAllWorkbenchPermissionAdapter(),
      publish: () => workbenchRequestOk(),
      eventBus: eventContext.eventBus,
    });

    const matter = SEED_MATTERS[0]!;
    const created = bundle.documentWorkflow.createDocument({
      ...createEmptyDocumentFormValues(matter.matterId),
      title: "Workflow Validation Document",
      matterId: matter.matterId,
    });

    expect(created.ok).toBe(true);
    expect(created.eventId).toBe("legal.document.created");
    expect(created.document?.matterId).toBe(matter.matterId);
    expect(eventContext.notificationService.getUnreadCount()).toBeGreaterThan(0);
    expect(activityContext.service.listActivities().length).toBeGreaterThan(0);

    const openResult = bundle.actionExecutor.executeSync("legal.document.open", {
      actor: "user",
      args: { documentId: created.document!.documentId },
    });
    expect(openResult.ok).toBe(true);
    expect(navigated).toContain(documentDetailRoute(created.document!.documentId));

    const searchResult = bundle.actionExecutor.executeSync("legal.document.search", {
      actor: "user",
      args: { query: "Workflow" },
    });
    expect(searchResult.ok).toBe(true);
    expect(navigated.some((route) => route.startsWith(documentListRoute()))).toBe(true);

    const archiveResult = bundle.actionExecutor.executeSync("legal.document.archive", {
      actor: "user",
      args: { documentId: created.document!.documentId },
    });
    expect(archiveResult.ok).toBe(true);
    expect(
      getSharedDocumentRepository().getById(created.document!.documentId),
    ).toBeUndefined();
    expect(navigated).toContain(documentListRoute());

    const createNav = bundle.actionExecutor.executeSync("legal.document.create", {
      actor: "user",
      args: { matterId: matter.matterId },
    });
    expect(createNav.ok).toBe(true);
    expect(navigated.some((route) => route.includes("matterId"))).toBe(true);

    const summary = getDocumentWorkflowDiagnostics().getSummary();
    expect(summary.repositoryMutations).toBeGreaterThan(0);
    expect(summary.eventsRaised).toBeGreaterThan(0);
    expect(summary.commandsExecuted).toBeGreaterThan(0);
  });

  it("records validation failures when matter is missing", () => {
    const eventContext = createAppEventNotificationContext();
    createAppActivityTimelineContext({ eventBus: eventContext.eventBus });

    const workflow = new DocumentWorkflowService({
      repository: getSharedDocumentRepository(),
      eventBus: eventContext.eventBus,
    });

    const result = workflow.createDocument(createEmptyDocumentFormValues());
    expect(result.ok).toBe(false);
    expect(result.validationErrors?.matterId).toBeDefined();
    expect(getDocumentWorkflowDiagnostics().getSummary().validationFailures).toBe(1);
  });
});
