# APZHUB Platform Security Reference Architecture (M8-06)

## Purpose

Strengthen platform-level security without redesigning Identity, Authorization, or Operations. Security protects the platform; products consume these capabilities — they do not duplicate them.

## Package

`@apzhub/platform-security` — environment validation, security header posture, API guard helpers, rate limiting (memory + Redis fallback), security diagnostics, and consolidated operational diagnostics aggregation.

## Security domains

| Domain | Owner | M8-06 posture |
|--------|-------|---------------|
| Authentication | `@apzhub/auth` + Identity | Session policy (PRH-006), secure cookies, tenant enrichment via `getValidatedSession()` |
| Authorization | `@apzhub/platform-authorization` + `@apzhub/platform-services` + `/api/v1` | `requirePlatformPermission()` on privileged APIs; gateway pipeline authz (OSS-110-06); HTTP surface (OSS-110-07, ADR-0051) |
| Tenant isolation | Identity + Authorization | Tenant context on session; RLS via persistence layer |
| Secrets | `@apzhub/config/governance` | Registry, masking, tiered validation, `ensureEnvironmentValid()`; Vault interface only (PCv2-04) |
| Headers | `HttpSecurityHeaderService` (PRH-003) | Centralised XFO, XCTO, Referrer-Policy, HSTS (prod), COOP/CORP/COEP, OAC, Cache-Control (API), CSP (enforced prod / report-only dev), Permissions-Policy; `poweredByHeader: false` |
| Rate limiting | `TrafficGovernanceService` (PRH-005) | Canonical policies; IP/user/tenant/endpoint/service dimensions; burst handling; Redis + memory backends |
| Audit | Authorization + Governance | Existing audit streams; no duplicate audit in security package |
| Input validation | Platform API + config | Zod at boundaries; guard returns standard 401/403 envelope |

## APIs

- `GET /api/platform/v1/security` — authenticated platform security summary
- `GET /api/platform/v1/security/diagnostics` — administration permission; consolidated security + operational diagnostics
- `GET /api/platform/v1/system/health` — aggregated health (public probe)
- `GET /api/platform/v1/system/readiness` — readiness probe
- `GET /api/platform/v1/system/liveness` — liveness probe

- `POST /api/platform/v1/security/csp-report` — CSP violation ingestion (public)

## HTTP header architecture

All response surfaces consume `HttpSecurityHeaderService`:

- Next.js apps: `withPlatformSecurityHeaders` in `next.config.ts` (thin app wrapper)
- Platform route handlers: `jsonPlatformResponse` / `securePlatformResponse`
- Law API envelope: `getApiResponseHeaders()` in response helper

See [HTTP Security Headers Architecture](./APZHUB-HTTP-Security-Headers-Architecture.md).

## Operations Console

Security and Resilience sections under Platform Administration expose posture, environment validation, dependency health, and recovery guidance.

## Deferred (intentional)

SOC/SIEM integration, external secret managers, key rotation services, vulnerability scanners, penetration testing — future milestones.

## References

- [Operational Resilience Architecture](./APZHUB-Operational-Resilience-Architecture.md)
- [Security Diagnostics Guide](../governance/APZHUB-Security-Diagnostics-Guide.md)
- [ADR-0045](../adr/ADR-0045-platform-security-operational-resilience.md)
