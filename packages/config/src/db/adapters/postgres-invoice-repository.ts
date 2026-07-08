import type { InvoiceLineItem } from "@apzhub/legal-business-core";
import { and, eq, isNull } from "drizzle-orm";

import { createDb, type DatabaseExecutor } from "../client";
import {
  lawClient,
  lawInvoice,
  lawInvoiceLineItem,
  lawMatter,
  lawTimeEntry,
} from "../legal-schema";
import {
  createInvoiceOutboxDraft,
  type PostgresOutboxEventDraft,
} from "../law-mappers/outbox-drafts";
import {
  invoiceToRow,
  lineItemToRow,
  rowToInvoice,
  rowToLineItem,
  type LawInvoicePersistenceModel,
} from "../law-mappers/invoice-row-mapper";

export interface PostgresInvoiceListCriteria {
  readonly query?: string;
  readonly clientId?: string;
  readonly matterId?: string;
  readonly invoiceStatus?: LawInvoicePersistenceModel["invoiceStatus"] | "all";
}

export interface PostgresInvoiceRepositoryContract {
  list(criteria?: PostgresInvoiceListCriteria): readonly LawInvoicePersistenceModel[];
  getById(invoiceId: string): LawInvoicePersistenceModel | undefined;
  create(invoice: LawInvoicePersistenceModel): LawInvoicePersistenceModel;
  update(
    invoiceId: string,
    invoice: LawInvoicePersistenceModel,
  ): LawInvoicePersistenceModel | undefined;
  count(): number;
}

export interface PostgresInvoiceRepositoryOptions {
  readonly tenantId: string;
  readonly db?: DatabaseExecutor;
  readonly runSync: <T>(promise: Promise<T>) => T;
  readonly runInTransaction: <T>(
    operation: (db: DatabaseExecutor) => Promise<T>,
  ) => Promise<T>;
  readonly matchesCriteria: (
    invoice: LawInvoicePersistenceModel,
    criteria?: PostgresInvoiceListCriteria,
  ) => boolean;
  readonly sortInvoices: (
    invoices: readonly LawInvoicePersistenceModel[],
  ) => LawInvoicePersistenceModel[];
  readonly onOutboxEvent?: (
    db: DatabaseExecutor,
    draft: PostgresOutboxEventDraft,
  ) => Promise<void>;
}

/** PostgreSQL-backed invoice repository with tenant isolation (LAW-012-06). */
export class PostgresInvoiceRepository implements PostgresInvoiceRepositoryContract {
  constructor(private readonly options: PostgresInvoiceRepositoryOptions) {}

  private get db() {
    return this.options.db ?? createDb();
  }

  list(criteria?: PostgresInvoiceListCriteria): readonly LawInvoicePersistenceModel[] {
    return this.options.runSync(this.listAsync(criteria));
  }

  getById(invoiceId: string): LawInvoicePersistenceModel | undefined {
    return this.options.runSync(this.getByIdAsync(invoiceId));
  }

  create(invoice: LawInvoicePersistenceModel): LawInvoicePersistenceModel {
    this.options.runSync(
      this.options.runInTransaction(async (tx) => {
        await this.assertInvoiceRelationships(tx, invoice);
        await tx
          .insert(lawInvoice)
          .values(invoiceToRow(invoice, this.options.tenantId));
        await this.insertLineItems(tx, invoice.invoiceId, invoice.lineItems);
        await this.options.onOutboxEvent?.(
          tx,
          createInvoiceOutboxDraft("legal.invoice.created", invoice),
        );
      }),
    );
    return invoice;
  }

  update(
    invoiceId: string,
    invoice: LawInvoicePersistenceModel,
  ): LawInvoicePersistenceModel | undefined {
    return this.options.runSync(this.updateAsync(invoiceId, invoice));
  }

  count(): number {
    return this.options.runSync(this.countAsync());
  }

