/**
 * APZSEARCH-011 deep coverage — validator / publisher / hooks branches.
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
  SupportSearchPublisher,
  createSupportSearchAdapter,
  createSupportSearchPublicationContext,
} from "./index";

function ctx(overrides?: { permissions?: readonly string[] }) {
  return createSupportSearchPublicationContext({
    serviceContext: {
      tenantId: "tenant-a",
      userId: "user-1",
      correlationId: "corr-deep",
      permissions: overrides?.permissions ?? ["support.read"],
      organisationId: "org-a",
    },
  });
}

const ticket: SupportTicket = {
  id: "sreq_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  tenantId: "tenant-a",
  title: "Cannot login",
  groupId: "sgrp_cccccccccccccccccccccccccccccccc",
  requesterId: "susr_dddddddddddddddddddddddddddddddd",
  status: "open",
  priority: "high",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("APZSEARCH-011 deep coverage", () => {
  it("exercises validator edge codes", () => {
    const adapter = createSupportSearchAdapter();
    const context = ctx();

    expect(
      adapter.validator
        .validateDraft(context, {
          entityId: "",
          entityType: "support_request",
          title: "",
          classification: undefined,
          metadata: {
            status: "open",
            priority: "high",
            groupId: "sgrp_zammad_bad",
            requesterId: "susr_ok",
            meiliUid: "x",
            originMetadata: "nope",
          },
        })
        .issues.map((i) => i.code),
    ).toEqual(
      expect.arrayContaining([
        "required",
        "zammad_id_forbidden",
        "provider_leakage",
        "origin_leakage",
      ]),
    );

    expect(
      adapter.validator
        .validateDraft(context, {
          entityId: "sreq_zammad_x",
          entityType: "unknown",
          title: "T",
          classification: "internal",
          metadata: {},
        })
        .issues.some((i) => i.code === "unsupported"),
    ).toBe(true);

    expect(
      adapter.validator.validateDraft(context, {
        entityId: "ok",
        entityType: "support_request",
        title: "T",
        classification: "internal",
        metadata: {
          status: "",
          priority: "high",
          groupId: "sgrp_ok",
          requesterId: "susr_ok",
        },
      }).valid,
    ).toBe(false);

    expect(
      adapter.validator
        .validateDraft(context, {
          entityId: "ok",
          entityType: "support_article",
          title: "T",
          classification: "internal",
          metadata: {
            supportTicketId: "Ticket::99",
            channel: "email",
            visibility: "public",
            senderType: "agent",
            zammadArticleId: "1",
          },
        })
        .issues.some((i) => i.code === "zammad_id_forbidden"),
    ).toBe(true);
  });

  it("covers remaining hooks removes and publisher catch paths", () => {
    const adapter = createSupportSearchAdapter();
    const context = ctx();

    expect(
      adapter.validator
        .validateDraft(
          {
            ...context,
            tenantId: "",
            permissions: null as unknown as readonly string[],
          },
          {
            entityId: "x",
            entityType: "support_group",
            title: "T",
            classification: "internal",
            metadata: { active: "true" },
          },
        )
        .issues.map((i) => i.field),
    ).toEqual(expect.arrayContaining(["tenantId", "permissions"]));

    const article: SupportArticle = {
      id: "sart_11111111111111111111111111111111",
      tenantId: "tenant-a",
      supportTicketId: ticket.id,
      subject: "Note",
      body: "Hello",
      bodyFormat: "text/plain",
      channel: "note",
      visibility: "public",
      senderType: "customer",
      author: { senderType: "customer" },
      deliveryStatus: "none",
      attachments: [],
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    const organisation: SupportOrganization = {
      id: "sorg_ffffffffffffffffffffffffffffffff",
      tenantId: "tenant-a",
      name: "Acme",
      domain: "acme.example",
      active: true,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    const group: SupportGroup = {
      id: "sgrp_cccccccccccccccccccccccccccccccc",
      tenantId: "tenant-a",
      name: "L1",
      active: true,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    const user: SupportUser = {
      id: "susr_dddddddddddddddddddddddddddddddd",
      tenantId: "tenant-a",
      email: "a@example.com",
      displayName: "Agent",
      active: true,
      role: "agent",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };

    expect(adapter.hooks.onSupportRequestUpserted(context, ticket).ok).toBe(true);
    expect(adapter.hooks.onSupportArticleUpserted(context, article).ok).toBe(true);
    expect(adapter.hooks.onSupportOrganisationUpserted(context, organisation).ok).toBe(
      true,
    );
    expect(adapter.hooks.onSupportGroupUpserted(context, group).ok).toBe(true);
    expect(adapter.hooks.onSupportUserUpserted(context, user).ok).toBe(true);

    expect(adapter.hooks.onArticleRemoved(context, article.id).ok).toBe(true);
    expect(adapter.hooks.onOrganisationRemoved(context, organisation.id).ok).toBe(true);
    expect(adapter.hooks.onGroupRemoved(context, group.id).ok).toBe(true);
    expect(adapter.hooks.onUserRemoved(context, user.id).ok).toBe(true);
    expect(adapter.hooks.onRequestRemoved(context, ticket.id).ok).toBe(true);

    expect(adapter.hooks.onSupportRequestUpserted(context, ticket).ok).toBe(true);

    const missingUpdate = adapter.publisher.update(context, {
      entityType: "support_request",
      entity: {
        ...ticket,
        id: "sreq_99999999999999999999999999999999",
      },
    });
    expect(missingUpdate.ok).toBe(false);

    expect(
      adapter.publisher.remove(
        context,
        "support_request",
        "sreq_00000000000000000000000000000000",
      ).ok,
    ).toBe(false);

    const mismatch = adapter.publisher.validate(context, {
      entityType: "support_request",
      entity: { ...ticket, tenantId: "other" },
    });
    expect(mismatch.ok).toBe(false);

    expect(
      adapter.publisher.preview(context, {
        entityType: "support_request",
        entity: { ...ticket, id: "sreq_zammad_x" },
      }).ok,
    ).toBe(false);

    expect(
      adapter.publisher.lifecycle(
        context,
        "sreq_00000000000000000000000000000000",
        "archived",
      ).ok,
    ).toBe(false);

    expect(adapter.publisher.getIntegrationPublisher()).toBeDefined();
    expect(adapter.metrics.snapshot().removed).toBeGreaterThan(0);

    const throwing = {
      publish: () => {
        throw new Error("boom publish");
      },
      update: () => {
        throw new Error("boom update");
      },
      preview: () => {
        throw new Error("boom preview");
      },
      remove: () => {
        throw new Error("boom remove");
      },
      lifecycle: () => {
        throw new Error("boom lifecycle");
      },
      validate: () => {
        throw new Error("boom validate");
      },
      getSink: () => adapter.integration.sink,
    } as never;

    const broken = createSupportSearchAdapter({
      integrationPublisher: throwing,
      integration: adapter.integration,
    });
    const publisherThrow = new SupportSearchPublisher({
      integrationPublisher: throwing,
      mapper: adapter.mapper,
      validator: {
        validateDraft: () => ({
          valid: false,
          issues: [{ field: "title", code: "required", message: "forced" }],
        }),
      } as never,
    });
    expect(
      publisherThrow.publish(context, {
        entityType: "support_request",
        entity: ticket,
      }).ok,
    ).toBe(false);

    const publisherOkMap = new SupportSearchPublisher({
      integrationPublisher: throwing,
    });
    expect(
      publisherOkMap.publish(context, {
        entityType: "support_request",
        entity: ticket,
      }).ok,
    ).toBe(false);
    expect(publisherOkMap.remove(context, "support_request", ticket.id).ok).toBe(false);
    expect(publisherOkMap.lifecycle(context, ticket.id, "archived").ok).toBe(false);
    expect(
      publisherOkMap.validate(context, {
        entityType: "support_request",
        entity: ticket,
      }).ok,
    ).toBe(false);
    expect(
      publisherOkMap.preview(context, {
        entityType: "support_request",
        entity: ticket,
      }).ok,
    ).toBe(false);
    expect(
      publisherOkMap.update(context, {
        entityType: "support_request",
        entity: ticket,
      }).ok,
    ).toBe(false);

    void broken;
    expect(adapter.lifecycle.suggestFromDomainStatus("support_request", "open")).toBe(
      "validated",
    );

    // Inactive group mapping + alias upserts
    const inactiveGroup: SupportGroup = { ...group, active: false };
    expect(adapter.mapper.mapSupportGroup(context, inactiveGroup).classification).toBe(
      "restricted",
    );
    expect(adapter.hooks.onGroupUpserted(context, group).ok).toBe(true);
    expect(adapter.hooks.onUserUpserted(context, user).ok).toBe(true);
    expect(adapter.hooks.onArticleUpserted(context, article).ok).toBe(true);
    expect(adapter.hooks.onOrganisationUpserted(context, organisation).ok).toBe(true);
  });
});
