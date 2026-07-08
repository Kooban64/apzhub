export const LAW_PLATFORM_VERSION = "1.0.0";
export const LAW_PLATFORM_NAME = "APZHUB Law Platform";
export const LAW_WORKSPACE_ID = "law";

export interface LawModuleDefinition {
  readonly id: string;
  readonly title: string;
  readonly route: string;
  readonly description: string;
}

/** Placeholder Law Platform modules — navigation and help only (LAW-001-01). */
export const LAW_PLATFORM_MODULES: readonly LawModuleDefinition[] = [
  {
    id: "legal-dashboard",
    title: "Dashboard",
    route: "/workspace/law/dashboard",
    description:
      "Executive overview — calendar, matters, tasks, billing, and firm activity.",
  },
  {
    id: "legal-clients",
    title: "Clients",
    route: "/workspace/law/clients",
    description: "Client directory, CRM profiles, and relationship management.",
  },
  {
    id: "legal-matters",
    title: "Matters",
    route: "/workspace/law/matters",
    description: "Matter lifecycle, workspaces, and case navigation.",
  },
  {
    id: "legal-documents",
    title: "Documents",
    route: "/workspace/law/documents",
    description: "Document register, filing, and matter-linked files.",
  },
  {
    id: "legal-calendar",
    title: "Calendar",
    route: "/workspace/law/calendar",
    description: "Hearings, deadlines, court appearances, and scheduling.",
  },
  {
    id: "legal-tasks",
    title: "Tasks",
    route: "/workspace/law/tasks",
    description: "Task lists, due dates, and workflow tracking.",
  },
  {
    id: "legal-time",
    title: "Time",
    route: "/workspace/law/time",
    description: "Time recording, utilisation, and unbilled work.",
  },
  {
    id: "legal-search",
    title: "Search",
    route: "/workspace/law/search",
    description:
      "Unified search across clients, matters, documents, tasks, time, and calendar.",
  },
  {
    id: "legal-billing",
    title: "Billing",
    route: "/workspace/law/billing",
    description: "Invoicing, outstanding balances, and billing workflows.",
  },
  {
    id: "legal-trust",
    title: "Trust",
    route: "/workspace/law/trust",
    description:
      "Trust Accounting — regulated client funds, reconciliation, and reporting.",
  },
  {
    id: "legal-reports",
    title: "Reports",
    route: "/workspace/law/reports",
    description: "Operational and financial reporting placeholders.",
  },
  {
    id: "legal-administration",
    title: "Administration",
    route: "/workspace/law/administration",
    description: "Firm configuration and platform administration placeholders.",
  },
] as const;

export const LAW_OPEN_COMMAND_IDS = [
  "legal.open.dashboard",
  "legal.open.clients",
  "legal.open.matters",
  "legal.open.documents",
  "legal.open.calendar",
  "legal.open.tasks",
  "legal.open.time",
  "legal.open.billing",
  "legal.open.trust",
  "legal.open.reports",
  "legal.open.administration",
] as const;

/** Client Management command palette actions (LAW-002-01). */
export const LAW_CLIENT_COMMAND_IDS = [
  "legal.client.open",
  "legal.client.create",
  "legal.client.edit",
  "legal.client.delete",
  "legal.client.search",
] as const;

/** Matter Management command palette actions (LAW-003-01). */
export const LAW_MATTER_COMMAND_IDS = [
  "legal.matter.open",
  "legal.matter.create",
  "legal.matter.edit",
  "legal.matter.archive",
  "legal.matter.search",
  "legal.matter.workspace.open",
  "legal.matter.workspace.refresh",
] as const;

/** Document Management command palette actions (LAW-004-01). */
export const LAW_DOCUMENT_COMMAND_IDS = [
  "legal.document.open",
  "legal.document.create",
  "legal.document.edit",
  "legal.document.archive",
  "legal.document.search",
] as const;

/** Task Management command palette actions (LAW-005-01). */
export const LAW_TASK_COMMAND_IDS = [
  "legal.task.open",
  "legal.task.create",
  "legal.task.edit",
  "legal.task.complete",
  "legal.task.archive",
  "legal.task.search",
] as const;

/** Calendar Management command palette actions (LAW-008-01). */
export const LAW_CALENDAR_COMMAND_IDS = [
  "legal.calendar.open",
  "legal.calendar.create",
  "legal.calendar.edit",
  "legal.calendar.search",
  "legal.calendar.cancel",
] as const;

/** Time Recording command palette actions (LAW-006-01). */
export const LAW_TIME_COMMAND_IDS = [
  "legal.time.open",
  "legal.time.create",
  "legal.time.edit",
  "legal.time.delete",
  "legal.time.search",
] as const;

/** Unified Legal Search command palette actions (LAW-007-01). */
export const LAW_SEARCH_COMMAND_IDS = [
  "legal.search.open",
  "legal.search.execute",
] as const;

/** Billing command palette actions (LAW-010-01). */
export const LAW_INVOICE_COMMAND_IDS = [
  "legal.invoice.open",
  "legal.invoice.create",
  "legal.invoice.edit",
  "legal.invoice.cancel",
  "legal.invoice.mark-paid",
  "legal.invoice.search",
] as const;

/** Trust Accounting command palette actions (LAW-015-09). */
export const LAW_TRUST_COMMAND_IDS = [
  "legal.trust.open",
  "legal.trust.transactions.open",
  "legal.trust.reconciliation.open",
  "legal.trust.reports.open",
  "legal.trust.transfer.create",
  "legal.trust.interest.run",
] as const;
