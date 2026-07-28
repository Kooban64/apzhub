/**
 * R12-SEARCH-01 deep coverage — validator / publisher / hooks branches.
 */
import { describe, expect, it } from "vitest";
import type {
  TimeActivity,
  TimeCustomer,
  TimeProject,
  TimeTag,
  Timesheet,
} from "@apzhub/platform-service-contracts";

import { createTimeSearchAdapter, createTimeSearchPublicationContext } from "./index";

function ctx(tenantId = "tenant-a") {
  return createTimeSearchPublicationContext({
    serviceContext: {
      tenantId,
      userId: "user-1",
      correlationId: "corr-deep",
      permissions: ["time.read"],
      organisationId: "org-a",
    },
  });
}

const entry: Timesheet = {
  id: "tts_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  tenantId: "tenant-a",
  userId: "user-1",
  description: "<b>HTML</b> note",
  status: "archived",
  durationMinutes: 10,
  startedAt: "2026-07-19T08:00:00.000Z",
  tagIds: [],
  billable: true,
  createdAt: "2026-07-19T08:00:00.000Z",
  updatedAt: "2026-07-19T08:10:00.000Z",
};

const activity: TimeActivity = {
  id: "tact_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  tenantId: "tenant-a",
  name: "A",
  status: "archived",
  createdAt: "2026-07-01T00:00:00.000Z",
  updatedAt: "2026-07-01T00:00:00.000Z",
};

const customer: TimeCustomer = {
  id: "tcust_dddddddddddddddddddddddddddddddd",
  tenantId: "tenant-a",
  name: "C",
  status: "archived",
  createdAt: "2026-07-01T00:00:00.000Z",
  updatedAt: "2026-07-01T00:00:00.000Z",
};

const project: TimeProject = {
  id: "tproj_ffffffffffffffffffffffffffffffff",
  tenantId: "tenant-a",
  name: "P",
  status: "archived",
  createdAt: "2026-07-01T00:00:00.000Z",
  updatedAt: "2026-07-01T00:00:00.000Z",
};

const tag: TimeTag = {
  id: "ttag_eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  tenantId: "tenant-a",
  name: "T",
  status: "archived",
  createdAt: "2026-07-01T00:00:00.000Z",
  updatedAt: "2026-07-01T00:00:00.000Z",
};

describe("R12-SEARCH-01 deep coverage", () => {
  it("maps archived entities and strips HTML", () => {
    const adapter = createTimeSearchAdapter();
    const context = ctx();
    const draft = adapter.mapper.mapTimeEntry(context, entry);
    expect(draft.title).not.toMatch(/</);
    expect(draft.classification).toBe("restricted");
    expect(adapter.mapper.mapTimeActivity(context, activity).classification).toBe(
      "restricted",
    );
    expect(adapter.mapper.mapTimeCustomer(context, customer).classification).toBe(
      "restricted",
    );
    expect(adapter.mapper.mapTimeProject(context, project).classification).toBe(
      "restricted",
    );
    expect(adapter.mapper.mapTimeTag(context, tag).classification).toBe("restricted");
  });

  it("rejects originMetadata and kimai metadata keys", () => {
    const adapter = createTimeSearchAdapter();
    const context = ctx();
    const draft = adapter.mapper.mapTimeEntry(context, entry);
    const origin = adapter.validator.validateDraft(context, {
      ...draft,
      metadata: { ...draft.metadata, originMetadata: "x" },
    });
    expect(origin.issues.some((i) => i.code === "origin_leakage")).toBe(true);

    const kimaiMeta = adapter.validator.validateDraft(context, {
      ...draft,
      metadata: { ...draft.metadata, kimaiId: "1" },
    });
    expect(kimaiMeta.issues.some((i) => i.code === "kimai_id_forbidden")).toBe(true);
  });

  it("covers alias hooks for all entity types", () => {
    const adapter = createTimeSearchAdapter();
    const context = ctx();
    expect(adapter.hooks.onEntryUpserted(context, entry).ok).toBe(true);
    expect(adapter.hooks.onActivityUpserted(context, activity).ok).toBe(true);
    expect(adapter.hooks.onCustomerUpserted(context, customer).ok).toBe(true);
    expect(adapter.hooks.onProjectUpserted(context, project).ok).toBe(true);
    expect(adapter.hooks.onTagUpserted(context, tag).ok).toBe(true);
    expect(adapter.hooks.onEntryRemoved(context, entry.id).ok).toBe(true);
    expect(adapter.hooks.onActivityRemoved(context, activity.id).ok).toBe(true);
    expect(adapter.hooks.onCustomerRemoved(context, customer.id).ok).toBe(true);
    expect(adapter.hooks.onProjectRemoved(context, project.id).ok).toBe(true);
    expect(adapter.hooks.onTagRemoved(context, tag.id).ok).toBe(true);
  });
});
