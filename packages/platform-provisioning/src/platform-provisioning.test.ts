import { describe, expect, it } from "vitest";

import { createInMemoryGovernanceService } from "@apzhub/platform-governance";
import { createInMemoryOutboxStore } from "@apzhub/platform-outbox";

import {
  PLATFORM_PROVISIONING_VERSION,
  PROVISIONING_EVENT_COMPLETED,
  PROVISIONING_EVENT_STARTED,
  createPlatformProvisioning,
  evaluateCommercialReadiness,
  stepsForKind,
} from "./index";

describe("OSS-100-12+ Product Provisioning Engine (unit)", () => {
  it("exposes package version 0.1.0", () => {
    expect(PLATFORM_PROVISIONING_VERSION).toBe("0.1.0");
  });

  it("defines tenant enablement workflow steps", () => {
    expect(stepsForKind("tenant_enablement")).toEqual([
      "validate",
      "enable_baseline",
      "enable_products",
      "activate_products",
      "finalize",
    ]);
  });

  it("runs synchronous tenant enablement to completion", async () => {
    const { service } = createInMemoryGovernanceService();
    const runtime = createPlatformProvisioning({ governance: service });

    const events: string[] = [];
    runtime.bus.subscribe({
      eventPattern: "platform.provisioning.*",
      handler: (envelope) => {
        events.push(envelope.eventId);
      },
    });

    const flow = await runtime.engine.startTenantEnablement({
      tenantId: "tenant-unit-1",
      productKeys: ["law-platform"],
      actorId: "user-1",
    });

    expect(flow.status).toBe("completed");
    expect(flow.steps.map((s) => s.step)).toEqual([
      "validate",
      "enable_baseline",
      "enable_products",
      "activate_products",
      "finalize",
    ]);
    expect(flow.governanceRecordIds.length).toBeGreaterThan(0);
    expect(events).toContain(PROVISIONING_EVENT_STARTED);
    expect(events).toContain(PROVISIONING_EVENT_COMPLETED);

    const enablements = await service.governance.listEnablements();
    expect(
      enablements.some(
        (e) =>
          e.scopeKey === "tenant-unit-1" && e.targetKey === "law-platform" && e.enabled,
      ),
    ).toBe(true);

    const health = runtime.health();
    expect(health.component).toBe("platform-provisioning");
    expect(health.flows.completed).toBe(1);
    expect(runtime.diagnostics().auditCount).toBeGreaterThan(0);
  });

  it("fails validation when tenantId is empty", async () => {
    const { service } = createInMemoryGovernanceService();
    const runtime = createPlatformProvisioning({ governance: service });

    const flow = await runtime.engine.startProductEnablement({
      tenantId: "   ",
      productKeys: ["law-platform"],
    });

    expect(flow.status).toBe("failed");
    expect(flow.steps[0]?.step).toBe("validate");
  });

  it("evaluates commercial readiness with provisioningImplemented true", async () => {
    const { service } = createInMemoryGovernanceService();
    const runtime = createPlatformProvisioning({ governance: service });
    await runtime.engine.startTenantEnablement({
      tenantId: "tenant-ready-1",
      productKeys: ["law-platform"],
    });

    const snapshot = await evaluateCommercialReadiness({
      tenantId: "tenant-ready-1",
      governance: service,
      hasAdmin: true,
      productionVerdict: "READY",
    });

    expect(snapshot.provisioningImplemented).toBe(true);
    const baseline = snapshot.hooks.find(
      (h) => h.id === "onboarding.governance.baseline",
    );
    const products = snapshot.hooks.find((h) => h.id === "onboarding.products.enabled");
    expect(baseline?.status).toBe("pass");
    expect(products?.status).toBe("pass");
  });

  it("queues async flows onto the outbox", async () => {
    const { service } = createInMemoryGovernanceService();
    const outboxStore = createInMemoryOutboxStore();
    const runtime = createPlatformProvisioning({
      governance: service,
      outboxStore,
    });

    const flow = await runtime.engine.startTenantEnablement({
      tenantId: "tenant-async-1",
      productKeys: ["law-platform"],
      async: true,
    });

    expect(flow.status).toBe("in_progress");
    expect(flow.message).toMatch(/queued/i);
    const counts = await outboxStore.countByStatus();
    expect(counts.pending).toBe(1);
  });
});
