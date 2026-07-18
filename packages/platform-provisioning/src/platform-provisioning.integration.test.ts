import { describe, expect, it } from "vitest";

import { createInMemoryGovernanceService } from "@apzhub/platform-governance";
import {
  createAcknowledgingHandler,
  createInMemoryOutboxStore,
  createOutboxWorker,
} from "@apzhub/platform-outbox";

import { PROVISIONING_EVENT_COMPLETED, createPlatformProvisioning } from "./index";

/**
 * Integration: governance + Event Bus + outbox drain for async provisioning.
 */
describe("OSS-100-12+ integration", () => {
  it("end-to-end async: enqueue → worker → completed + events", async () => {
    const { service } = createInMemoryGovernanceService();
    const store = createInMemoryOutboxStore();
    const runtime = createPlatformProvisioning({
      governance: service,
      outboxStore: store,
    });

    const completed: string[] = [];
    runtime.bus.subscribe({
      eventPattern: "platform.provisioning.*",
      handler: (envelope) => {
        if (envelope.eventId === PROVISIONING_EVENT_COMPLETED) {
          completed.push(String(envelope.payload.flowId));
        }
      },
    });

    const started = await runtime.engine.startTenantEnablement({
      tenantId: "tenant-e2e-1",
      productKeys: ["law-platform"],
      async: true,
      correlationId: "corr-prov-e2e",
    });

    expect(started.status).toBe("in_progress");

    const worker = createOutboxWorker({
      store,
      handlers: [
        runtime.createOutboxHandler("provisioning-steps"),
        createAcknowledgingHandler("ack"),
      ],
    });

    // Drain until flow completes (each step re-enqueues the next)
    for (let i = 0; i < 12; i++) {
      const flow = runtime.engine.getFlow(started.flowId);
      if (flow?.status === "completed" || flow?.status === "failed") break;
      await worker.processBatch();
    }

    const final = runtime.engine.getFlow(started.flowId);
    expect(final?.status).toBe("completed");
    expect(completed).toContain(started.flowId);

    const history = await service.provisioning.listProvisioningHistory({
      scopeType: "tenant",
      scopeKey: "tenant-e2e-1",
    });
    expect(history.some((r) => r.status === "completed")).toBe(true);

    const health = runtime.health();
    expect(["healthy", "degraded"]).toContain(health.status);
    expect(runtime.diagnostics().eventPublishOk).toBeGreaterThan(0);
  });

  it("product activation flow activates without baseline step", async () => {
    const { service } = createInMemoryGovernanceService();
    const runtime = createPlatformProvisioning({ governance: service });

    await runtime.engine.startProductEnablement({
      tenantId: "tenant-act-1",
      productKeys: ["law-platform"],
    });

    const activation = await runtime.engine.startProductActivation({
      tenantId: "tenant-act-1",
      productKeys: ["law-platform"],
    });

    expect(activation.status).toBe("completed");
    expect(activation.steps.map((s) => s.step)).toEqual([
      "validate",
      "activate_products",
      "finalize",
    ]);
  });
});
