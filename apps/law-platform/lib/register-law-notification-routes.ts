import type { NotificationRegistry } from "@apzhub/event-notification-framework";

/** Placeholder Law Platform notification routes — registration only (LAW-001-01). */
export function registerLawNotificationRoutes(registry: NotificationRegistry): void {
  if (!registry.has("legal.module.opened.inbox")) {
    registry.register({
      routeId: "legal.module.opened.inbox",
      eventPattern: "legal-platform-module-opened",
      notificationKind: "inbox",
      channel: "in-app",
      templateRef: "legal-module-opened-inbox",
      version: "1.0.0",
      status: "active",
      label: "Module opened",
      titleTemplate: "{{payload.moduleLabel}} opened",
      bodyTemplate: "Law Platform module {{payload.moduleId}} was opened.",
    });
  }

  if (!registry.has("legal.feature.available.toast")) {
    registry.register({
      routeId: "legal.feature.available.toast",
      eventPattern: "legal-platform-feature-available",
      notificationKind: "toast",
      channel: "in-app",
      templateRef: "legal-feature-available-toast",
      version: "1.0.0",
      status: "active",
      label: "Future feature available",
      titleTemplate: "Coming soon: {{payload.featureId}}",
      bodyTemplate: "{{payload.message}}",
    });
  }

  const clientRoutes = [
    {
      routeId: "legal.client.viewed.inbox",
      eventPattern: "legal.client.viewed",
      notificationKind: "inbox" as const,
      label: "Client viewed",
      titleTemplate: "Client viewed: {{payload.displayName}}",
      bodyTemplate: "Client {{payload.clientReference}} was opened.",
      templateRef: "legal-client-viewed-inbox",
    },
    {
      routeId: "legal.client.created.toast",
      eventPattern: "legal.client.created",
      notificationKind: "toast" as const,
      label: "Client created",
      titleTemplate: "Client created",
      bodyTemplate: "{{payload.displayName}} was created.",
      templateRef: "legal-client-created-toast",
    },
    {
      routeId: "legal.client.edited.toast",
      eventPattern: "legal.client.updated",
      notificationKind: "toast" as const,
      label: "Client edited",
      titleTemplate: "Client updated",
      bodyTemplate: "{{payload.displayName}} was edited.",
      templateRef: "legal-client-edited-toast",
    },
    {
      routeId: "legal.client.deleted.toast",
      eventPattern: "legal.client.deleted",
      notificationKind: "toast" as const,
      label: "Client deleted",
      titleTemplate: "Client deleted",
      bodyTemplate: "{{payload.displayName}} was archived.",
      templateRef: "legal-client-deleted-toast",
    },
  ];

  for (const route of clientRoutes) {
    if (!registry.has(route.routeId)) {
      registry.register({
        routeId: route.routeId,
        eventPattern: route.eventPattern,
        notificationKind: route.notificationKind,
        channel: "in-app",
        templateRef: route.templateRef,
        version: "1.0.0",
        status: "active",
        label: route.label,
        titleTemplate: route.titleTemplate,
        bodyTemplate: route.bodyTemplate,
      });
    }
  }

  const matterRoutes = [
    {
      routeId: "legal.matter.viewed.inbox",
      eventPattern: "legal.matter.viewed",
      notificationKind: "inbox" as const,
      label: "Matter viewed",
      titleTemplate: "Matter viewed: {{payload.title}}",
      bodyTemplate: "Matter {{payload.matterReference}} was opened.",
      templateRef: "legal-matter-viewed-inbox",
    },
    {
      routeId: "legal.matter.created.toast",
      eventPattern: "legal.matter.created",
      notificationKind: "toast" as const,
      label: "Matter created",
      titleTemplate: "Matter created",
      bodyTemplate: "{{payload.title}} was created.",
      templateRef: "legal-matter-created-toast",
    },
    {
      routeId: "legal.matter.edited.toast",
      eventPattern: "legal.matter.updated",
      notificationKind: "toast" as const,
      label: "Matter edited",
      titleTemplate: "Matter updated",
      bodyTemplate: "{{payload.title}} was edited.",
      templateRef: "legal-matter-edited-toast",
    },
    {
      routeId: "legal.matter.archived.toast",
      eventPattern: "legal.matter.archived",
      notificationKind: "toast" as const,
      label: "Matter archived",
      titleTemplate: "Matter archived",
      bodyTemplate: "{{payload.title}} was archived.",
      templateRef: "legal-matter-archived-toast",
    },
    {
      routeId: "legal.matter.workspace.opened.inbox",
      eventPattern: "legal.matter.workspace.opened",
      notificationKind: "inbox" as const,
      label: "Matter workspace opened",
      titleTemplate: "Matter workspace: {{payload.title}}",
      bodyTemplate: "Operational workspace opened for {{payload.matterReference}}.",
      templateRef: "legal-matter-workspace-opened-inbox",
    },
  ];

  for (const route of matterRoutes) {
    if (!registry.has(route.routeId)) {
      registry.register({
        routeId: route.routeId,
        eventPattern: route.eventPattern,
        notificationKind: route.notificationKind,
        channel: "in-app",
        templateRef: route.templateRef,
        version: "1.0.0",
        status: "active",
        label: route.label,
        titleTemplate: route.titleTemplate,
        bodyTemplate: route.bodyTemplate,
      });
    }
  }

  const documentRoutes = [
    {
      routeId: "legal.document.viewed.inbox",
      eventPattern: "legal.document.viewed",
      notificationKind: "inbox" as const,
      label: "Document viewed",
      titleTemplate: "Document viewed: {{payload.title}}",
      bodyTemplate: "Document {{payload.documentReference}} was opened.",
      templateRef: "legal-document-viewed-inbox",
    },
    {
      routeId: "legal.document.created.toast",
      eventPattern: "legal.document.created",
      notificationKind: "toast" as const,
      label: "Document created",
      titleTemplate: "Document created",
      bodyTemplate: "{{payload.title}} was uploaded.",
      templateRef: "legal-document-created-toast",
    },
    {
      routeId: "legal.document.edited.toast",
      eventPattern: "legal.document.updated",
      notificationKind: "toast" as const,
      label: "Document edited",
      titleTemplate: "Document updated",
      bodyTemplate: "{{payload.title}} metadata was edited.",
      templateRef: "legal-document-edited-toast",
    },
    {
      routeId: "legal.document.archived.toast",
      eventPattern: "legal.document.archived",
      notificationKind: "toast" as const,
      label: "Document archived",
      titleTemplate: "Document archived",
      bodyTemplate: "{{payload.title}} was archived.",
      templateRef: "legal-document-archived-toast",
    },
  ];

  for (const route of documentRoutes) {
    if (!registry.has(route.routeId)) {
      registry.register({
        routeId: route.routeId,
        eventPattern: route.eventPattern,
        notificationKind: route.notificationKind,
        channel: "in-app",
        templateRef: route.templateRef,
        version: "1.0.0",
        status: "active",
        label: route.label,
        titleTemplate: route.titleTemplate,
        bodyTemplate: route.bodyTemplate,
      });
    }
  }

  const taskRoutes = [
    {
      routeId: "legal.task.viewed.inbox",
      eventPattern: "legal.task.viewed",
      notificationKind: "inbox" as const,
      label: "Task viewed",
      titleTemplate: "Task viewed: {{payload.title}}",
      bodyTemplate: "Task {{payload.taskReference}} was opened.",
      templateRef: "legal-task-viewed-inbox",
    },
    {
      routeId: "legal.task.created.toast",
      eventPattern: "legal.task.created",
      notificationKind: "toast" as const,
      label: "Task created",
      titleTemplate: "Task created",
      bodyTemplate: "{{payload.title}} was created.",
      templateRef: "legal-task-created-toast",
    },
    {
      routeId: "legal.task.edited.toast",
      eventPattern: "legal.task.updated",
      notificationKind: "toast" as const,
      label: "Task edited",
      titleTemplate: "Task updated",
      bodyTemplate: "{{payload.title}} was edited.",
      templateRef: "legal-task-edited-toast",
    },
    {
      routeId: "legal.task.completed.toast",
      eventPattern: "legal.task.completed",
      notificationKind: "toast" as const,
      label: "Task completed",
      titleTemplate: "Task completed",
      bodyTemplate: "{{payload.title}} was marked complete.",
      templateRef: "legal-task-completed-toast",
    },
    {
      routeId: "legal.task.archived.toast",
      eventPattern: "legal.task.archived",
      notificationKind: "toast" as const,
      label: "Task archived",
      titleTemplate: "Task archived",
      bodyTemplate: "{{payload.title}} was archived.",
      templateRef: "legal-task-archived-toast",
    },
  ];

  for (const route of taskRoutes) {
    if (!registry.has(route.routeId)) {
      registry.register({
        routeId: route.routeId,
        eventPattern: route.eventPattern,
        notificationKind: route.notificationKind,
        channel: "in-app",
        templateRef: route.templateRef,
        version: "1.0.0",
        status: "active",
        label: route.label,
        titleTemplate: route.titleTemplate,
        bodyTemplate: route.bodyTemplate,
      });
    }
  }

  const timeRoutes = [
    {
      routeId: "legal.time.viewed.inbox",
      eventPattern: "legal.time.viewed",
      notificationKind: "inbox" as const,
      label: "Time entry viewed",
      titleTemplate: "Time viewed: {{payload.narrative}}",
      bodyTemplate: "Time entry {{payload.timeEntryReference}} was opened.",
      templateRef: "legal-time-viewed-inbox",
    },
    {
      routeId: "legal.time.created.toast",
      eventPattern: "legal.time.created",
      notificationKind: "toast" as const,
      label: "Time entry created",
      titleTemplate: "Time recorded",
      bodyTemplate: "{{payload.durationMinutes}} minutes recorded.",
      templateRef: "legal-time-created-toast",
    },
    {
      routeId: "legal.time.edited.toast",
      eventPattern: "legal.time.updated",
      notificationKind: "toast" as const,
      label: "Time entry edited",
      titleTemplate: "Time entry updated",
      bodyTemplate: "{{payload.timeEntryReference}} was edited.",
      templateRef: "legal-time-edited-toast",
    },
    {
      routeId: "legal.time.deleted.toast",
      eventPattern: "legal.time.deleted",
      notificationKind: "toast" as const,
      label: "Time entry deleted",
      titleTemplate: "Time entry deleted",
      bodyTemplate: "{{payload.timeEntryReference}} was removed.",
      templateRef: "legal-time-deleted-toast",
    },
  ];

  for (const route of timeRoutes) {
    if (!registry.has(route.routeId)) {
      registry.register({
        routeId: route.routeId,
        eventPattern: route.eventPattern,
        notificationKind: route.notificationKind,
        channel: "in-app",
        templateRef: route.templateRef,
        version: "1.0.0",
        status: "active",
        label: route.label,
        titleTemplate: route.titleTemplate,
        bodyTemplate: route.bodyTemplate,
      });
    }
  }

  const invoiceRoutes = [
    {
      routeId: "legal.invoice.viewed.inbox",
      eventPattern: "legal.invoice.viewed",
      notificationKind: "inbox" as const,
      label: "Invoice viewed",
      titleTemplate: "Invoice viewed: {{payload.invoiceReference}}",
      bodyTemplate: "{{payload.invoiceReference}} was opened.",
      templateRef: "legal-invoice-viewed-inbox",
    },
    {
      routeId: "legal.invoice.created.toast",
      eventPattern: "legal.invoice.created",
      notificationKind: "toast" as const,
      label: "Invoice created",
      titleTemplate: "Invoice created",
      bodyTemplate: "{{payload.invoiceReference}} was created.",
      templateRef: "legal-invoice-created-toast",
    },
    {
      routeId: "legal.invoice.updated.toast",
      eventPattern: "legal.invoice.updated",
      notificationKind: "toast" as const,
      label: "Invoice updated",
      titleTemplate: "Invoice updated",
      bodyTemplate: "{{payload.invoiceReference}} was edited.",
      templateRef: "legal-invoice-updated-toast",
    },
    {
      routeId: "legal.invoice.cancelled.toast",
      eventPattern: "legal.invoice.cancelled",
      notificationKind: "toast" as const,
      label: "Invoice cancelled",
      titleTemplate: "Invoice cancelled",
      bodyTemplate: "{{payload.invoiceReference}} was voided.",
      templateRef: "legal-invoice-cancelled-toast",
    },
    {
      routeId: "legal.invoice.paid.toast",
      eventPattern: "legal.invoice.paid",
      notificationKind: "toast" as const,
      label: "Invoice paid",
      titleTemplate: "Invoice paid",
      bodyTemplate: "{{payload.invoiceReference}} was marked paid.",
      templateRef: "legal-invoice-paid-toast",
    },
  ];

  for (const route of invoiceRoutes) {
    if (!registry.has(route.routeId)) {
      registry.register({
        routeId: route.routeId,
        eventPattern: route.eventPattern,
        notificationKind: route.notificationKind,
        channel: "in-app",
        templateRef: route.templateRef,
        version: "1.0.0",
        status: "active",
        label: route.label,
        titleTemplate: route.titleTemplate,
        bodyTemplate: route.bodyTemplate,
      });
    }
  }

  const calendarRoutes = [
    {
      routeId: "legal.calendar.viewed.inbox",
      eventPattern: "legal.calendar.viewed",
      notificationKind: "inbox" as const,
      label: "Calendar event viewed",
      titleTemplate: "Calendar event viewed: {{payload.title}}",
      bodyTemplate: "{{payload.calendarEventReference}} was opened.",
      templateRef: "legal-calendar-viewed-inbox",
    },
    {
      routeId: "legal.calendar.created.toast",
      eventPattern: "legal.calendar.created",
      notificationKind: "toast" as const,
      label: "Calendar event created",
      titleTemplate: "Event scheduled",
      bodyTemplate: "{{payload.title}} was created.",
      templateRef: "legal-calendar-created-toast",
    },
    {
      routeId: "legal.calendar.edited.toast",
      eventPattern: "legal.calendar.updated",
      notificationKind: "toast" as const,
      label: "Calendar event edited",
      titleTemplate: "Calendar event updated",
      bodyTemplate: "{{payload.calendarEventReference}} was edited.",
      templateRef: "legal-calendar-edited-toast",
    },
    {
      routeId: "legal.calendar.cancelled.toast",
      eventPattern: "legal.calendar.cancelled",
      notificationKind: "toast" as const,
      label: "Calendar event cancelled",
      titleTemplate: "Calendar event cancelled",
      bodyTemplate: "{{payload.title}} was cancelled.",
      templateRef: "legal-calendar-cancelled-toast",
    },
  ];

  for (const route of calendarRoutes) {
    if (!registry.has(route.routeId)) {
      registry.register({
        routeId: route.routeId,
        eventPattern: route.eventPattern,
        notificationKind: route.notificationKind,
        channel: "in-app",
        templateRef: route.templateRef,
        version: "1.0.0",
        status: "active",
        label: route.label,
        titleTemplate: route.titleTemplate,
        bodyTemplate: route.bodyTemplate,
      });
    }
  }

  const searchRoutes = [
    {
      routeId: "legal.notification.search.executed",
      eventPattern: "legal.search.executed",
      notificationKind: "toast" as const,
      label: "Legal search executed",
      titleTemplate: "Search completed",
      bodyTemplate: 'Found {{payload.resultCount}} result(s) for "{{payload.query}}".',
      templateRef: "legal-search-executed-toast",
    },
    {
      routeId: "legal.notification.search.result-opened",
      eventPattern: "legal.search.result.opened",
      notificationKind: "toast" as const,
      label: "Legal search result opened",
      titleTemplate: "Search result opened",
      bodyTemplate: "Opened {{payload.entityType}} {{payload.reference}}.",
      templateRef: "legal-search-result-opened-toast",
    },
    {
      routeId: "legal.notification.search.filtered",
      eventPattern: "legal.search.filtered",
      notificationKind: "toast" as const,
      label: "Legal search filtered",
      titleTemplate: "Filtered search completed",
      bodyTemplate:
        'Found {{payload.resultCount}} filtered result(s) for "{{payload.query}}".',
      templateRef: "legal-search-filtered-toast",
    },
  ];

  for (const route of searchRoutes) {
    if (!registry.has(route.routeId)) {
      registry.register({
        routeId: route.routeId,
        eventPattern: route.eventPattern,
        notificationKind: route.notificationKind,
        channel: "in-app",
        version: "1.0.0",
        status: "active",
        label: route.label,
        titleTemplate: route.titleTemplate,
        bodyTemplate: route.bodyTemplate,
        templateRef: route.templateRef,
      });
    }
  }
}
