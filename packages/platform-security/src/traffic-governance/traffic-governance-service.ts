import { RateLimitService } from "../rate-limit-service";
import { resolveTrafficPolicy } from "./policies";
import {
  applyEnvironmentProfileToLimits,
  resolveActiveEnvironmentProfile,
} from "./profiles";
import type {
  TrafficEvaluationResult,
  TrafficGovernanceDecision,
  TrafficGovernanceDiagnostics,
  TrafficGovernanceStatus,
  TrafficPolicyDimension,
  TrafficPolicyMatch,
  TrafficRequestContext,
} from "./types";
import { TRAFFIC_LIMIT_HEADERS } from "./types";

interface BurstBucket {
  count: number;
  resetAt: number;
}

export class TrafficGovernanceService {
  private readonly rateLimit: RateLimitService;
  private readonly burstBuckets = new Map<string, BurstBucket>();

  constructor(limitPerMinute?: number) {
    this.rateLimit = new RateLimitService(limitPerMinute);
  }

  getStatus(): TrafficGovernanceStatus {
    const rateStatus = this.rateLimit.getStatus();
    const profile = resolveActiveEnvironmentProfile();
    return {
      enabled: rateStatus.enabled,
      backend: rateStatus.backend,
      environment: profile,
      profileMultiplier: profile === "development" ? 10 : profile === "test" ? 100 : 1,
      defaultLimitPerMinute: rateStatus.defaultLimitPerMinute,
    };
  }

  resolvePolicy(pathname: string): TrafficPolicyMatch {
    const policy = resolveTrafficPolicy(pathname);
    const profile = resolveActiveEnvironmentProfile();
    const adjusted = applyEnvironmentProfileToLimits(policy.limits, profile);
    return {
      policy,
      source: adjusted.source,
      effectiveLimits: adjusted.limits,
    };
  }

  async evaluate(context: TrafficRequestContext): Promise<TrafficGovernanceDecision> {
    const policyMatch = this.resolvePolicy(context.pathname);
    const results: TrafficEvaluationResult[] = [];

    for (const dimension of policyMatch.policy.dimensions) {
      const limitKey = this.buildLimitKey(dimension, context);
      const limit = policyMatch.effectiveLimits.requestsPerMinute;
      const burstLimit = this.resolveBurstLimit(policyMatch.effectiveLimits);

      const sustained = await this.rateLimit.checkLimit(`${limitKey}:sustained`, limit);
      const burst = await this.checkBurstLimit(
        `${limitKey}:burst`,
        burstLimit,
        policyMatch.effectiveLimits.burstWindowSeconds ?? 10,
      );

      const allowed = sustained.allowed && burst.allowed;
      const result: TrafficEvaluationResult = {
        allowed,
        policy: policyMatch,
        dimension,
        limitKey,
        limit,
        remaining: Math.min(sustained.remaining, burst.remaining),
        resetAt: Math.max(sustained.resetAt, burst.resetAt),
        throttled: !allowed,
        burstApplied: burst.count > 0,
      };
      results.push(result);

      if (!allowed) {
        return this.buildDecision(false, results, result);
      }
    }

    const primary = results[results.length - 1];
    return this.buildDecision(true, results, primary);
  }

  getDiagnostics(
    context?: Partial<TrafficRequestContext>,
  ): TrafficGovernanceDiagnostics {
    const status = this.getStatus();
    const pathname = context?.pathname ?? "/api/platform/v1/system/health";
    const policyMatch = this.resolvePolicy(pathname);
    const recommendations: string[] = [
      "Gateway, Cloudflare, APISIX, WAF, and distributed quota adapters are deferred to future milestones.",
      "Use Redis in production for consistent limits across instances.",
    ];

    if (status.backend === "memory") {
      recommendations.push("Memory backend is active — limits are per-instance only.");
    }

    if (status.environment === "development") {
      recommendations.push("Development profile applies a 10x traffic multiplier.");
    }

    return {
      status,
      activePolicy: {
        id: policyMatch.policy.id,
        service: policyMatch.policy.service,
        source: policyMatch.source,
        effectiveLimits: policyMatch.effectiveLimits,
      },
      rateLimit: {
        backend: status.backend,
        enabled: status.enabled,
        defaultLimitPerMinute: status.defaultLimitPerMinute,
      },
      throttle: {
        active: true,
        burstWindowSeconds: policyMatch.effectiveLimits.burstWindowSeconds ?? 10,
      },
      policySource: policyMatch.source,
      environment: status.environment,
      recommendations,
    };
  }

