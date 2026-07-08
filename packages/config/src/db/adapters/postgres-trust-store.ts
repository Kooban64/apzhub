import { and, eq } from "drizzle-orm";

import { createDb, type DatabaseExecutor } from "../client";
import {
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
} from "../legal-schema";
import {
  rowPayloadToEntity,
  rowToTrustAccount,
  rowToTrustBalance,
  rowToTrustJournalEntry,
  rowToTrustTransaction,
  trustAccountToRow,
  trustBalanceToRow,
  trustJournalEntryToRow,
  trustTransactionToRow,
  type LawTrustAccountPersistenceModel,
  type LawTrustBalancePersistenceModel,
  type LawTrustJournalEntryPersistenceModel,
  type LawTrustTransactionPersistenceModel,
} from "../law-mappers/trust-row-mapper";
import {
  createTrustOutboxDraft,
  type PostgresOutboxEventDraft,
} from "../law-mappers/outbox-drafts";

export interface PostgresTrustStoreOptions {
  readonly tenantId: string;
  readonly db?: DatabaseExecutor;
  readonly runSync: <T>(promise: Promise<T>) => T;
  readonly runInTransaction: <T>(
    operation: (db: DatabaseExecutor) => Promise<T>,
  ) => Promise<T>;
  readonly onOutboxEvent?: (
    db: DatabaseExecutor,
    draft: PostgresOutboxEventDraft,
  ) => Promise<void>;
}

/** PostgreSQL trust accounting store — tenant-scoped (LAW-015-11). */
export class PostgresTrustStore {
  constructor(private readonly options: PostgresTrustStoreOptions) {}

  private get db() {
    return this.options.db ?? createDb();
  }

  // --- Accounts ---

  saveAccount(
    account: LawTrustAccountPersistenceModel,
  ): LawTrustAccountPersistenceModel {
    this.options.runSync(
      this.options.runInTransaction(async (tx) => {
        const existing = await this.getAccountAsyncWithDb(tx, account.trustAccountId);
        await tx
          .insert(lawTrustAccount)
          .values(trustAccountToRow(account, this.options.tenantId))
          .onConflictDoUpdate({
            target: lawTrustAccount.trustAccountId,
            set: {
              name: account.name,
              isActive: account.isActive,
              updatedAt: new Date(),
            },
          });
        await this.options.onOutboxEvent?.(
          tx,
          createTrustOutboxDraft(
            existing ? "legal.trust.account.updated" : "legal.trust.account.created",
            account.trustAccountId,
            {
              trustAccountId: account.trustAccountId,
              trustAccountCode: account.trustAccountCode,
              name: account.name,
              currency: account.currency,
            },
          ),
        );
      }),
    );
    return account;
  }

  getAccount(trustAccountId: string): LawTrustAccountPersistenceModel | undefined {
    return this.options.runSync(this.getAccountAsync(trustAccountId));
  }

  listAccounts(): readonly LawTrustAccountPersistenceModel[] {
    return this.options.runSync(this.listAccountsAsync());
  }

  // --- Journal (append-only) ---

  appendJournalEntry(
    entry: LawTrustJournalEntryPersistenceModel,
  ): LawTrustJournalEntryPersistenceModel {
    this.options.runSync(
      this.db
        .insert(lawTrustJournalEntry)
        .values(trustJournalEntryToRow(entry, this.options.tenantId)),
    );
    return entry;
  }

  getJournalEntries(
    trustAccountId: string,
  ): readonly LawTrustJournalEntryPersistenceModel[] {
    return this.options.runSync(this.getJournalEntriesAsync(trustAccountId));
  }

  // --- Transactions ---

  appendTransaction(
    transaction: LawTrustTransactionPersistenceModel,
  ): LawTrustTransactionPersistenceModel {
    this.options.runSync(
      this.options.runInTransaction(async (tx) => {
        await tx
          .insert(lawTrustTransaction)
          .values(trustTransactionToRow(transaction, this.options.tenantId));
        await this.options.onOutboxEvent?.(
          tx,
          createTrustOutboxDraft(
            "legal.trust.transaction.posted",
            transaction.trustTransactionId,
            {
              trustTransactionId: transaction.trustTransactionId,
              trustAccountId: transaction.trustAccountId,
              trustTransactionType: transaction.trustTransactionType,
              amount: transaction.amount,
              currency: transaction.currency,
              clientId: transaction.clientId,
            },
          ),
        );
      }),
    );
    return transaction;
  }

