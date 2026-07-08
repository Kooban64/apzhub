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
  composeMatterWorkspaceSnapshot,
  getMatterWorkflowDiagnostics,
  matterWorkspaceRoute,
  registerMatterNavigationHandler,
  resetMatterWorkflowDiagnostics,
  resetSharedMatterRepository,
  unregisterMatterNavigationHandler,
} from "./matters";
import { registerLegalSearchKnowledgeProviders } from "./knowledge/register-legal-search-knowledge";
import { resolveLegalSearchScopeFromPathname } from "./search/legal-search-scope";
import { resetLegalMatterEventEnvelopeCounter } from "./publish-legal-matter-event";
import { SEED_MATTERS } from "./matters/seed-matters";

const workspaceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

describe("matter workspace integration", () => {
  beforeEach(() => {
    resetSharedMatterRepository();
    resetMatterWorkflowDiagnostics();
    resetLegalMatterEventEnvelopeCounter();
    unregisterMatterNavigationHandler();
  });

  it("opens and refreshes workspace with composition, events, notifications, activities, and search scope", async () => {
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
    registerMatterNavigationHandler((route) => navigated.push(route));

    const bundle = createAppActionExecutorBundle({
      dto: actionBootstrap.dto,
      permissionAdapter: createAllowAllWorkbenchPermissionAdapter(),
      publish: () => workbenchRequestOk(),
      eventBus: eventContext.eventBus,
    });

    const matter = SEED_MATTERS[0]!;
    const workspaceRoute = matterWorkspaceRoute(matter.matterId);

    const openResult = bundle.actionExecutor.executeSync(
      "legal.matter.workspace.open",
      {
        actor: "user",
        args: { matterId: matter.matterId },
      },
    );
    expect(openResult.ok).toBe(true);
    expect(navigated).toContain(workspaceRoute);

    const opened = bundle.matterWorkflow.openMatterWorkspace(matter.matterId);
    expect(opened.ok).toBe(true);
    expect(opened.eventId).toBe("legal.matter.workspace.opened");
    expect(opened.matter && "relatedEntityCounts" in opened.matter).toBe(true);
    expect(eventContext.notificationService.getUnreadCount()).toBeGreaterThan(0);
    expect(activityContext.service.listActivities().length).toBeGreaterThan(0);

    const snapshot = composeMatterWorkspaceSnapshot(matter);
    expect(snapshot.documents.totalCount).toBeGreaterThanOrEqual(0);
    expect(snapshot.tasks.open.length).toBeGreaterThanOrEqual(0);

    const refreshResult = bundle.actionExecutor.executeSync(
      "legal.matter.workspace.refresh",
      {
        actor: "user",
        args: { matterId: matter.matterId },
      },
    );
    expect(refreshResult.ok).toBe(true);

    const scope = resolveLegalSearchScopeFromPathname(workspaceRoute);
    expect(scope?.matterId).toBe(matter.matterId);

    const knowledgeBootstrap = bootstrapKnowledgeRegistry();
    registerLegalSearchKnowledgeProviders(knowledgeBootstrap.registry);
    const provider = knowledgeBootstrap.registry.getProvider("legal.matters.search");
    expect(provider).toBeDefined();

    const summary = getMatterWorkflowDiagnostics().getSummary();
    expect(summary.eventsRaised).toBeGreaterThan(0);
    expect(summary.commandsExecuted).toBeGreaterThan(0);
  });
});
