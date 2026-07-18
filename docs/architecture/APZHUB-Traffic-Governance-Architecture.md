# APZHUB Traffic Governance Architecture (PRH-005)

## Purpose

Expand platform rate limiting into a canonical Traffic Governance capability owned by `@apzhub/platform-security`. Products must not implement traffic policies.

## Owner

`TrafficGovernanceService` — policy evaluation, burst handling, diagnostics, and shared middleware helpers.

## Components

```
TrafficGovernanceService
├── policies.ts          — canonical per-endpoint policies
├── profiles.ts          — environment-aware limit multipliers
├── traffic-governance-service.ts — evaluation + burst buckets
├── route-middleware.ts  — Node.js handler middleware helpers
├── edge.ts              — edge-safe evaluator for Next.js middleware
└── adapters.ts          — future gateway/WAF adapter contracts (no impl)
```

## Policy dimensions

| Dimension | Key format                              | Used for                           |
| --------- | --------------------------------------- | ---------------------------------- |
| IP        | `ip:{address}`                          | Auth brute-force, public endpoints |
| Endpoint  | `endpoint:{method}:{path}`              | Per-route fairness                 |
| User      | `user:{id}`                             | Authenticated platform/Law APIs    |
| Tenant    | `tenant:{id}`                           | Multi-tenant isolation             |
| Service   | `service:{platform\|law\|auth\|public}` | Service-level quotas               |

## Enforcement points

| Surface                  | Integration                                                         |
| ------------------------ | ------------------------------------------------------------------- |
| Platform APIs            | `apps/*/middleware.ts` via `@apzhub/platform-security/traffic-edge` |
| Law APIs (authenticated) | `withLawApiAuth` via full `TrafficGovernanceService`                |
| Law APIs (public)        | `apps/web/middleware.ts` edge evaluator                             |
| Auth APIs                | `apps/*/middleware.ts` edge evaluator                               |

## Backends

- **Redis** when `REDIS_URL` is healthy — Node.js `TrafficGovernanceService`
- **Memory** fallback (per-instance)
- **Edge memory evaluator** — Next.js middleware (no Redis/config bundle)

## Deferred adapters

Gateway, Cloudflare, APISIX, Redis cluster, bot detection, WAF, distributed quotas — interface only in `adapters.ts`.

## Diagnostics

`SecurityDiagnostics.trafficGovernance` exposes policy, rate limit status, throttle status, policy source, environment, and tuning recommendations.

## References

- [Traffic Policy Guide](../governance/APZHUB-Traffic-Policy-Guide.md)
- [Traffic Governance Developer Guide](../governance/APZHUB-Traffic-Governance-Developer-Guide.md)