  getTransaction(
    trustAccountId: string,
    trustTransactionId: string,
  ): LawTrustTransactionPersistenceModel | undefined {
    return this.options.runSync(
      this.getTransactionAsync(trustAccountId, trustTransactionId),
    );
  }

  listTransactions(
    trustAccountId: string,
  ): readonly LawTrustTransactionPersistenceModel[] {
    return this.options.runSync(this.listTransactionsAsync(trustAccountId));
  }

  markTransactionReversed(
    trustAccountId: string,
    trustTransactionId: string,
  ): LawTrustTransactionPersistenceModel | undefined {
    return this.options.runSync(
      this.options.runInTransaction(async (tx) => {
        const existing = await this.getTransactionAsyncWithDb(
          tx,
          trustAccountId,
          trustTransactionId,
        );
        if (!existing) {
          return undefined;
        }
        await tx
          .update(lawTrustTransaction)
          .set({ status: "reversed" })
          .where(
            and(
              eq(lawTrustTransaction.tenantId, this.options.tenantId),
              eq(lawTrustTransaction.trustTransactionId, trustTransactionId),
            ),
          );
        await this.options.onOutboxEvent?.(
          tx,
          createTrustOutboxDraft(
            "legal.trust.transaction.reversed",
            trustTransactionId,
            {
              trustTransactionId,
              trustAccountId,
              reversesTransactionId: existing.reversesTransactionId,
            },
          ),
        );
        return { ...existing, status: "reversed" };
      }),
    );
  }

  // --- Balances ---

  replaceBalances(
    trustAccountId: string,
    balances: readonly LawTrustBalancePersistenceModel[],
  ): void {
    this.options.runSync(this.replaceBalancesAsync(trustAccountId, balances));
  }

  getBalances(trustAccountId: string): readonly LawTrustBalancePersistenceModel[] {
    return this.options.runSync(this.getBalancesAsync(trustAccountId));
  }

  // --- JSON payload entities ---

  savePayloadEntity<T extends Record<string, unknown>>(
    table:
      | "draft"
      | "audit"
      | "allocation"
      | "reconciliation"
      | "interest_rule"
      | "interest_posting"
      | "transfer"
      | "approval_rule"
      | "approval_request"
      | "report",
    idField: string,
    entity: T,
    extras: Record<string, unknown> = {},
  ): T {
    this.options.runSync(this.savePayloadEntityAsync(table, idField, entity, extras));
    return entity;
  }

  getPayloadEntity<T>(
    table:
      | "draft"
      | "audit"
      | "allocation"
      | "reconciliation"
      | "interest_rule"
      | "interest_posting"
      | "transfer"
      | "approval_rule"
      | "approval_request"
      | "report",
    idField: string,
    id: string,
  ): T | undefined {
    return this.options.runSync(this.getPayloadEntityAsync<T>(table, idField, id));
  }

  listPayloadEntities<T>(
    table:
      | "draft"
      | "allocation"
      | "reconciliation"
      | "interest_rule"
      | "interest_posting"
      | "transfer"
      | "approval_rule"
      | "approval_request"
      | "report",
    filter?: (row: Record<string, unknown>) => boolean,
  ): readonly T[] {
    return this.options.runSync(this.listPayloadEntitiesAsync<T>(table, filter));
  }

  appendApprovalHistory<T extends Record<string, unknown>>(
    trustApprovalRequestId: string,
    historyId: string,
    record: T,
  ): T {
    this.options.runSync(
      this.db.insert(lawTrustApprovalHistory).values({
        trustApprovalHistoryId: historyId,
        tenantId: this.options.tenantId,
        trustApprovalRequestId,
        payload: record as Record<string, unknown>,
        occurredAt: new Date(),
      }),
    );
    return record;
  }

