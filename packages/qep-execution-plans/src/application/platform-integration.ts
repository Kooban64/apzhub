/**
 * Platform integration — QKI / Notifications / Commands for Execution Planning.
 */

import type { CommandDefinition, CommandHandler } from "@apzhub/qep-command";
import type { EventProcessor, ProcessorRegistry } from "@apzhub/platform-processing";
import type { ProjectionEngine } from "@apzhub/qep-knowledge-index";
import type {
  NotificationDeliveryEngine,
  NotificationTemplate,
} from "@apzhub/qep-notification";

import { QEP_EXECUTION_PLAN_EVENTS } from "./events";

export const EXECUTION_PLAN_PROJECTION_EVENT_TYPES = [
  QEP_EXECUTION_PLAN_EVENTS.created,
  QEP_EXECUTION_PLAN_EVENTS.updated,
  QEP_EXECUTION_PLAN_EVENTS.submittedForReview,
  QEP_EXECUTION_PLAN_EVENTS.approved,
  QEP_EXECUTION_PLAN_EVENTS.readinessEvaluated,
  QEP_EXECUTION_PLAN_EVENTS.ready,
  QEP_EXECUTION_PLAN_EVENTS.scheduled,
  QEP_EXECUTION_PLAN_EVENTS.handedOff,
  QEP_EXECUTION_PLAN_EVENTS.cancelled,
  QEP_EXECUTION_PLAN_EVENTS.archived,
] as const;

export const EXECUTION_PLAN_NOTIFICATION_TEMPLATES: readonly NotificationTemplate[] = [
  {
    templateId: "qep.notification.template.execution_plan.review",
    name: "Execution Plan Review Requested",
    category: "execution_plan",
    defaultSeverity: "info",
    defaultPriority: "normal",
    titleTemplate: "Review requested: {{name}}",
    bodyTemplate: "Execution plan {{planId}} was submitted for review.",
    defaultLocale: "en",
  },
  {
    templateId: "qep.notification.template.execution_plan.approved",
    name: "Execution Plan Approved",
    category: "execution_plan",
    defaultSeverity: "info",
    defaultPriority: "normal",
    titleTemplate: "Plan approved: {{name}}",
    bodyTemplate: "Execution plan {{planId}} was approved.",
    defaultLocale: "en",
  },
  {
    templateId: "qep.notification.template.execution_plan.ready",
    name: "Execution Plan Ready",
    category: "execution_plan",
    defaultSeverity: "info",
    defaultPriority: "high",
    titleTemplate: "Plan ready: {{name}}",
    bodyTemplate: "Execution plan {{planId}} is ready for scheduling/handoff.",
    defaultLocale: "en",
  },
  {
    templateId: "qep.notification.template.execution_plan.handed_off",
    name: "Execution Plan Handed Off",
    category: "execution_plan",
    defaultSeverity: "info",
    defaultPriority: "high",
    titleTemplate: "Plan handed off: {{name}}",
    bodyTemplate: "Execution plan {{planId}} handed off ({{handoffId}}).",
    defaultLocale: "en",
  },
  {
    templateId: "qep.notification.template.execution_plan.cancelled",
    name: "Execution Plan Cancelled",
    category: "execution_plan",
    defaultSeverity: "warning",
    defaultPriority: "normal",
    titleTemplate: "Plan cancelled: {{name}}",
    bodyTemplate: "Execution plan {{planId}} was cancelled.",
    defaultLocale: "en",
  },
];

export const EXECUTION_PLAN_COMMAND_DEFINITIONS: readonly CommandDefinition[] = [
  {
    commandId: "qep.command.navigate.execution_plans",
    name: "Open Execution Planning",
    description: "Navigate to Enterprise Test Execution Planning",
    kind: "navigation",
    category: "other",
    keywords: ["execution", "plan", "planning", "schedule"],
    requiredPermissions: ["qep.execution_plans.read"],
    requiredRoles: [],
    shortcut: "g p",
    enabled: true,
  },
  {
    commandId: "qep.command.execution_plan.create",
    name: "Create execution plan",
    description: "Create a new execution plan",
    kind: "global",
    category: "other",
    keywords: ["create", "plan", "execution"],
    requiredPermissions: ["qep.execution_plans.create"],
    requiredRoles: [],
    enabled: true,
  },
  {
    commandId: "qep.command.execution_plan.open",
    name: "Open execution plan",
    description: "Open an execution plan discovered via the Knowledge Index",
    kind: "entity",
    category: "other",
    keywords: ["open", "plan"],
    requiredPermissions: ["qep.execution_plans.read"],
    requiredRoles: [],
    entityKind: "run",
    enabled: true,
  },
  {
    commandId: "qep.command.execution_plan.assigned_to_me",
    name: "Show plans assigned to me",
    description: "List execution plans assigned to the current user",
    kind: "global",
    category: "other",
    keywords: ["assigned", "my plans"],
    requiredPermissions: ["qep.execution_plans.read"],
    requiredRoles: [],
    enabled: true,
  },
];