  private buildDecision(
    allowed: boolean,
    results: TrafficEvaluationResult[],
    primary?: TrafficEvaluationResult,
  ): TrafficGovernanceDecision {
    const blockingResult = results.find((result) => !result.allowed);
    const headers = this.buildHeaders(primary ?? blockingResult ?? results[0]);

    return {
      allowed,
      results,
      blockingResult,
      headers,
    };
  }

  private buildHeaders(result?: TrafficEvaluationResult): Record<string, string> {
    if (!result) {
      return {};
    }

    return {
      [TRAFFIC_LIMIT_HEADERS.limit]: String(result.limit),
      [TRAFFIC_LIMIT_HEADERS.remaining]: String(result.remaining),
      [TRAFFIC_LIMIT_HEADERS.reset]: String(Math.floor(result.resetAt / 1000)),
      [TRAFFIC_LIMIT_HEADERS.policy]: result.policy.policy.id,
      [TRAFFIC_LIMIT_HEADERS.service]: result.policy.policy.service,
    };
  }

  private buildLimitKey(
    dimension: TrafficPolicyDimension,
    context: TrafficRequestContext,
  ): string {
    switch (dimension) {
      case "ip":
        return `ip:${context.ip}`;
      case "endpoint":
        return `endpoint:${context.method}:${context.pathname}`;
      case "user":
        return `user:${context.userId ?? "anonymous"}`;
      case "tenant":
        return `tenant:${context.tenantId ?? "none"}`;
      case "service":
        return `service:${context.service}`;
      default:
        return `unknown:${context.pathname}`;
    }
  }

  private resolveBurstLimit(limits: TrafficPolicyMatch["effectiveLimits"]): number {
    const multiplier = limits.burstMultiplier ?? 1.5;
    const windowSeconds = limits.burstWindowSeconds ?? 10;
    return Math.max(
      1,
      Math.ceil((limits.requestsPerMinute * multiplier * windowSeconds) / 60),
    );
  }

  private async checkBurstLimit(
    key: string,
    limit: number,
    windowSeconds: number,
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number; count: number }> {
    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    const existing = this.burstBuckets.get(key);

    if (!existing || existing.resetAt <= now) {
      const resetAt = now + windowMs;
      this.burstBuckets.set(key, { count: 1, resetAt });
      return { allowed: true, remaining: limit - 1, resetAt, count: 1 };
    }

    if (existing.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: existing.resetAt,
        count: existing.count,
      };
    }

    existing.count += 1;
    this.burstBuckets.set(key, existing);
    return {
      allowed: true,
      remaining: limit - existing.count,
      resetAt: existing.resetAt,
      count: existing.count,
    };
  }
}

let sharedTrafficGovernanceService: TrafficGovernanceService | undefined;

export function getSharedTrafficGovernanceService(): TrafficGovernanceService {
  if (!sharedTrafficGovernanceService) {
    sharedTrafficGovernanceService = new TrafficGovernanceService();
  }
  return sharedTrafficGovernanceService;
}

export function resetSharedTrafficGovernanceService(): void {
  sharedTrafficGovernanceService = undefined;
}

// Re-export header constants for consumers
export { TRAFFIC_LIMIT_HEADERS } from "./types";