  listApprovalHistory<T>(trustApprovalRequestId: string): readonly T[] {
    return this.options.runSync(
      this.listApprovalHistoryAsync<T>(trustApprovalRequestId),
    );
  }

  listAuditRecords<T>(trustAccountId?: string): readonly T[] {
    return this.options.runSync(this.listAuditRecordsAsync<T>(trustAccountId));
  }

  private async getAccountAsync(trustAccountId: string) {
    return this.getAccountAsyncWithDb(this.db, trustAccountId);
  }

  private async getAccountAsyncWithDb(db: DatabaseExecutor, trustAccountId: string) {
    const rows = await db
      .select()
      .from(lawTrustAccount)
      .where(
        and(
          eq(lawTrustAccount.tenantId, this.options.tenantId),
          eq(lawTrustAccount.trustAccountId, trustAccountId),
        ),
      )
      .limit(1);
    return rows[0] ? rowToTrustAccount(rows[0]) : undefined;
  }

  private async listAccountsAsync() {
    const rows = await this.db
      .select()
      .from(lawTrustAccount)
      .where(eq(lawTrustAccount.tenantId, this.options.tenantId));
    return rows.map(rowToTrustAccount);
  }

  private async getJournalEntriesAsync(trustAccountId: string) {
    const rows = await this.db
      .select()
      .from(lawTrustJournalEntry)
      .where(
        and(
          eq(lawTrustJournalEntry.tenantId, this.options.tenantId),
          eq(lawTrustJournalEntry.trustAccountId, trustAccountId),
        ),
      );
    return rows.map(rowToTrustJournalEntry);
  }

  private async getTransactionAsync(
    trustAccountId: string,
    trustTransactionId: string,
  ) {
    return this.getTransactionAsyncWithDb(this.db, trustAccountId, trustTransactionId);
  }

  private async getTransactionAsyncWithDb(
    db: DatabaseExecutor,
    trustAccountId: string,
    trustTransactionId: string,
  ) {
    const rows = await db
      .select()
      .from(lawTrustTransaction)
      .where(
        and(
          eq(lawTrustTransaction.tenantId, this.options.tenantId),
          eq(lawTrustTransaction.trustAccountId, trustAccountId),
          eq(lawTrustTransaction.trustTransactionId, trustTransactionId),
        ),
      )
      .limit(1);
    return rows[0] ? rowToTrustTransaction(rows[0]) : undefined;
  }

  private async listTransactionsAsync(trustAccountId: string) {
    const rows = await this.db
      .select()
      .from(lawTrustTransaction)
      .where(
        and(
          eq(lawTrustTransaction.tenantId, this.options.tenantId),
          eq(lawTrustTransaction.trustAccountId, trustAccountId),
        ),
      );
    return rows.map(rowToTrustTransaction);
  }

  private async replaceBalancesAsync(
    trustAccountId: string,
    balances: readonly LawTrustBalancePersistenceModel[],
  ) {
    await this.db
      .delete(lawTrustBalance)
      .where(
        and(
          eq(lawTrustBalance.tenantId, this.options.tenantId),
          eq(lawTrustBalance.trustAccountId, trustAccountId),
        ),
      );

    for (const balance of balances) {
      const balanceId = `${trustAccountId}:${balance.scope}:${balance.clientId ?? ""}:${balance.matterId ?? ""}`;
      await this.db
        .insert(lawTrustBalance)
        .values(trustBalanceToRow(balance, this.options.tenantId, balanceId));
    }
  }

  private async getBalancesAsync(trustAccountId: string) {
    const rows = await this.db
      .select()
      .from(lawTrustBalance)
      .where(
        and(
          eq(lawTrustBalance.tenantId, this.options.tenantId),
          eq(lawTrustBalance.trustAccountId, trustAccountId),
        ),
      );
    return rows.map(rowToTrustBalance);
  }

