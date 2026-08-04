/**
 * Immutable policy / independent rule / profile registries (QO-006).
 */

import { OrchestrationError } from "../contracts/errors";
import {
  POLICY_PROFILE_IDS,
  QUALITY_ACTIVITY_KINDS,
  type PolicyProfile,
  type PolicyProfileInput,
  type QualityPolicy,
  type QualityPolicyInput,
  type QualityRule,
  type QualityRuleInput,
  type RuleCondition,
} from "../contracts/policy-selection";

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object") {
    Object.freeze(value);
    for (const child of Object.values(value as object)) {
      deepFreeze(child);
    }
  }
  return value;
}

function assertCondition(condition: RuleCondition, path = "condition"): void {
  switch (condition.type) {
    case "always":
    case "risk_at_least":
    case "confidence_below":
    case "confidence_at_least":
    case "impact_includes_asset_type":
    case "impact_node_count_at_least":
    case "magnitude_at_least":
    case "profile_is":
      return;
    case "and":
    case "or":
      if (!condition.conditions?.length) {
        throw new OrchestrationError(
          "validation",
          "INVALID_RULE_CONDITION",
          `${path} requires nested conditions`,
        );
      }
      for (let i = 0; i < condition.conditions.length; i++) {
        assertCondition(condition.conditions[i]!, `${path}[${i}]`);
      }
      return;
    default: {
      const _exhaustive: never = condition;
      throw new OrchestrationError(
        "validation",
        "INVALID_RULE_CONDITION",
        `Unknown condition type at ${path}`,
        { condition: _exhaustive },
      );
    }
  }
}

export class QualityPolicyRegistry {
  private readonly policies = new Map<string, QualityPolicy>();

  register(input: QualityPolicyInput): QualityPolicy {
    const policyId = input.policyId.trim();
    const version = input.version.trim();
    const key = `${policyId}@${version}`;
    if (!policyId || !version || !input.name.trim() || !input.owner.trim()) {
      throw new OrchestrationError(
        "validation",
        "INVALID_POLICY",
        "policyId, version, name, and owner are required",
      );
    }
    if (this.policies.has(key)) {
      throw new OrchestrationError(
        "validation",
        "POLICY_EXISTS",
        `Policy already registered: ${key}`,
        { policyId, version },
      );
    }
    const policy: QualityPolicy = Object.freeze({
      policyId,
      name: input.name.trim(),
      version,
      description: (input.description ?? "").trim(),
      owner: input.owner.trim(),
      scope: input.scope.trim(),
      lifecycleState: input.lifecycleState ?? "active",
      documentationRef: input.documentationRef.trim(),
      ruleIds: Object.freeze([...input.ruleIds]),
      metadata: Object.freeze({ ...(input.metadata ?? {}) }),
      createdAt: new Date().toISOString(),
    });
    this.policies.set(key, policy);
    return policy;
  }

  get(policyId: string, version?: string): QualityPolicy {
    if (version) {
      const p = this.policies.get(`${policyId.trim()}@${version.trim()}`);
      if (!p) {
        throw new OrchestrationError(
          "validation",
          "POLICY_MISSING",
          `Policy not found: ${policyId}@${version}`,
          { policyId, version },
        );
      }
      return p;
    }
    const versions = this.listVersions(policyId);
    if (versions.length === 0) {
      throw new OrchestrationError(
        "validation",
        "POLICY_MISSING",
        `Policy not found: ${policyId}`,
        { policyId },
      );
    }
    return versions[versions.length - 1]!;
  }

  listVersions(policyId: string): readonly QualityPolicy[] {
    const id = policyId.trim();
    return [...this.policies.values()]
      .filter((p) => p.policyId === id)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  list(): readonly QualityPolicy[] {
    return [...this.policies.values()].sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt),
    );
  }

  count(): number {
    return this.policies.size;
  }
}

export class QualityRuleRegistry {
  private readonly rules = new Map<string, QualityRule>();

