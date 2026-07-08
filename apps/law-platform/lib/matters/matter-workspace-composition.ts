import type { Client, Matter } from "@apzhub/legal-business-core";

import { getSharedClientRepository } from "../clients/in-memory-client-repository";
import { clientDetailRoute } from "../clients/client-routes";
import { getSharedDocumentRepository } from "../documents/in-memory-document-repository";
import { documentDetailRoute } from "../documents/document-routes";
import { getSharedCalendarEventRepository } from "../calendar/in-memory-calendar-event-repository";
import { calendarEventDetailRoute } from "../calendar/calendar-event-routes";
import { formatDecimalHours } from "../time/time-entry-types";
import { getSharedTimeEntryRepository } from "../time/in-memory-time-entry-repository";
import { timeEntryDetailRoute } from "../time/time-entry-routes";
import { getSharedTaskRepository } from "../tasks/in-memory-task-repository";
import { taskCreateRoute, taskDetailRoute } from "../tasks/task-routes";
import { getSharedInvoiceRepository } from "../billing/in-memory-invoice-repository";
import {
  formatInvoiceAmount,
  invoiceCreateRoute,
  invoiceDetailRoute,
  isOutstandingInvoiceStatus,
} from "../billing";
import {
  getClientDisplayName,
  getLeadAttorneyLabel,
  getMatterStatusLabel,
  getMatterTypeLabel,
  getPracticeAreaLabel,
} from "./matter-lookups";

const SEED_CONTACT_LABELS: Readonly<Record<string, string>> = {
  "ct100001-0001-4000-8000-000000000001": "Amelia Torres",
  "ct100001-0001-4000-8000-000000000002": "Elena Vasquez",
  "ct100001-0001-4000-8000-000000000003": "Robert Ng",
  "ct100001-0001-4000-8000-000000000005": "Priya Sharma",
  "ct100001-0001-4000-8000-000000000006": "Dr. Helen Marsh",
};

export interface MatterWorkspaceDocumentSummary {
  readonly documentId: string;
  readonly title: string;
  readonly reference: string;
  readonly route: string;
}

export interface MatterWorkspaceTaskSummary {
  readonly taskId: string;
  readonly title: string;
  readonly reference: string;
  readonly status: string;
  readonly dueAt?: string;
  readonly route: string;
}

export interface MatterWorkspaceTimeSummary {
  readonly timeEntryId: string;
  readonly narrative: string;
  readonly reference: string;
  readonly durationMinutes: number;
  readonly billable: boolean;
  readonly route: string;
}

export interface MatterWorkspaceCalendarSummary {
  readonly calendarEventId: string;
  readonly title: string;
  readonly reference: string;
  readonly eventType: string;
  readonly startsAt: string;
  readonly route: string;
}

export interface MatterWorkspaceInvoiceSummary {
  readonly invoiceId: string;
  readonly reference: string;
  readonly status: string;
  readonly total: string;
  readonly dueDate: string;
  readonly route: string;
}

export interface MatterWorkspaceClientSummary {
  readonly clientId: string;
  readonly displayName: string;
  readonly organisation: string;
  readonly primaryContact: string;
  readonly communicationDetails: string;
  readonly route: string;
}

export interface MatterWorkspaceMatterSummary {
  readonly matterReference: string;
  readonly status: string;
  readonly priority: string;
  readonly practiceArea: string;
  readonly assignedAttorney: string;
  readonly matterType: string;
}

