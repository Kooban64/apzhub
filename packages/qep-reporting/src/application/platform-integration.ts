import type { CommandDefinition, CommandHandler } from "@apzhub/qep-command";
import type { EventProcessor, ProcessorRegistry } from "@apzhub/platform-processing";
import type { ProjectionEngine } from "@apzhub/qep-knowledge-index";
import type {
  NotificationDeliveryEngine,
  NotificationTemplate,
} from "@apzhub/qep-notification";

import { QEP_REPORTING_EVENTS } from "./events";

export const REPORTING_PROJECTION_EVENT_TYPES = [
  QEP_REPORTING_EVENTS.savedReportCreated,
  QEP_REPORTING_EVENTS.savedReportUpdated,
] as const;

export const REPORTING_NOTIFICATION_TEMPLATES: readonly NotificationTemplate[] = [
  {
    templateId: "qep.notification.template.reporting.report_ready",
    name: "Report Ready",
    category: "reporting",
    defaultSeverity: "info",
    defaultPriority: "normal",
    titleTemplate: "Report ready: {{name}}",
    bodyTemplate: "Derived report {{templateId}} generated.",
    defaultLocale: "en",
  },
  {
    templateId: "qep.notification.template.reporting.coverage_threshold",
    name: "Coverage Threshold",
    category: "reporting",
    defaultSeverity: "warning",
    defaultPriority: "high",
    titleTemplate: "Coverage threshold breached",
    bodyTemplate: "Requirement coverage requires attention.",
    defaultLocale: "en",
  },
  {
    templateId: "qep.notification.template.reporting.critical_trend",
    name: "Critical Quality Trend",
    category: "reporting",
    defaultSeverity: "warning",
    defaultPriority: "high",
    titleTemplate: "Critical quality trend",
    bodyTemplate: "Derived quality trend requires review.",
    defaultLocale: "en",
  },
];

export const REPORTING_COMMAND_DEFINITIONS: readonly CommandDefinition[] = [
  {
    commandId: "qep.command.navigate.reporting",
    name: "Open Reporting",
    description: "Navigate to Enterprise Reporting & Analytics",
    kind: "navigation",
    category: "other",
    keywords: ["reporting", "dashboard", "analytics"],
    requiredPermissions: ["qep.reporting.read"],
    requiredRoles: [],
    shortcut: "g a",
    enabled: true,
  },
  {
    commandId: "qep.command.reporting.executive",
    name: "Open executive dashboard",
    description: "Open the executive quality dashboard",
    kind: "navigation",
    category: "other",
    keywords: ["executive", "dashboard"],
    requiredPermissions: ["qep.reporting.read"],
    requiredRoles: [],
    enabled: true,
  },
  {
    commandId: "qep.command.reporting.execution_trends",
    name: "Show execution trends",
    description: "Open execution / quality trend dashboards",
    kind: "navigation",
    category: "other",
    keywords: ["execution", "trends"],
    requiredPermissions: ["qep.reporting.read"],
    requiredRoles: [],
    enabled: true,
  },
  {
    commandId: "qep.command.reporting.critical_defects",
    name: "Show critical defects report",
    description: "Open the defect dashboard",
    kind: "navigation",
    category: "other",
    keywords: ["critical", "defects", "report"],
    requiredPermissions: ["qep.reporting.read"],
    requiredRoles: [],
    enabled: true,
  },
  {
    commandId: "qep.command.reporting.uncovered",
    name: "Show uncovered requirements",
    description: "Open coverage dashboard focused on gaps",
    kind: "navigation",
    category: "other",
    keywords: ["uncovered", "requirements", "coverage"],
    requiredPermissions: ["qep.reporting.read"],
    requiredRoles: [],
    enabled: true,
  },
  {
    commandId: "qep.command.reporting.saved_report",
    name: "Open saved report",
    description: "Open a saved report by ID",
    kind: "entity",
    category: "other",
    keywords: ["saved", "report"],
    requiredPermissions: ["qep.reporting.read"],
    requiredRoles: [],
    entityKind: "document",
    enabled: true,
  },
  {
    commandId: "qep.command.reporting.coverage_report",
    name: "Run coverage report",
    description: "Generate the coverage summary report",
    kind: "global",
    category: "other",
    keywords: ["coverage", "report", "run"],
    requiredPermissions: ["qep.reporting.read"],
    requiredRoles: [],
    enabled: true,
  },
  {
    commandId: "qep.command.reporting.my_dashboard",
    name: "Show my dashboard",
    description: "Open the tester dashboard",
    kind: "navigation",
    category: "other",
    keywords: ["my", "dashboard"],
    requiredPermissions: ["qep.reporting.read"],
    requiredRoles: [],
    enabled: true,
  },
];

export function createReportingCommandHandlers(options: {
  readonly onNavigate?: (
    target: string,
    args?: Readonly<Record<string, unknown>>,
  ) => void;
}): readonly CommandHandler[] {
  const base = "/workspace/qep/enterprise-reporting";
  return [
    {
      commandId: "qep.command.navigate.reporting",
      async execute() {
        options.onNavigate?.("reporting");
        return { ok: true, data: { target: base } };
      },
    },
    {
      commandId: "qep.command.reporting.executive",
      async execute() {
        return { ok: true, data: { target: `${base}/dashboards/executive` } };
      },
    },
    {
      commandId: "qep.command.reporting.execution_trends",
      async execute() {
        return {
          ok: true,
          data: { target: `${base}/dashboards/quality_trend` },
        };
      },
    },
    {
      commandId: "qep.command.reporting.critical_defects",
      async execute() {
        return { ok: true, data: { target: `${base}/dashboards/defect` } };
      },
    },
    {
      commandId: "qep.command.reporting.uncovered",
      async execute() {
        return { ok: true, data: { target: `${base}/dashboards/coverage` } };
      },
    },
    {
      commandId: "qep.command.reporting.saved_report",
      async execute(input) {
        const reportId = String(input.args?.reportId ?? input.context.entityId ?? "");
        return {
          ok: true,
          data: { target: `${base}/reports/${reportId}` },
        };
      },
    },
    {
      commandId: "qep.command.reporting.coverage_report",
      async execute() {
        return {
          ok: true,
          data: { target: `${base}/templates/coverage_summary` },
        };
      },
    },
    {
      commandId: "qep.command.reporting.my_dashboard",
      async execute() {
        return { ok: true, data: { target: `${base}/dashboards/tester` } };
      },
    },
  ];
}

export function createReportingKnowledgeProcessors(
  engine: ProjectionEngine,
): readonly EventProcessor[] {
  return REPORTING_PROJECTION_EVENT_TYPES.map((eventType) => ({
    descriptor: {
      processorId: `qep.knowledge.processor.reporting.${eventType.split(".").pop()}`,
      name: `QKI Reporting ${eventType}`,
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

export function createReportingNotificationProcessors(
  engine: NotificationDeliveryEngine,
): readonly EventProcessor[] {
  return [QEP_REPORTING_EVENTS.reportGenerated].map((eventType) => ({
    descriptor: {
      processorId: `qep.notification.processor.reporting.${eventType.split(".").pop()}`,
      name: `Notify Reporting ${eventType}`,
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

export function registerReportingProcessorsOnto(
  platformRegistry: ProcessorRegistry,
  processors: readonly EventProcessor[],
): void {
  for (const processor of processors) {
    platformRegistry.register(processor);
  }
}
