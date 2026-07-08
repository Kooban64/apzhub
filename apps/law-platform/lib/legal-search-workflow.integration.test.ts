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
import { registerLegalSearchKnowledgeProviders } from "./knowledge/register-legal-search-knowledge";
import { mapKnowledgeDocumentToSearchResult } from "./knowledge/map-legal-search-document";
import { resetLegalSearchEventEnvelopeCounter } from "./publish-legal-search-event";
import {
  LegalSearchWorkflowService,
  getLegalSearchWorkflowDiagnostics,
  legalSearchListRoute,
  mergeLegalSearchScope,
  registerLegalSearchNavigationHandler,
  resetLegalSearchRecentSearches,
  resetLegalSearchWorkflowDiagnostics,
  unregisterLegalSearchNavigationHandler,
} from "./search";
import { clientDetailRoute } from "./clients/client-routes";
import { SEED_CLIENTS } from "./clients/seed-clients";
import { SEED_MATTERS } from "./matters/seed-matters";

const workspaceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

function createIntegrationKnowledgeService() {
  const bootstrap = bootstrapKnowledgeRegistry();
  registerLegalSearchKnowledgeProviders(bootstrap.registry);
  const knowledgeDto = mapKnowledgeSourceRegistryDto(bootstrap.registry);

  return createAppKnowledgeService({
    knowledgeDto,
    actionDto: createEmptyActionRegistryDto(),
    workbenchDto: createEmptyWorkbenchRegistryDto(),
    registryReady: true,
  });
}

describe("legal search workflow integration", () => {
  beforeEach(() => {
    resetLegalSearchWorkflowDiagnostics();
    resetLegalSearchRecentSearches();
    resetLegalSearchEventEnvelopeCounter();
    unregisterLegalSearchNavigationHandler();
  });

  it("runs cross-module search with filtering, events, notifications, and activities", async () => {
    const eventContext = createAppEventNotificationContext();
    const activityContext = createAppActivityTimelineContext({
      eventBus: eventContext.eventBus,
    });
    const knowledgeService = createIntegrationKnowledgeService();
    const workflow = new LegalSearchWorkflowService({
      knowledgeService,
      eventBus: eventContext.eventBus,
    });

    const executed = await workflow.executeSearch("Harbourview");
    expect(executed.ok).toBe(true);
    expect(executed.eventId).toBe("legal.search.executed");
    expect(executed.results.length).toBeGreaterThan(1);

    const entityTypes = new Set(executed.results.map((result) => result.entityType));
    expect(entityTypes.has("client")).toBe(true);
    expect(entityTypes.has("matter")).toBe(true);

    const clientOnly = await workflow.executeSearch("Harbourview", "client");
    expect(clientOnly.results.every((result) => result.entityType === "client")).toBe(
      true,
    );
    expect(
      clientOnly.results.some((result) => result.title.includes("Harbourview")),
    ).toBe(true);

    expect(eventContext.notificationService.getUnreadCount()).toBeGreaterThan(0);
    expect(activityContext.service.listActivities().length).toBeGreaterThan(0);

    const harbourviewClient = SEED_CLIENTS[0]!;
    const clientResult = clientOnly.results.find(
      (result) => result.document.metadata?.clientId === harbourviewClient.clientId,
    );
    expect(clientResult).toBeDefined();

    const opened = workflow.openResult(clientResult!);
    expect(opened.ok).toBe(true);
    expect(opened.eventId).toBe("legal.search.result.opened");
    expect(clientResult!.route).toBe(clientDetailRoute(harbourviewClient.clientId));

    const summary = getLegalSearchWorkflowDiagnostics().getSummary();
    expect(summary.totalRuns).toBeGreaterThan(2);
    expect(summary.eventsRaised).toBeGreaterThan(2);
    expect(summary.lastProviderCount).toBeGreaterThanOrEqual(5);
  });

  it("maps knowledge documents into unified search result views", async () => {
    const knowledgeService = createIntegrationKnowledgeService();
    const workflow = new LegalSearchWorkflowService({
      knowledgeService,
      eventBus: createAppEventNotificationContext().eventBus,
    });

    const executed = await workflow.executeSearch("Harbourview");
    expect(
      executed.results.every((result) =>
        Boolean(mapKnowledgeDocumentToSearchResult(result.document)),
      ),
    ).toBe(true);
  });

  it("navigates via legal.search commands", async () => {
    await Runtime.bootstrap({ workspaceRoot, failFast: false });
    const capabilities = Runtime.registry().findAll();
    const actionBootstrap = bootstrapActionRegistry({
      capabilityRecords: mapPlatformCapabilitiesToActionRecords(capabilities),
    });

    const eventContext = createAppEventNotificationContext();
    createAppActivityTimelineContext({ eventBus: eventContext.eventBus });

    const navigated: string[] = [];
    registerLegalSearchNavigationHandler((path) => navigated.push(path));

    const bundle = createAppActionExecutorBundle({
      dto: actionBootstrap.dto,
      permissionAdapter: createAllowAllWorkbenchPermissionAdapter(),
      publish: () => workbenchRequestOk(),
      eventBus: eventContext.eventBus,
    });

    const openResult = bundle.actionExecutor.executeSync("legal.search.open", {
      actor: "user",
    });
    expect(openResult.ok).toBe(true);
    expect(navigated).toContain(legalSearchListRoute());

    const executeResult = bundle.actionExecutor.executeSync("legal.search.execute", {
      actor: "user",
      args: { query: "Harbourview" },
    });
    expect(executeResult.ok).toBe(true);
    expect(navigated).toContain(legalSearchListRoute("Harbourview"));
  });

  it("applies advanced filters and context-scoped matter search", async () => {
    const eventContext = createAppEventNotificationContext();
    const activityContext = createAppActivityTimelineContext({
      eventBus: eventContext.eventBus,
    });
    const workflow = new LegalSearchWorkflowService({
      knowledgeService: createIntegrationKnowledgeService(),
      eventBus: eventContext.eventBus,
    });

    const matter = SEED_MATTERS[0]!;
    const scoped = await workflow.executeSearch(
      "Harbourview",
      mergeLegalSearchScope({ entityType: "document" }, { matterId: matter.matterId }),
    );

    expect(scoped.filteredEventId).toBe("legal.search.filtered");
    expect(scoped.results.every((result) => result.entityType === "document")).toBe(
      true,
    );
    expect(
      scoped.results.every(
        (result) => result.document.metadata?.matterId === matter.matterId,
      ),
    ).toBe(true);
    expect(activityContext.service.listActivities().length).toBeGreaterThan(0);
    expect(getLegalSearchWorkflowDiagnostics().getSummary().filteredEventCount).toBe(1);
  });

  it("prioritises exact reference matches in ranking", async () => {
    const workflow = new LegalSearchWorkflowService({
      knowledgeService: createIntegrationKnowledgeService(),
      eventBus: createAppEventNotificationContext().eventBus,
    });

    const executed = await workflow.executeSearch(SEED_CLIENTS[0]!.clientReference);
    expect(executed.results[0]?.reference).toBe(SEED_CLIENTS[0]!.clientReference);
  });
});
