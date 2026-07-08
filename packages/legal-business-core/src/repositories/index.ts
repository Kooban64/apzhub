import type {
  CalendarEvent,
  CalendarSearchCriteria,
  Client,
  ClientSearchCriteria,
  Document,
  DocumentSearchCriteria,
  Invoice,
  InvoiceSearchCriteria,
  KnowledgeArticle,
  KnowledgeSearchCriteria,
  Matter,
  MatterSearchCriteria,
  Task,
  TaskSearchCriteria,
  TimeEntry,
  TimeSearchCriteria,
} from "../domain";

export interface ClientRepository {
  list(criteria?: ClientSearchCriteria): readonly Client[];
  getById(clientId: string): Client | undefined;
}

export interface MatterRepository {
  list(criteria?: MatterSearchCriteria): readonly Matter[];
  getById(matterId: string): Matter | undefined;
}

export interface DocumentRepository {
  list(criteria?: DocumentSearchCriteria): readonly Document[];
  getById(documentId: string): Document | undefined;
}

export interface TaskRepository {
  list(criteria?: TaskSearchCriteria): readonly Task[];
  getById(taskId: string): Task | undefined;
}

export interface InvoiceRepository {
  list(criteria?: InvoiceSearchCriteria): readonly Invoice[];
  getById(invoiceId: string): Invoice | undefined;
}

export interface CalendarRepository {
  list(criteria?: CalendarSearchCriteria): readonly CalendarEvent[];
  getById(calendarEventId: string): CalendarEvent | undefined;
}

export interface TimeRepository {
  list(criteria?: TimeSearchCriteria): readonly TimeEntry[];
  getById(timeEntryId: string): TimeEntry | undefined;
}

export interface KnowledgeRepository {
  list(criteria?: KnowledgeSearchCriteria): readonly KnowledgeArticle[];
  getById(knowledgeArticleId: string): KnowledgeArticle | undefined;
}