  private async assertClientExists(
    db: DatabaseExecutor,
    clientId: string,
  ): Promise<void> {
    const rows = await db
      .select({ clientId: lawClient.clientId })
      .from(lawClient)
      .where(
        and(
          eq(lawClient.tenantId, this.options.tenantId),
          eq(lawClient.clientId, clientId),
          isNull(lawClient.deletedAt),
        ),
      )
      .limit(1);

    if (!rows[0]) {
      throw new Error(`Client not found for tenant: ${clientId}`);
    }
  }

  private async assertMatterExists(
    db: DatabaseExecutor,
    matterId: string,
  ): Promise<void> {
    const rows = await db
      .select({ matterId: lawMatter.matterId })
      .from(lawMatter)
      .where(
        and(
          eq(lawMatter.tenantId, this.options.tenantId),
          eq(lawMatter.matterId, matterId),
          isNull(lawMatter.archivedAt),
        ),
      )
      .limit(1);

    if (!rows[0]) {
      throw new Error(`Matter not found for tenant: ${matterId}`);
    }
  }

  private async assertTimeEntryLink(
    db: DatabaseExecutor,
    matterId: string,
    timeEntryId: string,
  ): Promise<void> {
    const rows = await db
      .select({ matterId: lawTimeEntry.matterId })
      .from(lawTimeEntry)
      .where(
        and(
          eq(lawTimeEntry.tenantId, this.options.tenantId),
          eq(lawTimeEntry.timeEntryId, timeEntryId),
          isNull(lawTimeEntry.deletedAt),
        ),
      )
      .limit(1);

    if (!rows[0]) {
      throw new Error(`Time entry not found for tenant: ${timeEntryId}`);
    }

    if (rows[0].matterId !== matterId) {
      throw new Error(
        `Time entry ${timeEntryId} does not belong to matter ${matterId}`,
      );
    }
  }

  private async assertInvoiceRelationships(
    db: DatabaseExecutor,
    invoice: LawInvoicePersistenceModel,
  ): Promise<void> {
    await this.assertClientExists(db, invoice.clientId);

    const matterId = invoice.matterId?.trim();
    if (!matterId) {
      throw new Error("Matter is required for invoice persistence.");
    }

    await this.assertMatterExists(db, matterId);

    for (const lineItem of invoice.lineItems) {
      if (lineItem.matterId !== matterId) {
        throw new Error(
          `Line item ${lineItem.lineItemId} does not belong to invoice matter ${matterId}`,
        );
      }

      if (lineItem.timeEntryId) {
        await this.assertTimeEntryLink(db, matterId, lineItem.timeEntryId);
      }
    }
  }

  private async insertLineItems(
    db: DatabaseExecutor,
    invoiceId: string,
    lineItems: readonly InvoiceLineItem[],
  ): Promise<void> {
    for (const lineItem of lineItems) {
      await db
        .insert(lawInvoiceLineItem)
        .values(lineItemToRow(lineItem, invoiceId, this.options.tenantId));
    }
  }

  private async loadLineItemsForInvoice(
    invoiceId: string,
  ): Promise<readonly InvoiceLineItem[]> {
    const rows = await this.db
      .select()
      .from(lawInvoiceLineItem)
      .where(
        and(
          eq(lawInvoiceLineItem.tenantId, this.options.tenantId),
          eq(lawInvoiceLineItem.invoiceId, invoiceId),
        ),
      );

    return rows.map(rowToLineItem);
  }

  private async loadInvoicesWithLineItems(
    invoiceRows: readonly (typeof lawInvoice.$inferSelect)[],
  ): Promise<LawInvoicePersistenceModel[]> {
    if (invoiceRows.length === 0) {
      return [];
    }

    const lineItemRows = await this.db
      .select()
      .from(lawInvoiceLineItem)
      .where(eq(lawInvoiceLineItem.tenantId, this.options.tenantId));

    const lineItemsByInvoice = new Map<string, InvoiceLineItem[]>();
    for (const row of lineItemRows) {
      const items = lineItemsByInvoice.get(row.invoiceId) ?? [];
      items.push(rowToLineItem(row));
      lineItemsByInvoice.set(row.invoiceId, items);
    }

    return invoiceRows.map((row) =>
      rowToInvoice(row, lineItemsByInvoice.get(row.invoiceId) ?? []),
    );
  }

