/**
 * R12-SEARCH-01 residual coverage.
 */
import { describe, expect, it } from "vitest";
import type { Timesheet } from "@apzhub/platform-service-contracts";

import {
  DiagnosticsStore,
  TimeSearchErrorTranslator,
  TimeSearchLifecycle,
  assertPlatformEntityId,
  createTimeSearchAdapter,
  createTimeSearchPublicationContext,
  toSearchIntegrationContext,
} from "./index";

function ctx() {
  return createTimeSearchPublicationContext({
    serviceContext: {
      tenantId: "tenant-a",
      userId: "user-1",
      correlationId: "corr-cov",
      permissions: ["time.read"],
      organisationId: "org-a",
      requestId: "req-1",
      locale: "en",
    },
  });
}

const entry: Timesheet = {
  id: "tts_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  tenantId: "tenant-a",
  userId: "user-1",
  status: "stopped",
  durationMinutes: 30,
  startedAt: "2026-07-19T08:00:00.000Z",
  endedAt: "2026-07-19T08:30:00.000Z",
  tagIds: [],
  billable: false,
  createdAt: "2026-07-19T08:00:00.000Z",
  updatedAt: "2026-07-19T08:30:00.000Z",
};

describe("R12-SEARCH-01 residual coverage", () => {
  it("covers context helpers, assert ids, lifecycle suggest, errors", () => {
    const context = ctx();
    expect(toSearchIntegrationContext(context).productId).toBe("time");
    expect(() => assertPlatformEntityId("")).toThrow(/required/);
    expect(() => assertPlatformEntityId("a::b")).toThrow(/Kimai/);
    expect(() => assertPlatformEntityId("kimai_1")).toThrow(/Kimai/);

    const life = new TimeSearchLifecycle();
    expect(life.suggestFromDomainStatus("time_entry", "archived")).toBe("archived");
    expect(life.suggestFromDomainStatus("time_entry", "new")).toBe("draft");
    expect(life.suggestFromDomainStatus("time_customer", "active", true)).toBe(
      "archived",
    );
    expect(life.suggestFromDomainStatus("time_project", undefined)).toBe("validated");
    expect(life.canTransition("draft", "validated")).toBe(true);
    life.assertTransition("draft", "validated");

    const errors = new TimeSearchErrorTranslator();
    expect(errors.translate(new Error("Kimai leak")).classification).toBe(
      "validation_failed",
    );
    expect(errors.translate(new Error("tenant mismatch")).classification).toBe(
      "tenant_mismatch",
    );
    expect(errors.translate(new Error("other")).message).toBeTruthy();

    const store = new DiagnosticsStore();
    store.touch("preview", "corr", "time_entry");
    const diag = store.build(
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
      ["time_entry"],
    );
    expect(diag.productId).toBe("time");
    expect(diag.lastOperation).toBe("preview");
  });

  it("covers publisher validate/update/remove paths and accessors", () => {
    const adapter = createTimeSearchAdapter();
    const context = ctx();

    expect(
      adapter.publisher.validate(context, { entityType: "time_entry", entity: entry })
        .ok,
    ).toBe(true);
    expect(
      adapter.publisher.publish(context, { entityType: "time_entry", entity: entry })
        .ok,
    ).toBe(true);
    expect(
      adapter.publisher.update(context, {
        entityType: "time_entry",
        entity: { ...entry, description: "Updated" },
      }).ok,
    ).toBe(true);
    expect(adapter.publisher.getMapper()).toBe(adapter.mapper);
    expect(adapter.publisher.getValidator()).toBe(adapter.validator);
    expect(adapter.publisher.getLifecycle()).toBe(adapter.lifecycle);
    expect(adapter.publisher.getMetrics()).toBe(adapter.metrics);
    expect(adapter.publisher.getLogger()).toBe(adapter.logger);
    expect(adapter.publisher.getIntegrationPublisher()).toBeDefined();

    expect(adapter.hooks.onActivityRemoved(context, "tact_x").ok).toBe(false);
    expect(adapter.hooks.onCustomerRemoved(context, "tcust_x").ok).toBe(false);
    expect(adapter.hooks.onProjectRemoved(context, "tproj_x").ok).toBe(false);
    expect(adapter.hooks.onTagRemoved(context, "ttag_x").ok).toBe(false);
  });
});
