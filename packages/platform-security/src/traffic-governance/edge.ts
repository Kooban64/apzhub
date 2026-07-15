import { resolveTrafficPolicy } from "./policies";
import { applyEnvironmentProfileToLimits, resolveActiveEnvironmentProfile } from "./profiles";
import type {
  TrafficGovernanceDecision,
  TrafficPolicyDimension,
  TrafficRequestContext,
} from "./types";
import { TRAFFIC_LIMIT_HEADERS } from "./types";

interface EdgeBucket {
  count: number;
  resetAt: number;
}

const sustainedBuckets = new Map<string, EdgeBucket>();
const burstBuckets = new Map<string, EdgeBucket>();

export { shouldApplyTrafficGovernance, shouldApplyLawTrafficGovernance } from "./paths";

export async function evaluateEdgeTraffic(
  context: TrafficRequestContext,
): Promise<TrafficGovernanceDecision> {
  const policy = resolveTrafficPolicy(context.pathname);
  const profile = resolveActiveEnvironmentProfile();
  const { limits: effectiveLimits } = applyEnvironmentProfileToLimits(policy.limits, profile);
  const policyMatch = { policy, source: "registry" as const, effectiveLimits };
  const results = [];

  for (const dimension of policy.dimensions) {
    const limitKey = buildLimitKey(dimension, context);
    const limit = effectiveLimits.requestsPerMinute;
    const sustained = checkMemoryBucket(sustainedBuckets, `${limitKey}:sustained`, limit, 60_000);
    const burstLimit = resolveBurstLimit(effectiveLimits);
    const burst = checkMemoryBucket(
      burstBuckets,
      `${limitKey}:burst`,
      burstLimit,
      (effectiveLimits.burstWindowSeconds ?? 10) * 1000,
    );

    const allowed = sustained.allowed && burst.allowed;
    const result = {
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
      return buildDecision(false, results, result);
    }
  }

  return buildDecision(true, results, results[results.length - 1]!);
}

function buildLimitKey(dimension: TrafficPolicyDimension, context: TrafficRequestContext): string {
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

function resolveBurstLimit(limits: { requestsPerMinute: number; burstMultiplier?: number; burstWindowSeconds?: number }) {
  const multiplier = limits.burstMultiplier ?? 1.5;
  const windowSeconds = limits.burstWindowSeconds ?? 10;
  return Math.max(1, Math.ceil((limits.requestsPerMinute * multiplier * windowSeconds) / 60));
}

function checkMemoryBucket(
  store: Map<string, EdgeBucket>,
  key: string,
  limit: number,
  windowMs: number,
) {
  const now = Date.now();
  const existing = store.get(key);
  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt, count: 1 };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt, count: existing.count };
  }

  existing.count += 1;
  store.set(key, existing);
  return {
    allowed: true,
    remaining: limit - existing.count,
    resetAt: existing.resetAt,
    count: existing.count,
  };
}

function buildDecision(
  allowed: boolean,
  results: TrafficGovernanceDecision["results"],
  primary: TrafficGovernanceDecision["results"][number],
): TrafficGovernanceDecision {
  const blockingResult = results.find((result) => !result.allowed);
  return {
    allowed,
    results,
    blockingResult,
    headers: {
      [TRAFFIC_LIMIT_HEADERS.limit]: String(primary.limit),
      [TRAFFIC_LIMIT_HEADERS.remaining]: String(primary.remaining),
      [TRAFFIC_LIMIT_HEADERS.reset]: String(Math.floor(primary.resetAt / 1000)),
      [TRAFFIC_LIMIT_HEADERS.policy]: primary.policy.policy.id,
      [TRAFFIC_LIMIT_HEADERS.service]: primary.policy.policy.service,
    },
  };
}

export function buildEdgeTrafficRequestContext(input: {
  readonly pathname: string;
  readonly method: string;
  readonly ip: string;
  readonly userId?: string;
  readonly tenantId?: string;
}): TrafficRequestContext {
  const service = input.pathname.startsWith("/api/auth")
    ? "auth"
    : input.pathname.startsWith("/api/law/")
      ? "law"
      : input.pathname.startsWith("/api/platform/")
        ? "platform"
        : "public";

  return {
    pathname: input.pathname,
    method: input.method,
    ip: input.ip,
    userId: input.userId,
    tenantId: input.tenantId,
    service,
  };
}

export function buildEdgeTrafficDeniedInit(decision: TrafficGovernanceDecision) {
  return {
    status: 429,
    headers: {
      ...decision.headers,
      "Retry-After": String(
        Math.max(
          1,
          Math.ceil(((decision.blockingResult?.resetAt ?? Date.now()) - Date.now()) / 1000),
        ),
      ),
    },
  };
}

export function createEdgeTrafficDeniedBody() {
  return {
    error: {
      code: "RATE_LIMITED",
      message: "Too many requests. Please retry later.",
    },
  };
}
