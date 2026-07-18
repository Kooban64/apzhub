# APZIDENTITY Programme Summary

**Programme:** Platform Identity Administration  
**Closed:** APZIDENTITY-006 (2026-07-17)  
**Classification:** PRODUCTION_READY_WITH_LIMITATIONS  
**Architecture:** **FROZEN**

---

## Milestone chain

| Milestone       | Deliverable                                   |
| --------------- | --------------------------------------------- |
| APZIDENTITY-001 | Identity Administration Foundation            |
| APZIDENTITY-002 | Platform Services, Gateway & Authorization    |
| APZIDENTITY-003 | Identity HTTP API & Production Typed Client   |
| APZIDENTITY-004 | Identity Administration Workbench             |
| APZIDENTITY-005 | Vertical Certification & Production Readiness |
| APZIDENTITY-006 | Wave Certification & Architecture Freeze      |

## Final architecture

```text
Identity Workbench → Typed Client → /api/v1/identity/* → gateway.identity.*
→ RequestPipeline → Production Authorization → Platform Services
→ Identity Core → Identity Persistence → PostgreSQL
```

## What was delivered

- Canonical identity metadata SoR (`platform_iam_*`)
- Deny-by-default granular authorization
- 36 HTTP routes · OpenAPI 1.7.0 · production typed client
- Manifest-driven Workbench at `/workspace/identity` (16 sections)
- Vertical certification with 10 journeys · wave freeze + Reference Standard

## What was never in scope

Authentication, passwords, MFA, OAuth/OIDC/SAML, SCIM, LDAP, Entra/Google sync, provisioning, Event Bus, AI.

## Successor recommendation

**APZOBSERVE-001 — Platform Observability Foundation** (outside Identity). Further Identity authentication/provisioning work requires new programmes + ADRs.
