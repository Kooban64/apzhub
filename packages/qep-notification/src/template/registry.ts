import type {
  NotificationCategory,
  NotificationPriority,
  NotificationSeverity,
} from "../domain/classification";

export type NotificationTemplate = {
  readonly templateId: string;
  readonly name: string;
  readonly category: NotificationCategory;
  readonly defaultSeverity: NotificationSeverity;
  readonly defaultPriority: NotificationPriority;
  /** Title with `{{var}}` placeholders. */
  readonly titleTemplate: string;
  /** Body with `{{var}}` placeholders. */
  readonly bodyTemplate: string;
  /** Locale hook — default locale for this template. */
  readonly defaultLocale: string;
  readonly localisation?: Readonly<
    Record<string, { readonly titleTemplate: string; readonly bodyTemplate: string }>
  >;
};

export type TemplateRegistry = {
  register(template: NotificationTemplate): void;
  get(templateId: string): NotificationTemplate | undefined;
  list(): readonly NotificationTemplate[];
};

export function createTemplateRegistry(
  initial: readonly NotificationTemplate[] = [],
): TemplateRegistry {
  const byId = new Map<string, NotificationTemplate>();
  for (const t of initial) {
    byId.set(t.templateId, t);
  }
  return {
    register(template) {
      byId.set(template.templateId, template);
    },
    get(templateId) {
      return byId.get(templateId);
    },
    list() {
      return [...byId.values()];
    },
  };
}

/** Built-in Evidence templates — configurable registry, not hard-coded subscriptions. */
export const EVIDENCE_NOTIFICATION_TEMPLATES: readonly NotificationTemplate[] = [
  {
    templateId: "qep.notification.template.evidence.created",
    name: "Evidence Created",
    category: "evidence",
    defaultSeverity: "info",
    defaultPriority: "normal",
    titleTemplate: "Evidence created: {{title}}",
    bodyTemplate: "Evidence {{evidenceId}} was created in tenant {{tenantId}}.",
    defaultLocale: "en",
  },
  {
    templateId: "qep.notification.template.evidence.updated",
    name: "Evidence Updated",
    category: "evidence",
    defaultSeverity: "info",
    defaultPriority: "normal",
    titleTemplate: "Evidence updated: {{title}}",
    bodyTemplate: "Evidence {{evidenceId}} was updated.",
    defaultLocale: "en",
  },
  {
    templateId: "qep.notification.template.evidence.lifecycle",
    name: "Evidence Lifecycle Changed",
    category: "evidence",
    defaultSeverity: "info",
    defaultPriority: "normal",
    titleTemplate: "Evidence lifecycle: {{evidenceId}}",
    bodyTemplate: "Evidence {{evidenceId}} lifecycle changed.",
    defaultLocale: "en",
  },
  {
    templateId: "qep.notification.template.evidence.integrity",
    name: "Evidence Integrity",
    category: "evidence",
    defaultSeverity: "warning",
    defaultPriority: "high",
    titleTemplate: "Evidence integrity: {{evidenceId}}",
    bodyTemplate: "Integrity event for evidence {{evidenceId}}.",
    defaultLocale: "en",
  },
  {
    templateId: "qep.notification.template.evidence.archive",
    name: "Evidence Archived",
    category: "evidence",
    defaultSeverity: "info",
    defaultPriority: "low",
    titleTemplate: "Evidence archived: {{evidenceId}}",
    bodyTemplate: "Evidence {{evidenceId}} was archived.",
    defaultLocale: "en",
  },
  {
    templateId: "qep.notification.template.evidence.supersession",
    name: "Evidence Superseded",
    category: "evidence",
    defaultSeverity: "warning",
    defaultPriority: "normal",
    titleTemplate: "Evidence superseded: {{evidenceId}}",
    bodyTemplate: "Evidence {{evidenceId}} was superseded.",
    defaultLocale: "en",
  },
  {
    templateId: "qep.notification.template.evidence.delete",
    name: "Evidence Deleted",
    category: "evidence",
    defaultSeverity: "warning",
    defaultPriority: "high",
    titleTemplate: "Evidence deleted: {{evidenceId}}",
    bodyTemplate: "Evidence {{evidenceId}} was deleted.",
    defaultLocale: "en",
  },
];
