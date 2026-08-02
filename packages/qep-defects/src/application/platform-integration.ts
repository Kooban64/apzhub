import type { CommandDefinition, CommandHandler } from "@apzhub/qep-command";
import type { EventProcessor, ProcessorRegistry } from "@apzhub/platform-processing";
import type { ProjectionEngine } from "@apzhub/qep-knowledge-index";
import type {
  NotificationDeliveryEngine,
  NotificationTemplate,
} from "@apzhub/qep-notification";

import { QEP_DEFECT_EVENTS } from "./events";

export const DEFECT_PROJECTION_EVENT_TYPES = [
  QEP_DEFECT_EVENTS.created,
  QEP_DEFECT_EVENTS.updated,
  QEP_DEFECT_EVENTS.assigned,
  QEP_DEFECT_EVENTS.fixed,
  QEP_DEFECT_EVENTS.verified,
  QEP_DEFECT_EVENTS.closed,
  QEP_DEFECT_EVENTS.reopened,
  QEP_DEFECT_EVENTS.statusChanged,
] as const;

export const DEFECT_NOTIFICATION_TEMPLATES: readonly NotificationTemplate[] = [
  {
    templateId: "qep.notification.template.defect.assigned",
    name: "Defect Assigned",
    category: "defect",
    defaultSeverity: "info",
    defaultPriority: "normal",
    titleTemplate: "Defect assigned: {{title}}",
    bodyTemplate: "Defect {{defectId}} assigned to {{assigneeId}}.",
    defaultLocale: "en",
  },
  {
    templateId: "qep.notification.template.defect.fixed",
    name: "Defect Fixed / Ready for Retest",
    category: "defect",
    defaultSeverity: "info",
    defaultPriority: "high",
    titleTemplate: "Ready for retest: {{title}}",
    bodyTemplate: "Defect {{defectId}} is {{status}}.",
    defaultLocale: "en",
  },
  {
    templateId: "qep.notification.template.defect.verified",
    name: "Defect Verified",
    category: "defect",
    defaultSeverity: "info",
    defaultPriority: "normal",
    titleTemplate: "Defect verified: {{title}}",
    bodyTemplate: "Defect {{defectId}} verified.",
    defaultLocale: "en",
  },
  {
    templateId: "qep.notification.template.defect.closed",
    name: "Defect Closed",
    category: "defect",
    defaultSeverity: "info",
    defaultPriority: "low",
    titleTemplate: "Defect closed: {{title}}",
    bodyTemplate: "Defect {{defectId}} closed.",
    defaultLocale: "en",
  },
];

export const DEFECT_COMMAND_DEFINITIONS: readonly CommandDefinition[] = [
  {
    commandId: "qep.command.navigate.defects",
    name: "Open Defects",
    description: "Navigate to Enterprise Defect Management",
    kind: "navigation",
    category: "other",
    keywords: ["defect", "bug", "finding"],
    requiredPermissions: ["qep.defects.read"],
    requiredRoles: [],
    shortcut: "g d",
    enabled: true,
  },
  {
    commandId: "qep.command.defect.create",
    name: "Create defect",
    description: "Create a new defect",
    kind: "global",
    category: "other",
    keywords: ["create", "defect"],
    requiredPermissions: ["qep.defects.create"],
    requiredRoles: [],
    enabled: true,
  },
  {
    commandId: "qep.command.defect.open",
    name: "Open defect",
    description: "Open a defect discovered via the Knowledge Index",
    kind: "entity",
    category: "other",
    keywords: ["open", "defect"],
    requiredPermissions: ["qep.defects.read"],
    requiredRoles: [],
    entityKind: "defect",
    enabled: true,
  },
  {
    commandId: "qep.command.defect.my_defects",
    name: "Show my defects",
    description: "List defects assigned to me",
    kind: "global",
    category: "other",
    keywords: ["my", "assigned", "defects"],
    requiredPermissions: ["qep.defects.read"],
    requiredRoles: [],
    enabled: true,
  },
  {
    commandId: "qep.command.defect.critical",
    name: "Show critical defects",
    description: "List critical severity defects",
    kind: "global",
    category: "other",
    keywords: ["critical", "defects"],
    requiredPermissions: ["qep.defects.read"],
    requiredRoles: [],
    enabled: true,
  },
];

export function createDefectCommandHandlers(options: {
  readonly onNavigate?: (
    target: string,
    args?: Readonly<Record<string, unknown>>,
  ) => void;
}): readonly CommandHandler[] {
  return [
    {
      commandId: "qep.command.navigate.defects",
      async execute() {
        options.onNavigate?.("defects");
        return { ok: true, data: { target: "/workspace/qep/defects" } };
      },
    },
    {
      commandId: "qep.command.defect.create",
      async execute() {
        options.onNavigate?.("defects.new");
        return { ok: true, data: { target: "/workspace/qep/defects/new" } };
      },
    },
    {
      commandId: "qep.command.defect.open",
      validate(input) {
        if (!input.context.entityId && !input.args?.defectId) {
          return { ok: false, message: "validation.defectId_required" };
        }
        return { ok: true };
      },
      async execute(input) {
        const defectId = String(input.args?.defectId ?? input.context.entityId ?? "");
        options.onNavigate?.("defects.detail", { defectId });
        return { ok: true, data: { defectId } };
      },
    },
    {
      commandId: "qep.command.defect.my_defects",
      async execute() {
        options.onNavigate?.("defects.assigned");
        return {
          ok: true,
          data: { target: "/workspace/qep/defects?assignee=me" },
        };
      },
    },
    {
      commandId: "qep.command.defect.critical",
      async execute() {
        options.onNavigate?.("defects.critical");
        return {
          ok: true,
          data: { target: "/workspace/qep/defects?severity=critical" },
        };
      },
    },
  ];
}

export function createDefectKnowledgeProcessors(
  engine: ProjectionEngine,
): readonly EventProcessor[] {
  return DEFECT_PROJECTION_EVENT_TYPES.map((eventType) => ({
    descriptor: {
      processorId: `qep.knowledge.processor.defect.${eventType.split(".").pop()}`,
      name: `QKI Defect ${eventType}`,
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

export function createDefectNotificationProcessors(
  engine: NotificationDeliveryEngine,
): readonly EventProcessor[] {
  const notifyTypes = [
    QEP_DEFECT_EVENTS.assigned,
    QEP_DEFECT_EVENTS.fixed,
    QEP_DEFECT_EVENTS.verified,
    QEP_DEFECT_EVENTS.closed,
  ] as const;
  return notifyTypes.map((eventType) => ({
    descriptor: {
      processorId: `qep.notification.processor.defect.${eventType.split(".").pop()}`,
      name: `Notify Defect ${eventType}`,
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

export function registerDefectProcessorsOnto(
  platformRegistry: ProcessorRegistry,
  processors: readonly EventProcessor[],
): void {
  for (const processor of processors) {
    platformRegistry.register(processor);
  }
}
