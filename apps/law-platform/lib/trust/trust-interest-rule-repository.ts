import type {
  CreateTrustInterestRuleInput,
  TrustInterestRule,
} from "./trust-interest-types";

/** Interest rule repository — versioned policy store (LAW-015-06). */
export interface TrustInterestRuleRepository {
  save(rule: TrustInterestRule): TrustInterestRule;
  getById(tenantId: string, trustInterestRuleId: string): TrustInterestRule | undefined;
  list(tenantId: string, trustAccountId?: string): readonly TrustInterestRule[];
  findActiveRule(
    tenantId: string,
    trustAccountId: string,
  ): TrustInterestRule | undefined;
}

export type { CreateTrustInterestRuleInput };
