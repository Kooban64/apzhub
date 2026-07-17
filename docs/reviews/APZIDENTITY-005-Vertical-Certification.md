# APZIDENTITY-005 — Vertical Certification

**Date:** 2026-07-17  
**Scope:** Platform Identity Administration System of Record (metadata management plane)  
**Classification:** See [Production Readiness](./APZIDENTITY-005-Production-Readiness.md)

## Certified path

```text
Identity Administration Workbench
→ createHttpIdentityClient() / identity-api
→ /api/v1/identity/*
→ PlatformServiceGateway.identity.*
→ RequestPipeline
→ Production Authorization
→ Identity Platform Services
→ Identity Core
→ Identity Persistence
→ PostgreSQL
```

## Gates

| Gate | Result |
| --- | --- |
| `pnpm audit:identity-foundation` | PASS |
| `pnpm audit:identity-platform-services` | PASS |
| `pnpm audit:identity-http-client` | PASS |
| `pnpm audit:identity-workbench` | PASS |
| `pnpm audit:identity-vertical` | PASS (required) |
| `pnpm certify:identity-vertical` | PASS (composes audits + harness + coverage) |
| `pnpm openapi:validate:platform` | PASS |
| Vitest `testing/identity-vertical` | PASS (10 journeys) |
| Playwright live webServer | LIMITED (Testing slug conflict — external) |

## Intentional non-defects

No authentication administration, password/MFA/OAuth/OIDC/SAML, SCIM/LDAP/Entra/Google Workspace directory sync, provisioning, Event Bus, AI, or invitation email delivery.

## Next (not authorised)

**APZIDENTITY-006 — Identity Administration Wave Certification & Architecture Freeze** — do not implement.
