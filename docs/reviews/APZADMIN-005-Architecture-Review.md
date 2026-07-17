# APZADMIN-005 — Architecture Review

**Date:** 2026-07-16  
**Command:** `pnpm audit:administration-vertical` (+ prior 001–004 audits)

## Verdict

**PASS** — certified dependency direction holds:

```text
Workbench → Typed Client → HTTP → Gateway → RequestPipeline → Authz → Services → Core → Persistence → PostgreSQL
```

## Findings

| Layer | Isolation |
| --- | --- |
| Workbench | Typed-client facades only; no gateway/core/persistence |
| Typed client | `/api/v1/administration` only |
| HTTP handlers | `gateway.administration.*` only |
| Platform services | Thin wrappers; rules in Core |
| Core | No persistence implementation deps |
| Persistence | No platform-services / HTTP |

## Coexistence

| Surface | Route | Manifest parent |
| --- | --- | --- |
| Administration SoR Workbench | `/workspace/administration` | `platform-admin` |
| Platform Operations (M8-03) | `/workspace/operations` | `platform-administration` |

## Prohibited surfaces absent

Runtime admin, execute/provision, users/roles/tenants, Event Bus, AI administration, dedicated `apps/web/app/workspace/administration` tree.
