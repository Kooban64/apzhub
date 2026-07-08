import type { TrustInterestRuleRepository } from "./trust-interest-rule-repository";
import type { TrustInterestRule } from "./trust-interest-types";

/** In-memory interest rule store (LAW-015-06). */
export class InMemoryTrustInterestRuleRepository implements TrustInterestRuleRepository {
  private readonly rules = new Map<string, TrustInterestRule>();

  clear(): void {
    this.rules.clear();
  }

  save(rule: TrustInterestRule): TrustInterestRule {
    this.rules.set(this.key(rule.tenantId, rule.trustInterestRuleId), rule);
    return rule;
  }

  getById(
    tenantId: string,
    trustInterestRuleId: string,
  ): TrustInterestRule | undefined {
    return this.rules.get(this.key(tenantId, trustInterestRuleId));
  }

  list(tenantId: string, trustAccountId?: string): readonly TrustInterestRule[] {
    return [...this.rules.values()]
      .filter((rule) => {
        if (rule.tenantId !== tenantId) {
          return false;
        }
        if (
          trustAccountId &&
          rule.trustAccountId &&
          rule.trustAccountId !== trustAccountId
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  findActiveRule(
    tenantId: string,
    trustAccountId: string,
  ): TrustInterestRule | undefined {
    const accountRule = [...this.rules.values()].find(
      (rule) =>
        rule.tenantId === tenantId &&
        rule.trustAccountId === trustAccountId &&
        rule.isActive,
    );
    if (accountRule) {
      return accountRule;
    }

    return [...this.rules.values()].find(
      (rule) => rule.tenantId === tenantId && !rule.trustAccountId && rule.isActive,
    );
  }

  private key(tenantId: string, trustInterestRuleId: string): string {
    return `${tenantId}::${trustInterestRuleId}`;
  }
}