  register(input: QualityRuleInput): QualityRule {
    const ruleId = input.ruleId.trim();
    if (!ruleId || !input.name.trim() || !input.explanation.trim()) {
      throw new OrchestrationError(
        "validation",
        "INVALID_RULE",
        "ruleId, name, and explanation are required",
      );
    }
    if (this.rules.has(ruleId)) {
      throw new OrchestrationError(
        "validation",
        "RULE_EXISTS",
        `Rule already registered: ${ruleId}`,
        { ruleId },
      );
    }
    if (!(QUALITY_ACTIVITY_KINDS as readonly string[]).includes(input.activityKind)) {
      throw new OrchestrationError(
        "validation",
        "INVALID_ACTIVITY_KIND",
        `Unsupported activity kind: ${input.activityKind}`,
        { activityKind: input.activityKind },
      );
    }
    assertCondition(input.condition);

    const rule: QualityRule = Object.freeze({
      ruleId,
      name: input.name.trim(),
      version: input.version.trim(),
      description: (input.description ?? "").trim(),
      condition: deepFreeze(input.condition),
      severity: input.severity,
      activityKind: input.activityKind,
      activityClassification: input.activityClassification,
      expectedConfidenceContribution: clamp01(
        input.expectedConfidenceContribution ?? 0.15,
      ),
      estimatedDurationMinutes: Math.max(0, input.estimatedDurationMinutes ?? 15),
      explanation: input.explanation.trim(),
      metadata: Object.freeze({ ...(input.metadata ?? {}) }),
      createdAt: new Date().toISOString(),
    });
    this.rules.set(ruleId, rule);
    return rule;
  }

  get(ruleId: string): QualityRule {
    const rule = this.rules.get(ruleId.trim());
    if (!rule) {
      throw new OrchestrationError(
        "validation",
        "RULE_MISSING",
        `Rule not found: ${ruleId}`,
        { ruleId },
      );
    }
    return rule;
  }

  tryGet(ruleId: string): QualityRule | undefined {
    return this.rules.get(ruleId.trim());
  }

  list(): readonly QualityRule[] {
    return [...this.rules.values()].sort((a, b) => a.ruleId.localeCompare(b.ruleId));
  }

  count(): number {
    return this.rules.size;
  }
}

export class PolicyProfileRegistry {
  private readonly profiles = new Map<string, PolicyProfile>();

  register(input: PolicyProfileInput): PolicyProfile {
    if (!(POLICY_PROFILE_IDS as readonly string[]).includes(input.profileId)) {
      throw new OrchestrationError(
        "validation",
        "INVALID_PROFILE",
        `Unsupported profile id: ${input.profileId}`,
        { profileId: input.profileId },
      );
    }
    if (this.profiles.has(input.profileId)) {
      throw new OrchestrationError(
        "validation",
        "PROFILE_EXISTS",
        `Profile already registered: ${input.profileId}`,
        { profileId: input.profileId },
      );
    }
    const profile: PolicyProfile = Object.freeze({
      profileId: input.profileId,
      name: input.name.trim(),
      description: (input.description ?? "").trim(),
      policyIds: Object.freeze([...input.policyIds]),
      confidenceTarget: clamp01(input.confidenceTarget),
      requiresHumanApproval: Boolean(input.requiresHumanApproval),
      documentationRef: input.documentationRef.trim(),
      metadata: Object.freeze({ ...(input.metadata ?? {}) }),
      createdAt: new Date().toISOString(),
    });
    this.profiles.set(input.profileId, profile);
    return profile;
  }

  get(profileId: string): PolicyProfile {
    const profile = this.profiles.get(profileId);
    if (!profile) {
      throw new OrchestrationError(
        "validation",
        "PROFILE_MISSING",
        `Profile not found: ${profileId}`,
        { profileId },
      );
    }
    return profile;
  }

  list(): readonly PolicyProfile[] {
    return [...this.profiles.values()].sort((a, b) =>
      a.profileId.localeCompare(b.profileId),
    );
  }

  count(): number {
    return this.profiles.size;
  }
}
