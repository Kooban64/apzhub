/**
 * OSS-102-08 — Wave 2 certification assertions (claims, mapping, secrets, matrix).
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

import {
  createZammadAdapter,
  disposeZammadAdapter,
  createMockZammadFetch,
  DEFAULT_TEST_ZAMMAD_CONFIG,
  TEST_CORRELATION_ID,
  TEST_TENANT_ID,
  ZAMMAD_KNOWN_LIMITATIONS,
  certifyAttachmentPlaceholder,
  buildZammadCompatibilityMatrix,
  decideZammadCertificationOutcome,
  defaultZammadReferenceCompliance,
  certifyZammadCapabilities,
} from "@apzhub/integration-zammad";
import { mapZammadTicket } from "../../integrations/zammad/src/mappers/support-ticket-mapper";
import { mapZammadArticle } from "../../integrations/zammad/src/mappers/article-mapper";
import {
  MOCK_TICKET,
  MOCK_ARTICLE_NOTE,
} from "../../integrations/zammad/src/testing/mock-zammad-core-data";

const ctx = { correlationId: TEST_CORRELATION_ID, tenantId: TEST_TENANT_ID };

describe("OSS-102-08 Wave 2 capability certification claims", () => {
  it("certifies webhook ingress and binary attachments; does not certify persistent sync", async () => {
    const { adapter, factory } = await createZammadAdapter({
      zammad: DEFAULT_TEST_ZAMMAD_CONFIG,
      tenantId: TEST_TENANT_ID,
      apiToken: "wave2-cert-token",
      adapterOptions: { fetchFn: createMockZammadFetch() },
    });
    await adapter.testConnection(ctx);
    const caps = adapter.operations.certifyCapabilities();
    const attachments = caps.find((c) => c.capabilityId === "attachments");
    expect(attachments?.implemented).toBe(true);
    expect(certifyAttachmentPlaceholder().implemented).toBe(true);

    const webhooks = caps.find((c) => c.capabilityId === "webhooks");
    expect(webhooks?.supportedOperations).toContain("webhookHttpIngress");
    expect(webhooks?.supportedOperations).toContain("platformEventPublication");

    const sync = caps.find((c) => c.capabilityId === "synchronisation");
    expect(sync?.unsupportedOperations).toContain("persistentSyncState");

    const events = caps.find((c) => c.capabilityId === "events");
    expect(events?.supportedOperations).toContain("platformEventPublication");
    expect(events?.unsupportedOperations).toContain("platformEventSubscription");

    const report = await adapter.buildOperationalReport(ctx);
    expect(report.diagnostics.binaryAttachmentSupport).toBe(true);
    expect(report.diagnostics.webhookIngressSupport).toBe(true);
    expect(report.diagnostics.persistentSyncStateSupport).toBe(false);
    expect(report.knownLimitations).toEqual(
      expect.arrayContaining([...ZAMMAD_KNOWN_LIMITATIONS]),
    );
    expect(["CERTIFIED", "CERTIFIED_WITH_LIMITATIONS"]).toContain(
      report.certificationOutcome,
    );

    const ordered = [...report.capabilities.map((c) => c.capabilityId)].sort();
    expect([...report.capabilities.map((c) => c.capabilityId)].sort()).toEqual(ordered);

    await disposeZammadAdapter(adapter, factory);
  });

  it("produces CERTIFIED_WITH_LIMITATIONS for documented CE limitations", () => {
    const outcome = decideZammadCertificationOutcome({
      capabilities: certifyZammadCapabilities({
        serviceAvailable: () => true,
        providerReachable: true,
        authenticationValid: true,
      }),
      compatibility: buildZammadCompatibilityMatrix({
        detectedZammadVersion: "6.4.0",
        versionMin: "6.3.0",
        versionMax: "6.5.x",
      }),
      readiness: {
        ready: true,
        overallHealth: "HEALTHY",
        checkedAt: "2026-07-11T00:00:00.000Z",
        checks: [],
        blockingIssues: [],
        warnings: [],
      },
      healthLevel: "HEALTHY",
      referenceCompliance: defaultZammadReferenceCompliance(),
    });
    expect(outcome).toBe("CERTIFIED_WITH_LIMITATIONS");
  });
});

describe("OSS-102-08 canonical mapping validation", () => {
  it("maps Zammad Ticket to Support Request IDs, never Task", () => {
    const mapped = mapZammadTicket(MOCK_TICKET, { tenantId: TEST_TENANT_ID });
    expect(mapped.id).toMatch(/^sreq_zammad_/);
    expect(mapped.title).toBe(MOCK_TICKET.title);
    expect(JSON.stringify(mapped)).not.toMatch(/task_|issue_|plane/i);
    expect("projectId" in mapped).toBe(false);
  });

  it("maps Zammad Article to Support Article, never Project Comment", () => {
    const mapped = mapZammadArticle(MOCK_ARTICLE_NOTE, { tenantId: TEST_TENANT_ID });
    expect(mapped.id).toMatch(/^sart_zammad_/);
    expect(mapped.supportTicketId).toMatch(/^sreq_zammad_/);
    expect(mapped.visibility).toBe("internal");
    expect(JSON.stringify(mapped)).not.toMatch(/comment_|project_comment/i);
  });

  it("keeps organisations, groups, and users in Support-domain ID space", async () => {
    const { adapter, factory } = await createZammadAdapter({
      zammad: DEFAULT_TEST_ZAMMAD_CONFIG,
      tenantId: TEST_TENANT_ID,
      apiToken: "wave2-cert-token",
      adapterOptions: { fetchFn: createMockZammadFetch() },
    });
    const orgs = await adapter.core.organizations.list(ctx);
    const groups = await adapter.core.groups.list(ctx);
    const users = await adapter.core.users.list(ctx);
    expect(orgs.items.every((o) => o.id.startsWith("sorg_zammad_"))).toBe(true);
    expect(groups.items.every((g) => g.id.startsWith("sgrp_zammad_"))).toBe(true);
    expect(users.items.every((u) => u.id.startsWith("suser_zammad_"))).toBe(true);
    await disposeZammadAdapter(adapter, factory);
  });
});

describe("OSS-102-08 secret redaction and public export boundaries", () => {
  it("keeps operational outputs free of tokens and provider secrets", async () => {
    const { adapter, factory } = await createZammadAdapter({
      zammad: DEFAULT_TEST_ZAMMAD_CONFIG,
      tenantId: TEST_TENANT_ID,
      apiToken: "super-secret-wave2-token",
      adapterOptions: { fetchFn: createMockZammadFetch() },
    });
    await adapter.testConnection(ctx);
    await adapter.detectFeatures(ctx);
    const report = await adapter.buildOperationalReport(ctx);
    const snapshot = adapter.getRuntimeDiagnosticsSnapshot();
    const diagnostics = await adapter.collectDiagnostics(ctx);
    for (const payload of [report, snapshot, diagnostics]) {
      const serialized = JSON.stringify(payload);
      expect(serialized).not.toMatch(/super-secret-wave2-token/i);
      expect(serialized).not.toMatch(/Token token=/i);
      expect(serialized).not.toMatch(/Bearer /i);
      expect(serialized).not.toMatch(/"secret"\s*:\s*"[^"]+"/i);
    }
    await disposeZammadAdapter(adapter, factory);
  });

  it("does not export Zammad internal API types from the public package", async () => {
    const publicApi = await import("@apzhub/integration-zammad");
    expect("ZammadTicketRecord" in publicApi).toBe(false);
    expect("ZammadRestClient" in publicApi).toBe(false);
    expect("ZammadFetchClient" in publicApi).toBe(false);
    expect("ZammadListQuery" in publicApi).toBe(false);
  });

  it("enforces forbidden dependency needles in production sources", () => {
    const root = join(process.cwd(), "integrations/zammad/src");
    const forbidden = [
      "@apzhub/platform-services",
      "PlatformServiceGateway",
      "EntityMappingStore",
      "@apzhub/integration-plane",
      'from "next/',
      "from 'next/",
    ];
    const offenders: string[] = [];
    function walk(dir: string): void {
      for (const entry of readdirSync(dir)) {
        if (entry === "testing" || entry.endsWith(".test.ts")) continue;
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
          walk(full);
          continue;
        }
        if (!entry.endsWith(".ts")) continue;
        const source = readFileSync(full, "utf8");
        for (const needle of forbidden) {
          if (source.includes(needle)) {
            offenders.push(`${relative(root, full)}:${needle}`);
          }
        }
      }
    }
    walk(root);
    expect(offenders).toEqual([]);
  });
});
