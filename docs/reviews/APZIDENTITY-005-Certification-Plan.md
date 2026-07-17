# APZIDENTITY-005 — Identity Vertical Certification Plan

**Date:** 2026-07-17  
**Milestone:** Identity Administration Vertical Certification & Production Readiness  
**Status:** Executed

## Objective

Certify the complete Identity Administration vertical as a production-ready APZHUB platform capability (metadata SoR only). No new product features.

## Certified path

```text
Identity Administration Workbench
→ Identity Typed Client
→ /api/v1/identity/*
→ gateway.identity.*
→ RequestPipeline
→ Production Authorization
→ Identity Platform Services
→ Identity Core
→ Identity Persistence
→ PostgreSQL
```

## Gates (16)

1. Identity foundation audit
2. Identity Platform Services audit
3. Identity HTTP/client audit
4. Identity Workbench audit
5. Identity vertical audit
6. OpenAPI validation
7. Certification harness (10 journeys)
8. Scoped vertical coverage
9. Authorization review
10. Tenant isolation review
11. Organisation isolation review
12. Persistence review
13. Credential-exposure review
14. Operational readiness review
15. Playwright certification
16. Regression suite

## Classification options

`PRODUCTION_READY` | `PRODUCTION_READY_WITH_LIMITATIONS` | `NOT_PRODUCTION_READY`

## Explicit exclusions (non-defects)

Authentication, passwords, MFA, OAuth/OIDC/SAML, SCIM, LDAP, Entra ID, Google Workspace sync, provisioning, Event Bus, AI, invitation email delivery, wave closeout, architecture freeze.
