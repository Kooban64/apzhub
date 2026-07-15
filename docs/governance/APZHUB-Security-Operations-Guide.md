# APZHUB Security Operations Guide (M8-06)

## Daily checks

1. Open **Platform Administration → Health** — verify database, Redis, runtime, and security environment signals.
2. Open **Security** — confirm header posture and environment validation checks pass.
3. Open **Resilience** — confirm readiness and review recovery guidance (should show platform-healthy when all dependencies pass).

## API probes

```bash
curl -sS https://<host>/api/platform/v1/system/liveness
curl -sS https://<host>/api/platform/v1/system/readiness
curl -sS https://<host>/api/platform/v1/system/health
```

Authenticated (session cookie):

```bash
curl -sS -b cookies.txt https://<host>/api/platform/v1/security/diagnostics
```

## Environment validation failures

| Check | Action |
|-------|--------|
| `ENV_SCHEMA` fail | Review `getConfigurationDiagnostics()` — fix missing/invalid variables |
| `BETTER_AUTH_SECRET` fail | Rotate secret in secure store; minimum 32 characters; restart app |
| `DATABASE_URL` fail | Restore PostgreSQL connectivity; verify credentials |
| `REDIS_URL` fail | Restore Redis; rate limit falls back to memory |
| `ALLOW_DEV_REGISTRATION` warn (prod) | Set `ALLOW_DEV_REGISTRATION=false` |
| Deprecated alias warn | Migrate `AUTH_SECRET` → `BETTER_AUTH_SECRET`, `AUTH_URL` → `BETTER_AUTH_URL` |

Configuration governance is centralised in `@apzhub/config/governance` (PRH-004). See [Environment Governance](./APZHUB-Environment-Governance.md).

### Configuration diagnostics

`GET /api/platform/v1/security/diagnostics` includes `security.environment.configuration`:

- `missingVariables`, `deprecatedVariables`, `unknownVariables`
- `defaultUsage`, `secretStatus` (masked previews only)
- `vault.provider` — `environment` until PCv2-04 Vault integration

## Rate limiting

Default: 120 requests/minute per policy dimension. Backend: Redis when `REDIS_URL` is healthy; otherwise in-memory (single-instance only).

Traffic governance is centralised in `@apzhub/platform-security` (`TrafficGovernanceService`, PRH-005). See [Traffic Policy Guide](./APZHUB-Traffic-Policy-Guide.md).

Throttled requests return **429** with `X-RateLimit-*`, `X-Traffic-Policy`, and `Retry-After` headers.

### Diagnostics

`GET /api/platform/v1/security/diagnostics` includes `security.trafficGovernance`:

- Active policy and environment profile
- Rate limit backend status
- Throttle/burst status
- Tuning recommendations

## Header posture

HTTP security headers are **centralised** in `@apzhub/platform-security` (`HttpSecurityHeaderService`, PRH-003). Products must not define their own headers.

See [HTTP Security Headers Architecture](../architecture/APZHUB-HTTP-Security-Headers-Architecture.md).

### Standard headers

| Header | Value |
|--------|-------|
| X-Frame-Options | DENY |
| X-Content-Type-Options | nosniff |
| Referrer-Policy | strict-origin-when-cross-origin |
| Permissions-Policy | camera/mic/geo/payment/usb disabled |
| Cross-Origin-Opener-Policy | same-origin-allow-popups |
| Cross-Origin-Resource-Policy | same-site |
| Cross-Origin-Embedder-Policy | unsafe-none |
| Origin-Agent-Cluster | ?1 |
| Cache-Control (API/health/diagnostics) | no-store, no-cache, must-revalidate, private |

`X-Powered-By` is suppressed (`poweredByHeader: false`).

### CSP (PRH-002)

CSP uses **progressive enforcement** (PRH-002):

| Environment | Mode | Header |
|-------------|------|--------|
| Development | Report-Only | `Content-Security-Policy-Report-Only` |
| Production | Enforced stable policy | `Content-Security-Policy` |

Policy is built by `CspPolicyService` (`@apzhub/platform-security/csp`). Violations report to `POST /api/platform/v1/security/csp-report`. See [CSP Violation Reporting](../security/CSP-Violation-Reporting.md) and [PCv2-01 CSP Audit](../security/PCv2-01-CSP-Audit.md).

Permissions-Policy restricts camera, microphone, geolocation, payment, and USB.

### Header compliance diagnostics

`GET /api/platform/v1/security/diagnostics` includes `security.httpHeaders`:

- `compliant` — all required headers present for current environment
- `missing` — header names not emitted
- `environmentDifferences` — dev vs production policy deltas
- `recommendations` — operational guidance
- `etagPolicy` — platform ETag posture
- `poweredBySuppressed` — should always be `true`

### Session diagnostics

`GET /api/platform/v1/security/diagnostics` includes `security.session.sessionDiagnostics`:

- Cookie posture (secure, httpOnly, sameSite)
- Timeout policy (absolute, idle, cache)
- Tenant binding status
- Dev fallback usage flags
- Recommendations (no tokens or secrets)

## Session policy

Session security is centralised in `@apzhub/auth` (PRH-006). See [Session Policy Guide](./APZHUB-Session-Policy-Guide.md).

Production requires secure HttpOnly cookies, disabled dev registration, and tenant consistency validation.

## Escalation

See [Incident Response Guide](./APZHUB-Incident-Response-Guide.md).
