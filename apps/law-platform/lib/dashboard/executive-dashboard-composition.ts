import { getSharedInvoiceRepository } from "../billing/in-memory-invoice-repository";
import { getSharedCalendarEventRepository } from "../calendar/in-memory-calendar-event-repository";
import { getSharedClientRepository } from "../clients/in-memory-client-repository";
import { getSharedDocumentRepository } from "../documents/in-memory-document-repository";
import { getSharedMatterRepository } from "../matters/in-memory-matter-repository";
import { getSharedTaskRepository } from "../tasks/in-memory-task-repository";
import { getSharedTimeEntryRepository } from "../time/in-memory-time-entry-repository";
import { clientDetailRoute } from "../clients/client-routes";
import { matterWorkspaceRoute } from "../matters/matter-routes";
import { documentDetailRoute } from "../documents/document-routes";
import { taskDetailRoute } from "../tasks/task-routes";
import { calendarEventDetailRoute } from "../calendar/calendar-event-routes";
import { timeEntryDetailRoute } from "../time/time-entry-routes";
import {
  formatInvoiceAmount,
  invoiceDetailRoute,
  isOutstandingInvoiceStatus,
} from "../billing";
import { formatDecimalHours } from "../time/time-entry-types";
import { legalSearchListRoute } from "../search/legal-search-routes";
import { clientCreateRoute } from "../clients/client-routes";
import { matterCreateRoute } from "../matters/matter-routes";
import { taskCreateRoute } from "../tasks/task-routes";
import { timeEntryCreateRoute } from "../time/time-entry-routes";
import { invoiceCreateRoute } from "../billing/invoice-routes";

export interface ExecutiveDashboardLinkItem {
  readonly title: string;
  readonly subtitle: string;
  readonly route: string;
}

export interface ExecutiveDashboardQuickAction {
  readonly label: string;
  readonly route: string;
}

export interface ExecutiveDashboardSnapshot {
  readonly refreshedAt: string;
  readonly metrics: {
    readonly openMatters: number;
    readonly activeClients: number;
    readonly openTasks: number;
    readonly overdueTasks: number;
    readonly unbilledHours: string;
    readonly outstandingInvoices: number;
    readonly outstandingBalance: string;
    readonly todayEvents: number;
  };
  readonly welcomeMessage: string;
  readonly todayCalendar: readonly ExecutiveDashboardLinkItem[];
  readonly openMatters: readonly ExecutiveDashboardLinkItem[];
  readonly recentClients: readonly ExecutiveDashboardLinkItem[];
  readonly recentDocuments: readonly ExecutiveDashboardLinkItem[];
  readonly outstandingTasks: readonly ExecutiveDashboardLinkItem[];
  readonly unbilledTime: readonly ExecutiveDashboardLinkItem[];
  readonly outstandingInvoices: readonly ExecutiveDashboardLinkItem[];
  readonly quickActions: readonly ExecutiveDashboardQuickAction[];
  readonly globalSearchRoute: string;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date: Date): Date {
  const end = startOfDay(date);
  end.setDate(end.getDate() + 1);
  return end;
}

