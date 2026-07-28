import { describe, expect, it, beforeEach } from "vitest";

import {
  createDomainEventEnvelopeId,
  resetDomainEventEnvelopeCounter,
  type DomainEventEnvelope,
} from "../../events/domain-event-publisher";
import {
  AUTOMATION_JOURNAL_HANDLER_ID,
  createAutomationFoundation,
  registerDefaultSupportAutomationRegistrations,
  registerWorkflowTriggerAsAutomation,
  resetAutomationExecutionSeq,
  resetAutomationRegistrationSeq,
  wireEventAutomation,
  type AutomationEventBus,
  type WorkflowEventTriggerSource,
} from "./index";

function envelope(
  eventId: string,
  overrides: Partial<DomainEventEnvelope> = {},
): DomainEventEnvelope {
  return {
    envelopeId: createDomainEventEnvelopeId(),
    eventId,
    eventVersion: "1.0.0",
    category: "business",
    correlationId: "corr-auto-1",
    timestamp: new Date().toISOString(),
    publisher: "support-service",
    tenantId: "tenant-a",
    payload: { supportRequestId: "sreq_1" },
    ...overrides,
  };
}

describe("AutomationFoundation (APZHUB-1.1-004)", () => {
  beforeEach(() => {
    resetDomainEventEnvelopeCounter();
    resetAutomationRegistrationSeq();
    resetAutomationExecutionSeq();
  });

  it("registers platform automations and journals Support request events", async () => {
    const foundation = createAutomationFoundation();
    registerDefaultSupportAutomationRegistrations(foundation);

    const results = await foundation.handleDomainEvent(
      envelope("support.request.created"),
    );

    expect(results).toHaveLength(1);
    expect(results[0]?.status).toBe("succeeded");
    expect(results[0]?.reason).toBe("JOURNALED");
    expect(results[0]?.registrationKey).toBe("support.request.*→automation.journal");
  });

  it("is idempotent for the same envelope + registration", async () => {
    const foundation = createAutomationFoundation();
    registerDefaultSupportAutomationRegistrations(foundation);
    const env = envelope("support.request.assigned");

    const first = await foundation.handleDomainEvent(env);
    const second = await foundation.handleDomainEvent(env);

    expect(first[0]?.status).toBe("succeeded");
    expect(second[0]?.status).toBe("skipped");
    expect(second[0]?.reason).toBe("IDEMPOTENT_SKIP");
  });

  it("defers workflow-triggered automation while execute is gated", async () => {
    const foundation = createAutomationFoundation();
    const registration = registerWorkflowTriggerAsAutomation(foundation, {
      id: "wtrg_1",
      workflowId: "wf_demo",
      kind: "event",
      eventType: "support.request.closed",
      enabled: true,
      tenantId: "tenant-a",
    });

    expect(registration?.actionKind).toBe("workflow.trigger");

    const results = await foundation.handleDomainEvent(
      envelope("support.request.closed"),
    );

    expect(results).toHaveLength(1);
    expect(results[0]?.status).toBe("deferred");
    expect(results[0]?.reason).toBe("WORKFLOW_EXECUTE_GATED");
    expect(results[0]?.details?.workflowId).toBe("wf_demo");
  });

  it("matches WorkflowEventTriggerSource bindings without product engines", async () => {
    const foundation = createAutomationFoundation();
    const source: WorkflowEventTriggerSource = {
      async listEnabledEventTriggers() {
        return [
          {
            triggerId: "wtrg_src_1",
            workflowId: "wf_from_source",
            eventType: "support.request.updated",
            enabled: true,
            tenantId: "tenant-a",
          },
        ];
      },
    };
    foundation.attachWorkflowEventTriggerSource(source);

    const results = await foundation.handleDomainEvent(
      envelope("support.request.updated"),
    );

    expect(results).toHaveLength(1);
    expect(results[0]?.status).toBe("deferred");
    expect(results[0]?.details?.workflowId).toBe("wf_from_source");
    expect(results[0]?.details?.triggerId).toBe("wtrg_src_1");
  });

  it("wires Event Bus publish → automation dispatch", async () => {
    const handlers: Array<{
      eventPattern: string;
      handler: (e: DomainEventEnvelope) => void | Promise<void>;
    }> = [];
    const bus: AutomationEventBus = {
      subscribe(options) {
        handlers.push(options);
        return `sub_${handlers.length}`;
      },
    };

    const foundation = createAutomationFoundation();
    registerDefaultSupportAutomationRegistrations(foundation);
    const subscriptionIds = wireEventAutomation(bus, foundation, ["support.*"]);
    expect(subscriptionIds).toHaveLength(1);

    const env = envelope("support.article.created");
    await handlers[0]?.handler(env);

    // allow async void handler
    await new Promise((r) => setTimeout(r, 0));

    const executions = await foundation.listExecutions({
      envelopeId: env.envelopeId,
    });
    expect(executions.some((e) => e.status === "succeeded")).toBe(true);
  });

  it("fails soft when handler is missing", async () => {
    const foundation = createAutomationFoundation({
      registerJournalHandler: false,
    });
    foundation.register({
      key: "missing-handler",
      eventPattern: "support.request.created",
      actionKind: "platform.handler",
      actionRef: "does.not.exist",
    });

    const results = await foundation.handleDomainEvent(
      envelope("support.request.created"),
    );

    expect(results[0]?.status).toBe("failed");
    expect(results[0]?.reason).toBe("HANDLER_NOT_FOUND");
  });

  it("exposes journal handler id for product reuse", () => {
    expect(AUTOMATION_JOURNAL_HANDLER_ID).toBe("automation.journal");
  });
});
