import { describe, expect, it } from "vitest";

import {
  createProcessorRegistry,
  createInMemoryProcessingStore,
  createProcessingWorker,
  enqueueProcessingWork,
} from "@apzhub/platform-processing";
import { createQualityKnowledgeIndex } from "@apzhub/qep-knowledge-index";
import {
  createNotificationSubscriptionPlatform,
  CHANNEL_IDS,
} from "@apzhub/qep-notification";
import { createEnterpriseCommandPlatform } from "@apzhub/qep-command";

import {
  QEP_SUITES_VERSION,
  QEP_SUITE_EVENTS,
  createEnterpriseTestSuiteManagement,
  createSuiteKnowledgeProcessors,
  createSuiteNotificationProcessors,
  registerSuiteProcessorsOnto,
  SUITE_COMMAND_DEFINITIONS,
  createSuiteCommandHandlers,
  SUITE_NOTIFICATION_TEMPLATES,
} from "./index";

const actor = {
  userId: "user-1",
  tenantId: "tenant-a",
  permissions: [
    "qep.suites.read",
    "qep.suites.create",
    "qep.suites.update",
    "qep.suites.lifecycle",
  ],
};

describe("APZQEP-140-A Enterprise Test Suite Management", () => {
  it("exports version 0.1.0", () => {
    expect(QEP_SUITES_VERSION).toBe("0.1.0");
  });

  it("creates, updates, versions, and publishes suites", async () => {
    const { service } = createEnterpriseTestSuiteManagement();
    const now = "2026-08-02T17:00:00.000Z";
    const created = await service.create(
      actor,
      {
        name: "Regression Pack",
        description: "Core regression",
        projectId: "proj-1",
        tags: ["regression"],
        priority: "high",
      },
      now,
    );
    expect(created.status).toBe("draft");
    expect(created.version).toBe(1);

    const updated = await service.update(
      actor,
      created.suiteId,
      { description: "Updated desc" },
      "2026-08-02T17:00:01.000Z",
    );
    expect(updated.description).toBe("Updated desc");

    const versioned = await service.version(
      actor,
      created.suiteId,
      "2026-08-02T17:00:02.000Z",
    );
    expect(versioned.version).toBe(2);

    await service.transition(
      actor,
      created.suiteId,
      "review",
      "2026-08-02T17:00:03.000Z",
    );
    await service.transition(
      actor,
      created.suiteId,
      "approved",
      "2026-08-02T17:00:04.000Z",
    );
    const published = await service.transition(
      actor,
      created.suiteId,
      "published",
      "2026-08-02T17:00:05.000Z",
    );
    expect(published.status).toBe("published");
    expect(published.publishedAt).toBeDefined();

    const events = service.drainEvents();
    expect(events.some((e) => e.eventId === QEP_SUITE_EVENTS.created)).toBe(true);
    expect(events.some((e) => e.eventId === QEP_SUITE_EVENTS.published)).toBe(true);
  });

  it("supports hierarchy, clone, favourite, pin, archive, restore", async () => {
    const { service } = createEnterpriseTestSuiteManagement();
    const parent = await service.create(
      actor,
      { name: "Parent", folderPath: "/qa" },
      "2026-08-02T17:10:00.000Z",
    );
    const child = await service.create(
      actor,
      {
        name: "Child",
        parentSuiteId: parent.suiteId,
        folderPath: "/qa/child",
      },
      "2026-08-02T17:10:01.000Z",
    );
    expect(child.parentSuiteId).toBe(parent.suiteId);

    const cloned = await service.clone(
      actor,
      child.suiteId,
      "2026-08-02T17:10:02.000Z",
    );
    expect(cloned.name).toContain("Copy");

    await service.favourite(actor, parent.suiteId, true, "2026-08-02T17:10:03.000Z");
    await service.pin(actor, parent.suiteId, true, "2026-08-02T17:10:04.000Z");
    const fav = await service.get(actor, parent.suiteId);
    expect(fav.suite.favouriteUserIds).toContain("user-1");
    expect(fav.suite.pinnedUserIds).toContain("user-1");

    await service.transition(
      actor,
      parent.suiteId,
      "review",
      "2026-08-02T17:10:05.000Z",
    );
    await service.transition(
      actor,
      parent.suiteId,
      "approved",
      "2026-08-02T17:10:06.000Z",
    );
    await service.transition(
      actor,
      parent.suiteId,
      "published",
      "2026-08-02T17:10:07.000Z",
    );
    await service.transition(
      actor,
      parent.suiteId,
      "archived",
      "2026-08-02T17:10:08.000Z",
    );
    const restored = await service.transition(
      actor,
      parent.suiteId,
      "draft",
      "2026-08-02T17:10:09.000Z",
    );
    expect(restored.status).toBe("draft");

    const tree = await service.tree(actor);
    expect(tree.length).toBeGreaterThanOrEqual(3);
  });

  it("enforces permissions and invalid lifecycle", async () => {
    const { service } = createEnterpriseTestSuiteManagement();
    await expect(
      service.create(
        { ...actor, permissions: [] },
        { name: "X" },
        "2026-08-02T17:20:00.000Z",
      ),
    ).rejects.toThrow(/permission/);

    const suite = await service.create(
      actor,
      { name: "Lock" },
      "2026-08-02T17:20:01.000Z",
    );
    await expect(
      service.transition(actor, suite.suiteId, "published", "2026-08-02T17:20:02.000Z"),
    ).rejects.toThrow(/lifecycle/);
  });

  it("projects suites into Quality Knowledge Index from events", async () => {
    const qki = createQualityKnowledgeIndex();
    const { service } = createEnterpriseTestSuiteManagement();
    const suite = await service.create(
      actor,
      { name: "Searchable Suite", tags: ["smoke"] },
      "2026-08-02T17:30:00.000Z",
    );
    const event = service
      .drainEvents()
      .find((e) => e.eventId === QEP_SUITE_EVENTS.created);
    expect(event).toBeDefined();

    const applied = await qki.engine.applyEvent({
      eventType: event!.eventId,
      tenantId: event!.tenantId,
      payload: event!.payload,
      correlationId: event!.correlationId,
      now: event!.timestamp,
    });
    expect(applied.ok).toBe(true);

    const hit = await qki.search.search({
      tenantId: "tenant-a",
      query: "Searchable",
      entityKinds: ["suite"],
    });
    expect(hit.total).toBe(1);
    expect(hit.hits[0]?.document.entityId).toBe(suite.suiteId);
  });

  it("fans out suite events to QKI via platform processing", async () => {
    const qki = createQualityKnowledgeIndex();
    const platformRegistry = createProcessorRegistry();
    registerSuiteProcessorsOnto(
      platformRegistry,
      createSuiteKnowledgeProcessors(qki.engine),
    );

    const store = createInMemoryProcessingStore();
    await enqueueProcessingWork(store, {
      workItemId: "pw-suite-1",
      tenantId: "tenant-a",
      eventType: QEP_SUITE_EVENTS.created,
      payload: {
        suiteId: "suite-fan",
        name: "Fan Suite",
        status: "draft",
        tags: [],
        ownerId: "user-1",
        version: 1,
        kind: "standard",
        priority: "normal",
        folderPath: "/",
        revision: 1,
        tenantId: "tenant-a",
      },
      idempotencyKey: "suite-fan-1",
      createdAt: "2026-08-02T17:40:00.000Z",
    });

    const result = await createProcessingWorker({
      store,
      registry: platformRegistry,
      workerId: "suite-worker",
      now: () => "2026-08-02T17:40:01.000Z",
      leasePolicy: { leaseTtlMs: 60_000, processingTimeoutMs: 30_000 },
    }).runOnce();

    expect(result.acknowledged).toBe(1);
    const doc = await qki.repository.get({
      tenantId: "tenant-a",
      entityKind: "suite",
      entityId: "suite-fan",
    });
    expect(doc?.title).toBe("Fan Suite");
  });

  it("registers suite commands and notification templates", () => {
    const platform = createEnterpriseCommandPlatform({ registerBuiltins: false });
    platform.commands.registerBatch([...SUITE_COMMAND_DEFINITIONS]);
    platform.handlers.registerBatch([...createSuiteCommandHandlers({})]);
    expect(platform.commands.get("qep.command.suite.open")).toBeDefined();

    const notify = createNotificationSubscriptionPlatform();
    for (const t of SUITE_NOTIFICATION_TEMPLATES) {
      notify.templates.register(t);
    }
    expect(
      notify.templates.get("qep.notification.template.suite.published"),
    ).toBeDefined();

    const processors = createSuiteNotificationProcessors(notify.engine);
    expect(processors.length).toBe(3);
    expect(CHANNEL_IDS.internal).toBe("internal");
  });

  it("supports search/filter/sort listing", async () => {
    const { service } = createEnterpriseTestSuiteManagement();
    await service.create(
      actor,
      { name: "Alpha", tags: ["a"], priority: "low" },
      "2026-08-02T17:50:00.000Z",
    );
    await service.create(
      actor,
      { name: "Beta", tags: ["b"], priority: "high" },
      "2026-08-02T17:50:01.000Z",
    );
    const filtered = await service.list(actor, {
      query: "Beta",
      sortBy: "name",
      sortDirection: "asc",
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.name).toBe("Beta");
  });
});
