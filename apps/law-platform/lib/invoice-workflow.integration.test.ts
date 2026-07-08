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
import {
  composeInvoiceDetail,
  createEmptyInvoiceFormValues,
  getInvoiceWorkflowDiagnostics,
  getSharedInvoiceRepository,
  invoiceDetailRoute,
  invoiceListRoute,
  registerInvoiceNavigationHandler,
  resetInvoiceWorkflowDiagnostics,
  resetSharedInvoiceRepository,
  unregisterInvoiceNavigationHandler,
} from "./billing";
import { registerLegalSearchKnowledgeProviders } from "./knowledge/register-legal-search-knowledge";
import { SEED_MATTERS } from "./matters/seed-matters";
import { SEED_TIME_ENTRIES } from "./time/seed-time-entries";
import { resetLegalBillingEventEnvelopeCounter } from "./publish-legal-billing-event";

const workspaceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

describe("invoice workflow integration", () => {
  beforeEach(() => {
    resetSharedInvoiceRepository();
    resetInvoiceWorkflowDiagnostics();
    resetLegalBillingEventEnvelopeCounter();
    unregisterInvoiceNavigationHandler();
  });

  it("runs create → open → edit → cancel → mark paid with aggregation, search, events, notifications, and activities", async () => {
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
    registerInvoiceNavigationHandler((route) => navigated.push(route));

    const bundle = createAppActionExecutorBundle({
      dto: actionBootstrap.dto,
      permissionAdapter: createAllowAllWorkbenchPermissionAdapter(),
      publish: () => workbenchRequestOk(),
      eventBus: eventContext.eventBus,
    });

    const matter = SEED_MATTERS[0]!;
    const timeEntry = SEED_TIME_ENTRIES.find(
      (entry) => entry.matterId === matter.matterId,
    )!;

    const created = bundle.invoiceWorkflow.createInvoice({
      ...createEmptyInvoiceFormValues(matter.matterId, matter.clientId),
      timeEntryIds: timeEntry.timeEntryId,
      notes: "Integration test invoice",
    });

    expect(created.ok).toBe(true);
    expect(created.eventId).toBe("legal.invoice.created");
    expect(created.composition?.timeEntries.length).toBeGreaterThan(0);
    expect(created.composition!.total).toBeGreaterThan(0);
    expect(eventContext.notificationService.getUnreadCount()).toBeGreaterThan(0);
    expect(activityContext.service.listActivities().length).toBeGreaterThan(0);

    const invoiceId = created.invoice!.invoiceId;

    const openResult = bundle.actionExecutor.executeSync("legal.invoice.open", {
      actor: "user",
      args: { invoiceId },
    });
    expect(openResult.ok).toBe(true);
    expect(navigated).toContain(invoiceDetailRoute(invoiceId));

    const updated = bundle.invoiceWorkflow.updateInvoice(invoiceId, {
      ...createEmptyInvoiceFormValues(matter.matterId, matter.clientId),
      timeEntryIds: timeEntry.timeEntryId,
      notes: "Updated integration invoice",
      expensesPlaceholder: "25",
    });
    expect(updated.ok).toBe(true);
    expect(updated.eventId).toBe("legal.invoice.updated");
    expect(composeInvoiceDetail(updated.invoice!).expensesPlaceholder).toBe(25);

    const searchResult = bundle.actionExecutor.executeSync("legal.invoice.search", {
      actor: "user",
      args: { query: created.invoice!.invoiceReference },
    });
    expect(searchResult.ok).toBe(true);
    expect(navigated.some((route) => route.startsWith(invoiceListRoute()))).toBe(true);

    const cancelled = bundle.invoiceWorkflow.cancelInvoice(invoiceId);
    expect(cancelled.ok).toBe(true);
    expect(cancelled.eventId).toBe("legal.invoice.cancelled");

    const recreated = bundle.invoiceWorkflow.createInvoice({
      ...createEmptyInvoiceFormValues(matter.matterId, matter.clientId),
      timeEntryIds: timeEntry.timeEntryId,
    });
    const paidTarget = recreated.invoice!.invoiceId;
    const paid = bundle.invoiceWorkflow.markInvoicePaid(paidTarget);
    expect(paid.ok).toBe(true);
    expect(paid.eventId).toBe("legal.invoice.paid");

    const knowledgeBootstrap = bootstrapKnowledgeRegistry();
    registerLegalSearchKnowledgeProviders(knowledgeBootstrap.registry);
    const provider = knowledgeBootstrap.registry.getProvider("legal.invoices.search");
    expect(provider).toBeDefined();

    const summary = getInvoiceWorkflowDiagnostics().getSummary();
    expect(summary.eventsRaised).toBeGreaterThan(0);
    expect(summary.commandsExecuted).toBeGreaterThan(0);
    expect(getSharedInvoiceRepository().count()).toBeGreaterThanOrEqual(20);
  });
});
