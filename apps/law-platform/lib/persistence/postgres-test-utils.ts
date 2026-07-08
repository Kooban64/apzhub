import type { Client, Document, Matter } from "@apzhub/legal-business-core";
import {
  calendarEventToRow,
  checkDatabaseHealth,
  clientToRow,
  createDb,
  documentToRow,
  getDatabaseUrl,
  invoiceToRow,
  lawCalendarEvent,
  lawClient,
  lawDocument,
  lawInvoice,
  lawInvoiceLineItem,
  lawMatter,
  lawOutboxEvent,
  lawTask,
  lawTimeEntry,
  lawTrustAccount,
  lawTrustAllocation,
  lawTrustApprovalHistory,
  lawTrustApprovalRequest,
  lawTrustApprovalRule,
  lawTrustBalance,
  lawTrustInterestPosting,
  lawTrustInterestRule,
  lawTrustJournalEntry,
  lawTrustReconciliationRun,
  lawTrustReport,
  lawTrustTransaction,
  lawTrustTransactionAudit,
  lawTrustTransactionDraft,
  lawTrustTransfer,
  lineItemToRow,
  matterToRow,
  runMigrations,
  taskToRow,
  timeEntryToRow,
  type LawCalendarEventPersistenceModel,
  type LawInvoicePersistenceModel,
  type LawTaskPersistenceModel,
  type LawTimeEntryPersistenceModel,
} from "@apzhub/config";

import type { LawPersistenceContext } from "./law-persistence-context";

/** Returns true when DATABASE_URL is configured and PostgreSQL accepts connections. */
export async function isPostgresIntegrationAvailable(): Promise<boolean> {
  if (!process.env.DATABASE_URL) {
    return false;
  }

  const health = await checkDatabaseHealth();
  return health.ok;
}

export async function ensureLawMigrations(connectionString?: string): Promise<void> {
  await runMigrations(connectionString ?? getDatabaseUrl());
}

export async function truncateLawTables(connectionString?: string): Promise<void> {
  const db = createDb(connectionString ?? getDatabaseUrl());
  await db.delete(lawOutboxEvent);
  await db.delete(lawTrustApprovalHistory);
  await db.delete(lawTrustApprovalRequest);
  await db.delete(lawTrustApprovalRule);
  await db.delete(lawTrustReport);
  await db.delete(lawTrustReconciliationRun);
  await db.delete(lawTrustInterestPosting);
  await db.delete(lawTrustInterestRule);
  await db.delete(lawTrustTransfer);
  await db.delete(lawTrustAllocation);
  await db.delete(lawTrustTransactionAudit);
  await db.delete(lawTrustTransactionDraft);
  await db.delete(lawTrustBalance);
  await db.delete(lawTrustJournalEntry);
  await db.delete(lawTrustTransaction);
  await db.delete(lawTrustAccount);
  await db.delete(lawInvoiceLineItem);
  await db.delete(lawInvoice);
  await db.delete(lawCalendarEvent);
  await db.delete(lawTimeEntry);
  await db.delete(lawTask);
  await db.delete(lawDocument);
  await db.delete(lawMatter);
  await db.delete(lawClient);
}

export async function seedPostgresLawDataAsync(
  context: LawPersistenceContext,
  input: {
    readonly clients?: readonly Client[];
    readonly matters?: readonly Matter[];
    readonly documents?: readonly Document[];
    readonly tasks?: readonly LawTaskPersistenceModel[];
    readonly timeEntries?: readonly LawTimeEntryPersistenceModel[];
    readonly calendarEvents?: readonly LawCalendarEventPersistenceModel[];
    readonly invoices?: readonly LawInvoicePersistenceModel[];
  },
  connectionString?: string,
): Promise<void> {
  const db = context.db ?? createDb(connectionString);

  for (const client of input.clients ?? []) {
    await db
      .insert(lawClient)
      .values(clientToRow(client, context.tenantId))
      .onConflictDoNothing();
  }

  for (const matter of input.matters ?? []) {
    await db
      .insert(lawMatter)
      .values(matterToRow(matter, context.tenantId))
      .onConflictDoNothing();
  }

  for (const document of input.documents ?? []) {
    await db
      .insert(lawDocument)
      .values(documentToRow(document, context.tenantId))
      .onConflictDoNothing();
  }

  for (const task of input.tasks ?? []) {
    await db
      .insert(lawTask)
      .values(taskToRow(task, context.tenantId))
      .onConflictDoNothing();
  }

  for (const entry of input.timeEntries ?? []) {
    await db
      .insert(lawTimeEntry)
      .values(timeEntryToRow(entry, context.tenantId))
      .onConflictDoNothing();
  }

  for (const event of input.calendarEvents ?? []) {
    await db
      .insert(lawCalendarEvent)
      .values(calendarEventToRow(event, context.tenantId))
      .onConflictDoNothing();
  }

  for (const invoice of input.invoices ?? []) {
    await db
      .insert(lawInvoice)
      .values(invoiceToRow(invoice, context.tenantId))
      .onConflictDoNothing();

    for (const lineItem of invoice.lineItems) {
      await db
        .insert(lawInvoiceLineItem)
        .values(lineItemToRow(lineItem, invoice.invoiceId, context.tenantId))
        .onConflictDoNothing();
    }
  }
}

export async function countClientsForTenant(
  tenantId: string,
  connectionString?: string,
): Promise<number> {
  const db = createDb(connectionString);
  const rows = await db.select().from(lawClient);
  return rows.filter((row) => row.tenantId === tenantId).length;
}
