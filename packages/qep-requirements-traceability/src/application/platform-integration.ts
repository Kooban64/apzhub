import type { CommandDefinition, CommandHandler } from "@apzhub/qep-command";
import type { EventProcessor, ProcessorRegistry } from "@apzhub/platform-processing";
import type { ProjectionEngine } from "@apzhub/qep-knowledge-index";
import type {
  NotificationDeliveryEngine,
  NotificationTemplate,
} from "@apzhub/qep-notification";

import { QEP_REQUIREMENT_EVENTS } from "./events";

export const REQUIREMENT_PROJECTION_EVENT_TYPES = [
  QEP_REQUIREMENT_EVENTS.created,
  QEP_REQUIREMENT_EVENTS.updated,
  QEP_REQUIREMENT_EVENTS.approved,
  QEP_REQUIREMENT_EVENTS.linked,
  QEP_REQUIREMENT_EVENTS.coverageUpdated,
  QEP_REQUIREMENT_EVENTS.traceabilityChanged,
  QEP_REQUIREMENT_EVENTS.statusChanged,
] as const;

export const REQUIREMENT_NOTIFICATION_TEMPLATES: readonly NotificationTemplate[] = [
  {
    templateId: "qep.notification.template.requirement.approved",
    name: "Requirement Approved",
    category: "requirement",
    defaultSeverity: "info",
    defaultPriority: "normal",
    titleTemplate: "Requirement approved: {{title}}",
    bodyTemplate: "Requirement {{requirementId}} approved.",
    defaultLocale: "en",
  },
  {
    templateId: "qep.notification.template.requirement.coverage",
    name: "Coverage Changed",
    category: "requirement",
    defaultSeverity: "info",
    defaultPriority: "normal",
    titleTemplate: "Coverage updated: {{title}}",
    bodyTemplate: "Overall coverage {{overallCoverage}}%.",
    defaultLocale: "en",
  },
  {
    templateId: "qep.notification.template.requirement.gap",
    name: "High-risk Coverage Gap",
    category: "requirement",
    defaultSeverity: "warning",
    defaultPriority: "high",
    titleTemplate: "High-risk gap: {{title}}",
    bodyTemplate: "Requirement {{requirementId}} has a high-risk coverage gap.",
    defaultLocale: "en",
  },
  {
    templateId: "qep.notification.template.requirement.traceability",
    name: "Traceability Changed",
    category: "requirement",
    defaultSeverity: "info",
    defaultPriority: "low",
    titleTemplate: "Traceability changed: {{title}}",
    bodyTemplate: "Derived traceability updated for {{requirementId}}.",
    defaultLocale: "en",
  },
];

export const REQUIREMENT_COMMAND_DEFINITIONS: readonly CommandDefinition[] = [
  {
    commandId: "qep.command.navigate.enterprise_requirements",
    name: "Open Requirements & Traceability",
    description: "Navigate to Enterprise Requirements & Traceability",
    kind: "navigation",
    category: "other",
    keywords: ["requirement", "traceability", "coverage"],
    requiredPermissions: ["qep.enterprise_requirements.read"],
    requiredRoles: [],
    shortcut: "g r",
    enabled: true,
  },
  {
    commandId: "qep.command.requirement.create",
    name: "Create requirement",
    description: "Create a quality requirement",
    kind: "global",
    category: "other",
    keywords: ["create", "requirement"],
    requiredPermissions: ["qep.enterprise_requirements.create"],
    requiredRoles: [],
    enabled: true,
  },
  {
    commandId: "qep.command.requirement.approve",
    name: "Approve requirement",
    description: "Approve a requirement under review",
    kind: "entity",
    category: "other",
    keywords: ["approve", "requirement"],
    requiredPermissions: ["qep.enterprise_requirements.lifecycle"],
    requiredRoles: [],
    entityKind: "requirement",
    enabled: true,
  },
  {
    commandId: "qep.command.requirement.link_suite",
    name: "Link suite",
    description: "Link a test suite to a requirement",
    kind: "entity",
    category: "other",
    keywords: ["link", "suite", "requirement"],
    requiredPermissions: ["qep.enterprise_requirements.update"],
    requiredRoles: [],
    entityKind: "requirement",
    enabled: true,
  },
  {
    commandId: "qep.command.requirement.view_traceability",
    name: "View traceability",
    description: "Open the derived traceability matrix",
    kind: "navigation",
    category: "other",
    keywords: ["traceability", "matrix"],
    requiredPermissions: ["qep.enterprise_requirements.read"],
    requiredRoles: [],
    enabled: true,
  },
  {
    commandId: "qep.command.requirement.uncovered",
    name: "Show uncovered requirements",
    description: "List requirements with no suite links",
    kind: "global",
    category: "other",
    keywords: ["uncovered", "coverage", "gap"],
    requiredPermissions: ["qep.enterprise_requirements.read"],
    requiredRoles: [],
    enabled: true,
  },
  {
    commandId: "qep.command.requirement.failed_coverage",
    name: "Show failed coverage",
    description: "List requirements with failed verification coverage",
    kind: "global",
    category: "other",
    keywords: ["failed", "coverage"],
    requiredPermissions: ["qep.enterprise_requirements.read"],
    requiredRoles: [],
    enabled: true,
  },
  {
    commandId: "qep.command.requirement.high_risk",
    name: "Show high-risk requirements",
    description: "List high-risk requirements and gaps",
    kind: "global",
    category: "other",
    keywords: ["high", "risk", "requirement"],
    requiredPermissions: ["qep.enterprise_requirements.read"],
    requiredRoles: [],
    enabled: true,
  },
];