export interface MatterWorkspaceSnapshot {
  readonly matterId: string;
  readonly matterTitle: string;
  readonly refreshedAt: string;
  readonly matter: MatterWorkspaceMatterSummary;
  readonly client: MatterWorkspaceClientSummary;
  readonly documents: {
    readonly totalCount: number;
    readonly recent: readonly MatterWorkspaceDocumentSummary[];
  };
  readonly tasks: {
    readonly open: readonly MatterWorkspaceTaskSummary[];
    readonly overdue: readonly MatterWorkspaceTaskSummary[];
    readonly upcoming: readonly MatterWorkspaceTaskSummary[];
    readonly createRoute: string;
  };
  readonly time: {
    readonly recent: readonly MatterWorkspaceTimeSummary[];
    readonly totalHours: string;
    readonly billableHours: string;
  };
  readonly calendar: {
    readonly upcoming: readonly MatterWorkspaceCalendarSummary[];
    readonly courtAppearances: readonly MatterWorkspaceCalendarSummary[];
    readonly deadlines: readonly MatterWorkspaceCalendarSummary[];
  };
  readonly billing: {
    readonly outstanding: readonly MatterWorkspaceInvoiceSummary[];
    readonly invoiceTotal: string;
    readonly outstandingBalance: string;
    readonly createRoute: string;
    readonly listRoute: string;
  };
  readonly relatedEntityCounts: {
    readonly documents: number;
    readonly tasks: number;
    readonly timeEntries: number;
    readonly calendarEvents: number;
    readonly invoices: number;
  };
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function resolvePrimaryContactLabel(contactId?: string): string {
  if (!contactId) {
    return "—";
  }

  return SEED_CONTACT_LABELS[contactId] ?? contactId;
}

function resolveCommunicationDetails(client: Client | undefined): string {
  if (!client) {
    return "—";
  }

  const parts = [
    client.customFields.email,
    client.customFields.phone,
    client.customFields.jurisdiction,
    client.tags.join(", "),
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" · ") : "No communication details on file";
}

function resolveOrganisationLabel(client: Client): string {
  if (client.clientType === "organisation") {
    return client.displayName;
  }

  return client.customFields.organisation ?? client.customFields.employer ?? "—";
}

/** Composes matter workspace data from existing in-memory repositories (LAW-009-01). */
export function composeMatterWorkspaceSnapshot(
  matter: Matter,
): MatterWorkspaceSnapshot {
  const matterId = matter.matterId;
  const client = getSharedClientRepository().getById(matter.clientId);
  const now = new Date();
  const today = startOfDay(now);
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 14);

  const documents = getSharedDocumentRepository()
    .list({ matterId })
    .slice(0, 5)
    .map((document): MatterWorkspaceDocumentSummary => ({
      documentId: document.documentId,
      title: document.title,
      reference: document.documentReference,
      route: documentDetailRoute(document.documentId),
    }));

  const documentCount = getSharedDocumentRepository().list({ matterId }).length;

  const matterTasks = getSharedTaskRepository().list({ matterId });
  const openTasks = matterTasks
    .filter(
      (task) => task.taskStatus !== "completed" && task.taskStatus !== "cancelled",
    )
    .slice(0, 5)
    .map((task): MatterWorkspaceTaskSummary => ({
      taskId: task.taskId,
      title: task.title,
      reference: task.taskReference,
      status: task.taskStatus,
      dueAt: task.dueAt,
      route: taskDetailRoute(task.taskId),
    }));

  const overdueTasks = matterTasks
    .filter((task) => {
      if (
        !task.dueAt ||
        task.taskStatus === "completed" ||
        task.taskStatus === "cancelled"
      ) {
        return false;
      }
      return startOfDay(new Date(task.dueAt)).getTime() < today.getTime();
    })
    .slice(0, 5)
    .map((task): MatterWorkspaceTaskSummary => ({
      taskId: task.taskId,
      title: task.title,
      reference: task.taskReference,
      status: task.taskStatus,
      dueAt: task.dueAt,
      route: taskDetailRoute(task.taskId),
    }));

  const upcomingTasks = matterTasks
    .filter((task) => {
      if (
        !task.dueAt ||
        task.taskStatus === "completed" ||
        task.taskStatus === "cancelled"
      ) {
        return false;
      }
      const dueDay = startOfDay(new Date(task.dueAt));
      return (
        dueDay.getTime() >= today.getTime() && dueDay.getTime() <= weekEnd.getTime()
      );
    })
    .slice(0, 5)
    .map((task): MatterWorkspaceTaskSummary => ({
      taskId: task.taskId,
      title: task.title,
      reference: task.taskReference,
      status: task.taskStatus,
      dueAt: task.dueAt,
      route: taskDetailRoute(task.taskId),
    }));

  const timeEntries = getSharedTimeEntryRepository().list({ matterId });
  const recentTime = timeEntries
    .slice(0, 5)
    .map((entry): MatterWorkspaceTimeSummary => ({
      timeEntryId: entry.timeEntryId,
      narrative: entry.narrative,
      reference: entry.timeEntryReference,
      durationMinutes: entry.durationMinutes,
      billable: entry.billable,
      route: timeEntryDetailRoute(entry.timeEntryId),
    }));

  const totalMinutes = timeEntries.reduce(
    (sum, entry) => sum + entry.durationMinutes,
    0,
  );
  const billableMinutes = timeEntries
    .filter((entry) => entry.billable)
    .reduce((sum, entry) => sum + entry.durationMinutes, 0);

