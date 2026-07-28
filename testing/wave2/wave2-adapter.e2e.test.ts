/**
 * OSS-102-08 — Wave 2 mocked adapter E2E.
 * Factory → lifecycle → core services → operation runner → REST → mock Zammad.
 * No PlatformServiceGateway / HTTP / live Zammad.
 */
import { afterEach, describe, expect, it } from "vitest";

import {
  createZammadAdapter,
  disposeZammadAdapter,
  ZAMMAD_ADAPTER_VERSION,
  createMockZammadFetch,
  DEFAULT_TEST_ZAMMAD_CONFIG,
  TEST_CORRELATION_ID,
  TEST_TENANT_ID,
} from "@apzhub/integration-zammad";

const ctx = { correlationId: TEST_CORRELATION_ID, tenantId: TEST_TENANT_ID };

describe("OSS-102-08 Wave 2 mocked adapter E2E", () => {
  let adapter: Awaited<ReturnType<typeof createZammadAdapter>>["adapter"];
  let factory: Awaited<ReturnType<typeof createZammadAdapter>>["factory"];

  afterEach(async () => {
    if (adapter && factory) {
      await disposeZammadAdapter(adapter, factory);
    }
  });

  async function boot(fetchOptions?: Parameters<typeof createMockZammadFetch>[0]) {
    const created = await createZammadAdapter({
      zammad: DEFAULT_TEST_ZAMMAD_CONFIG,
      tenantId: TEST_TENANT_ID,
      apiToken: "wave2-e2e-token",
      adapterOptions: { fetchFn: createMockZammadFetch(fetchOptions) },
    });
    adapter = created.adapter;
    factory = created.factory;
    return created;
  }

  it("bootstraps, authenticates, detects version, and reports health/diagnostics", async () => {
    await boot({ engineVersion: "6.4.1", edition: "community" });
    expect(adapter.isInitialised).toBe(true);
    expect(ZAMMAD_ADAPTER_VERSION).toBe("0.8.0");

    const connected = await adapter.testConnection(ctx);
    expect(connected.ok).toBe(true);

    const version = await adapter.discoverVersion(ctx);
    expect(version).toBe("6.4.1");
    expect(adapter.getDetectedEdition()).toBe("community");

    const health = await adapter.performHealthCheck(ctx);
    expect(health.checks.some((c) => c.name === "zammad_api")).toBe(true);
    expect(health.checks.some((c) => c.name === "zammad_operational_health")).toBe(
      true,
    );

    const diagnostics = await adapter.collectDiagnostics(ctx);
    const serialized = JSON.stringify(diagnostics);
    expect(serialized).not.toMatch(/wave2-e2e-token/i);
    expect(serialized).not.toMatch(/Token token=/i);
    expect(diagnostics.engineVersion).toBe("6.4.1");
  });

  it("exercises Support-domain lifecycle across core services", async () => {
    await boot();
    await adapter.testConnection(ctx);

    const listed = await adapter.core.support.list(ctx);
    expect(listed.totalCount).toBeGreaterThan(0);

    const ticketId = listed.items[0]!.id;
    const got = await adapter.core.support.get(ctx, ticketId);
    expect(got.id).toBe(ticketId);
    expect(got.id.startsWith("sreq_zammad_")).toBe(true);

    const created = await adapter.core.support.create(ctx, {
      title: "Wave2 E2E ticket",
      groupId: "sgrp_zammad_1",
      requesterId: "suser_zammad_5",
    });
    expect(created.title).toBe("Wave2 E2E ticket");

    const org = await adapter.core.organizations.create(ctx, {
      name: "Wave2 Org",
    });
    expect(org.id.startsWith("sorg_zammad_")).toBe(true);

    const group = await adapter.core.groups.create(ctx, { name: "Wave2 Group" });
    expect(group.id.startsWith("sgrp_zammad_")).toBe(true);

    const users = await adapter.core.users.list(ctx);
    expect(users.items.length).toBeGreaterThan(0);
    expect(users.items[0]!.id.startsWith("suser_zammad_")).toBe(true);

    const articles = await adapter.core.articles.list(ctx, ticketId);
    expect(articles.items.length).toBeGreaterThan(0);

    const note = await adapter.core.articles.createNote(ctx, {
      supportTicketId: ticketId,
      body: "Internal wave2 note",
      bodyFormat: "text/plain",
    });
    expect(note.visibility).toBe("internal");

    const reply = await adapter.core.articles.createReply(ctx, {
      supportTicketId: ticketId,
      body: "Customer-visible wave2 reply",
      channel: "email",
    });
    expect(reply.visibility).toBe("public");
  });

  it("exercises search, history, analytics, sync, events, and webhooks", async () => {
    await boot();
    await adapter.testConnection(ctx);

    const search = await adapter.core.search.searchSupportRequests(ctx, "password");
    expect(search.hits.length).toBeGreaterThanOrEqual(0);

    const timeline = await adapter.core.history.getSupportTimeline(
      ctx,
      "sreq_zammad_100",
    );
    expect(timeline.events.length).toBeGreaterThanOrEqual(0);

    const analytics = await adapter.core.analytics.getSupportIntelligence(ctx);
    expect(analytics.totalTickets).toBeGreaterThanOrEqual(0);

    const sync = await adapter.core.synchronisation.runIncrementalSync(ctx);
    expect(sync.recordsProcessed).toBeGreaterThanOrEqual(0);
    expect(sync.status).toBeDefined();
    const syncDiag = adapter.core.synchronisation.getDiagnostics();
    expect(syncDiag).toBeDefined();

    const translated = adapter.core.events.translate(ctx, {
      event: "ticket",
      action: "create",
      ticket: { id: 100 },
    });
    expect(translated.ok).toBe(true);
    expect(translated.ignored).toBe(false);

    const unknown = adapter.core.events.translate(ctx, {
      event: "macro",
      action: "execute",
    });
    expect(unknown.ok).toBe(true);
    expect(unknown.ignored).toBe(true);

    const webhooks = await adapter.core.webhooks.list(ctx);
    expect(Array.isArray(webhooks)).toBe(true);
  });

  it("certifies compatibility, readiness, health, and operational reports", async () => {
    await boot({ engineVersion: "6.3.1" });
    await adapter.testConnection(ctx);
    await adapter.detectFeatures(ctx);

    const matrix = adapter.operations.getCompatibilityMatrix();
    expect(matrix.compatibilityStatus).toBe("compatible");
    expect(matrix.supportedVersionRange.min).toBe("6.3.0");

    const readiness = await adapter.evaluateReadiness(ctx);
    expect(readiness.ready).toBe(true);

    const health = adapter.operations.classifyHealth();
    expect(["HEALTHY", "DEGRADED"]).toContain(health.level);

    const report = await adapter.buildOperationalReport(ctx);
    expect(["CERTIFIED", "CERTIFIED_WITH_LIMITATIONS"]).toContain(
      report.certificationOutcome,
    );
    expect(report.diagnostics.persistentSyncStateSupport).toBe(false);
    expect(report.diagnostics.webhookIngressSupport).toBe(true);
    expect(report.diagnostics.binaryAttachmentSupport).toBe(true);

    const caps = adapter.operations.certifyCapabilities();
    expect(caps.some((c) => c.capabilityId === "attachments" && c.implemented)).toBe(
      true,
    );
    expect(
      caps
        .find((c) => c.capabilityId === "attachments")
        ?.unsupportedOperations.includes("deleteBinaryAttachment"),
    ).toBe(true);
    expect(
      caps
        .find((c) => c.capabilityId === "webhooks")
        ?.supportedOperations.includes("webhookHttpIngress"),
    ).toBe(true);

    const serialized = JSON.stringify(report);
    expect(serialized).not.toMatch(/wave2-e2e-token/i);
    expect(serialized).not.toMatch(/Authorization/i);
  });

  it("classifies unsupported older versions as incompatible", async () => {
    await boot({ engineVersion: "6.0.0" });
    await adapter.testConnection(ctx);
    const matrix = adapter.operations.getCompatibilityMatrix();
    expect(matrix.compatibilityStatus).toBe("incompatible");
    expect(matrix.blockingIncompatibilities.length).toBeGreaterThan(0);
  });
});
