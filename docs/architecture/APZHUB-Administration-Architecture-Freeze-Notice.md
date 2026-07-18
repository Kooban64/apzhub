# APZHUB Administration Architecture Freeze Notice

**Programme:** Platform Administration System of Record (APZADMIN)  
**Effective:** 2026-07-16 (APZADMIN-006)  
**Status:** **FROZEN**

---

## Frozen architecture

```text
Administration Workbench
→ Administration Typed Client
→ Administration HTTP API (/api/v1/administration)
→ PlatformServiceGateway.administration.*
→ RequestPipeline
→ Production Authorization
→ Administration Platform Services
→ Administration Core
→ Administration Persistence
→ PostgreSQL
```

No alternative execution paths are permitted.

## What is frozen

| Surface           | Freeze scope                                                      |
| ----------------- | ----------------------------------------------------------------- |
| Contracts         | `@apzhub/admin-contracts` **0.2.0**                               |
| Core              | `@apzhub/admin-core` **0.2.0**                                    |
| Persistence       | `@apzhub/admin-persistence` **0.1.0**                             |
| Platform Services | `gateway.administration.*` wiring in **0.22.0**                   |
| HTTP API          | `/api/v1/administration/*` · OpenAPI **1.6.0**                    |
| Typed client      | `apps/web/lib/administration`                                     |
| Workbench         | `/workspace/administration` + `platform-admin` manifests          |
| Authorization     | `administrationPlatformOps` + `admin.*` permission catalogue      |
| Coexistence       | Platform Operations at `/workspace/operations` (separate product) |
| Boundary          | Metadata governance only — does not own registered products       |

## Intentionally unavailable (frozen absence)

- Runtime administration / execute / live infrastructure control
- User / role / tenant / organisation management
- Account or service provisioning
- Live diagnostic probes
- Event Bus / workers / queues / AI administration

## Change control

Any change to the frozen architecture requires:

1. Formal ADR
2. Explicit owner approval
3. A new approved milestone (not APZADMIN-006)

Certification-only documentation updates that do not alter behaviour are permitted under later governance milestones.

## Classification retained

**PRODUCTION_READY_WITH_LIMITATIONS** (APZADMIN-005 evidence).

## See also

- [Administration Reference Standard](./APZHUB-Administration-Reference-Standard.md)
- [APZADMIN-006 Completion Report](../sprint/APZADMIN-006-completion-report.md)
