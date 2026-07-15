# CSP Violation Reporting

> **Story:** PRH-002  
> **Endpoint:** `POST /api/platform/v1/security/csp-report`  
> **Authentication:** None (browser reports; size-limited)

---

## Overview

Browsers send CSP violation reports to the platform endpoint configured via `report-uri` in the Content Security Policy header. Reports are ingested by `@apzhub/platform-security` (`CspViolationService`), counted by directive, and exposed via security diagnostics.

---

## Endpoint

| Field | Value |
|-------|-------|
| **Method** | `POST` |
| **Path** | `/api/platform/v1/security/csp-report` |
| **Auth** | Unauthenticated (public middleware path) |
| **Max body** | 4096 bytes |
| **Success** | `204 No Content` |
| **Invalid JSON** | `400` |
| **Oversized** | `413` |

### Hosts

| App | Route file |
|-----|------------|
| `apps/web` | `app/api/platform/v1/security/csp-report/route.ts` |
| `apps/law-platform` | `app/api/platform/v1/security/csp-report/route.ts` |

Each host reports to its **same-origin** endpoint.

---

## Request format

Browsers send `application/csp-report` or `application/json`:

```json
{
  "csp-report": {
    "document-uri": "https://host/workspace/home",
    "violated-directive": "script-src",
    "effective-directive": "script-src",
    "blocked-uri": "inline",
    "source-file": "https://host/_next/static/...",
    "line-number": 1,
    "column-number": 1,
    "disposition": "report"
  }
}
```

Sensitive keys (`password`, `token`, `cookie`, etc.) are **stripped** before storage.

---

## Diagnostics

Security diagnostics (`GET /api/platform/v1/security/diagnostics`) include:

```json
{
  "csp": {
    "mode": "enforced",
    "reportUri": "/api/platform/v1/security/csp-report",
    "violationCount": 0,
    "violationsByDirective": {}
  }
}
```

`CspViolationService` retains the **200 most recent** reports in memory for operator review (single-instance; Redis aggregation deferred to PCv2-07).

---

## Operator workflow

1. Monitor `violationCount` after policy changes.
2. Inspect `violationsByDirective` for dominant failure types.
3. Cross-reference [PCv2-01 CSP Audit](./PCv2-01-CSP-Audit.md) before tightening directives.
4. Escalate sustained `script-src` violations per [Incident Response Guide](../governance/APZHUB-Incident-Response-Guide.md).

---

## Manual test

```bash
curl -sS -X POST http://localhost:3300/api/platform/v1/security/csp-report \
  -H 'content-type: application/csp-report' \
  -d '{"csp-report":{"document-uri":"http://localhost/login","violated-directive":"style-src"}}' \
  -w '\nHTTP %{http_code}\n'
```

Expected: HTTP 204

---

## References

- `packages/platform-security/src/csp-violation-service.ts`
- `packages/platform-security/src/csp-policy-service.ts`
