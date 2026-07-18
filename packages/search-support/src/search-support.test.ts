/**
 * APZSEARCH-011 — Support Search Publication Adapter tests.
 */
import { describe, expect, it } from "vitest";
import type {
  SupportArticle,
  SupportGroup,
  SupportOrganization,
  SupportTicket,
  SupportUser,
} from "@apzhub/platform-service-contracts";

import {
  SEARCH_SUPPORT_VERSION,
  createSupportSearchAdapter,
  createSupportSearchPublicationContext,
  isSupportSearchEntityType,
  looksLikeZammadIdentifier,
} from "./index";

function ctx(tenantId = "tenant-a", org = "org-a") {
  return createSupportSearchPublicationContext({
    serviceContext: {
      tenantId,
      userId: "user-1",
      correlationId: "corr-011",
      permissions: ["support.read", "search.query.execute"],
      organisationId: org,
      workspaceId: "ws_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    },
  });
}

const ticket: SupportTicket = {
  id: "sreq_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  tenantId: "tenant-a",
  displayId: "42",
  title: "Cannot login",
  groupId: "sgrp_cccccccccccccccccccccccccccccccc",
  requesterId: "susr_dddddddddddddddddddddddddddddddd",
  assigneeId: "susr_eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  organizationId: "sorg_ffffffffffffffffffffffffffffffff",
  status: "open",
  priority: "high",
  tags: ["auth"],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
};

const article: SupportArticle = {
  id: "sart_11111111111111111111111111111111",
  tenantId: "tenant-a",
  supportTicketId: "sreq_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  subject: "Re: Cannot login",
  body: "<p>Please <b>reset</b> your password and try again with the new credentials.</p>",
  bodyFormat: "text/html",
  channel: "email",
  visibility: "public",
  senderType: "agent",
  author: {
    userId: "susr_eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    displayName: "Agent A",
    senderType: "agent",
  },
  deliveryStatus: "sent",
  attachments: [],
  createdAt: "2026-01-01T01:00:00.000Z",
  updatedAt: "2026-01-01T01:00:00.000Z",
  originMetadata: { zammad_article_id: "99" },
};

const organisation: SupportOrganization = {
  id: "sorg_ffffffffffffffffffffffffffffffff",
  tenantId: "tenant-a",
  name: "Acme Corp",
  note: "Enterprise customer",
  domain: "acme.example",
  active: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const group: SupportGroup = {
  id: "sgrp_cccccccccccccccccccccccccccccccc",
  tenantId: "tenant-a",
  name: "Support L1",
  note: "First line",
  active: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const user: SupportUser = {
  id: "susr_dddddddddddddddddddddddddddddddd",
  tenantId: "tenant-a",
  email: "customer@acme.example",
  displayName: "Customer C",
  active: true,
  role: "customer",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("APZSEARCH-011 search-support", () => {
  it("ships version and entity catalogue", () => {
    expect(SEARCH_SUPPORT_VERSION).toBe("0.1.0");
    expect(isSupportSearchEntityType("support_request")).toBe(true);
    expect(isSupportSearchEntityType("task")).toBe(false);
    expect(looksLikeZammadIdentifier("sreq_zammad_99")).toBe(true);
    expect(looksLikeZammadIdentifier("zammad_ticket_1")).toBe(true);
    expect(looksLikeZammadIdentifier("Ticket::1")).toBe(true);
    expect(looksLikeZammadIdentifier("sreq_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb")).toBe(
      false,
    );
  });

  it("maps and publishes all Support entity types without Zammad leakage", () => {
    const adapter = createSupportSearchAdapter();
    const context = ctx();

    for (const input of [
      { entityType: "support_request" as const, entity: ticket },
      { entityType: "support_article" as const, entity: article },
      { entityType: "support_organisation" as const, entity: organisation },
      { entityType: "support_group" as const, entity: group },
      { entityType: "support_user" as const, entity: user },
    ]) {
      const preview = adapter.publisher.preview(context, input);
      expect(preview.ok, input.entityType).toBe(true);
      expect(preview.previewMetadata?.productId).toBe("support");
      expect(JSON.stringify(preview.previewMetadata)).not.toMatch(/zammad/i);

      const published = adapter.publisher.publish(context, input);
      expect(published.ok, input.entityType).toBe(true);
      expect(published.lifecycleState).toBe("published");
    }

    expect(adapter.integration.sink.count()).toBe(5);
    const stats = adapter.publisher.statistics(context);
    expect(stats.published).toBe(5);
    expect(stats.byEntityType["support_request"]).toBeGreaterThan(0);

    const articleDraft = adapter.mapper.mapSupportArticle(context, article);
    expect(articleDraft.summary).not.toMatch(/</);
    expect(articleDraft.metadata).not.toHaveProperty("originMetadata");
    expect(JSON.stringify(articleDraft.metadata)).not.toMatch(/zammad/i);
  });

  it("rejects Zammad ids and tenant mismatches", () => {
    const adapter = createSupportSearchAdapter();
    const context = ctx();

    expect(() =>
      adapter.mapper.mapSupportRequest(context, {
        ...ticket,
        id: "sreq_zammad_native123",
      }),
    ).toThrow(/Zammad/);

    const badValidate = adapter.publisher.validate(context, {
      entityType: "support_request",
      entity: { ...ticket, id: "zammad_ticket_x" },
    });
    expect(badValidate.ok).toBe(false);

    expect(() =>
      adapter.mapper.mapSupportRequest(context, {
        ...ticket,
        tenantId: "other-tenant",
      }),
    ).toThrow(/tenant mismatch/);

    const published = adapter.publisher.publish(context, {
      entityType: "support_request",
      entity: ticket,
    });
    expect(published.ok).toBe(true);

    const crossTenantRemove = adapter.publisher.remove(
      ctx("other-tenant"),
      "support_request",
      ticket.id,
    );
    expect(crossTenantRemove.ok).toBe(false);
  });

  it("supports lifecycle hooks upsert/remove and diagnostics", () => {
    const adapter = createSupportSearchAdapter();
    const context = ctx();

    const first = adapter.hooks.onSupportRequestUpserted(context, ticket);
    expect(first.ok).toBe(true);
    expect(first.operation).toBe("publish");

    const second = adapter.hooks.onSupportRequestUpserted(context, {
      ...ticket,
      title: "Cannot login (updated)",
    });
    expect(second.ok).toBe(true);
    expect(second.operation).toBe("update");
    expect(second.entity?.title).toBe("Cannot login (updated)");

    const life = adapter.publisher.lifecycle(context, ticket.id, "archived", "done");
    expect(life.ok).toBe(true);

    const other: SupportTicket = {
      ...ticket,
      id: "sreq_33333333333333333333333333333333",
      title: "Other",
    };
    expect(adapter.hooks.onRequestUpserted(context, other).ok).toBe(true);
    const removed = adapter.hooks.onSupportRequestRemoved(context, other.id);
    expect(removed.ok).toBe(true);

    adapter.hooks.onSupportArticleUpserted(context, article);
    adapter.hooks.onSupportOrganisationUpserted(context, organisation);
    adapter.hooks.onSupportGroupUpserted(context, group);
    adapter.hooks.onSupportUserUpserted(context, user);

    const diag = adapter.publisher.diagnostics(context);
    expect(diag.adapterVersion).toBe("0.1.0");
    expect(diag.productId).toBe("support");
    expect(diag.supportedEntityTypes).toContain("support_article");
    expect(diag.mapperNotes.length).toBeGreaterThan(0);
    expect(adapter.publisher.getLogger().recent().length).toBeGreaterThan(0);
    expect(adapter.lifecycle.suggestFromDomainStatus("support_request", "closed")).toBe(
      "archived",
    );
    expect(adapter.lifecycle.suggestFromDomainStatus("support_request", "new")).toBe(
      "draft",
    );
  });

  it("validates mandatory metadata and provider leakage", () => {
    const adapter = createSupportSearchAdapter();
    const context = ctx();
    const draft = adapter.mapper.mapSupportRequest(context, ticket);
    const ok = adapter.validator.validateDraft(context, draft);
    expect(ok.valid).toBe(true);

    const leak = adapter.validator.validateDraft(context, {
      ...draft,
      metadata: { ...draft.metadata, meilisearchIndex: "x" },
    });
    expect(leak.valid).toBe(false);
    expect(leak.issues.some((i) => i.code === "provider_leakage")).toBe(true);

    const incomplete = adapter.validator.validateDraft(context, {
      entityId: "sreq_x",
      entityType: "support_request",
      title: "X",
      classification: "internal",
      metadata: {},
    });
    expect(incomplete.valid).toBe(false);
  });
});
