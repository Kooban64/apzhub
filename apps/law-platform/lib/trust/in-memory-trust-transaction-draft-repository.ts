import type { TrustTransactionDraftRepository } from "./trust-transaction-draft-repository";
import type {
  TrustDraftStatus,
  TrustTransactionDraft,
} from "./trust-transaction-workflow-types";

/** In-memory draft store (LAW-015-03). */
export class InMemoryTrustTransactionDraftRepository implements TrustTransactionDraftRepository {
  private readonly drafts = new Map<string, TrustTransactionDraft>();

  clear(): void {
    this.drafts.clear();
  }

  save(draft: TrustTransactionDraft): TrustTransactionDraft {
    this.drafts.set(this.key(draft.tenantId, draft.draftId), draft);
    return draft;
  }

  getById(tenantId: string, draftId: string): TrustTransactionDraft | undefined {
    return this.drafts.get(this.key(tenantId, draftId));
  }

  listByAccount(
    tenantId: string,
    trustAccountId: string,
  ): readonly TrustTransactionDraft[] {
    return [...this.drafts.values()].filter(
      (draft) => draft.tenantId === tenantId && draft.trustAccountId === trustAccountId,
    );
  }

  listByStatus(
    tenantId: string,
    status: TrustDraftStatus,
  ): readonly TrustTransactionDraft[] {
    return [...this.drafts.values()].filter(
      (draft) => draft.tenantId === tenantId && draft.status === status,
    );
  }

  findByPostedTransactionId(
    tenantId: string,
    postedTrustTransactionId: string,
  ): TrustTransactionDraft | undefined {
    return [...this.drafts.values()].find(
      (draft) =>
        draft.tenantId === tenantId &&
        draft.postedTrustTransactionId === postedTrustTransactionId,
    );
  }

  private key(tenantId: string, draftId: string): string {
    return `${tenantId}::${draftId}`;
  }
}
