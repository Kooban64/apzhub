/**
 * Platform integration helpers — QKI / Notifications / Commands.
 * Consumes completed APZQEP-120 packages; does not redesign them.
 */

import type { CommandDefinition, CommandHandler } from "@apzhub/qep-command";
import type { EventProcessor, ProcessorRegistry } from "@apzhub/platform-processing";
import type { ProjectionEngine } from "@apzhub/qep-knowledge-index";
import type { NotificationDeliveryEngine } from "@apzhub/qep-notification";
import type { NotificationTemplate } from "@apzhub/qep-notification";

import { QEP_SUITE_EVENTS } from "./events";

export const SUITE_PROJECTION_EVENT_TYPES = [
  QEP_SUITE_EVENTS.created,
  QEP_SUITE_EVENTS.updated,
  QEP_SUITE_EVENTS.published,
  QEP_SUITE_EVENTS.archived,
  QEP_SUITE_EVENTS.versioned,
  QEP_SUITE_EVENTS.deleted,
  QEP_SUITE_EVENTS.restored,
  QEP_SUITE_EVENTS.retired,
  QEP_SUITE_EVENTS.lifecycleChanged,
] as const;

export const SUITE_NOTIFICATION_TEMPLATES: readonly NotificationTemplate[] = [
  {
    templateId: "qep.notification.template.suite.published",
    name: "Suite Published",
    category: "suite",
    defaultSeverity: "info",
    defaultPriority: "normal",
    titleTemplate: "Suite published: {{name}}",
    bodyTemplate: "Suite {{suiteId}} was published.",
    defaultLocale: "en",
  },
  {
    templateId: "qep.notification.template.suite.archived",
    name: "Suite Archived",
    category: "suite",
    defaultSeverity: "info",
    defaultPriority: "low",
    titleTemplate: "Suite archived: {{name}}",
    bodyTemplate: "Suite {{suiteId}} was archived.",
    defaultLocale: "en",
  },
  {
    templateId: "qep.notification.template.suite.retired",
    name: "Suite Retired",
    category: "suite",
    defaultSeverity: "warning",
    defaultPriority: "normal",
    titleTemplate: "Suite retired: {{name}}",
    bodyTemplate: "Suite {{suiteId}} was retired.",
    defaultLocale: "en",
  },
];

export const SUITE_COMMAND_DEFINITIONS: readonly CommandDefinition[] = [
  {
    commandId: "qep.command.navigate.suites",
    name: "Open Suites",
    description: "Navigate to Enterprise Test Suite Management",
    kind: "navigation",
    category: "other",
    keywords: ["suite", "suites", "test suite"],
    requiredPermissions: ["qep.suites.read"],
    requiredRoles: [],
    shortcut: "g s",
    enabled: true,
  },
  {
    commandId: "qep.command.suite.create",
    name: "Create Suite",
    description: "Create a new enterprise test suite",
    kind: "global",
    category: "other",
    keywords: ["create", "suite", "new"],
    requiredPermissions: ["qep.suites.create"],
    requiredRoles: [],
    enabled: true,
  },
  {
    commandId: "qep.command.suite.open",
    name: "Open Suite",
    description: "Open a suite discovered via the Knowledge Index",
    kind: "entity",
    category: "other",
    keywords: ["open", "suite"],
    requiredPermissions: ["qep.suites.read"],
    requiredRoles: [],
    entityKind: "suite",
    enabled: true,
  },
];

export function createSuiteCommandHandlers(options: {
  readonly onNavigate?: (
    target: string,
    args?: Readonly<Record<string, unknown>>,
  ) => void;
}): readonly CommandHandler[] {
  return [
    {
      commandId: "qep.command.navigate.suites",
      async execute() {
        options.onNavigate?.("suites");
        return { ok: true, data: { target: "/workspace/qep/suites" } };
      },
    },
    {
      commandId: "qep.command.suite.create",
      async execute() {
        options.onNavigate?.("suites.new");
        return { ok: true, data: { target: "/workspace/qep/suites/new" } };
      },
    },
    {
      commandId: "qep.command.suite.open",
      validate(input) {
        if (!input.context.entityId && !input.args?.suiteId) {
          return { ok: false, message: "validation.suiteId_required" };
        }
        return { ok: true };
      },
      async execute(input) {
        const suiteId = String(input.args?.suiteId ?? input.context.entityId ?? "");
        options.onNavigate?.("suites.detail", { suiteId });
        return { ok: true, data: { suiteId } };
      },
    },
  ];
}

export function createSuiteKnowledgeProcessors(
  engine: ProjectionEngine,
): readonly EventProcessor[] {
  return SUITE_PROJECTION_EVENT_TYPES.map((eventType) => ({
    descriptor: {
      processorId: `qep.knowledge.processor.suite.${eventType.split(".").pop()}`,
      name: `QKI Suite ${eventType}`,
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

export function createSuiteNotificationProcessors(
  engine: NotificationDeliveryEngine,
): readonly EventProcessor[] {
  const notifyTypes = [
    QEP_SUITE_EVENTS.published,
    QEP_SUITE_EVENTS.archived,
    QEP_SUITE_EVENTS.retired,
  ] as const;
  return notifyTypes.map((eventType) => ({
    descriptor: {
      processorId: `qep.notification.processor.suite.${eventType.split(".").pop()}`,
      name: `Notify Suite ${eventType}`,
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

export function registerSuiteProcessorsOnto(
  platformRegistry: ProcessorRegistry,
  processors: readonly EventProcessor[],
): void {
  for (const processor of processors) {
    platformRegistry.register(processor);
  }
}
