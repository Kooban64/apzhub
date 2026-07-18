# APZIDENTITY-006 — Wave Certification

**Date:** 2026-07-17  
**Scope:** Platform Identity Administration programme wave closeout  
**Classification:** PRODUCTION_READY_WITH_LIMITATIONS (retained; architecture **frozen**)

## Programme milestones certified

| Milestone       | Outcome                                                    |
| --------------- | ---------------------------------------------------------- |
| APZIDENTITY-001 | Foundation                                                 |
| APZIDENTITY-002 | Platform Services, Gateway & Authorization                 |
| APZIDENTITY-003 | HTTP API & Production Typed Client                         |
| APZIDENTITY-004 | Identity Administration Workbench                          |
| APZIDENTITY-005 | Vertical Certification — PRODUCTION_READY_WITH_LIMITATIONS |
| APZIDENTITY-006 | Wave Certification & Architecture Freeze                   |

## Gates

| Gate                             | Result                        |
| -------------------------------- | ----------------------------- |
| `pnpm audit:identity-vertical`   | PASS (re-exec via wave audit) |
| `pnpm audit:identity-wave`       | PASS (required)               |
| `pnpm certify:identity-vertical` | PASS (quality gate)           |
| `pnpm openapi:validate:platform` | PASS                          |
| Vitest wave closeout harness     | PASS                          |

## Frozen path

```text
Workbench → Typed Client → HTTP → gateway.identity.* → RequestPipeline → Authz
→ Platform Services → Core → Persistence → PostgreSQL
```

## Intentional exclusions (not defects)

Authentication, passwords, MFA, OAuth/OIDC/SAML, SCIM, LDAP, Entra ID, Google Workspace sync, provisioning, Event Bus, AI.

## Next (not authorised)

**APZOBSERVE-001 — Platform Observability Foundation** — do not implement.