export function createRequirementCommandHandlers(options: {
  readonly onNavigate?: (
    target: string,
    args?: Readonly<Record<string, unknown>>,
  ) => void;
}): readonly CommandHandler[] {
  const base = "/workspace/qep/enterprise-requirements";
  return [
    {
      commandId: "qep.command.navigate.enterprise_requirements",
      async execute() {
        options.onNavigate?.("enterprise_requirements");
        return { ok: true, data: { target: base } };
      },
    },
    {
      commandId: "qep.command.requirement.create",
      async execute() {
        options.onNavigate?.("enterprise_requirements.new");
        return { ok: true, data: { target: `${base}/new` } };
      },
    },
    {
      commandId: "qep.command.requirement.approve",
      async execute(input) {
        const requirementId = String(
          input.args?.requirementId ?? input.context.entityId ?? "",
        );
        return { ok: true, data: { requirementId, action: "approve" } };
      },
    },
    {
      commandId: "qep.command.requirement.link_suite",
      async execute(input) {
        const requirementId = String(
          input.args?.requirementId ?? input.context.entityId ?? "",
        );
        return { ok: true, data: { requirementId, action: "link_suite" } };
      },
    },
    {
      commandId: "qep.command.requirement.view_traceability",
      async execute() {
        options.onNavigate?.("enterprise_requirements.matrix");
        return { ok: true, data: { target: `${base}/matrix` } };
      },
    },
    {
      commandId: "qep.command.requirement.uncovered",
      async execute() {
        return {
          ok: true,
          data: { target: `${base}?uncovered=true` },
        };
      },
    },
    {
      commandId: "qep.command.requirement.failed_coverage",
      async execute() {
        return {
          ok: true,
          data: { target: `${base}/coverage?verification=failed` },
        };
      },
    },
    {
      commandId: "qep.command.requirement.high_risk",
      async execute() {
        return {
          ok: true,
          data: { target: `${base}?highRisk=true` },
        };
      },
    },
  ];
}

export function createRequirementKnowledgeProcessors(
  engine: ProjectionEngine,
): readonly EventProcessor[] {
  return REQUIREMENT_PROJECTION_EVENT_TYPES.map((eventType) => ({
    descriptor: {
      processorId: `qep.knowledge.processor.requirement.${eventType.split(".").pop()}`,
      name: `QKI Requirement ${eventType}`,
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

export function createRequirementNotificationProcessors(
  engine: NotificationDeliveryEngine,
): readonly EventProcessor[] {
  const notifyTypes = [
    QEP_REQUIREMENT_EVENTS.approved,
    QEP_REQUIREMENT_EVENTS.coverageUpdated,
    QEP_REQUIREMENT_EVENTS.traceabilityChanged,
  ] as const;
  return notifyTypes.map((eventType) => ({
    descriptor: {
      processorId: `qep.notification.processor.requirement.${eventType.split(".").pop()}`,
      name: `Notify Requirement ${eventType}`,
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

export function registerRequirementProcessorsOnto(
  platformRegistry: ProcessorRegistry,
  processors: readonly EventProcessor[],
): void {
  for (const processor of processors) {
    platformRegistry.register(processor);
  }
}
