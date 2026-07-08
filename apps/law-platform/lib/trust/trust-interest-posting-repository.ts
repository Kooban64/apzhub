import type {
  TrustInterestPosting,
  TrustInterestPostingHistoryCriteria,
} from "./trust-interest-types";

/** Interest posting repository — draft/approved/posted batches (LAW-015-06). */
export interface TrustInterestPostingRepository {
  save(posting: TrustInterestPosting): TrustInterestPosting;
  getById(
    tenantId: string,
    trustInterestPostingId: string,
  ): TrustInterestPosting | undefined;
  list(criteria: TrustInterestPostingHistoryCriteria): readonly TrustInterestPosting[];
}