export function createExecutionPlanCommandHandlers(options: {
  readonly onNavigate?: (
    target: string,
    args?: Readonly<Record<string, unknown>>,
  ) => void;
}): readonly CommandHandler[] {
  return [
    {
      commandId: "qep.command.navigate.execution_plans",
      async execute() {
        options.onNavigate?.("execution_plans");
        return {
          ok: true,
          data: { target: "/workspace/qep/execution-plans" },
        };
      },
    },
    {
      commandId: "qep.command.execution_plan.create",
      async execute() {
        options.onNavigate?.("execution_plans.new");
        return {
          ok: true,
          data: { target: "/workspace/qep/execution-plans/new" },
        };
      },
    },
    {
      commandId: "qep.command.execution_plan.open",
      validate(input) {
        if (!input.context.entityId && !input.args?.planId) {
          return { ok: false, message: "validation.planId_required" };
        }
        return { ok: true };
      },
      async execute(input) {
        const planId = String(input.args?.planId ?? input.context.entityId ?? "");
        options.onNavigate?.("execution_plans.detail", { planId });
        return { ok: true, data: { planId } };
      },
    },
    {
      commandId: "qep.command.execution_plan.assigned_to_me",
      async execute() {
        options.onNavigate?.("execution_plans.assigned");
        return {
          ok: true,
          data: { target: "/workspace/qep/execution-plans?assignee=me" },
        };
      },
    },
  ];
}

export function createExecutionPlanKnowledgeProcessors(
  engine: ProjectionEngine,
): readonly EventProcessor[] {
  return EXECUTION_PLAN_PROJECTION_EVENT_TYPES.map((eventType) => ({
    descriptor: {
      processorId: `qep.knowledge.processor.execution_plan.${eventType.split(".").pop()}`,
      name: `QKI Execution Plan ${eventType}`,
      capabilities: [{ eventType }],
      replayCompatible: true,
    },
    async execute(context) {
      const result = await engine.applyEvent({
        eventType: context.eventType,
        tenantId: context.tenantId,
        payload: context.payload,
        ...(context.correlationId ? { correlationId: context.correlationId } : {}),
        now: context.now,
      });
      if (!result.ok) {
        return result.retryable
          ? { outcome: "retry" as const, message: result.error, retryable: true }
          : {
              outcome: "terminal_failure" as const,
              message: result.error,
              permanent: true,
            };
      }
      return { outcome: "acknowledged" as const };
    },
  }));
}

export function createExecutionPlanNotificationProcessors(
  engine: NotificationDeliveryEngine,
): readonly EventProcessor[] {
  const notifyTypes = [
    QEP_EXECUTION_PLAN_EVENTS.submittedForReview,
    QEP_EXECUTION_PLAN_EVENTS.approved,
    QEP_EXECUTION_PLAN_EVENTS.ready,
    QEP_EXECUTION_PLAN_EVENTS.handedOff,
    QEP_EXECUTION_PLAN_EVENTS.cancelled,
  ] as const;
  return notifyTypes.map((eventType) => ({
    descriptor: {
      processorId: `qep.notification.processor.execution_plan.${eventType.split(".").pop()}`,
      name: `Notify Execution Plan ${eventType}`,
      capabilities: [{ eventType }],
      replayCompatible: true,
    },
    async execute(context) {
      const result = await engine.processFact({
        eventType: context.eventType,
        tenantId: context.tenantId,
        correlationId: context.correlationId ?? context.workItemId,
        payload: context.payload,
        now: context.now,
      });
      if (result.retryableFailures > 0) {
        return {
          outcome: "retry" as const,
          message: result.errors.join("; "),
          retryable: true,
        };
      }
      return { outcome: "acknowledged" as const };
    },
  }));
}

export function registerExecutionPlanProcessorsOnto(
  platformRegistry: ProcessorRegistry,
  processors: readonly EventProcessor[],
): void {
  for (const processor of processors) {
    platformRegistry.register(processor);
  }
}
