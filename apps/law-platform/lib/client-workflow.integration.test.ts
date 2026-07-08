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
  ClientWorkflowService,
  clientCreateRoute,
  clientDetailRoute,
  clientListRoute,
  createEmptyClientFormValues,
  getClientWorkflowDiagnostics,
  getSharedClientRepository,
  registerClientNavigationHandler,
  resetClientWorkflowDiagnostics,
  resetSharedClientRepository,
  unregisterClientNavigationHandler,
} from "./clients";
import { resetLawPersistenceScope } from "./persistence";
import { resetLegalClientEventEnvelopeCounter } from "./publish-legal-client-event";

const workspaceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

describe("client workflow integration", () => {
  beforeEach(() => {
    resetSharedClientRepository();
    resetLawPersistenceScope();
    resetClientWorkflowDiagnostics();
    resetLegalClientEventEnvelopeCounter();
    unregisterClientNavigationHandler();
  });

  it("runs the full create → open → search → delete pipeline with events, notifications, and activities", async () => {
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
    registerClientNavigationHandler((path) => navigated.push(path));

    const bundle = createAppActionExecutorBundle({
      dto: actionBootstrap.dto,
      permissionAdapter: createAllowAllWorkbenchPermissionAdapter(),
      publish: () => workbenchRequestOk(),
      eventBus: eventContext.eventBus,
    });

    const created = bundle.clientWorkflow.createClient({
      ...createEmptyClientFormValues(),
      displayName: "Workflow Validation Client",
    });

    expect(created.ok).toBe(true);
    expect(created.eventId).toBe("legal.client.created");
    expect(created.client?.displayName).toBe("Workflow Validation Client");
    expect(eventContext.notificationService.getUnreadCount()).toBeGreaterThan(0);
    expect(activityContext.service.listActivities().length).toBeGreaterThan(0);

    const openResult = bundle.actionExecutor.executeSync("legal.client.open", {
      actor: "user",
      args: { clientId: created.client!.clientId },
    });
    expect(openResult.ok).toBe(true);
    expect(navigated).toContain(clientDetailRoute(created.client!.clientId));

    const searchResult = bundle.actionExecutor.executeSync("legal.client.search", {
      actor: "user",
      args: { query: "Workflow" },
    });
    expect(searchResult.ok).toBe(true);
    expect(navigated.some((route) => route.startsWith(clientListRoute()))).toBe(true);

    const deleteResult = bundle.actionExecutor.executeSync("legal.client.delete", {
      actor: "user",
      args: { clientId: created.client!.clientId },
    });
    expect(deleteResult.ok).toBe(true);
    expect(
      getSharedClientRepository().getById(created.client!.clientId),
    ).toBeUndefined();
    expect(navigated).toContain(clientListRoute());

    const createNav = bundle.actionExecutor.executeSync("legal.client.create", {
      actor: "user",
    });
    expect(createNav.ok).toBe(true);
    expect(navigated).toContain(clientCreateRoute());

    const summary = getClientWorkflowDiagnostics().getSummary();
    expect(summary.repositoryMutations).toBeGreaterThan(0);
    expect(summary.eventsRaised).toBeGreaterThan(0);
    expect(summary.commandsExecuted).toBeGreaterThan(0);
  });

  it("records validation failures in workflow diagnostics", () => {
    const eventContext = createAppEventNotificationContext();
    createAppActivityTimelineContext({ eventBus: eventContext.eventBus });

    const workflow = new ClientWorkflowService({
      repository: getSharedClientRepository(),
      eventBus: eventContext.eventBus,
    });

    const result = workflow.createClient(createEmptyClientFormValues());
    expect(result.ok).toBe(false);
    expect(result.validationErrors?.displayName).toBeDefined();
    expect(getClientWorkflowDiagnostics().getSummary().validationFailures).toBe(1);
  });
});