  private async savePayloadEntityAsync<T extends Record<string, unknown>>(
    table: string,
    idField: string,
    entity: T,
    extras: Record<string, unknown>,
  ) {
    const payload = entity as Record<string, unknown>;
    const id = String(entity[idField]);

    switch (table) {
      case "draft":
        await this.db
          .insert(lawTrustTransactionDraft)
          .values({
            draftId: id,
            tenantId: this.options.tenantId,
            trustAccountId: String(extras.trustAccountId ?? payload.trustAccountId),
            payload,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: lawTrustTransactionDraft.draftId,
            set: { payload, updatedAt: new Date() },
          });
        break;
      case "audit":
        await this.db.insert(lawTrustTransactionAudit).values({
          auditRecordId: id,
          tenantId: this.options.tenantId,
          trustAccountId: String(extras.trustAccountId ?? payload.trustAccountId),
          payload,
        });
        break;
      case "allocation":
        await this.db.insert(lawTrustAllocation).values({
          trustAllocationId: id,
          tenantId: this.options.tenantId,
          trustAccountId: String(extras.trustAccountId ?? payload.trustAccountId),
          payload,
        });
        break;
      case "reconciliation":
        await this.db.insert(lawTrustReconciliationRun).values({
          trustReconciliationRunId: id,
          tenantId: this.options.tenantId,
          trustAccountId: String(extras.trustAccountId ?? payload.trustAccountId),
          payload,
        });
        break;
      case "interest_rule":
        await this.db.insert(lawTrustInterestRule).values({
          trustInterestRuleId: id,
          tenantId: this.options.tenantId,
          payload,
        });
        break;
      case "interest_posting":
        await this.db
          .insert(lawTrustInterestPosting)
          .values({
            trustInterestPostingId: id,
            tenantId: this.options.tenantId,
            trustAccountId: String(extras.trustAccountId ?? payload.trustAccountId),
            payload,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: lawTrustInterestPosting.trustInterestPostingId,
            set: { payload, updatedAt: new Date() },
          });
        break;
      case "transfer":
        await this.db
          .insert(lawTrustTransfer)
          .values({
            trustTransferId: id,
            tenantId: this.options.tenantId,
            payload,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: lawTrustTransfer.trustTransferId,
            set: { payload, updatedAt: new Date() },
          });
        break;
      case "approval_rule":
        await this.db.insert(lawTrustApprovalRule).values({
          trustApprovalRuleId: id,
          tenantId: this.options.tenantId,
          payload,
        });
        break;
      case "approval_request":
        await this.db
          .insert(lawTrustApprovalRequest)
          .values({
            trustApprovalRequestId: id,
            tenantId: this.options.tenantId,
            trustAccountId: String(extras.trustAccountId ?? payload.trustAccountId),
            approvalType: String(extras.approvalType ?? payload.approvalType),
            subjectId: String(extras.subjectId ?? payload.subjectId),
            status: String(extras.status ?? payload.status),
            payload,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: lawTrustApprovalRequest.trustApprovalRequestId,
            set: {
              status: String(extras.status ?? payload.status),
              payload,
              updatedAt: new Date(),
            },
          });
        break;
      case "report":
        await this.db.insert(lawTrustReport).values({
          trustReportId: id,
          tenantId: this.options.tenantId,
          trustAccountId: extras.trustAccountId ? String(extras.trustAccountId) : null,
          reportType: String(extras.reportType ?? payload.reportType),
          payload,
        });
        break;
      default:
        break;
    }
  }

