/**
 * APZSEARCH-011 residual coverage.
 */
import { describe, expect, it } from "vitest";
import type {
  SupportArticle,
  SupportOrganization,
  SupportTicket,
  SupportUser,
} from "@apzhub/platform-service-contracts";

import {
  DiagnosticsStore,
  SupportSearchErrorTranslator,
  SupportSearchLifecycle,
  assertPlatformEntityId,
  createSupportSearchAdapter,
  createSupportSearchPublicationContext,
  toSearchIntegrationContext,
} from "./index";

function ctx() {
  return createSupportSearchPublicationContext({
    serviceContext: {
      tenantId: "tenant-a",
      userId: "user-1",
      correlationId: "corr-cov",
      permissions: ["support.read"],
      organisationId: "org-a",
      requestId: "req-1",
      locale: "en",
    },
  });
}

describe("APZSEARCH-011 residual coverage", () => {
  it("covers context helpers, assert ids, lifecycle suggest, errors", () => {
    const context = ctx();
    expect(toSearchIntegrationContext(context).productId).toBe("support");
    expect(() => assertPlatformEntityId("")).toThrow(/required/);
    expect(() => assertPlatformEntityId("a::b")).toThrow(/Zammad/);
    expect(() => assertPlatformEntityId("zammad_1")).toThrow(/Zammad/);

    const life = new SupportSearchLifecycle();
    expect(life.suggestFromDomainStatus("support_request", "merged")).toBe("archived");
    expect(life.suggestFromDomainStatus("support_request", "new")).toBe("draft");
    expect(life.suggestFromDomainStatus("support_organisation", "active", true)).toBe(
      "archived",
    );
    expect(life.suggestFromDomainStatus("support_group", undefined)).toBe("validated");
    expect(life.suggestFromDomainStatus("support_request", "pending")).toBe(
      "validated",
    );
    expect(life.canTransition("published", "removed")).toBe(true);
    expect(() => life.assertTransition("archived", "published")).toThrow();

    const errors = new SupportSearchErrorTranslator();
    expect(
      errors.translate(new Error("Zammad identifiers forbidden")).classification,
    ).toBe("validation_failed");
    expect(errors.translate(new Error("tenant mismatch")).classification).toBe(
      "tenant_mismatch",
    );
    expect(errors.translate(new Error("boom")).message).toContain("boom");

    const store = new DiagnosticsStore();
    store.touch("validate", "corr");
    expect(
      store.build(
        {
          byEntityType: {},
          published: 0,
          updated: 0,
          removed: 0,
          validated: 0,
          previewed: 0,
          validationFailures: 0,
          publicationFailures: 0,
        },
        ["support_request"],
      ).productId,
    ).toBe("support");
  });

  it("covers restricted classifications and validate path", () => {
    const adapter = createSupportSearchAdapter();
    const context = ctx();

    const internalArticle: SupportArticle = {
      id: "sart_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      tenantId: "tenant-a",
      supportTicketId: "sreq_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      body: "x".repeat(400),
      bodyFormat: "text/plain",
      channel: "note",
      visibility: "internal",
      senderType: "agent",
      author: { senderType: "agent" },
      deliveryStatus: "none",
      attachments: [],
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    const articleDraft = adapter.mapper.mapSupportArticle(context, internalArticle);
    expect(articleDraft.classification).toBe("restricted");
    expect(articleDraft.title).toBe("Article");
    expect(articleDraft.summary!.length).toBeLessThanOrEqual(280);

    const inactiveOrg: SupportOrganization = {
      id: "sorg_cccccccccccccccccccccccccccccccc",
      tenantId: "tenant-a",
      name: "Inactive",
      active: false,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    expect(
      adapter.mapper.mapSupportOrganisation(context, inactiveOrg).classification,
    ).toBe("restricted");

    const inactiveUser: SupportUser = {
      id: "susr_dddddddddddddddddddddddddddddddd",
      tenantId: "tenant-a",
      displayName: "Old",
      active: false,
      role: "agent",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    const userDraft = adapter.mapper.mapSupportUser(context, inactiveUser);
    expect(userDraft.classification).toBe("restricted");
    expect(userDraft.summary).toBe("agent");
    expect(userDraft.metadata).not.toHaveProperty("login");

    const ticket: SupportTicket = {
      id: "sreq_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      tenantId: "tenant-a",
      title: "T",
      groupId: "sgrp_eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      requesterId: "susr_ffffffffffffffffffffffffffffffff",
      status: "open",
      priority: "normal",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    const ok = adapter.publisher.validate(context, {
      entityType: "support_request",
      entity: ticket,
    });
    expect(ok.ok).toBe(true);

    const rejected = adapter.publisher.publish(context, {
      entityType: "support_request",
      entity: { ...ticket, id: "sreq_zammad_leak" },
    });
    expect(rejected.ok).toBe(false);

    expect(adapter.publisher.getMapper()).toBe(adapter.mapper);
    expect(adapter.publisher.getValidator()).toBe(adapter.validator);
    expect(adapter.publisher.getLifecycle()).toBe(adapter.lifecycle);
    expect(
      adapter.publisher.getMetrics().snapshot().publicationFailures,
    ).toBeGreaterThan(0);
  });
});
