import type { TrustInterestPostingRepository } from "./trust-interest-posting-repository";
import type {
  TrustInterestPosting,
  TrustInterestPostingHistoryCriteria,
} from "./trust-interest-types";

/** In-memory interest posting store (LAW-015-06). */
export class InMemoryTrustInterestPostingRepository implements TrustInterestPostingRepository {
  private readonly postings = new Map<string, TrustInterestPosting>();

  clear(): void {
    this.postings.clear();
  }

  save(posting: TrustInterestPosting): TrustInterestPosting {
    const frozen = Object.freeze(structuredClone(posting));
    this.postings.set(
      this.key(posting.tenantId, posting.trustInterestPostingId),
      frozen,
    );
    return frozen;
  }

  getById(
    tenantId: string,
    trustInterestPostingId: string,
  ): TrustInterestPosting | undefined {
    return this.postings.get(this.key(tenantId, trustInterestPostingId));
  }

  list(criteria: TrustInterestPostingHistoryCriteria): readonly TrustInterestPosting[] {
    return [...this.postings.values()]
      .filter((posting) => {
        if (posting.tenantId !== criteria.tenantId) {
          return false;
        }
        if (
          criteria.trustAccountId &&
          posting.trustAccountId !== criteria.trustAccountId
        ) {
          return false;
        }
        if (criteria.status && posting.status !== criteria.status) {
          return false;
        }
        return true;
      })
      .sort((a, b) => a.draftCreatedAt.localeCompare(b.draftCreatedAt));
  }

  private key(tenantId: string, trustInterestPostingId: string): string {
    return `${tenantId}::${trustInterestPostingId}`;
  }
}
