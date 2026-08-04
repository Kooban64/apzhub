/**
 * Immutable Decision Profile registry (QO-009).
 */

import { OrchestrationError } from "../contracts/errors";
import type { RiskLevel } from "../contracts/impact-correlation";
import type {
  DecisionProfile,
  DecisionProfileInput,
  DecisionThresholds,
} from "../contracts/decision";

const RISK_ORDER: readonly RiskLevel[] = ["low", "medium", "high", "critical"];

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object") {
    Object.freeze(value);
    for (const child of Object.values(value as object)) {
      deepFreeze(child);
    }
  }
  return value;
}

function assertThresholds(thresholds: DecisionThresholds): void {
  if (
    Number.isNaN(thresholds.minOverallConfidence) ||
    thresholds.minOverallConfidence < 0 ||
    thresholds.minOverallConfidence > 1
  ) {
    throw new OrchestrationError(
      "validation",
      "INVALID_DECISION_THRESHOLDS",
      "minOverallConfidence must be between 0 and 1",
    );
  }
  if (!RISK_ORDER.includes(thresholds.maxResidualRisk)) {
    throw new OrchestrationError(
      "validation",
      "INVALID_DECISION_THRESHOLDS",
      "maxResidualRisk must be a known RiskLevel",
    );
  }
}

export function riskRank(level: RiskLevel): number {
  return RISK_ORDER.indexOf(level);
}

export function maxRiskLevel(a: RiskLevel, b: RiskLevel): RiskLevel {
  return riskRank(a) >= riskRank(b) ? a : b;
}

export class DecisionProfileRegistry {
  private readonly profiles = new Map<string, DecisionProfile>();

  private key(profileId: string, version: string): string {
    return `${profileId}@${version}`;
  }

  register(input: DecisionProfileInput): DecisionProfile {
    const profileId = input.profileId.trim();
    const version = input.version.trim();
    const name = input.name.trim();
    const documentationRef = input.documentationRef.trim();
    if (!profileId || !version || !name || !documentationRef) {
      throw new OrchestrationError(
        "validation",
        "INVALID_DECISION_PROFILE",
        "profileId, version, name, and documentationRef are required",
      );
    }
    assertThresholds(input.thresholds);
    const key = this.key(profileId, version);
    if (this.profiles.has(key)) {
      throw new OrchestrationError(
        "validation",
        "DECISION_PROFILE_EXISTS",
        `Decision profile already registered: ${key}`,
        { profileId, version },
      );
    }
    const profile: DecisionProfile = deepFreeze({
      profileId,
      name,
      version,
      description: (input.description ?? "").trim(),
      thresholds: { ...input.thresholds },
      lifecycleState: input.lifecycleState ?? "active",
      documentationRef,
      metadata: Object.freeze({ ...(input.metadata ?? {}) }),
      createdAt: new Date().toISOString(),
    });
    this.profiles.set(key, profile);
    return profile;
  }

  get(profileId: string, version?: string): DecisionProfile {
    const id = profileId.trim();
    if (version) {
      const found = this.profiles.get(this.key(id, version.trim()));
      if (!found) {
        throw new OrchestrationError(
          "validation",
          "DECISION_PROFILE_NOT_FOUND",
          `Decision profile not found: ${id}@${version}`,
          { profileId: id, version },
        );
      }
      return found;
    }
    const matches = [...this.profiles.values()]
      .filter((p) => p.profileId === id)
      .sort((a, b) => b.version.localeCompare(a.version));
    if (!matches.length) {
      throw new OrchestrationError(
        "validation",
        "DECISION_PROFILE_NOT_FOUND",
        `Decision profile not found: ${id}`,
        { profileId: id },
      );
    }
    return matches[0]!;
  }

  list(): readonly DecisionProfile[] {
    return [...this.profiles.values()];
  }

  count(): number {
    return this.profiles.size;
  }

