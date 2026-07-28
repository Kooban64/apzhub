import path from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, expect, it } from "vitest";

import {
  bootstrapActionRegistry,
  createEmptyActionRegistryDto,
  mapPlatformCapabilitiesToActionRecords,
} from "@apzhub/command-framework/server";
import {
  bootstrapKnowledgeRegistry,
  mapKnowledgeSourceRegistryDto,
} from "@apzhub/knowledge-discovery-framework/server";
import { createAllowAllWorkbenchPermissionAdapter } from "@apzhub/workbench-framework";
import { workbenchRequestOk } from "@apzhub/workbench-framework";
import { createEmptyWorkbenchRegistryDto } from "@apzhub/workbench-framework/server";
import { Runtime } from "@apzhub/platform-runtime/server";

import { createAppActionExecutorBundle } from "./create-app-action-executor";
import { createAppActivityTimelineContext } from "./create-app-activity-timeline-context";
import { createAppEventNotificationContext } from "./create-app-event-notification-context";
import { createAppKnowledgeService } from "./create-app-knowledge-service";
import {
  createEmptyClientFormValues,
  clientDetailRoute,
  registerClientNavigationHandler,
} from "./clients";
import {
  composeMatterWorkspaceSnapshot,
  createEmptyMatterFormValues,
  matterDetailRoute,
  matterWorkspaceRoute,
  registerMatterNavigationHandler,
} from "./matters";
import {
  createEmptyDocumentFormValues,
  registerDocumentNavigationHandler,
} from "./documents";
import { createEmptyTaskFormValues, registerTaskNavigationHandler } from "./tasks";
import {
  createEmptyCalendarEventFormValues,
  registerCalendarEventNavigationHandler,
} from "./calendar";
import {
  createEmptyTimeEntryFormValues,
  registerTimeEntryNavigationHandler,
  SEED_TIME_ATTORNEYS,
} from "./time";
import {
  createEmptyInvoiceFormValues,
  registerInvoiceNavigationHandler,
} from "./billing";
import {
  LegalSearchWorkflowService,
  registerLegalSearchNavigationHandler,
} from "./search";
import { registerLegalSearchKnowledgeProviders } from "./knowledge/register-legal-search-knowledge";
import { LEGAL_ENTITY_SEARCH_SOURCE_IDS } from "./knowledge/legal-search-source-ids";
import { registerLawClientKnowledge } from "./register-law-client-knowledge";
import { registerLawMatterKnowledge } from "./register-law-matter-knowledge";
import { registerLawDocumentKnowledge } from "./register-law-document-knowledge";
import { registerLawTaskKnowledge } from "./register-law-task-knowledge";
import { registerLawCalendarKnowledge } from "./register-law-calendar-knowledge";
import { registerLawTimeKnowledge } from "./register-law-time-knowledge";
import { registerLawBillingKnowledge } from "./register-law-billing-knowledge";
import { registerLawSearchKnowledge } from "./register-law-search-knowledge";
import {
  MATTER_LIFECYCLE_SEARCH_TAG,
  buildMatterLifecycleExecutionReport,
  resetMatterLifecycleValidationState,
  type MatterLifecycleStepReport,
} from "./matter-lifecycle-report";
import {
  createLawPersistenceContext,
  DEFAULT_LAW_TENANT_ID,
  resetLawPersistenceScope,
  setSessionLawPersistenceContext,
} from "./persistence";

const workspaceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

const HELP_SOURCE_IDS = [
  "legal.help.clients.list",
  "legal.help.matters.list",
  "legal.help.matter.workspace",
  "legal.help.documents.list",
  "legal.help.tasks.list",
  "legal.help.calendar.list",
  "legal.help.time.list",
  "legal.help.billing.list",
  "legal.help.search.list",
] as const;

function createLifecycleKnowledgeContext() {
  const bootstrap = bootstrapKnowledgeRegistry();
  registerLawClientKnowledge(bootstrap.registry);
  registerLawMatterKnowledge(bootstrap.registry);
  registerLawDocumentKnowledge(bootstrap.registry);
  registerLawTaskKnowledge(bootstrap.registry);
  registerLawCalendarKnowledge(bootstrap.registry);
  registerLawTimeKnowledge(bootstrap.registry);
  registerLawBillingKnowledge(bootstrap.registry);
  registerLawSearchKnowledge(bootstrap.registry);
  registerLegalSearchKnowledgeProviders(bootstrap.registry);

  const knowledgeService = createAppKnowledgeService({
    knowledgeDto: mapKnowledgeSourceRegistryDto(bootstrap.registry),
    actionDto: createEmptyActionRegistryDto(),
    workbenchDto: createEmptyWorkbenchRegistryDto(),
    registryReady: true,
  });

  return { knowledgeService, registry: bootstrap.registry };
}

