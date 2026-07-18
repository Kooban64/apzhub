# APZHUB HTTP Security Headers Architecture (PRH-003)

## Purpose

Centralise HTTP security posture across `apps/web`, `apps/law-platform`, Platform APIs, Law APIs, Swagger, health, diagnostics, and static assets. Products must not define their own security headers.

## Owner

`@apzhub/platform-security` — `HttpSecurityHeaderService`

## Canonical policy

| Header                                | Value                                          | Notes                           |
| ------------------------------------- | ---------------------------------------------- | ------------------------------- |
| `X-Frame-Options`                     | `DENY`                                         | Clickjacking protection         |
| `X-Content-Type-Options`              | `nosniff`                                      | MIME sniffing protection        |
| `Referrer-Policy`                     | `strict-origin-when-cross-origin`              | Limits referrer leakage         |
| `Permissions-Policy`                  | camera/mic/geo/payment/usb disabled            | Feature policy                  |
| `Cross-Origin-Opener-Policy`          | `same-origin-allow-popups`                     | Auth popup compatibility        |
| `Cross-Origin-Resource-Policy`        | `same-site`                                    | Cross-origin resource isolation |
| `Cross-Origin-Embedder-Policy`        | `unsafe-none`                                  | Next.js + Swagger compatibility |
| `Origin-Agent-Cluster`                | `?1`                                           | Process isolation hint          |
| `Strict-Transport-Security`           | `max-age=31536000; includeSubDomains`          | Production only                 |
| `Content-Security-Policy`             | Enforced stable policy                         | Production (PRH-002)            |
| `Content-Security-Policy-Report-Only` | Stable policy + report-uri                     | Development                     |
| `Cache-Control`                       | `no-store, no-cache, must-revalidate, private` | API, health, diagnostics only   |

## Disclosure controls

- `poweredByHeader: false` in Next.js config (via `withPlatformSecurityHeaders`)
- No `Server` header mutation at application layer (edge proxy responsibility)
- No `X-Powered-By` emission

## ETag policy

Platform does not emit weak ETags on health or diagnostics. Law API resource handlers may emit ETags for conditional GET where appropriate; header service does not strip ETags.

## Application surfaces

| Surface        | Delivery mechanism                                                                    |
| -------------- | ------------------------------------------------------------------------------------- |
| Pages & static | Next.js `headers()` via `withPlatformSecurityHeaders`                                 |
| Platform APIs  | `jsonPlatformResponse` / `securePlatformResponse` in handlers                         |
| Law APIs       | `HttpSecurityHeaderService.getApiResponseHeaders()` in `apps/web/lib/api/response.ts` |
| Guard failures | `guardFailureResponse` applies API headers                                            |

## Per-environment overrides

| Control               | Development | Production |
| --------------------- | ----------- | ---------- |
| HSTS                  | Absent      | Enforced   |
| CSP                   | Report-Only | Enforced   |
| Cache-Control on APIs | Present     | Present    |

## Diagnostics

`SecurityDiagnostics.httpHeaders` exposes:

- Compliance status
- Missing headers
- Environment differences
- Recommendations
- ETag policy
- Powered-By suppression status

## Product integration

```typescript
// apps/*/next.config.ts
import { withSecurityHeaders } from "./lib/security-headers";
export default withSecurityHeaders({/* next config */});

// apps/*/lib/security-headers.ts — thin wrapper only
import { withPlatformSecurityHeaders } from "@apzhub/platform-security/headers";
export function withSecurityHeaders(config) {
  return withPlatformSecurityHeaders(config, { app: "web" });
}
```

Products must not assemble security headers locally.

## References

- [PRH-003 Compliance Report](../security/PRH-003-HTTP-Header-Compliance-Report.md)
- [CSP Violation Reporting](../security/CSP-Violation-Reporting.md)
- [Security Operations Guide](../governance/APZHUB-Security-Operations-Guide.md)
