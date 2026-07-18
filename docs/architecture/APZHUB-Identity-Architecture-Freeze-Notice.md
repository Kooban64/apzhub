# APZHUB Identity Administration Architecture Freeze Notice

**Programme:** Platform Identity Administration System of Record (APZIDENTITY)  
**Effective:** 2026-07-17 (APZIDENTITY-006)  
**Status:** **FROZEN**

---

## Frozen architecture

```text
Identity Administration Workbench
→ Identity Typed Client
→ Identity HTTP API (/api/v1/identity)
→ PlatformServiceGateway.identity.*
→ RequestPipeline
→ Production Authorization
→ Identity Platform Services
→ Identity Core
→ Identity Persistence
→ PostgreSQL
```

No alternative execution paths are permitted.

## What is frozen

| Surface           | Freeze scope                                                        |
| ----------------- | ------------------------------------------------------------------- |
| Contracts         | `@apzhub/identity-contracts` **0.2.0**                              |
| Core              | `@apzhub/identity-core` **0.2.0**                                   |
| Persistence       | `@apzhub/identity-persistence` **0.1.0**                            |
| Platform Services | `gateway.identity.*` wiring in **0.23.0**                           |
| HTTP API          | `/api/v1/identity/*` · OpenAPI **1.7.0** · **36** App Router routes |
| Typed client      | `apps/web/lib/identity`                                             |
| Workbench         | `/workspace/identity` + `platform-identity` manifests (16 sections) |
| Authorization     | `identityPlatformOps` + `PLATFORM_IDENTITY_PERMISSIONS`             |
| Schema            | Migrations `0052` / `0053` · `platform_iam_*`                       |
| Boundary          | Metadata administration only — not authentication                   |

## Intentionally unavailable (frozen absence)

- Authentication administration (login, logout, sessions)
- Password / MFA / OAuth / OIDC / SAML management
- SCIM / LDAP / Microsoft Entra ID / Google Workspace directory synchronisation
- Account or service provisioning into backend engines
- Invitation email delivery
- Event Bus / workers / AI identity features

## Separation (frozen)

| Capability              | Path / ownership                                  |
| ----------------------- | ------------------------------------------------- |
| Identity Administration | `/workspace/identity` — this SoR                  |
| Platform Administration | `/workspace/administration` — frozen separate SoR |
| Platform Operations     | `/workspace/operations` — separate product        |

## Change control

Any change to the frozen architecture requires:

1. Formal ADR
2. Explicit owner approval
3. A new approved milestone (not APZIDENTITY-006)

Certification-only documentation updates that do not alter behaviour are permitted under later governance milestones.

## Classification retained

**PRODUCTION_READY_WITH_LIMITATIONS** (APZIDENTITY-005 evidence).

## See also

- [Identity Reference Standard](./APZHUB-Identity-Reference-Standard.md)
- [APZIDENTITY-006 Completion Report](../sprint/APZIDENTITY-006-completion-report.md)
