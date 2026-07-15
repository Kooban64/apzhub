export type TrafficServiceId = "platform" | "law" | "auth" | "public";

export type TrafficPolicyDimension = "ip" | "endpoint" | "user" | "tenant" | "service";

export type TrafficPolicySource = "registry" | "environment-profile" | "default";

export type TrafficEnforcementBackend = "memory" | "redis";

export interface TrafficPolicyLimits {
  readonly requestsPerMinute: number;
  readonly burstMultiplier?: number;
  readonly burstWindowSeconds?: number;
}

export interface TrafficPolicyDefinition {
  readonly id: string;
  readonly service: TrafficServiceId;
  readonly endpointPattern: RegExp;
  readonly description: string;
  readonly limits: TrafficPolicyLimits;
  readonly dimensions: readonly TrafficPolicyDimension[];
  readonly exempt?: boolean;
}

export interface TrafficRequestContext {
  readonly pathname: string;
  readonly method: string;
  readonly ip: string;
  readonly userId?: string;
  readonly tenantId?: string;
  readonly service: TrafficServiceId;
}

export interface TrafficPolicyMatch {
  readonly policy: TrafficPolicyDefinition;
  readonly source: TrafficPolicySource;
  readonly effectiveLimits: TrafficPolicyLimits;
}

export interface TrafficEvaluationResult {
  readonly allowed: boolean;
  readonly policy: TrafficPolicyMatch;
  readonly dimension: TrafficPolicyDimension;
  readonly limitKey: string;
  readonly limit: number;
  readonly remaining: number;
  readonly resetAt: number;
  readonly throttled: boolean;
  readonly burstApplied: boolean;
}

export interface TrafficGovernanceDecision {
  readonly allowed: boolean;
  readonly results: readonly TrafficEvaluationResult[];
  readonly blockingResult?: TrafficEvaluationResult;
  readonly headers: Readonly<Record<string, string>>;
}

export interface TrafficGovernanceStatus {
  readonly enabled: boolean;
  readonly backend: TrafficEnforcementBackend;
  readonly environment: string;
  readonly profileMultiplier: number;
  readonly defaultLimitPerMinute: number;
}

export interface TrafficGovernanceDiagnostics {
  readonly status: TrafficGovernanceStatus;
  readonly activePolicy: {
    readonly id: string;
    readonly service: TrafficServiceId;
    readonly source: TrafficPolicySource;
    readonly effectiveLimits: TrafficPolicyLimits;
  } | null;
  readonly rateLimit: {
    readonly backend: TrafficEnforcementBackend;
    readonly enabled: boolean;
    readonly defaultLimitPerMinute: number;
  };
  readonly throttle: {
    readonly active: boolean;
    readonly burstWindowSeconds: number;
  };
  readonly policySource: TrafficPolicySource;
  readonly environment: string;
  readonly recommendations: readonly string[];
}

export const TRAFFIC_LIMIT_HEADERS = {
  limit: "X-RateLimit-Limit",
  remaining: "X-RateLimit-Remaining",
  reset: "X-RateLimit-Reset",
  policy: "X-Traffic-Policy",
  service: "X-Traffic-Service",
} as const;
