import { AUTOMATION_JOURNAL_HANDLER_ID } from "./automation-handler-registry";
import type { AutomationFoundation } from "./automation-foundation";
import type { AutomationRegistration } from "./types";

/**
 * Seed reusable platform registrations for the Support event catalogue
 * (event-driven automation path — journal handler, not a Support engine).
 */
export function registerDefaultSupportAutomationRegistrations(
  foundation: AutomationFoundation,
): readonly AutomationRegistration[] {
  return [
    foundation.register({
      key: "support.request.*→automation.journal",
      eventPattern: "support.request.*",
      actionKind: "platform.handler",
      actionRef: AUTOMATION_JOURNAL_HANDLER_ID,
      description:
        "Platform journal for Support request domain events (APZHUB-1.1-004)",
    }),
    foundation.register({
      key: "support.article.created→automation.journal",
      eventPattern: "support.article.created",
      actionKind: "platform.handler",
      actionRef: AUTOMATION_JOURNAL_HANDLER_ID,
      description: "Platform journal for Support article created (APZHUB-1.1-004)",
    }),
  ];
}

/**
 * Mirror a Workflow event trigger binding into the Automation Foundation
 * without redesigning Workflow Platform Services.
 */
export function registerWorkflowTriggerAsAutomation(
  foundation: AutomationFoundation,
  binding: {
    readonly id: string;
    readonly workflowId: string;
    readonly kind: string;
    readonly eventType?: string;
    readonly enabled?: boolean;
    readonly tenantId?: string;
  },
): AutomationRegistration | undefined {
  if (binding.kind !== "event" || !binding.eventType) {
    return undefined;
  }

  return foundation.register({
    key: `workflow.trigger:${binding.id}`,
    eventPattern: binding.eventType,
    actionKind: "workflow.trigger",
    actionRef: binding.workflowId,
    enabled: binding.enabled ?? true,
    tenantId: binding.tenantId,
    description: "Workflow event trigger mirrored into Automation Foundation",
    metadata: {
      triggerId: binding.id,
    },
  });
}