describe("matter lifecycle end-to-end validation", () => {
  beforeEach(() => {
    resetLawPersistenceScope();
    setSessionLawPersistenceContext(
      createLawPersistenceContext({ tenantId: DEFAULT_LAW_TENANT_ID }),
    );
    resetMatterLifecycleValidationState();
  });

  it("executes the complete matter lifecycle with commands, events, notifications, activities, search, and workspace validation", async () => {
    const startedAt = performance.now();
    const steps: MatterLifecycleStepReport[] = [];
    const warnings: string[] = [];
    const navigated: string[] = [];

    await Runtime.bootstrap({ workspaceRoot, failFast: false });
    const actionBootstrap = bootstrapActionRegistry({
      capabilityRecords: mapPlatformCapabilitiesToActionRecords(
        Runtime.registry().findAll(),
      ),
    });

    const eventContext = createAppEventNotificationContext();
    const activityContext = createAppActivityTimelineContext({
      eventBus: eventContext.eventBus,
    });
    const { knowledgeService, registry: knowledgeRegistry } =
      createLifecycleKnowledgeContext();
    const searchWorkflow = new LegalSearchWorkflowService({
      knowledgeService,
      eventBus: eventContext.eventBus,
    });

    registerClientNavigationHandler((route) => navigated.push(route));
    registerMatterNavigationHandler((route) => navigated.push(route));
    registerDocumentNavigationHandler((route) => navigated.push(route));
    registerTaskNavigationHandler((route) => navigated.push(route));
    registerCalendarEventNavigationHandler((route) => navigated.push(route));
    registerTimeEntryNavigationHandler((route) => navigated.push(route));
    registerInvoiceNavigationHandler((route) => navigated.push(route));
    registerLegalSearchNavigationHandler((route) => navigated.push(route));

    const bundle = createAppActionExecutorBundle({
      dto: actionBootstrap.dto,
      permissionAdapter: createAllowAllWorkbenchPermissionAdapter(),
      publish: () => workbenchRequestOk(),
      eventBus: eventContext.eventBus,
    });

    const attorney = SEED_TIME_ATTORNEYS[0]!;
    let notificationBaseline = eventContext.notificationService.getUnreadCount();
    let activityBaseline = activityContext.service.listActivities().length;

    function recordStep(
      step: string,
      result: { ok: boolean; eventId?: string; run?: { durationMs: number } },
      commandId?: string,
      workspace?: ReturnType<typeof composeMatterWorkspaceSnapshot>,
    ): void {
      const notificationsAfter = eventContext.notificationService.getUnreadCount();
      const activitiesAfter = activityContext.service.listActivities().length;

      if (result.ok && result.eventId) {
        if (notificationsAfter <= notificationBaseline) {
          warnings.push(`${step}: notification count did not increase`);
        }
        if (activitiesAfter <= activityBaseline) {
          warnings.push(`${step}: activity count did not increase`);
        }
      }

      steps.push({
        step,
        ok: result.ok,
        commandId,
        eventId: result.eventId,
        durationMs: result.run?.durationMs ?? 0,
        notificationsAfter,
        activitiesAfter,
        workspaceDocumentCount: workspace?.relatedEntityCounts.documents,
        workspaceTaskCount: workspace?.relatedEntityCounts.tasks,
        workspaceTimeCount: workspace?.relatedEntityCounts.timeEntries,
        workspaceCalendarCount: workspace?.relatedEntityCounts.calendarEvents,
        workspaceInvoiceCount: workspace?.relatedEntityCounts.invoices,
        warnings: [],
      });

      notificationBaseline = notificationsAfter;
      activityBaseline = activitiesAfter;
    }

    for (const sourceId of HELP_SOURCE_IDS) {
      expect(knowledgeRegistry.hasSource(sourceId), `help source ${sourceId}`).toBe(
        true,
      );
    }

    for (const sourceId of LEGAL_ENTITY_SEARCH_SOURCE_IDS) {
      expect(
        knowledgeRegistry.getProvider(sourceId),
        `search provider ${sourceId}`,
      ).toBeDefined();
    }

    const stepStart = performance.now();
    const clientCreated = bundle.clientWorkflow.createClient({
      ...createEmptyClientFormValues(),
      displayName: `Lifecycle Client ${MATTER_LIFECYCLE_SEARCH_TAG}`,
      tags: MATTER_LIFECYCLE_SEARCH_TAG,
    });
    expect(clientCreated.ok).toBe(true);
    recordStep("Create Client", clientCreated, "legal.client.create");

    const clientOpen = bundle.actionExecutor.executeSync("legal.client.open", {
      actor: "user",
      args: { clientId: clientCreated.client!.clientId },
    });
    expect(clientOpen.ok).toBe(true);
    expect(navigated).toContain(clientDetailRoute(clientCreated.client!.clientId));

    const matterCreated = bundle.matterWorkflow.createMatter({
      ...createEmptyMatterFormValues(),
      title: `Lifecycle Matter ${MATTER_LIFECYCLE_SEARCH_TAG}`,
      clientId: clientCreated.client!.clientId,
      leadAttorneyId: attorney.userId,
      tags: MATTER_LIFECYCLE_SEARCH_TAG,
    });
    expect(matterCreated.ok).toBe(true);
    recordStep("Create Matter", matterCreated, "legal.matter.create");

    const matter = matterCreated.matter!;
    let workspace = composeMatterWorkspaceSnapshot(matter);

    const workspaceOpened = bundle.actionExecutor.executeSync(
      "legal.matter.workspace.open",
      {
        actor: "user",
        args: { matterId: matter.matterId },
      },
    );
    expect(workspaceOpened.ok).toBe(true);
    expect(navigated).toContain(matterWorkspaceRoute(matter.matterId));
    recordStep(
      "Open Matter Workspace",
      { ok: true, eventId: "legal.matter.workspace.opened", run: { durationMs: 0 } },
      "legal.matter.workspace.open",
      workspace,
    );

    const matterOpen = bundle.actionExecutor.executeSync("legal.matter.open", {
      actor: "user",
      args: { matterId: matter.matterId },
    });
    expect(matterOpen.ok).toBe(true);
    expect(navigated).toContain(matterDetailRoute(matter.matterId));

    const documentCreated = bundle.documentWorkflow.createDocument({
      ...createEmptyDocumentFormValues(matter.matterId),
      title: `Lifecycle Document ${MATTER_LIFECYCLE_SEARCH_TAG}`,
      fileName: "lifecycle-brief.pdf",
      sizeBytes: "2048",
    });
    expect(documentCreated.ok).toBe(true);
    workspace = composeMatterWorkspaceSnapshot(matter);
    expect(workspace.relatedEntityCounts.documents).toBeGreaterThan(0);
    recordStep("Upload Document", documentCreated, "legal.document.create", workspace);

    const documentOpen = bundle.actionExecutor.executeSync("legal.document.open", {
      actor: "user",
      args: { documentId: documentCreated.document!.documentId },
    });
    expect(documentOpen.ok).toBe(true);

    const taskCreated = bundle.taskWorkflow.createTask({
      ...createEmptyTaskFormValues(matter.matterId),
      title: `Lifecycle Task ${MATTER_LIFECYCLE_SEARCH_TAG}`,
      assigneeUserId: attorney.userId,
      documentId: documentCreated.document!.documentId,
    });
    expect(taskCreated.ok).toBe(true);
    workspace = composeMatterWorkspaceSnapshot(matter);
    expect(workspace.relatedEntityCounts.tasks).toBeGreaterThan(0);
    recordStep("Create Task", taskCreated, "legal.task.create", workspace);

    const taskOpen = bundle.actionExecutor.executeSync("legal.task.open", {
      actor: "user",
      args: { taskId: taskCreated.task!.taskId },
    });
    expect(taskOpen.ok).toBe(true);

    const calendarCreated = bundle.calendarEventWorkflow.createCalendarEvent({
      ...createEmptyCalendarEventFormValues(matter.matterId),
      title: `Lifecycle Hearing ${MATTER_LIFECYCLE_SEARCH_TAG}`,
      eventType: "hearing",
      clientId: clientCreated.client!.clientId,
      ownerUserId: attorney.userId,
      taskId: taskCreated.task!.taskId,
    });
    expect(calendarCreated.ok).toBe(true);
    workspace = composeMatterWorkspaceSnapshot(matter);
    expect(workspace.relatedEntityCounts.calendarEvents).toBeGreaterThan(0);
    recordStep(
      "Schedule Calendar Event",
      calendarCreated,
      "legal.calendar.create",
      workspace,
    );

    const calendarOpen = bundle.actionExecutor.executeSync("legal.calendar.open", {
      actor: "user",
      args: { calendarEventId: calendarCreated.calendarEvent!.calendarEventId },
    });
    expect(calendarOpen.ok).toBe(true);

    const timeCreated = bundle.timeEntryWorkflow.createTimeEntry({
      ...createEmptyTimeEntryFormValues(matter.matterId),
      narrative: `Lifecycle time entry ${MATTER_LIFECYCLE_SEARCH_TAG}`,
      userId: attorney.userId,
      durationMinutes: "90",
      taskId: taskCreated.task!.taskId,
      documentId: documentCreated.document!.documentId,
    });
    expect(timeCreated.ok).toBe(true);
    workspace = composeMatterWorkspaceSnapshot(matter);
    expect(workspace.relatedEntityCounts.timeEntries).toBeGreaterThan(0);
    recordStep("Record Time Entry", timeCreated, "legal.time.create", workspace);

    const timeOpen = bundle.actionExecutor.executeSync("legal.time.open", {
      actor: "user",
      args: { timeEntryId: timeCreated.timeEntry!.timeEntryId },
    });
    expect(timeOpen.ok).toBe(true);

    const invoiceCreated = bundle.invoiceWorkflow.createInvoice({
      ...createEmptyInvoiceFormValues(matter.matterId, clientCreated.client!.clientId),
      timeEntryIds: timeCreated.timeEntry!.timeEntryId,
      notes: `Lifecycle invoice ${MATTER_LIFECYCLE_SEARCH_TAG}`,
    });
    expect(invoiceCreated.ok).toBe(true);
    workspace = composeMatterWorkspaceSnapshot(matter);
    expect(workspace.billing.invoiceTotal).not.toBe("$0.00");
    recordStep("Generate Invoice", invoiceCreated, "legal.invoice.create", workspace);

    const invoiceOpen = bundle.actionExecutor.executeSync("legal.invoice.open", {
      actor: "user",
      args: { invoiceId: invoiceCreated.invoice!.invoiceId },
    });
    expect(invoiceOpen.ok).toBe(true);

    const markPaid = bundle.invoiceWorkflow.markInvoicePaid(
      invoiceCreated.invoice!.invoiceId,
    );
    expect(markPaid.ok).toBe(true);
    expect(markPaid.eventId).toBe("legal.invoice.paid");
    workspace = composeMatterWorkspaceSnapshot(matter);
    recordStep("Mark Invoice Paid", markPaid, "legal.invoice.mark-paid", workspace);

    const workspaceRefreshed = bundle.matterWorkflow.refreshMatterWorkspace(
      matter.matterId,
    );
    expect(workspaceRefreshed.ok).toBe(true);
    recordStep(
      "Refresh Matter Workspace",
      workspaceRefreshed,
      "legal.matter.workspace.refresh",
      workspace,
    );

    const searchExecuted = await searchWorkflow.executeSearch(
      MATTER_LIFECYCLE_SEARCH_TAG,
    );
    expect(searchExecuted.ok).toBe(true);
    expect(searchExecuted.eventId).toBe("legal.search.executed");
    const entityTypes = new Set(
      searchExecuted.results.map((result) => result.entityType),
    );
    expect(entityTypes.has("client")).toBe(true);
    expect(entityTypes.has("matter")).toBe(true);
    expect(entityTypes.has("document")).toBe(true);
    expect(entityTypes.has("task")).toBe(true);
    expect(entityTypes.has("time_entry")).toBe(true);
    expect(entityTypes.has("calendar_event")).toBe(true);
    expect(entityTypes.has("invoice")).toBe(true);
    recordStep(
      "Unified Legal Search",
      {
        ok: searchExecuted.ok,
        eventId: searchExecuted.eventId,
        run: { durationMs: performance.now() - stepStart },
      },
      "legal.search.execute",
    );

    const archiveResult = bundle.actionExecutor.executeSync("legal.matter.archive", {
      actor: "user",
      args: { matterId: matter.matterId },
    });
    expect(archiveResult.ok).toBe(true);
    recordStep(
      "Archive Matter",
      { ok: true, eventId: "legal.matter.archived" },
      "legal.matter.archive",
    );

    const completedAt = performance.now();
    const report = buildMatterLifecycleExecutionReport({
      startedAt,
      completedAt,
      steps,
      knowledgeProvidersExercised: [...HELP_SOURCE_IDS],
      searchProvidersExercised: [...LEGAL_ENTITY_SEARCH_SOURCE_IDS],
      navigationRoutes: navigated,
      notificationsGenerated: eventContext.notificationService.getUnreadCount(),
      activitiesGenerated: activityContext.service.listActivities().length,
      warnings,
    });

    expect(report.steps.every((step) => step.ok)).toBe(true);
    expect(report.validationFailures).toBe(0);
    expect(report.commandsExecuted).toBeGreaterThan(10);
    expect(report.eventsPublished).toBeGreaterThan(10);
    expect(report.notificationsGenerated).toBeGreaterThan(0);
    expect(report.activitiesGenerated).toBeGreaterThan(0);
    expect(report.searchProvidersExercised.length).toBe(8);
    expect(report.totalDurationMs).toBeGreaterThan(0);
    expect(report.repositoryMutations.matters).toBeGreaterThan(0);
    expect(report.repositoryMutations.invoices).toBeGreaterThan(0);
  });
});
