export interface PostgresOutboxEventDraft {
  readonly aggregateType:
    | "client"
    | "matter"
    | "document"
    | "task"
    | "calendar"
    | "time"
    | "invoice"
    | "trust";
  readonly aggregateId: string;
  readonly eventType: string;
  readonly payload: Record<string, unknown>;
}

export function createClientOutboxDraft(
  eventType: "legal.client.created" | "legal.client.updated" | "legal.client.deleted",
  client: {
    readonly clientId: string;
    readonly displayName: string;
    readonly clientReference: string;
  },
): PostgresOutboxEventDraft {
  return {
    aggregateType: "client",
    aggregateId: client.clientId,
    eventType,
    payload: {
      clientId: client.clientId,
      clientReference: client.clientReference,
      displayName: client.displayName,
    },
  };
}

export function createMatterOutboxDraft(
  eventType: "legal.matter.created" | "legal.matter.updated" | "legal.matter.archived",
  matter: {
    readonly matterId: string;
    readonly title: string;
    readonly matterReference: string;
  },
): PostgresOutboxEventDraft {
  return {
    aggregateType: "matter",
    aggregateId: matter.matterId,
    eventType,
    payload: {
      matterId: matter.matterId,
      matterReference: matter.matterReference,
      title: matter.title,
    },
  };
}

export function createDocumentOutboxDraft(
  eventType:
    "legal.document.created" | "legal.document.updated" | "legal.document.archived",
  document: {
    readonly documentId: string;
    readonly title: string;
    readonly documentReference: string;
    readonly matterId: string;
  },
): PostgresOutboxEventDraft {
  return {
    aggregateType: "document",
    aggregateId: document.documentId,
    eventType,
    payload: {
      documentId: document.documentId,
      documentReference: document.documentReference,
      title: document.title,
      matterId: document.matterId,
    },
  };
}

export function createTaskOutboxDraft(
  eventType:
    | "legal.task.created"
    | "legal.task.updated"
    | "legal.task.completed"
    | "legal.task.archived",
  task: {
    readonly taskId: string;
    readonly title: string;
    readonly taskReference: string;
    readonly matterId?: string;
    readonly documentId?: string;
  },
): PostgresOutboxEventDraft {
  return {
    aggregateType: "task",
    aggregateId: task.taskId,
    eventType,
    payload: {
      taskId: task.taskId,
      taskReference: task.taskReference,
      title: task.title,
      matterId: task.matterId ?? "",
      documentId: task.documentId,
    },
  };
}

export function createCalendarOutboxDraft(
  eventType:
    "legal.calendar.created" | "legal.calendar.updated" | "legal.calendar.cancelled",
  event: {
    readonly calendarEventId: string;
    readonly title: string;
    readonly calendarEventReference: string;
    readonly matterId?: string;
  },
): PostgresOutboxEventDraft {
  return {
    aggregateType: "calendar",
    aggregateId: event.calendarEventId,
    eventType,
    payload: {
      calendarEventId: event.calendarEventId,
      calendarEventReference: event.calendarEventReference,
      title: event.title,
      matterId: event.matterId ?? "",
    },
  };
}

export function createTimeOutboxDraft(
  eventType: "legal.time.created" | "legal.time.updated" | "legal.time.deleted",
  entry: {
    readonly timeEntryId: string;
    readonly timeEntryReference: string;
    readonly matterId: string;
    readonly narrative: string;
  },
): PostgresOutboxEventDraft {
  return {
    aggregateType: "time",
    aggregateId: entry.timeEntryId,
    eventType,
    payload: {
      timeEntryId: entry.timeEntryId,
      timeEntryReference: entry.timeEntryReference,
      matterId: entry.matterId,
      narrative: entry.narrative,
    },
  };
}

export function createTrustOutboxDraft(
  eventType: string,
  aggregateId: string,
  payload: Record<string, unknown>,
): PostgresOutboxEventDraft {
  return {
    aggregateType: "trust",
    aggregateId,
    eventType,
    payload,
  };
}

export function createInvoiceOutboxDraft(
  eventType:
    | "legal.invoice.created"
    | "legal.invoice.updated"
    | "legal.invoice.cancelled"
    | "legal.invoice.paid",
  invoice: {
    readonly invoiceId: string;
    readonly invoiceReference: string;
    readonly clientId: string;
    readonly matterId?: string;
    readonly invoiceStatus: string;
  },
): PostgresOutboxEventDraft {
  return {
    aggregateType: "invoice",
    aggregateId: invoice.invoiceId,
    eventType,
    payload: {
      invoiceId: invoice.invoiceId,
      invoiceReference: invoice.invoiceReference,
      clientId: invoice.clientId,
      matterId: invoice.matterId ?? "",
      invoiceStatus: invoice.invoiceStatus,
    },
  };
}
