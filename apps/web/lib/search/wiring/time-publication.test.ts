/**
 * Platform-1.3-ENG-001 — Time Search Live Drain wiring tests
 */

import { beforeEach, describe, expect, it } from "vitest";
import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import {
  createTimePlatformServicesForTest,
  type TimeOpsProvider,
} from "@apzhub/platform-services";
import { createSearchOrchestrationForTest } from "@apzhub/search-orchestrator";

import {
  getSearchCompositionRegistration,
  getSearchPublicationRuntime,
  resetSearchPublicationRuntimeForTests,
  setSearchPublicationRuntimeForTests,
} from "../publication-runtime";
import { wireTimeBundleSearchPublication } from "./time-publication";

function mockOps(): TimeOpsProvider {
  return {
    getFoundationCapabilities: async () => ({
      adapterId: "in-memory",
      adapterVersion: "0.0.0",
      domainCrudAvailable: true,
      operations: ["health", "diagnostics", "domain"],
    }),
    testConnection: async () => ({ ok: true, message: "in-memory" }),
    getHealth: async () => ({
      status: "healthy",
      checks: [{ name: "in-memory", status: "pass" }],
      observedAt: new Date().toISOString(),
    }),
    getDiagnostics: async () => ({
      healthStatus: "healthy",
      warnings: [],
      recommendations: [],
      foundationOnly: true,
    }),
    getCompatibility: async () => ({
      compatibilityStatus: "compatible",
      edition: "community",
    }),
    getReadiness: async () => ({
      ready: true,
      classification: "ready",
      blockingFailures: [],
      warnings: [],
    }),
  };
}

function ctx(): ServiceRequestContext {
  return {
    tenantId: "tenant_a",
    organisationId: "org_a",
    correlationId: "corr_eng001_time",
    userId: "user_a",
    permissions: ["time.*", "search.*"],
    locale: "en",
  };
}

describe("Platform-1.3-ENG-001 Time Search Live Drain", () => {
  beforeEach(() => {
    resetSearchPublicationRuntimeForTests();
    setSearchPublicationRuntimeForTests(
      createSearchOrchestrationForTest({
        allowInMemoryJournal: true,
        env: { APZHUB_SEARCH_ORCHESTRATION_ENABLED: "true" },
      }),
    );
  });

  it("wires Time mutations into publication journal and drains to Search Integration", async () => {
    const bundle = wireTimeBundleSearchPublication(
      createTimePlatformServicesForTest({ ops: mockOps() }),
      { APZHUB_SEARCH_ORCHESTRATION_ENABLED: "true" },
    );
    expect(getSearchCompositionRegistration().time).toBe(true);

    const gateway = bundle.gatewaySurface;
    const customer = await gateway.customers.create(ctx(), { name: "Acme" });
    const project = await gateway.projects.create(ctx(), {
      name: "Delivery",
      customerId: customer.id,
    });
    const activity = await gateway.activities.create(ctx(), {
      name: "Development",
      projectId: project.id,
    });
    const timesheet = await gateway.timesheets.create(ctx(), {
      description: "Billable drafting",
      projectId: project.id,
      activityId: activity.id,
    });

    // Allow microtask drain schedule to settle, then force a batch.
    await Promise.resolve();
    const live = getSearchPublicationRuntime({
      APZHUB_SEARCH_ORCHESTRATION_ENABLED: "true",
    });
    const drained = await live.orchestrator.processBatch();
    expect(drained.published + drained.processed).toBeGreaterThanOrEqual(1);

    const published = live.integration.sink.list({
      tenantId: "tenant_a",
      productId: "time",
    });
    expect(published.length).toBeGreaterThanOrEqual(1);
    expect(
      published.some(
        (e) =>
          e.id === timesheet.id ||
          e.id === customer.id ||
          e.entityType === "time_entry" ||
          e.entityType === "time_customer",
      ),
    ).toBe(true);
  });
});
