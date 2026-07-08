import { beforeEach, describe, expect, it } from "vitest";

import { createEmptyActionRegistryDto } from "@apzhub/command-framework/server";
import {
  bootstrapKnowledgeRegistry,
  mapKnowledgeSourceRegistryDto,
} from "@apzhub/knowledge-discovery-framework/server";
import { createEmptyWorkbenchRegistryDto } from "@apzhub/workbench-framework/server";

import { createAppEventNotificationContext } from "./create-app-event-notification-context";
import { createAppKnowledgeService } from "./create-app-knowledge-service";
import { registerLegalSearchKnowledgeProviders } from "./knowledge/register-legal-search-knowledge";
import { resetLegalSearchEventEnvelopeCounter } from "./publish-legal-search-event";
import {
  getLegalSearchRecentSearches,
  getLegalSearchWorkflowDiagnostics,
  resetLegalSearchRecentSearches,
  resetLegalSearchWorkflowDiagnostics,
  resetLegalSearchWorkflowQueryDepth,
  wrapKnowledgeServiceForLegalSearchTracking,
} from "./search";

function createPaletteKnowledgeService(
  eventBus: ReturnType<typeof createAppEventNotificationContext>["eventBus"],
) {
  const bootstrap = bootstrapKnowledgeRegistry();
  registerLegalSearchKnowledgeProviders(bootstrap.registry);
  const knowledgeDto = mapKnowledgeSourceRegistryDto(bootstrap.registry);
  return createAppKnowledgeService({
    knowledgeDto,
    actionDto: createEmptyActionRegistryDto(),
    workbenchDto: createEmptyWorkbenchRegistryDto(),
    registryReady: true,
    eventBus,
  });
}

describe("legal search palette integration", () => {
  beforeEach(() => {
    resetLegalSearchWorkflowDiagnostics();
    resetLegalSearchRecentSearches();
    resetLegalSearchEventEnvelopeCounter();
    resetLegalSearchWorkflowQueryDepth();
  });

  it("tracks palette knowledge queries in session recent searches and diagnostics", async () => {
    const eventContext = createAppEventNotificationContext();
    const service = createPaletteKnowledgeService(eventContext.eventBus);

    const result = await service.query({ text: "Harbourview" });
    expect(
      result.documents.some((document) => document.sourceId.startsWith("legal.")),
    ).toBe(true);

    const recent = getLegalSearchRecentSearches().list();
    expect(
      recent.some(
        (entry) => entry.query === "Harbourview" && entry.surface === "palette",
      ),
    ).toBe(true);

    const diagnostics = getLegalSearchWorkflowDiagnostics().getSummary();
    expect(diagnostics.lastSurface).toBe("palette");
    expect(diagnostics.paletteQueryCount).toBe(1);
    expect(eventContext.notificationService.getUnreadCount()).toBeGreaterThan(0);
  });

  it("does not treat workflow queries as palette queries", async () => {
    const eventContext = createAppEventNotificationContext();
    const inner = createPaletteKnowledgeService(eventContext.eventBus);
    const wrapped = wrapKnowledgeServiceForLegalSearchTracking(inner, {
      eventBus: eventContext.eventBus,
    });

    await wrapped.query({ text: "Harbourview" });
    expect(getLegalSearchRecentSearches().list()).toHaveLength(1);

    const { runAsLegalSearchWorkflowQuery } =
      await import("./search/legal-search-knowledge-tracking");
    await runAsLegalSearchWorkflowQuery(() => wrapped.query({ text: "Harbourview" }));
    expect(getLegalSearchRecentSearches().list()).toHaveLength(1);
  });
});