/** Firm-wide executive dashboard snapshot from existing repositories (LAW-013-01). */
export function composeExecutiveDashboardSnapshot(
  userName?: string,
): ExecutiveDashboardSnapshot {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  const matters = getSharedMatterRepository().list();
  const openMatters = matters.filter(
    (matter) => matter.matterStatus === "open" || matter.matterStatus === "pending",
  );

  const clients = getSharedClientRepository().list();
  const activeClients = clients.filter((client) => client.status === "active");

  const tasks = getSharedTaskRepository().list();
  const openTasks = tasks.filter(
    (task) => task.taskStatus !== "completed" && task.taskStatus !== "cancelled",
  );
  const overdueTasks = openTasks.filter((task) => {
    if (!task.dueAt) {
      return false;
    }
    return startOfDay(new Date(task.dueAt)).getTime() < todayStart.getTime();
  });

  const timeEntries = getSharedTimeEntryRepository().list();
  const unbilledEntries = timeEntries.filter(
    (entry) => entry.billingStatus === "unbilled",
  );
  const unbilledMinutes = unbilledEntries.reduce(
    (sum, entry) => sum + entry.durationMinutes,
    0,
  );

  const invoices = getSharedInvoiceRepository().list();
  const outstanding = invoices.filter((invoice) =>
    isOutstandingInvoiceStatus(invoice.invoiceStatus),
  );
  const outstandingBalance = outstanding.reduce(
    (sum, invoice) => sum + invoice.total,
    0,
  );

  const calendarEvents = getSharedCalendarEventRepository()
    .list({ calendarEventStatus: "all" })
    .filter((event) => event.calendarEventStatus !== "cancelled");

  const todayEvents = calendarEvents
    .filter((event) => {
      const startsAt = new Date(event.startsAt).getTime();
      return startsAt >= todayStart.getTime() && startsAt < todayEnd.getTime();
    })
    .sort((left, right) => left.startsAt.localeCompare(right.startsAt))
    .slice(0, 6);

  const documents = getSharedDocumentRepository().list().slice(0, 6);

  const recentClients = [...clients]
    .sort((left, right) => left.displayName.localeCompare(right.displayName))
    .slice(0, 6);

  const priorityMatters = [...openMatters]
    .sort((left, right) => left.title.localeCompare(right.title))
    .slice(0, 6);

  const priorityTasks = [...overdueTasks, ...openTasks]
    .filter(
      (task, index, array) =>
        array.findIndex((candidate) => candidate.taskId === task.taskId) === index,
    )
    .slice(0, 6);

  const recentUnbilled = unbilledEntries.slice(0, 6);

  const outstandingList = outstanding
    .sort((left, right) => left.dueDate.localeCompare(right.dueDate))
    .slice(0, 6);

  const displayName = userName?.trim() || "Counsel";

  return {
    refreshedAt: now.toISOString(),
    welcomeMessage: `Good ${resolveDayPart(now)}, ${displayName}. Here is your firm overview.`,
    metrics: {
      openMatters: openMatters.length,
      activeClients: activeClients.length,
      openTasks: openTasks.length,
      overdueTasks: overdueTasks.length,
      unbilledHours: formatDecimalHours(unbilledMinutes),
      outstandingInvoices: outstanding.length,
      outstandingBalance: formatInvoiceAmount(outstandingBalance),
      todayEvents: todayEvents.length,
    },
    todayCalendar: todayEvents.map((event) => ({
      title: event.title,
      subtitle: `${event.calendarEventReference} · ${event.startsAt.slice(11, 16)}`,
      route: calendarEventDetailRoute(event.calendarEventId),
    })),
    openMatters: priorityMatters.map((matter) => ({
      title: matter.title,
      subtitle: `${matter.matterReference} · ${matter.matterStatus}`,
      route: matterWorkspaceRoute(matter.matterId),
    })),
    recentClients: recentClients.map((client) => ({
      title: client.displayName,
      subtitle: `${client.clientReference} · ${client.status}`,
      route: clientDetailRoute(client.clientId),
    })),
    recentDocuments: documents.map((document) => ({
      title: document.title,
      subtitle: document.documentReference,
      route: documentDetailRoute(document.documentId),
    })),
    outstandingTasks: priorityTasks.map((task) => ({
      title: task.title,
      subtitle: task.dueAt
        ? `${task.taskReference} · due ${task.dueAt.slice(0, 10)}`
        : task.taskReference,
      route: taskDetailRoute(task.taskId),
    })),
    unbilledTime: recentUnbilled.map((entry) => ({
      title: entry.narrative,
      subtitle: `${entry.timeEntryReference} · ${entry.durationMinutes} min`,
      route: timeEntryDetailRoute(entry.timeEntryId),
    })),
    outstandingInvoices: outstandingList.map((invoice) => ({
      title: invoice.invoiceReference,
      subtitle: `${invoice.invoiceStatus} · due ${invoice.dueDate.slice(0, 10)} · ${formatInvoiceAmount(invoice.total, invoice.currency)}`,
      route: invoiceDetailRoute(invoice.invoiceId),
    })),
    quickActions: [
      { label: "New client", route: clientCreateRoute() },
      { label: "New matter", route: matterCreateRoute() },
      { label: "Record time", route: timeEntryCreateRoute() },
      { label: "Create task", route: taskCreateRoute() },
      { label: "Create invoice", route: invoiceCreateRoute() },
      { label: "Search", route: legalSearchListRoute() },
    ],
    globalSearchRoute: legalSearchListRoute(),
  };
}

function resolveDayPart(date: Date): string {
  const hour = date.getHours();
  if (hour < 12) {
    return "morning";
  }
  if (hour < 17) {
    return "afternoon";
  }
  return "evening";
}
