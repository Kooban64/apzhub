import type { TrafficPolicyDefinition } from "./types";

export const CANONICAL_TRAFFIC_POLICIES: readonly TrafficPolicyDefinition[] = [
  {
    id: "auth-sensitive",
    service: "auth",
    endpointPattern: /^\/api\/auth\/(sign-in|sign-up|forget-password|reset-password)/,
    description: "Authentication mutation endpoints",
    limits: { requestsPerMinute: 30, burstMultiplier: 1.5, burstWindowSeconds: 10 },
    dimensions: ["ip", "endpoint"],
  },
  {
    id: "auth-general",
    service: "auth",
    endpointPattern: /^\/api\/auth\//,
    description: "General authentication API routes",
    limits: { requestsPerMinute: 60, burstMultiplier: 1.5, burstWindowSeconds: 10 },
    dimensions: ["ip", "service"],
  },
  {
    id: "platform-privileged",
    service: "platform",
    endpointPattern: /^\/api\/platform\/v1\//,
    description: "Privileged platform API routes",
    limits: { requestsPerMinute: 120, burstMultiplier: 2, burstWindowSeconds: 10 },
    dimensions: ["ip", "user", "tenant", "endpoint", "service"],
  },
  {
    id: "law-api",
    service: "law",
    endpointPattern: /^\/api\/law\/v1\//,
    description: "Law platform API routes",
    limits: { requestsPerMinute: 120, burstMultiplier: 2, burstWindowSeconds: 10 },
    dimensions: ["ip", "user", "tenant", "endpoint", "service"],
  },
  {
    id: "public-health",
    service: "public",
    endpointPattern:
      /^\/api\/(health|platform\/v1\/system\/(health|liveness|readiness)|law\/v1\/health)/,
    description: "Public health and probe endpoints",
    limits: { requestsPerMinute: 300, burstMultiplier: 2, burstWindowSeconds: 10 },
    dimensions: ["ip", "endpoint"],
  },
  {
    id: "csp-report",
    service: "public",
    endpointPattern: /^\/api\/platform\/v1\/security\/csp-report$/,
    description: "CSP violation reporting",
    limits: { requestsPerMinute: 60, burstMultiplier: 1.5, burstWindowSeconds: 10 },
    dimensions: ["ip", "endpoint"],
  },
  {
    id: "law-openapi",
    service: "public",
    endpointPattern: /^\/api\/law\/v1\/openapi/,
    description: "Law OpenAPI specification endpoints",
    limits: { requestsPerMinute: 120, burstMultiplier: 1.5, burstWindowSeconds: 10 },
    dimensions: ["ip", "endpoint"],
  },
];

export const PLATFORM_API_ENDPOINT_SAMPLES = [
  "/api/platform/v1/tenants",
  "/api/platform/v1/security",
  "/api/platform/v1/security/diagnostics",
  "/api/platform/v1/system/health",
  "/api/platform/v1/operations/configuration",
] as const;

export const LAW_API_ENDPOINT_SAMPLES = [
  "/api/law/v1/clients",
  "/api/law/v1/matters",
  "/api/law/v1/health",
  "/api/law/v1/diagnostics",
  "/api/law/v1/openapi.json",
] as const;

export function resolveTrafficPolicy(pathname: string): TrafficPolicyDefinition {
  const match = CANONICAL_TRAFFIC_POLICIES.find((policy) =>
    policy.endpointPattern.test(pathname),
  );
  return match ?? DEFAULT_TRAFFIC_POLICY;
}

export const DEFAULT_TRAFFIC_POLICY: TrafficPolicyDefinition = {
  id: "default-api",
  service: "platform",
  endpointPattern: /^\/api\//,
  description: "Default API traffic policy",
  limits: { requestsPerMinute: 120, burstMultiplier: 1.5, burstWindowSeconds: 10 },
  dimensions: ["ip", "endpoint", "service"],
};
