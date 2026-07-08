import type {
  TrustDraftStatus,
  TrustTransactionDraft,
} from "./trust-transaction-workflow-types";

/** Draft repository contract (LAW-015-03). */
export interface TrustTransactionDraftRepository {
  save(draft: TrustTransactionDraft): TrustTransactionDraft;
  getById(tenantId: string, draftId: string): TrustTransactionDraft | undefined;
  listByAccount(
    tenantId: string,
    trustAccountId: string,
  ): readonly TrustTransactionDraft[];
  listByStatus(
    tenantId: string,
    status: TrustDraftStatus,
  ): readonly TrustTransactionDraft[];
  findByPostedTransactionId(
    tenantId: string,
    postedTrustTransactionId: string,
  ): TrustTransactionDraft | undefined;
}
