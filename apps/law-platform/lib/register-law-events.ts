import type { EventRegistry } from "@apzhub/event-notification-framework";

/** Placeholder Law Platform event definitions — app registration (LAW-001-01). */
export function registerLawEvents(registry: EventRegistry): void {
  if (!registry.has("legal-platform-module-opened")) {
    registry.register({
      eventId: "legal-platform-module-opened",
      version: "1.0.0",
      category: "business",
      publisher: "legal-platform",
      label: "Law Platform Module Opened",
      description: "Emitted when a Law Platform module view is opened.",
      sourceCapability: "legal-platform",
      source: "manifest",
      status: "active",
    });
  }

  if (!registry.has("legal-platform-feature-available")) {
    registry.register({
      eventId: "legal-platform-feature-available",
      version: "1.0.0",
      category: "business",
      publisher: "legal-platform",
      label: "Law Platform Feature Available",
      description: "Placeholder event for future Law Platform features.",
      sourceCapability: "legal-platform",
      source: "manifest",
      status: "active",
    });
  }

  const clientEvents = [
    {
      eventId: "legal.client.viewed",
      label: "Client Viewed",
      description: "Emitted when a client record is viewed in Client Management.",
    },
    {
      eventId: "legal.client.created",
      label: "Client Created",
      description: "Placeholder event when a client is created.",
    },
    {
      eventId: "legal.client.updated",
      label: "Client Updated",
      description: "Placeholder event when a client is edited.",
    },
    {
      eventId: "legal.client.deleted",
      label: "Client Deleted",
      description: "Placeholder event when a client is soft deleted.",
    },
  ] as const;

  for (const event of clientEvents) {
    if (!registry.has(event.eventId)) {
      registry.register({
        eventId: event.eventId,
        version: "1.0.0",
        category: "business",
        publisher: "legal-clients",
        label: event.label,
        description: event.description,
        sourceCapability: "legal-clients",
        source: "manifest",
        status: "active",
      });
    }
  }

  const matterEvents = [
    {
      eventId: "legal.matter.viewed",
      label: "Matter Viewed",
      description: "Emitted when a matter record is viewed in Matter Management.",
    },
    {
      eventId: "legal.matter.created",
      label: "Matter Created",
      description: "Placeholder event when a matter is created.",
    },
    {
      eventId: "legal.matter.updated",
      label: "Matter Updated",
      description: "Placeholder event when a matter is edited.",
    },
    {
      eventId: "legal.matter.archived",
      label: "Matter Archived",
      description: "Placeholder event when a matter is soft archived.",
    },
    {
      eventId: "legal.matter.workspace.opened",
      label: "Matter Workspace Opened",
      description: "Emitted when the primary matter workspace is opened.",
    },
  ] as const;

  for (const event of matterEvents) {
    if (!registry.has(event.eventId)) {
      registry.register({
        eventId: event.eventId,
        version: "1.0.0",
        category: "business",
        publisher: "legal-matters",
        label: event.label,
        description: event.description,
        sourceCapability: "legal-matters",
        source: "manifest",
        status: "active",
      });
    }
  }

  const documentEvents = [
    {
      eventId: "legal.document.viewed",
      label: "Document Viewed",
      description: "Emitted when a document record is viewed in Document Management.",
    },
    {
      eventId: "legal.document.created",
      label: "Document Created",
      description: "Placeholder event when a document is uploaded or created.",
    },
    {
      eventId: "legal.document.updated",
      label: "Document Updated",
      description: "Placeholder event when document metadata is edited.",
    },
    {
      eventId: "legal.document.archived",
      label: "Document Archived",
      description: "Placeholder event when a document is soft archived.",
    },
  ] as const;

  for (const event of documentEvents) {
    if (!registry.has(event.eventId)) {
      registry.register({
        eventId: event.eventId,
        version: "1.0.0",
        category: "business",
        publisher: "legal-documents",
        label: event.label,
        description: event.description,
        sourceCapability: "legal-documents",
        source: "manifest",
        status: "active",
      });
    }
  }

  const taskEvents = [
    {
      eventId: "legal.task.viewed",
      label: "Task Viewed",
      description: "Emitted when a task record is viewed in Task Management.",
    },
    {
      eventId: "legal.task.created",
      label: "Task Created",
      description: "Placeholder event when a task is created.",
    },
    {
      eventId: "legal.task.updated",
      label: "Task Updated",
      description: "Placeholder event when a task is edited.",
    },
    {
      eventId: "legal.task.completed",
      label: "Task Completed",
      description: "Placeholder event when a task is marked complete.",
    },
    {
      eventId: "legal.task.archived",
      label: "Task Archived",
      description: "Placeholder event when a task is soft archived.",
    },
  ] as const;

  for (const event of taskEvents) {
    if (!registry.has(event.eventId)) {
      registry.register({
        eventId: event.eventId,
        version: "1.0.0",
        category: "business",
        publisher: "legal-tasks",
        label: event.label,
        description: event.description,
        sourceCapability: "legal-tasks",
        source: "manifest",
        status: "active",
      });
    }
  }

  const timeEvents = [
    {
      eventId: "legal.time.viewed",
      label: "Time Entry Viewed",
      description: "Emitted when a time entry is viewed in Time Recording.",
    },
    {
      eventId: "legal.time.created",
      label: "Time Entry Created",
      description: "Placeholder event when a time entry is created.",
    },
    {
      eventId: "legal.time.updated",
      label: "Time Entry Updated",
      description: "Placeholder event when a time entry is edited.",
    },
    {
      eventId: "legal.time.deleted",
      label: "Time Entry Deleted",
      description: "Placeholder event when a time entry is soft deleted.",
    },
  ] as const;

  for (const event of timeEvents) {
    if (!registry.has(event.eventId)) {
      registry.register({
        eventId: event.eventId,
        version: "1.0.0",
        category: "business",
        publisher: "legal-time",
        label: event.label,
        description: event.description,
        sourceCapability: "legal-time",
        source: "manifest",
        status: "active",
      });
    }
  }

  const invoiceEvents = [
    {
      eventId: "legal.invoice.viewed",
      label: "Invoice Viewed",
      description: "Emitted when an invoice is viewed in Billing.",
    },
    {
      eventId: "legal.invoice.created",
      label: "Invoice Created",
      description: "Placeholder event when an invoice is created.",
    },
    {
      eventId: "legal.invoice.updated",
      label: "Invoice Updated",
      description: "Placeholder event when an invoice is edited.",
    },
    {
      eventId: "legal.invoice.cancelled",
      label: "Invoice Cancelled",
      description: "Placeholder event when an invoice is voided.",
    },
    {
      eventId: "legal.invoice.paid",
      label: "Invoice Paid",
      description: "Placeholder event when an invoice is marked paid.",
    },
  ] as const;

  for (const event of invoiceEvents) {
    if (!registry.has(event.eventId)) {
      registry.register({
        eventId: event.eventId,
        version: "1.0.0",
        category: "business",
        publisher: "legal-billing",
        label: event.label,
        description: event.description,
        sourceCapability: "legal-billing",
        source: "manifest",
        status: "active",
      });
    }
  }

  const calendarEvents = [
    {
      eventId: "legal.calendar.viewed",
      label: "Calendar Event Viewed",
      description: "Emitted when a calendar event is viewed in Calendar Management.",
    },
    {
      eventId: "legal.calendar.created",
      label: "Calendar Event Created",
      description: "Placeholder event when a calendar event is created.",
    },
    {
      eventId: "legal.calendar.updated",
      label: "Calendar Event Updated",
      description: "Placeholder event when a calendar event is edited.",
    },
    {
      eventId: "legal.calendar.cancelled",
      label: "Calendar Event Cancelled",
      description: "Placeholder event when a calendar event is cancelled.",
    },
  ] as const;

  for (const event of calendarEvents) {
    if (!registry.has(event.eventId)) {
      registry.register({
        eventId: event.eventId,
        version: "1.0.0",
        category: "business",
        publisher: "legal-calendar",
        label: event.label,
        description: event.description,
        sourceCapability: "legal-calendar",
        source: "manifest",
        status: "active",
      });
    }
  }

  const searchEvents = [
    {
      eventId: "legal.search.executed",
      label: "Legal Search Executed",
      description: "Emitted when unified legal search is executed.",
    },
    {
      eventId: "legal.search.result.opened",
      label: "Legal Search Result Opened",
      description: "Emitted when a unified search result is opened.",
    },
    {
      eventId: "legal.search.filtered",
      label: "Legal Search Filtered",
      description: "Emitted when unified legal search runs with advanced filters.",
    },
  ] as const;

  for (const event of searchEvents) {
    if (!registry.has(event.eventId)) {
      registry.register({
        eventId: event.eventId,
        version: "1.0.0",
        category: "business",
        publisher: "legal-search",
        label: event.label,
        description: event.description,
        sourceCapability: "legal-search",
        source: "manifest",
        status: "active",
      });
    }
  }
}