  private async getPayloadEntityAsync<T>(table: string, idField: string, id: string) {
    let row: { payload: Record<string, unknown> } | undefined;

    switch (table) {
      case "draft": {
        const rows = await this.db
          .select({ payload: lawTrustTransactionDraft.payload })
          .from(lawTrustTransactionDraft)
          .where(
            and(
              eq(lawTrustTransactionDraft.tenantId, this.options.tenantId),
              eq(lawTrustTransactionDraft.draftId, id),
            ),
          )
          .limit(1);
        row = rows[0];
        break;
      }
      case "transfer": {
        const rows = await this.db
          .select({ payload: lawTrustTransfer.payload })
          .from(lawTrustTransfer)
          .where(
            and(
              eq(lawTrustTransfer.tenantId, this.options.tenantId),
              eq(lawTrustTransfer.trustTransferId, id),
            ),
          )
          .limit(1);
        row = rows[0];
        break;
      }
      case "approval_request": {
        const rows = await this.db
          .select({ payload: lawTrustApprovalRequest.payload })
          .from(lawTrustApprovalRequest)
          .where(
            and(
              eq(lawTrustApprovalRequest.tenantId, this.options.tenantId),
              eq(lawTrustApprovalRequest.trustApprovalRequestId, id),
            ),
          )
          .limit(1);
        row = rows[0];
        break;
      }
      case "interest_posting": {
        const rows = await this.db
          .select({ payload: lawTrustInterestPosting.payload })
          .from(lawTrustInterestPosting)
          .where(
            and(
              eq(lawTrustInterestPosting.tenantId, this.options.tenantId),
              eq(lawTrustInterestPosting.trustInterestPostingId, id),
            ),
          )
          .limit(1);
        row = rows[0];
        break;
      }
      case "report": {
        const rows = await this.db
          .select({ payload: lawTrustReport.payload })
          .from(lawTrustReport)
          .where(
            and(
              eq(lawTrustReport.tenantId, this.options.tenantId),
              eq(lawTrustReport.trustReportId, id),
            ),
          )
          .limit(1);
        row = rows[0];
        break;
      }
      default:
        break;
    }

    return row ? rowPayloadToEntity<T>(row.payload) : undefined;
  }

  private async listPayloadEntitiesAsync<T>(
    table: string,
    filter?: (row: Record<string, unknown>) => boolean,
  ) {
    let rows: { payload: Record<string, unknown> }[] = [];

    switch (table) {
      case "draft":
        rows = await this.db
          .select({ payload: lawTrustTransactionDraft.payload })
          .from(lawTrustTransactionDraft)
          .where(eq(lawTrustTransactionDraft.tenantId, this.options.tenantId));
        break;
      case "transfer":
        rows = await this.db
          .select({ payload: lawTrustTransfer.payload })
          .from(lawTrustTransfer)
          .where(eq(lawTrustTransfer.tenantId, this.options.tenantId));
        break;
      case "approval_request":
        rows = await this.db
          .select({ payload: lawTrustApprovalRequest.payload })
          .from(lawTrustApprovalRequest)
          .where(eq(lawTrustApprovalRequest.tenantId, this.options.tenantId));
        break;
      case "interest_posting":
        rows = await this.db
          .select({ payload: lawTrustInterestPosting.payload })
          .from(lawTrustInterestPosting)
          .where(eq(lawTrustInterestPosting.tenantId, this.options.tenantId));
        break;
      case "report":
        rows = await this.db
          .select({ payload: lawTrustReport.payload })
          .from(lawTrustReport)
          .where(eq(lawTrustReport.tenantId, this.options.tenantId));
        break;
      default:
        break;
    }

    const entities = rows.map((row) => rowPayloadToEntity<T>(row.payload));
    if (!filter) {
      return entities;
    }
    return entities.filter((entity) => filter(entity as Record<string, unknown>));
  }

  private async listApprovalHistoryAsync<T>(trustApprovalRequestId: string) {
    const rows = await this.db
      .select({ payload: lawTrustApprovalHistory.payload })
      .from(lawTrustApprovalHistory)
      .where(
        and(
          eq(lawTrustApprovalHistory.tenantId, this.options.tenantId),
          eq(lawTrustApprovalHistory.trustApprovalRequestId, trustApprovalRequestId),
        ),
      );
    return rows.map((row) => rowPayloadToEntity<T>(row.payload));
  }

  private async listAuditRecordsAsync<T>(trustAccountId?: string) {
    const rows = trustAccountId
      ? await this.db
          .select({ payload: lawTrustTransactionAudit.payload })
          .from(lawTrustTransactionAudit)
          .where(
            and(
              eq(lawTrustTransactionAudit.tenantId, this.options.tenantId),
              eq(lawTrustTransactionAudit.trustAccountId, trustAccountId),
            ),
          )
      : await this.db
          .select({ payload: lawTrustTransactionAudit.payload })
          .from(lawTrustTransactionAudit)
          .where(eq(lawTrustTransactionAudit.tenantId, this.options.tenantId));
    return rows.map((row) => rowPayloadToEntity<T>(row.payload));
  }
}
