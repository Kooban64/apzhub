# APZHUB Configuration Architecture Freeze Notice

**Programme:** Platform Configuration System of Record (APZCONFIG)  
**Effective:** 2026-07-16 (APZCONFIG-006)  
**Status:** **FROZEN**

---

## Frozen architecture

```text
Configuration Workbench
→ Configuration Typed Client
→ Configuration HTTP API (/api/v1/configuration)
→ PlatformServiceGateway.configuration.*
→ RequestPipeline
→ Production Authorization
→ Configuration Platform Services
→ Configuration Core
→ Configuration Persistence
→ PostgreSQL
```

No alternative execution paths are permitted.

## What is frozen

| Surface | Freeze scope |
| --- | --- |
| Contracts | `@apzhub/configuration-contracts` **0.2.0** |
| Core | `@apzhub/configuration-core` **0.2.0** |
| Persistence | `@apzhub/configuration-persistence` **0.1.0** |
| Platform Services | `gateway.configuration.*` wiring in **0.21.0** |
| HTTP API | `/api/v1/configuration/*` · OpenAPI **1.5.0** |
| Typed client | `apps/web/lib/configuration` |
| Workbench | `/workspace/configuration` + manifests |
| Authorization | `configurationPlatformOps` + permission catalogue |
| Lifecycle | draft → validated → approved → published → deprecated → archived |
| Boundary vs `@apzhub/config` | SoR ≠ runtime configuration-manager |

## Intentionally unavailable (frozen absence)

- Runtime configuration resolution / effective values / apply
- Feature flags
- Secrets management / Vault
- Environment-variable injection / Kubernetes ConfigMaps
- Hot reload / rollout orchestration
- Event Bus / workers / queues / notifications

## Change control

Any change to the frozen architecture requires:

1. Formal ADR
2. Explicit owner approval
3. A new approved milestone (not APZCONFIG-006)

Certification-only documentation updates that do not alter behaviour are permitted under later governance milestones.

## Classification retained

**PRODUCTION_READY_WITH_LIMITATIONS** (APZCONFIG-005 evidence).

## See also

- [Configuration Reference Standard](./APZHUB-Configuration-Reference-Standard.md)
- [APZCONFIG-006 Completion Report](../sprint/APZCONFIG-006-completion-report.md)
