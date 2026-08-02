import type { CommandDefinition, CommandHandler } from "@apzhub/qep-command";
import type { EventProcessor, ProcessorRegistry } from "@apzhub/platform-processing";
import type { ProjectionEngine } from "@apzhub/qep-knowledge-index";
import type {
  NotificationDeliveryEngine,
  NotificationTemplate,
} from "@apzhub/qep-notification";

import { QEP_EXECUTION_SESSION_EVENTS } from "./events";

export const EXECUTION_SESSION_PROJECTION_EVENT_TYPES = [
  QEP_EXECUTION_SESSION_EVENTS.created,
  QEP_EXECUTION_SESSION_EVENTS.started,
  QEP_EXECUTION_SESSION_EVENTS.paused,
  QEP_EXECUTION_SESSION_EVENTS.resumed,
  QEP_EXECUTION_SESSION_EVENTS.blocked,
  QEP_EXECUTION_SESSION_EVENTS.completed,
  QEP_EXECUTION_SESSION_EVENTS.cancelled,
  QEP_EXECUTION_SESSION_EVENTS.resultRecorded,
  QEP_EXECUTION_SESSION_EVENTS.evidenceAttached,
  QEP_EXECUTION_SESSION_EVENTS.progressUpdated,
  QEP_EXECUTION_SESSION_EVENTS.archived,
  QEP_EXECUTION_SESSION_EVENTS.amended,
] as const;

export const EXECUTION_SESSION_NOTIFICATION_TEMPLATES: readonly NotificationTemplate[] =
  [
    {
      templateId: "qep.notification.template.execution.started",
      name: "Execution Started",
      category: "execution",
      defaultSeverity: "info",
      defaultPriority: "normal",
      titleTemplate: "Execution started: {{name}}",
      bodyTemplate: "Session {{sessionId}} started.",
      defaultLocale: "en",
    },
    {
      templateId: "qep.notification.template.execution.blocked",
      name: "Execution Blocked",
      category: "execution",
      defaultSeverity: "warning",
      defaultPriority: "high",
      titleTemplate: "Execution blocked: {{name}}",
      bodyTemplate: "Session {{sessionId}} is blocked.",
      defaultLocale: "en",
    },
    {
      templateId: "qep.notification.template.execution.completed",
      name: "Execution Completed",
      category: "execution",
      defaultSeverity: "info",
      defaultPriority: "normal",
      titleTemplate: "Execution completed: {{name}}",
      bodyTemplate: "Session {{sessionId}} completed.",
      defaultLocale: "en",
    },
    {
      templateId: "qep.notification.template.execution.cancelled",
      name: "Execution Cancelled",
      category: "execution",
      defaultSeverity: "warning",
      defaultPriority: "normal",
      titleTemplate: "Execution cancelled: {{name}}",
      bodyTemplate: "Session {{sessionId}} cancelled.",
      defaultLocale: "en",
    },
  ];

export const EXECUTION_SESSION_COMMAND_DEFINITIONS: readonly CommandDefinition[] = [
  {
    commandId: "qep.command.navigate.execution_workspace",
    name: "Open Execution Workspace",
    description: "Navigate to Enterprise Test Execution Workspace",
    kind: "navigation",
    category: "other",
    keywords: ["execution", "workspace", "session", "run"],
    requiredPermissions: ["qep.execution_workspace.read"],
    requiredRoles: [],
    shortcut: "g e",
    enabled: true,
  },
  {
    commandId: "qep.command.execution.start",
    name: "Start execution",
    description: "Start or open an execution session",
    kind: "entity",
    category: "other",
    keywords: ["start", "execution"],
    requiredPermissions: ["qep.execution_workspace.lifecycle"],
    requiredRoles: [],
    entityKind: "execution",
    enabled: true,
  },
  {
    commandId: "qep.command.execution.pause",
    name: "Pause execution",
    description: "Pause an in-progress execution session",
    kind: "entity",
    category: "other",
    keywords: ["pause", "execution"],
    requiredPermissions: ["qep.execution_workspace.lifecycle"],
    requiredRoles: [],
    entityKind: "execution",
    enabled: true,
  },
  {
    commandId: "qep.command.execution.complete",
    name: "Complete execution",
    description: "Complete an execution session",
    kind: "entity",
    category: "other",
    keywords: ["complete", "execution"],
    requiredPermissions: ["qep.execution_workspace.lifecycle"],
    requiredRoles: [],
    entityKind: "execution",
    enabled: true,
  },
  {
    commandId: "qep.command.execution.assigned_to_me",
    name: "Show assigned executions",
    description: "List execution sessions assigned to me",
    kind: "global",
    category: "other",
    keywords: ["assigned", "my executions"],
    requiredPermissions: ["qep.execution_workspace.read"],
    requiredRoles: [],
    enabled: true,
  },
];

export function createExecutionSessionCommandHandlers(options: {
  readonly onNavigate?: (
    target: string,
    args?: Readonly<Record<string, unknown>>,
  ) => void;
}): readonly CommandHandler[] {
  return [
    {
      commandId: "qep.command.navigate.execution_workspace",
      async execute() {
        options.onNavigate?.("execution_workspace");
        return {
          ok: true,
          data: { target: "/workspace/qep/execution-workspace" },
        };
      },
    },
    {
      commandId: "qep.command.execution.start",
      async execute(input) {
        const sessionId = String(input.args?.sessionId ?? input.context.entityId ?? "");
        options.onNavigate?.("execution_workspace.detail", { sessionId });
        return { ok: true, data: { sessionId } };
      },
    },
    {
      commandId: "qep.command.execution.pause",
      async execute(input) {
        const sessionId = String(input.args?.sessionId ?? input.context.entityId ?? "");
        return { ok: true, data: { sessionId, action: "pause" } };
      },
    },
    {
      commandId: "qep.command.execution.complete",
      async execute(input) {
        const sessionId = String(input.args?.sessionId ?? input.context.entityId ?? "");
        return { ok: true, data: { sessionId, action: "complete" } };
      },
    },
    {
      commandId: "qep.command.execution.assigned_to_me",
      async execute() {
        options.onNavigate?.("execution_workspace.assigned");
        return {
          ok: true,
          data: { target: "/workspace/qep/execution-workspace?assignee=me" },
        };
      },
    },
  ];
}

export function createExecutionSessionKnowledgeProcessors(
  engine: ProjectionEngine,
): readonly EventProcessor[] {
  return EXECUTION_SESSION_PROJECTION_EVENT_TYPES.map((eventType) => ({
    descriptor: {
      processorId: `qep.knowledge.processor.execution.${eventType.split(".").pop()}`,
      name: `QKI Execution ${eventType}`,
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

export function createExecutionSessionNotificationProcessors(
  engine: NotificationDeliveryEngine,
): readonly EventProcessor[] {
  const notifyTypes = [
    QEP_EXECUTION_SESSION_EVENTS.started,
    QEP_EXECUTION_SESSION_EVENTS.blocked,
    QEP_EXECUTION_SESSION_EVENTS.completed,
    QEP_EXECUTION_SESSION_EVENTS.cancelled,
  ] as const;
  return notifyTypes.map((eventType) => ({
    descriptor: {
      processorId: `qep.notification.processor.execution.${eventType.split(".").pop()}`,
      name: `Notify Execution ${eventType}`,
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

export function registerExecutionSessionProcessorsOnto(
  platformRegistry: ProcessorRegistry,
  processors: readonly EventProcessor[],
): void {
  for (const processor of processors) {
    platformRegistry.register(processor);
  }
}