  /** Register immutable built-in profiles (idempotent per version). */
  registerBuiltIns(): void {
    const defs: DecisionProfileInput[] = [
      {
        profileId: "developer_commit",
        name: "Developer Commit",
        version: "1.0.0",
        description: "Local/developer commit thresholds",
        documentationRef: "docs://decision-profiles/developer_commit",
        thresholds: {
          minOverallConfidence: 0.3,
          maxResidualRisk: "high",
          requireGovernanceSatisfied: false,
          requireApprovalComplete: false,
          deferWhenApprovalsOutstanding: false,
          allowConditionalGo: true,
        },
      },
      {
        profileId: "pull_request",
        name: "Pull Request",
        version: "1.0.0",
        description: "PR quality decision thresholds",
        documentationRef: "docs://decision-profiles/pull_request",
        thresholds: {
          minOverallConfidence: 0.5,
          maxResidualRisk: "medium",
          requireGovernanceSatisfied: true,
          requireApprovalComplete: false,
          deferWhenApprovalsOutstanding: true,
          allowConditionalGo: true,
        },
      },
      {
        profileId: "nightly",
        name: "Nightly",
        version: "1.0.0",
        description: "Nightly regression decision thresholds",
        documentationRef: "docs://decision-profiles/nightly",
        thresholds: {
          minOverallConfidence: 0.6,
          maxResidualRisk: "medium",
          requireGovernanceSatisfied: true,
          requireApprovalComplete: false,
          deferWhenApprovalsOutstanding: true,
          allowConditionalGo: true,
        },
      },
      {
        profileId: "regression",
        name: "Regression",
        version: "1.0.0",
        description: "Focused regression decision thresholds",
        documentationRef: "docs://decision-profiles/regression",
        thresholds: {
          minOverallConfidence: 0.65,
          maxResidualRisk: "medium",
          requireGovernanceSatisfied: true,
          requireApprovalComplete: false,
          deferWhenApprovalsOutstanding: false,
          allowConditionalGo: true,
        },
      },
      {
        profileId: "release_candidate",
        name: "Release Candidate",
        version: "1.0.0",
        description: "Release candidate decision thresholds",
        documentationRef: "docs://decision-profiles/release_candidate",
        thresholds: {
          minOverallConfidence: 0.75,
          maxResidualRisk: "low",
          requireGovernanceSatisfied: true,
          requireApprovalComplete: true,
          deferWhenApprovalsOutstanding: true,
          allowConditionalGo: true,
        },
      },
      {
        profileId: "production_release",
        name: "Production Release",
        version: "1.0.0",
        description: "Production release decision thresholds",
        documentationRef: "docs://decision-profiles/production_release",
        thresholds: {
          minOverallConfidence: 0.85,
          maxResidualRisk: "low",
          requireGovernanceSatisfied: true,
          requireApprovalComplete: true,
          deferWhenApprovalsOutstanding: false,
          allowConditionalGo: false,
        },
      },
      {
        profileId: "emergency_fix",
        name: "Emergency Fix",
        version: "1.0.0",
        description: "Emergency fix decision thresholds",
        documentationRef: "docs://decision-profiles/emergency_fix",
        thresholds: {
          minOverallConfidence: 0.4,
          maxResidualRisk: "high",
          requireGovernanceSatisfied: true,
          requireApprovalComplete: true,
          deferWhenApprovalsOutstanding: false,
          allowConditionalGo: true,
        },
      },
      {
        profileId: "compliance_audit",
        name: "Compliance Audit",
        version: "1.0.0",
        description: "Compliance audit decision thresholds",
        documentationRef: "docs://decision-profiles/compliance_audit",
        thresholds: {
          minOverallConfidence: 0.9,
          maxResidualRisk: "low",
          requireGovernanceSatisfied: true,
          requireApprovalComplete: true,
          deferWhenApprovalsOutstanding: false,
          allowConditionalGo: false,
        },
      },
      {
        profileId: "custom",
        name: "Custom",
        version: "1.0.0",
        description: "Custom baseline decision thresholds",
        documentationRef: "docs://decision-profiles/custom",
        thresholds: {
          minOverallConfidence: 0.5,
          maxResidualRisk: "medium",
          requireGovernanceSatisfied: true,
          requireApprovalComplete: false,
          deferWhenApprovalsOutstanding: true,
          allowConditionalGo: true,
        },
      },
    ];

    for (const def of defs) {
      const key = this.key(def.profileId, def.version);
      if (!this.profiles.has(key)) {
        this.register(def);
      }
    }
  }
}
