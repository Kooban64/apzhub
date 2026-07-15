import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import { PlatformServiceError } from "@apzhub/platform-service-contracts";

/** Built-in policy kinds — framework only; production policies are future work. */
export type PolicyKind =
  | "authorization"
  | "validation"
  | "rate_limiting"
  | "feature_flags"
  | "maintenance_mode"
  | "licensing"
  | "custom";

export type PolicyDecisionEffect = "allow" | "deny" | "skip";

export interface PolicyDecision {
  readonly effect: PolicyDecisionEffect;
  readonly policyId: string;
  readonly kind: PolicyKind;
  readonly reason?: string;
}

export interface PolicyExecutionContext {
  readonly context: ServiceRequestContext;
  readonly service: string;
  readonly operation: string;
  readonly args: readonly unknown[];
}

/**
 * Individual policy evaluator.
 * Only the framework is required in OSS-110-04 — no production policies.
 */
export interface Policy {
  readonly id: string;
  readonly kind: PolicyKind;
  /** Lower values run first. */
  readonly priority?: number;
  evaluate(input: PolicyExecutionContext): Promise<PolicyDecision>;
}

export interface PolicyPipelineOptions {
  readonly policies?: readonly Policy[];
}

/**
 * Executes registered policies in priority order.
 * First deny wins; skip continues; all allow/skip → allow.
 */
export class PolicyPipeline {
  private readonly policies: Policy[];

  constructor(options: PolicyPipelineOptions = {}) {
    this.policies = [...(options.policies ?? [])].sort(
      (a, b) => (a.priority ?? 100) - (b.priority ?? 100),
    );
  }

  register(policy: Policy): void {
    this.policies.push(policy);
    this.policies.sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100));
  }

  list(): readonly Policy[] {
    return [...this.policies];
  }

  async evaluate(input: PolicyExecutionContext): Promise<readonly PolicyDecision[]> {
    const decisions: PolicyDecision[] = [];

    for (const policy of this.policies) {
      const decision = await policy.evaluate(input);
      decisions.push(decision);
      if (decision.effect === "deny") {
        break;
      }
    }

    return decisions;
  }

  async assertAllowed(input: PolicyExecutionContext): Promise<readonly PolicyDecision[]> {
    const decisions = await this.evaluate(input);
    const denied = decisions.find((entry) => entry.effect === "deny");
    if (denied) {
      throw new PlatformServiceError({
        category: "authorization",
        code: "POLICY_DENIED",
        message: denied.reason ?? `Policy denied: ${denied.policyId}`,
        correlationId: input.context.correlationId,
        retryable: false,
        details: {
          policyId: denied.policyId,
          policyKind: denied.kind,
          classification: "policy_denied",
        },
      });
    }
    return decisions;
  }
}
