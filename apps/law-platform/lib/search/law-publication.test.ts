/**
 * Platform-1.3-ENG-001 — Law Search Live Drain wiring tests
 */

import { beforeEach, describe, expect, it } from "vitest";

import { ClientWorkflowService } from "../clients/client-workflow-service";
import { createEmptyClientFormValues } from "../clients/client-types";
import { InMemoryClientRepository } from "../clients/in-memory-client-repository";
import { createAppEventNotificationContext } from "../create-app-event-notification-context";
import { DocumentWorkflowService } from "../documents/document-workflow-service";
import { InMemoryDocumentRepository } from "../documents/in-memory-document-repository";
import { MatterWorkflowService } from "../matters/matter-workflow-service";
import { createEmptyMatterFormValues } from "../matters/matter-types";
import { InMemoryMatterRepository } from "../matters/in-memory-matter-repository";
import { TaskWorkflowService } from "../tasks/task-workflow-service";
import { InMemoryTaskRepository } from "../tasks/in-memory-task-repository";
import {
  getLawSearchPublicationRuntime,
  isLawSearchCompositionRegistered,
  resetLawSearchPublicationRuntimeForTests,
} from "./publication-runtime";
import { wireLawSearchPublication } from "./law-publication-wiring";

describe("Platform-1.3-ENG-001 Law Search Live Drain", () => {
  beforeEach(() => {
    resetLawSearchPublicationRuntimeForTests();
  });

  it("wires Law client/matter mutations into journal and drains to Search Integration", async () => {
    const { eventBus } = createAppEventNotificationContext();
    const wired = wireLawSearchPublication({
      matterWorkflow: new MatterWorkflowService({
        repository: new InMemoryMatterRepository(),
        eventBus,
        actorId: "tester",
      }),
      clientWorkflow: new ClientWorkflowService({
        repository: new InMemoryClientRepository(),
        eventBus,
        actorId: "tester",
      }),
      documentWorkflow: new DocumentWorkflowService({
        repository: new InMemoryDocumentRepository(),
        eventBus,
        actorId: "tester",
      }),
      taskWorkflow: new TaskWorkflowService({
        repository: new InMemoryTaskRepository(),
        eventBus,
        actorId: "tester",
      }),
      env: { actorUserId: "tester", tenantId: "tenant_law" },
    });

    expect(isLawSearchCompositionRegistered()).toBe(true);

    const clientResult = wired.clientWorkflow.createClient({
      ...createEmptyClientFormValues(),
      displayName: "Harbourview Holdings Pty Ltd",
      clientReference: "CLT-2026-00099",
      customFields: "industry=Property\njurisdiction=NSW",
    });
    expect(clientResult.ok).toBe(true);
    expect(clientResult.client).toBeDefined();

    const matterResult = wired.matterWorkflow.createMatter({
      ...createEmptyMatterFormValues(),
      title: "Matter Search Drain",
      clientId: clientResult.client!.clientId,
      leadAttorneyId: "user_attorney_01",
    });
    expect(matterResult.ok).toBe(true);

    await Promise.resolve();
    const runtime = getLawSearchPublicationRuntime()!;
    const drained = await runtime.orchestrator.processBatch();
    expect(drained.published).toBeGreaterThanOrEqual(1);

    const published = runtime.integration.sink.list({
      tenantId: "tenant_law",
      productId: "law",
    });
    expect(published.length).toBeGreaterThanOrEqual(1);
    expect(
      published.some(
        (e) => e.entityType === "law_client" || e.entityType === "law_matter",
      ),
    ).toBe(true);
  });
});
