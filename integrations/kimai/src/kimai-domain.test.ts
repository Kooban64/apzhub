import type { IntegrationRequestContext } from "@apzhub/integration-sdk";
import { describe, expect, it } from "vitest";

import {
  createKimaiAdapter,
  disposeKimaiAdapter,
  createMockKimaiFetch,
  DEFAULT_TEST_KIMAI_CONFIG,
  TEST_CORRELATION_ID,
  TEST_TENANT_ID,
} from "./index";

function ctx(): IntegrationRequestContext {
  return {
    tenantId: TEST_TENANT_ID,
    correlationId: TEST_CORRELATION_ID,
  };
}

describe("@apzhub/integration-kimai domain services (KIMAI-002)", () => {
  it("supports customer/project/activity/tag/timesheet domain CRUD via adapter.core", async () => {
    const { adapter, factory } = await createKimaiAdapter({
      tenantId: TEST_TENANT_ID,
      kimai: DEFAULT_TEST_KIMAI_CONFIG,
      apiToken: "domain-token",
      adapterOptions: { fetchFn: createMockKimaiFetch() },
    });
    await adapter.connect(ctx());

    expect(adapter.core).toBeDefined();

    const customers = await adapter.core.customers.list(ctx());
    expect(customers.items.length).toBeGreaterThan(0);

    const customer = await adapter.core.customers.create(ctx(), {
      name: "Contoso",
      number: "C-9",
    });
    expect(customer.id).toMatch(/^tcust_/);

    const project = await adapter.core.projects.create(ctx(), {
      name: "Delivery",
      customerId: customer.id,
    });
    expect(project.id).toMatch(/^tproj_/);

    const activity = await adapter.core.activities.create(ctx(), {
      name: "Coding",
      projectId: project.id,
    });
    expect(activity.id).toMatch(/^tact_/);

    const tag = await adapter.core.tags.create(ctx(), {
      name: "urgent",
      color: "#abcdef",
    });
    expect(tag.id).toMatch(/^ttag_/);

    const timesheet = await adapter.core.timesheets.create(ctx(), {
      description: "Implement domain",
      activityId: activity.id,
      projectId: project.id,
      tagIds: [tag.id],
      billable: true,
    });
    expect(timesheet.id).toMatch(/^tts_/);
    expect(timesheet.status).toBe("running");

    const stopped = await adapter.core.timesheets.stop(ctx(), timesheet.id);
    expect(stopped.status).toBe("stopped");
    expect(stopped.durationMinutes).toBeGreaterThan(0);

    const searched = await adapter.core.customers.list(ctx(), { search: "Contoso" });
    expect(searched.items.some((item) => item.name === "Contoso")).toBe(true);

    await disposeKimaiAdapter(adapter, factory);
  });
});
