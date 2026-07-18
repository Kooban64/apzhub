# PRH-003 — HTTP Header Compliance Report

**Sprint:** PRH-003  
**Status:** Compliant  
**Date:** 2026-07-08

## Scope reviewed

| Surface                | Paths                                           | Mechanism                                    |
| ---------------------- | ----------------------------------------------- | -------------------------------------------- |
| Platform health        | `/api/health`, `/api/platform/v1/system/*`      | Handler + Next.js edge                       |
| Platform diagnostics   | `/api/platform/v1/security/diagnostics`         | Handler                                      |
| Law health/diagnostics | `/api/law/v1/health`, `/api/law/v1/diagnostics` | Law API response helper                      |
| Law API                | `/api/law/v1/*`                                 | Law API response helper                      |
| Platform API           | `/api/platform/v1/*`                            | Platform handlers                            |
| CSP reporting          | `POST /api/platform/v1/security/csp-report`     | Handler                                      |
| Swagger                | `/docs`, `/api/law/v1/openapi.json`             | Next.js page headers                         |
| Static assets          | `/_next/static/*`                               | Next.js page headers (no API cache override) |
| Web pages              | `apps/web` routes                               | Next.js headers                              |
| Law Platform pages     | `apps/law-platform` routes                      | Next.js headers                              |

## Required headers — compliance matrix

| Header                 | Web           | Law Platform  | API responses | Notes                              |
| ---------------------- | ------------- | ------------- | ------------- | ---------------------------------- |
| X-Frame-Options        | ✅            | ✅            | ✅            | DENY                               |
| X-Content-Type-Options | ✅            | ✅            | ✅            | nosniff                            |
| Referrer-Policy        | ✅            | ✅            | ✅            | strict-origin-when-cross-origin    |
| Permissions-Policy     | ✅            | ✅            | ✅            | Restricted features                |
| COOP                   | ✅            | ✅            | ✅            | same-origin-allow-popups           |
| CORP                   | ✅            | ✅            | ✅            | same-site                          |
| COEP                   | ✅            | ✅            | ✅            | unsafe-none (documented)           |
| Origin-Agent-Cluster   | ✅            | ✅            | ✅            | ?1                                 |
| HSTS                   | ✅ prod       | ✅ prod       | ✅ prod       | Absent in development              |
| CSP                    | ✅            | ✅            | ✅            | Enforced prod / report-only dev    |
| Cache-Control          | ✅ API        | ✅ API        | ✅            | no-store on API/health/diagnostics |
| X-Powered-By           | ✅ suppressed | ✅ suppressed | ✅ suppressed | poweredByHeader: false             |

## Environment differences

| Header                    | Development        | Production                          |
| ------------------------- | ------------------ | ----------------------------------- |
| Strict-Transport-Security | Absent             | max-age=31536000; includeSubDomains |
| Content-Security-Policy   | Report-Only header | Enforced header                     |

## Automated validation

Tests in `packages/platform-security/src/http-security-header-service.test.ts`:

- Canonical header emission per surface
- Production HSTS enforcement
- API Cache-Control on api/health/diagnostics
- Compliance report generation
- All `PLATFORM_HTTP_ENDPOINT_SAMPLES` validated

Law API scaffold tests verify headers on success and route responses.

## Recommendations (accepted)

1. COEP remains `unsafe-none` for Next.js and Swagger UI stability.
2. Development uses CSP Report-Only; monitor violations before tightening.
3. Edge proxy should strip or normalise `Server` headers (out of app scope).

## Non-compliance items

None identified at implementation time.
