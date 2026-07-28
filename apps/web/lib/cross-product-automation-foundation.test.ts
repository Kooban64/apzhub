import { describe, expect, it, beforeEach } from "vitest";

import {
  createDomainEventEnvelopeId,
  resetDomainEventEnvelopeCounter,
} from "@apzhub/platform-services";

import {
  getOrCreateServerAutomationFoundation,
  getOrCreateServerDomainEventPublisher,
  resetServerDomainEventBusForTests,
} from "./api/v1/gateway/domain-event-bus";

describe("Cross-Product Automation Foundation wire (APZHUB-1.1-004)", () => {
  beforeEach(() => {
    resetServerDomainEventBusForTests();
    resetDomainEventEnvelopeCounter();
  });

  it("wires server Event Bus publish → Support automation journal", async () => {
    const publisher = getOrCreateServerDomainEventPublisher();
    const foundation = getOrCreateServerAutomationFoundation();

    const envelopeId = createDomainEventEnvelopeId();
    const result = publisher.publish({
      envelopeId,
      eventId: "support.request.created",
      eventVersion: "1.0.0",
      category: "business",
      correlationId: "corr-xpr-1",
      timestamp: new Date().toISOString(),
      publisher: "support-service",
      tenantId: "tenant-a",
      payload: { supportRequestId: "sreq_xpr_1", title: "Automation" },
    });

    expect(result.ok).toBe(true);

    await new Promise((r) => setTimeout(r, 10));

    const executions = await foundation.listExecutions({ envelopeId });
    expect(executions.length).toBeGreaterThan(0);
    expect(executions.some((e) => e.status === "succeeded")).toBe(true);
    expect(
      executions.some(
        (e) => e.registrationKey === "support.request.*→automation.journal",
      ),
    ).toBe(true);
  });

  it("records workflow-triggered automation as deferred (execute gated)", async () => {
    const publisher = getOrCreateServerDomainEventPublisher();
    const foundation = getOrCreateServerAutomationFoundation();

    foundation.register({
      key: "support.request.closed→workflow.demo",
      eventPattern: "support.request.closed",
      actionKind: "workflow.trigger",
      actionRef: "wf_demo_close",
      metadata: { triggerId: "wtrg_demo" },
    });

    const envelopeId = createDomainEventEnvelopeId();
    publisher.publish({
      envelopeId,
      eventId: "support.request.closed",
      eventVersion: "1.0.0",
      category: "business",
      correlationId: "corr-xpr-2",
      timestamp: new Date().toISOString(),
      publisher: "support-service",
      tenantId: "tenant-a",
      payload: { supportRequestId: "sreq_xpr_2" },
    });

    await new Promise((r) => setTimeout(r, 10));

    const executions = await foundation.listExecutions({ envelopeId });
    const workflowExec = executions.find(
      (e) => e.registrationKey === "support.request.closed→workflow.demo",
    );
    expect(workflowExec?.status).toBe("deferred");
    expect(workflowExec?.reason).toBe("WORKFLOW_EXECUTE_GATED");
  });
});
