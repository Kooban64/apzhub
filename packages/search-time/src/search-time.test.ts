/**
 * R12-SEARCH-01 — Time Search Publication Adapter tests.
 */
import { describe, expect, it } from "vitest";
import type {
  TimeActivity,
  TimeCustomer,
  TimeProject,
  TimeTag,
  Timesheet,
} from "@apzhub/platform-service-contracts";

import {
  SEARCH_TIME_VERSION,
  createTimeSearchAdapter,
  createTimeSearchPublicationContext,
  isTimeSearchEntityType,
  looksLikeKimaiIdentifier,
} from "./index";

function ctx(tenantId = "tenant-a", org = "org-a") {
  return createTimeSearchPublicationContext({
    serviceContext: {
      tenantId,
      userId: "user-1",
      correlationId: "corr-search-time",
      permissions: ["time.read", "search.query.execute"],
      organisationId: org,
      workspaceId: "ws_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    },
  });
}

const entry: Timesheet = {
  id: "tts_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  tenantId: "tenant-a",
  userId: "user-1",
  description: "Client delivery block",
  status: "running",
  durationMinutes: 45,
  startedAt: "2026-07-19T08:00:00.000Z",
  activityId: "tact_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  customerId: "tcust_dddddddddddddddddddddddddddddddd",
  projectId: "tproj_ffffffffffffffffffffffffffffffff",
  tagIds: ["ttag_eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"],
  billable: true,
  createdAt: "2026-07-19T08:00:00.000Z",
  updatedAt: "2026-07-19T08:45:00.000Z",
};

const activity: TimeActivity = {
  id: "tact_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  tenantId: "tenant-a",
  name: "Delivery",
  description: "Client delivery activity",
  projectId: "tproj_ffffffffffffffffffffffffffffffff",
  status: "active",
  createdAt: "2026-07-01T00:00:00.000Z",
  updatedAt: "2026-07-01T00:00:00.000Z",
};

const customer: TimeCustomer = {
  id: "tcust_dddddddddddddddddddddddddddddddd",
  tenantId: "tenant-a",
  name: "Acme Corp",
  number: "C-100",
  status: "active",
  createdAt: "2026-07-01T00:00:00.000Z",
  updatedAt: "2026-07-01T00:00:00.000Z",
};

const project: TimeProject = {
  id: "tproj_ffffffffffffffffffffffffffffffff",
  tenantId: "tenant-a",
  name: "Acme Retainer",
  customerId: "tcust_dddddddddddddddddddddddddddddddd",
  status: "active",
  createdAt: "2026-07-01T00:00:00.000Z",
  updatedAt: "2026-07-01T00:00:00.000Z",
};

const tag: TimeTag = {
  id: "ttag_eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  tenantId: "tenant-a",
  name: "delivery-work",
  color: "#336699",
  status: "active",
  createdAt: "2026-07-01T00:00:00.000Z",
  updatedAt: "2026-07-01T00:00:00.000Z",
};

describe("R12-SEARCH-01 search-time", () => {
  it("ships version and entity catalogue", () => {
    expect(SEARCH_TIME_VERSION).toBe("0.1.0");
    expect(isTimeSearchEntityType("time_entry")).toBe(true);
    expect(isTimeSearchEntityType("support_request")).toBe(false);
    expect(looksLikeKimaiIdentifier("tts_kimai_99")).toBe(true);
    expect(looksLikeKimaiIdentifier("kimai_timesheet_1")).toBe(true);
    expect(looksLikeKimaiIdentifier("Timesheet::1")).toBe(true);
    expect(looksLikeKimaiIdentifier("tts_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")).toBe(
      false,
    );
  });

  it("maps and publishes all Time entity types without Kimai or financial leakage", () => {
    const adapter = createTimeSearchAdapter();
    const context = ctx();

    for (const input of [
      { entityType: "time_entry" as const, entity: entry },
      { entityType: "time_activity" as const, entity: activity },
      { entityType: "time_customer" as const, entity: customer },
      { entityType: "time_project" as const, entity: project },
      { entityType: "time_tag" as const, entity: tag },
    ]) {
      const preview = adapter.publisher.preview(context, input);
      expect(preview.ok, input.entityType).toBe(true);
      expect(preview.previewMetadata?.productId).toBe("time");
      expect(JSON.stringify(preview.previewMetadata)).not.toMatch(/kimai/i);
      expect(JSON.stringify(preview.previewMetadata?.custom ?? {})).not.toMatch(
        /billable|hourlyRate|invoice/i,
      );

      const published = adapter.publisher.publish(context, input);
      expect(published.ok, input.entityType).toBe(true);
      expect(published.lifecycleState).toBe("published");
    }

    expect(adapter.integration.sink.count()).toBe(5);
    const stats = adapter.publisher.statistics(context);
    expect(stats.published).toBe(5);
    expect(stats.byEntityType["time_entry"]).toBeGreaterThan(0);

    const entryDraft = adapter.mapper.mapTimeEntry(context, entry);
    expect(entryDraft.metadata).not.toHaveProperty("billable");
    expect(entryDraft.metadata).not.toHaveProperty("originMetadata");
    expect(JSON.stringify(entryDraft.metadata)).not.toMatch(/kimai/i);
  });

  it("rejects Kimai ids and tenant mismatches", () => {
    const adapter = createTimeSearchAdapter();
    const context = ctx();

    expect(() =>
      adapter.mapper.mapTimeEntry(context, {
        ...entry,
        id: "tts_kimai_native123",
      }),
    ).toThrow(/Kimai/);

    const badValidate = adapter.publisher.validate(context, {
      entityType: "time_entry",
      entity: { ...entry, id: "kimai_timesheet_x" },
    });
    expect(badValidate.ok).toBe(false);

    expect(() =>
      adapter.mapper.mapTimeEntry(context, {
        ...entry,
        tenantId: "other-tenant",
      }),
    ).toThrow(/tenant mismatch/);

    const published = adapter.publisher.publish(context, {
      entityType: "time_entry",
      entity: entry,
    });
    expect(published.ok).toBe(true);

    const crossTenantRemove = adapter.publisher.remove(
      ctx("other-tenant"),
      "time_entry",
      entry.id,
    );
    expect(crossTenantRemove.ok).toBe(false);
  });

  it("supports lifecycle hooks upsert/remove and diagnostics", () => {
    const adapter = createTimeSearchAdapter();
    const context = ctx();

    const first = adapter.hooks.onTimeEntryUpserted(context, entry);
    expect(first.ok).toBe(true);
    expect(first.operation).toBe("publish");

    const second = adapter.hooks.onTimeEntryUpserted(context, {
      ...entry,
      description: "Client delivery block (updated)",
    });
    expect(second.ok).toBe(true);
    expect(second.operation).toBe("update");

    const life = adapter.publisher.lifecycle(context, entry.id, "archived", "done");
    expect(life.ok).toBe(true);

    const other: Timesheet = {
      ...entry,
      id: "tts_33333333333333333333333333333333",
      description: "Other",
    };
    expect(adapter.hooks.onEntryUpserted(context, other).ok).toBe(true);
    const removed = adapter.hooks.onTimeEntryRemoved(context, other.id);
    expect(removed.ok).toBe(true);

    adapter.hooks.onTimeActivityUpserted(context, activity);
    adapter.hooks.onTimeCustomerUpserted(context, customer);
    adapter.hooks.onTimeProjectUpserted(context, project);
    adapter.hooks.onTimeTagUpserted(context, tag);

    const diag = adapter.publisher.diagnostics(context);
    expect(diag.adapterVersion).toBe("0.1.0");
    expect(diag.productId).toBe("time");
    expect(diag.supportedEntityTypes).toContain("time_entry");
    expect(diag.mapperNotes.length).toBeGreaterThan(0);
    expect(adapter.publisher.getLogger().recent().length).toBeGreaterThan(0);
    expect(adapter.lifecycle.suggestFromDomainStatus("time_entry", "archived")).toBe(
      "archived",
    );
    expect(adapter.lifecycle.suggestFromDomainStatus("time_entry", "running")).toBe(
      "validated",
    );
  });

  it("validates mandatory metadata and rejects financial / provider leakage", () => {
    const adapter = createTimeSearchAdapter();
    const context = ctx();
    const draft = adapter.mapper.mapTimeEntry(context, entry);
    const ok = adapter.validator.validateDraft(context, draft);
    expect(ok.valid).toBe(true);

    const leak = adapter.validator.validateDraft(context, {
      ...draft,
      metadata: { ...draft.metadata, meilisearchIndex: "x" },
    });
    expect(leak.valid).toBe(false);
    expect(leak.issues.some((i) => i.code === "provider_leakage")).toBe(true);

    const financial = adapter.validator.validateDraft(context, {
      ...draft,
      metadata: { ...draft.metadata, billable: "true", hourlyRate: "100" },
    });
    expect(financial.valid).toBe(false);
    expect(financial.issues.some((i) => i.code === "financial_forbidden")).toBe(true);

    const incomplete = adapter.validator.validateDraft(context, {
      entityId: "tts_x",
      entityType: "time_entry",
      title: "X",
      classification: "internal",
      metadata: {},
    });
    expect(incomplete.valid).toBe(false);
  });
});
