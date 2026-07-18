import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

/** Law platform client aggregate (LAW-012-02). */
export const lawClient = pgTable(
  "law_client",
  {
    clientId: text("client_id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    clientReference: varchar("client_reference", { length: 64 }).notNull(),
    displayName: text("display_name").notNull(),
    clientType: varchar("client_type", { length: 32 }).notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    primaryContactId: text("primary_contact_id"),
    billingAddressId: text("billing_address_id"),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    customFields: jsonb("custom_fields")
      .$type<Record<string, string>>()
      .notNull()
      .default({}),
    version: integer("version").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("law_client_tenant_reference_uidx").on(
      table.tenantId,
      table.clientReference,
    ),
    index("law_client_tenant_idx").on(table.tenantId),
  ],
);

/** Law platform matter aggregate (LAW-012-02). */
export const lawMatter = pgTable(
  "law_matter",
  {
    matterId: text("matter_id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    clientId: text("client_id").notNull(),
    matterReference: varchar("matter_reference", { length: 64 }).notNull(),
    title: text("title").notNull(),
    description: text("description"),
    matterTypeId: varchar("matter_type_id", { length: 64 }).notNull(),
    matterStatus: varchar("matter_status", { length: 32 }).notNull(),
    practiceAreaId: varchar("practice_area_id", { length: 64 }).notNull(),
    priority: varchar("priority", { length: 32 }).notNull(),
    openedAt: timestamp("opened_at", { withTimezone: true }).notNull(),
    closedAt: timestamp("closed_at", { withTimezone: true }),
    courtId: text("court_id"),
    judgeId: text("judge_id"),
    leadAttorneyId: text("lead_attorney_id").notNull(),
    teamMemberIds: jsonb("team_member_ids").$type<string[]>().notNull().default([]),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    customFields: jsonb("custom_fields")
      .$type<Record<string, string>>()
      .notNull()
      .default({}),
    version: integer("version").notNull().default(1),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("law_matter_tenant_reference_uidx").on(
      table.tenantId,
      table.matterReference,
    ),
    index("law_matter_tenant_idx").on(table.tenantId),
    index("law_matter_tenant_client_idx").on(table.tenantId, table.clientId),
  ],
);

/** Law platform document aggregate — metadata only (LAW-012-04). */
export const lawDocument = pgTable(
  "law_document",
  {
    documentId: text("document_id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    matterId: text("matter_id").notNull(),
    clientId: text("client_id"),
    documentReference: varchar("document_reference", { length: 64 }).notNull(),
    title: text("title").notNull(),
    documentType: varchar("document_type", { length: 32 }).notNull(),
    documentStatus: varchar("document_status", { length: 32 }).notNull(),
    documentCategoryId: varchar("document_category_id", { length: 64 }).notNull(),
    folderId: text("folder_id"),
    version: integer("version").notNull().default(1),
    fileName: text("file_name").notNull(),
    mimeType: varchar("mime_type", { length: 128 }).notNull(),
    sizeBytes: integer("size_bytes").notNull().default(0),
    createdByUserId: text("created_by_user_id").notNull(),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    customFields: jsonb("custom_fields")
      .$type<Record<string, string>>()
      .notNull()
      .default({}),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("law_document_tenant_reference_uidx").on(
      table.tenantId,
      table.documentReference,
    ),
    index("law_document_tenant_idx").on(table.tenantId),
    index("law_document_tenant_matter_idx").on(table.tenantId, table.matterId),
  ],
);

/** Law platform task aggregate (LAW-012-04). */
export const lawTask = pgTable(
  "law_task",
  {
    taskId: text("task_id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    matterId: text("matter_id").notNull(),
    clientId: text("client_id"),
    documentId: text("document_id"),
    taskReference: varchar("task_reference", { length: 64 }).notNull(),
    title: text("title").notNull(),
    description: text("description"),
    taskStatus: varchar("task_status", { length: 32 }).notNull(),
    taskPriority: varchar("task_priority", { length: 32 }).notNull(),
    assigneeUserId: text("assignee_user_id").notNull(),
    dueAt: timestamp("due_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    workflowStepId: text("workflow_step_id"),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    version: integer("version").notNull().default(1),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("law_task_tenant_reference_uidx").on(
      table.tenantId,
      table.taskReference,
    ),
    index("law_task_tenant_idx").on(table.tenantId),
    index("law_task_tenant_matter_idx").on(table.tenantId, table.matterId),
    index("law_task_tenant_document_idx").on(table.tenantId, table.documentId),
  ],
);

/** Law platform calendar event aggregate (LAW-012-05). */
export const lawCalendarEvent = pgTable(
  "law_calendar_event",
  {
    calendarEventId: text("calendar_event_id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    matterId: text("matter_id").notNull(),
    clientId: text("client_id"),
    taskId: text("task_id"),
    documentId: text("document_id"),
    timeEntryId: text("time_entry_id"),
    calendarEventReference: varchar("calendar_event_reference", {
      length: 64,
    }).notNull(),
    title: text("title").notNull(),
    eventType: varchar("event_type", { length: 32 }).notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    allDay: boolean("all_day").notNull().default(false),
    courtId: text("court_id"),
    ownerUserId: text("owner_user_id").notNull(),
    reminderMinutes: jsonb("reminder_minutes").$type<number[]>().notNull().default([]),
    calendarEventStatus: varchar("calendar_event_status", { length: 32 }).notNull(),
    location: text("location"),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    version: integer("version").notNull().default(1),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("law_calendar_event_tenant_reference_uidx").on(
      table.tenantId,
      table.calendarEventReference,
    ),
    index("law_calendar_event_tenant_idx").on(table.tenantId),
    index("law_calendar_event_tenant_matter_idx").on(table.tenantId, table.matterId),
  ],
);

/** Law platform time entry aggregate (LAW-012-05). */
export const lawTimeEntry = pgTable(
  "law_time_entry",
  {
    timeEntryId: text("time_entry_id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    matterId: text("matter_id").notNull(),
    taskId: text("task_id"),
    documentId: text("document_id"),
    timeEntryReference: varchar("time_entry_reference", { length: 64 }).notNull(),
    userId: text("user_id").notNull(),
    entryDate: timestamp("entry_date", { withTimezone: true }).notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    narrative: text("narrative").notNull(),
    activityCode: varchar("activity_code", { length: 64 }),
    billable: boolean("billable").notNull().default(true),
    billingStatus: varchar("billing_status", { length: 32 }).notNull(),
    rate: real("rate").notNull().default(0),
    amount: real("amount").notNull().default(0),
    approvedByUserId: text("approved_by_user_id"),
    startTime: timestamp("start_time", { withTimezone: true }),
    endTime: timestamp("end_time", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    version: integer("version").notNull().default(1),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("law_time_entry_tenant_reference_uidx").on(
      table.tenantId,
      table.timeEntryReference,
    ),
    index("law_time_entry_tenant_idx").on(table.tenantId),
    index("law_time_entry_tenant_matter_idx").on(table.tenantId, table.matterId),
  ],
);

/** Law platform invoice aggregate (LAW-012-06). */
export const lawInvoice = pgTable(
  "law_invoice",
  {
    invoiceId: text("invoice_id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    clientId: text("client_id").notNull(),
    matterId: text("matter_id"),
    invoiceReference: varchar("invoice_reference", { length: 64 }).notNull(),
    invoiceStatus: varchar("invoice_status", { length: 32 }).notNull(),
    issueDate: timestamp("issue_date", { withTimezone: true }).notNull(),
    dueDate: timestamp("due_date", { withTimezone: true }).notNull(),
    subtotal: real("subtotal").notNull().default(0),
    taxTotal: real("tax_total").notNull().default(0),
    total: real("total").notNull().default(0),
    currency: varchar("currency", { length: 8 }).notNull().default("AUD"),
    trustAppliedAmount: real("trust_applied_amount"),
    expensesPlaceholder: real("expenses_placeholder").notNull().default(0),
    disbursementsPlaceholder: real("disbursements_placeholder").notNull().default(0),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    version: integer("version").notNull().default(1),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("law_invoice_tenant_reference_uidx").on(
      table.tenantId,
      table.invoiceReference,
    ),
    index("law_invoice_tenant_idx").on(table.tenantId),
    index("law_invoice_tenant_client_idx").on(table.tenantId, table.clientId),
    index("law_invoice_tenant_matter_idx").on(table.tenantId, table.matterId),
  ],
);

/** Invoice line items — child rows of law_invoice (LAW-012-06). */
export const lawInvoiceLineItem = pgTable(
  "law_invoice_line_item",
  {
    lineItemId: text("line_item_id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    invoiceId: text("invoice_id").notNull(),
    description: text("description").notNull(),
    quantity: real("quantity").notNull(),
    unitPrice: real("unit_price").notNull(),
    amount: real("amount").notNull(),
    matterId: text("matter_id").notNull(),
    timeEntryId: text("time_entry_id"),
    expenseId: text("expense_id"),
  },
  (table) => [
    index("law_invoice_line_item_tenant_idx").on(table.tenantId),
    index("law_invoice_line_item_tenant_invoice_idx").on(
      table.tenantId,
      table.invoiceId,
    ),
    index("law_invoice_line_item_tenant_time_entry_idx").on(
      table.tenantId,
      table.timeEntryId,
    ),
  ],
);

/** Outbox for reliable event delivery (LAW-012-02 write path; PCv2-02 worker lifecycle). */
export const lawOutboxEvent = pgTable(
  "law_outbox_event",
  {
    outboxEventId: text("outbox_event_id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    aggregateType: varchar("aggregate_type", { length: 64 }).notNull(),
    aggregateId: text("aggregate_id").notNull(),
    eventType: varchar("event_type", { length: 128 }).notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    attemptCount: integer("attempt_count").notNull().default(0),
    maxAttempts: integer("max_attempts").notNull().default(5),
    nextAttemptAt: timestamp("next_attempt_at", { withTimezone: true }),
    lastError: text("last_error"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    correlationId: text("correlation_id"),
  },
  (table) => [
    index("law_outbox_event_tenant_idx").on(table.tenantId),
    index("law_outbox_event_status_idx").on(table.status),
    index("law_outbox_event_claim_idx").on(
      table.status,
      table.nextAttemptAt,
      table.createdAt,
    ),
  ],
);

/** Trust bank account aggregate (LAW-015-11). */
export const lawTrustAccount = pgTable(
  "law_trust_account",
  {
    trustAccountId: text("trust_account_id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    trustAccountCode: varchar("trust_account_code", { length: 64 }).notNull(),
    name: text("name").notNull(),
    currency: varchar("currency", { length: 8 }).notNull(),
    institutionName: text("institution_name").notNull(),
    accountNumberMasked: text("account_number_masked").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    openedAt: timestamp("opened_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    version: integer("version").notNull().default(1),
  },
  (table) => [
    uniqueIndex("law_trust_account_tenant_code_uidx").on(
      table.tenantId,
      table.trustAccountCode,
    ),
    index("law_trust_account_tenant_idx").on(table.tenantId),
  ],
);

/** Immutable trust journal entry (LAW-015-11). */
export const lawTrustJournalEntry = pgTable(
  "law_trust_journal_entry",
  {
    journalEntryId: text("journal_entry_id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    trustAccountId: text("trust_account_id").notNull(),
    journalReference: varchar("journal_reference", { length: 64 }).notNull(),
    entryDate: timestamp("entry_date", { withTimezone: true }).notNull(),
    postedAt: timestamp("posted_at", { withTimezone: true }).notNull(),
    postedByUserId: text("posted_by_user_id").notNull(),
    trustTransactionId: text("trust_transaction_id").notNull(),
    reversesEntryId: text("reverses_entry_id"),
    lines: jsonb("lines").$type<Record<string, unknown>[]>().notNull(),
  },
  (table) => [
    index("law_trust_journal_entry_tenant_idx").on(table.tenantId),
    index("law_trust_journal_entry_tenant_account_idx").on(
      table.tenantId,
      table.trustAccountId,
    ),
  ],
);

/** Posted trust transaction (LAW-015-11). */
export const lawTrustTransaction = pgTable(
  "law_trust_transaction",
  {
    trustTransactionId: text("trust_transaction_id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    trustAccountId: text("trust_account_id").notNull(),
    transactionReference: varchar("transaction_reference", { length: 64 }).notNull(),
    trustTransactionType: varchar("trust_transaction_type", { length: 32 }).notNull(),
    amount: real("amount").notNull(),
    currency: varchar("currency", { length: 8 }).notNull(),
    transactionDate: timestamp("transaction_date", { withTimezone: true }).notNull(),
    postingDate: timestamp("posting_date", { withTimezone: true }).notNull(),
    clientId: text("client_id").notNull(),
    matterId: text("matter_id"),
    narrative: text("narrative").notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    journalEntryId: text("journal_entry_id").notNull(),
    postedByUserId: text("posted_by_user_id").notNull(),
    reversesTransactionId: text("reverses_transaction_id"),
    pairedTransactionId: text("paired_transaction_id"),
    adjustmentDirection: varchar("adjustment_direction", { length: 16 }),
    postedAt: timestamp("posted_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("law_trust_transaction_tenant_reference_uidx").on(
      table.tenantId,
      table.transactionReference,
    ),
    index("law_trust_transaction_tenant_idx").on(table.tenantId),
    index("law_trust_transaction_tenant_account_idx").on(
      table.tenantId,
      table.trustAccountId,
    ),
  ],
);

/** Derived trust balance projection (LAW-015-11). */
export const lawTrustBalance = pgTable(
  "law_trust_balance",
  {
    balanceId: text("balance_id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    trustAccountId: text("trust_account_id").notNull(),
    scope: varchar("scope", { length: 32 }).notNull(),
    clientId: text("client_id"),
    matterId: text("matter_id"),
    balanceAmount: real("balance_amount").notNull(),
    currency: varchar("currency", { length: 8 }).notNull(),
    asOfDate: timestamp("as_of_date", { withTimezone: true }).notNull(),
  },
  (table) => [
    index("law_trust_balance_tenant_account_idx").on(
      table.tenantId,
      table.trustAccountId,
    ),
  ],
);

export const lawTrustTransactionDraft = pgTable(
  "law_trust_transaction_draft",
  {
    draftId: text("draft_id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    trustAccountId: text("trust_account_id").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("law_trust_transaction_draft_tenant_idx").on(table.tenantId),
    index("law_trust_transaction_draft_tenant_account_idx").on(
      table.tenantId,
      table.trustAccountId,
    ),
  ],
);

export const lawTrustTransactionAudit = pgTable(
  "law_trust_transaction_audit",
  {
    auditRecordId: text("audit_record_id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    trustAccountId: text("trust_account_id").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("law_trust_transaction_audit_tenant_idx").on(table.tenantId)],
);

export const lawTrustAllocation = pgTable(
  "law_trust_allocation",
  {
    trustAllocationId: text("trust_allocation_id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    trustAccountId: text("trust_account_id").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("law_trust_allocation_tenant_idx").on(table.tenantId),
    index("law_trust_allocation_tenant_account_idx").on(
      table.tenantId,
      table.trustAccountId,
    ),
  ],
);

export const lawTrustReconciliationRun = pgTable(
  "law_trust_reconciliation_run",
  {
    trustReconciliationRunId: text("trust_reconciliation_run_id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    trustAccountId: text("trust_account_id").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("law_trust_reconciliation_run_tenant_idx").on(table.tenantId)],
);

export const lawTrustInterestRule = pgTable(
  "law_trust_interest_rule",
  {
    trustInterestRuleId: text("trust_interest_rule_id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("law_trust_interest_rule_tenant_idx").on(table.tenantId)],
);

export const lawTrustInterestPosting = pgTable(
  "law_trust_interest_posting",
  {
    trustInterestPostingId: text("trust_interest_posting_id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    trustAccountId: text("trust_account_id").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("law_trust_interest_posting_tenant_idx").on(table.tenantId)],
);

export const lawTrustTransfer = pgTable(
  "law_trust_transfer",
  {
    trustTransferId: text("trust_transfer_id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("law_trust_transfer_tenant_idx").on(table.tenantId)],
);

export const lawTrustApprovalRule = pgTable(
  "law_trust_approval_rule",
  {
    trustApprovalRuleId: text("trust_approval_rule_id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("law_trust_approval_rule_tenant_idx").on(table.tenantId)],
);

export const lawTrustApprovalRequest = pgTable(
  "law_trust_approval_request",
  {
    trustApprovalRequestId: text("trust_approval_request_id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    trustAccountId: text("trust_account_id").notNull(),
    approvalType: varchar("approval_type", { length: 64 }).notNull(),
    subjectId: text("subject_id").notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("law_trust_approval_request_tenant_idx").on(table.tenantId),
    index("law_trust_approval_request_tenant_status_idx").on(
      table.tenantId,
      table.status,
    ),
  ],
);

export const lawTrustApprovalHistory = pgTable(
  "law_trust_approval_history",
  {
    trustApprovalHistoryId: text("trust_approval_history_id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    trustApprovalRequestId: text("trust_approval_request_id").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("law_trust_approval_history_tenant_idx").on(table.tenantId),
    index("law_trust_approval_history_request_idx").on(
      table.tenantId,
      table.trustApprovalRequestId,
    ),
  ],
);

export const lawTrustReport = pgTable(
  "law_trust_report",
  {
    trustReportId: text("trust_report_id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    trustAccountId: text("trust_account_id"),
    reportType: varchar("report_type", { length: 64 }).notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    generatedAt: timestamp("generated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("law_trust_report_tenant_idx").on(table.tenantId)],
);

export const legalSchema = {
  lawClient,
  lawMatter,
  lawDocument,
  lawTask,
  lawCalendarEvent,
  lawTimeEntry,
  lawInvoice,
  lawInvoiceLineItem,
  lawOutboxEvent,
  lawTrustAccount,
  lawTrustJournalEntry,
  lawTrustTransaction,
  lawTrustBalance,
  lawTrustTransactionDraft,
  lawTrustTransactionAudit,
  lawTrustAllocation,
  lawTrustReconciliationRun,
  lawTrustInterestRule,
  lawTrustInterestPosting,
  lawTrustTransfer,
  lawTrustApprovalRule,
  lawTrustApprovalRequest,
  lawTrustApprovalHistory,
  lawTrustReport,
};