  private resolveUpdateOutboxEvent(
    previousStatus: string,
    nextStatus: string,
  ): "legal.invoice.updated" | "legal.invoice.cancelled" | "legal.invoice.paid" {
    if (nextStatus === "void" && previousStatus !== "void") {
      return "legal.invoice.cancelled";
    }

    if (nextStatus === "paid" && previousStatus !== "paid") {
      return "legal.invoice.paid";
    }

    return "legal.invoice.updated";
  }

  private async listAsync(
    criteria?: PostgresInvoiceListCriteria,
  ): Promise<readonly LawInvoicePersistenceModel[]> {
    const rows = await this.db
      .select()
      .from(lawInvoice)
      .where(eq(lawInvoice.tenantId, this.options.tenantId));

    const invoices = await this.loadInvoicesWithLineItems(rows);
    return this.options.sortInvoices(
      invoices.filter((invoice) => this.options.matchesCriteria(invoice, criteria)),
    );
  }

  private async getByIdAsync(
    invoiceId: string,
  ): Promise<LawInvoicePersistenceModel | undefined> {
    const rows = await this.db
      .select()
      .from(lawInvoice)
      .where(
        and(
          eq(lawInvoice.tenantId, this.options.tenantId),
          eq(lawInvoice.invoiceId, invoiceId),
        ),
      )
      .limit(1);

    const row = rows[0];
    if (!row) {
      return undefined;
    }

    const lineItems = await this.loadLineItemsForInvoice(invoiceId);
    return rowToInvoice(row, lineItems);
  }

  private async updateAsync(
    invoiceId: string,
    invoice: LawInvoicePersistenceModel,
  ): Promise<LawInvoicePersistenceModel | undefined> {
    return this.options.runInTransaction(async (tx) => {
      await this.assertInvoiceRelationships(tx, invoice);

      const rows = await tx
        .select()
        .from(lawInvoice)
        .where(
          and(
            eq(lawInvoice.tenantId, this.options.tenantId),
            eq(lawInvoice.invoiceId, invoiceId),
          ),
        )
        .limit(1);

      const existing = rows[0];
      if (!existing) {
        return undefined;
      }

      const nextVersion = (existing.version ?? 1) + 1;
      const result = await tx
        .update(lawInvoice)
        .set({
          ...invoiceToRow(invoice, this.options.tenantId),
          version: nextVersion,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(lawInvoice.tenantId, this.options.tenantId),
            eq(lawInvoice.invoiceId, invoiceId),
          ),
        )
        .returning();

      await tx
        .delete(lawInvoiceLineItem)
        .where(
          and(
            eq(lawInvoiceLineItem.tenantId, this.options.tenantId),
            eq(lawInvoiceLineItem.invoiceId, invoiceId),
          ),
        );

      await this.insertLineItems(tx, invoiceId, invoice.lineItems);

      const updatedRow = result[0];
      if (!updatedRow) {
        return undefined;
      }

      const updated = rowToInvoice(updatedRow, invoice.lineItems);
      const eventType = this.resolveUpdateOutboxEvent(
        existing.invoiceStatus,
        updated.invoiceStatus,
      );
      await this.options.onOutboxEvent?.(
        tx,
        createInvoiceOutboxDraft(eventType, updated),
      );

      return updated;
    });
  }

  private async countAsync(): Promise<number> {
    const rows = await this.db
      .select()
      .from(lawInvoice)
      .where(eq(lawInvoice.tenantId, this.options.tenantId));

    return rows.length;
  }
}