  const calendarEvents = getSharedCalendarEventRepository()
    .list({ matterId, calendarEventStatus: "all" })
    .filter((event) => event.calendarEventStatus !== "cancelled");

  const upcomingEvents = calendarEvents
    .filter((event) => new Date(event.startsAt).getTime() >= now.getTime())
    .slice(0, 5)
    .map((event): MatterWorkspaceCalendarSummary => ({
      calendarEventId: event.calendarEventId,
      title: event.title,
      reference: event.calendarEventReference,
      eventType: event.eventType,
      startsAt: event.startsAt,
      route: calendarEventDetailRoute(event.calendarEventId),
    }));

  const courtAppearances = calendarEvents
    .filter((event) => event.eventType === "hearing")
    .slice(0, 5)
    .map((event): MatterWorkspaceCalendarSummary => ({
      calendarEventId: event.calendarEventId,
      title: event.title,
      reference: event.calendarEventReference,
      eventType: event.eventType,
      startsAt: event.startsAt,
      route: calendarEventDetailRoute(event.calendarEventId),
    }));

  const deadlines = calendarEvents
    .filter((event) => event.eventType === "deadline")
    .slice(0, 5)
    .map((event): MatterWorkspaceCalendarSummary => ({
      calendarEventId: event.calendarEventId,
      title: event.title,
      reference: event.calendarEventReference,
      eventType: event.eventType,
      startsAt: event.startsAt,
      route: calendarEventDetailRoute(event.calendarEventId),
    }));

  const matterInvoices = getSharedInvoiceRepository().list({ matterId });
  const outstandingInvoices = matterInvoices
    .filter((invoice) => isOutstandingInvoiceStatus(invoice.invoiceStatus))
    .slice(0, 5)
    .map((invoice): MatterWorkspaceInvoiceSummary => ({
      invoiceId: invoice.invoiceId,
      reference: invoice.invoiceReference,
      status: invoice.invoiceStatus,
      total: formatInvoiceAmount(invoice.total, invoice.currency),
      dueDate: invoice.dueDate,
      route: invoiceDetailRoute(invoice.invoiceId),
    }));

  const invoiceTotalAmount = matterInvoices.reduce(
    (sum, invoice) => sum + invoice.total,
    0,
  );
  const outstandingBalanceAmount = matterInvoices
    .filter((invoice) => isOutstandingInvoiceStatus(invoice.invoiceStatus))
    .reduce((sum, invoice) => sum + invoice.total, 0);

  return {
    matterId,
    matterTitle: matter.title,
    refreshedAt: new Date().toISOString(),
    matter: {
      matterReference: matter.matterReference,
      status: getMatterStatusLabel(matter.matterStatus),
      priority: matter.priority,
      practiceArea: getPracticeAreaLabel(matter.practiceAreaId),
      assignedAttorney: getLeadAttorneyLabel(matter.leadAttorneyId),
      matterType: getMatterTypeLabel(matter.matterTypeId),
    },
    client: {
      clientId: matter.clientId,
      displayName: getClientDisplayName(matter.clientId),
      organisation: client ? resolveOrganisationLabel(client) : "—",
      primaryContact: resolvePrimaryContactLabel(client?.primaryContactId),
      communicationDetails: resolveCommunicationDetails(client),
      route: clientDetailRoute(matter.clientId),
    },
    documents: {
      totalCount: documentCount,
      recent: documents,
    },
    tasks: {
      open: openTasks,
      overdue: overdueTasks,
      upcoming: upcomingTasks,
      createRoute: taskCreateRoute(matterId),
    },
    time: {
      recent: recentTime,
      totalHours: formatDecimalHours(totalMinutes),
      billableHours: formatDecimalHours(billableMinutes),
    },
    calendar: {
      upcoming: upcomingEvents,
      courtAppearances,
      deadlines,
    },
    billing: {
      outstanding: outstandingInvoices,
      invoiceTotal: formatInvoiceAmount(invoiceTotalAmount),
      outstandingBalance: formatInvoiceAmount(outstandingBalanceAmount),
      createRoute: invoiceCreateRoute(matterId, matter.clientId),
      listRoute: `/workspace/law/billing?matterId=${encodeURIComponent(matterId)}`,
    },
    relatedEntityCounts: {
      documents: documentCount,
      tasks: matterTasks.length,
      timeEntries: timeEntries.length,
      calendarEvents: calendarEvents.length,
      invoices: matterInvoices.length,
    },
  };
}
