# APZHUB-ENG-0007 — Remediation Evidence

> **Programme:** APZHUB-ENG-0007  
> **Group:** RG-LAW-DNS

---

## Before (APZHUB-QA-RECERT-001)

| Metric              | Value                                                                               |
| ------------------- | ----------------------------------------------------------------------------------- |
| RG-LAW-DNS failures | **7**                                                                               |
| Symptom             | Next.js Build Error: `Can't resolve 'dns'` (`pg` in Client Component Browser graph) |
| Effect              | All `law-015-trust-workflow` tests timed out on login email input                   |

## After (this programme)

| Metric              | Value             |
| ------------------- | ----------------- |
| RG-LAW-DNS failures | **0**             |
| Scoped suite        | **7 passed**      |
| Flaky               | **0** (final run) |

## Causal chain closed

```text
Client shell / domain barrels → repository-factory / persistence barrel → pg → dns
        ↓ (fixed: memory singletons + client-safe imports)
Login + trust shell load
        ↓ (fixed: deep-link preserve under active view route)
Trust sub-routes + seeded workbench assertions PASS
```

## Import traces (historical)

Primary (pre-fix):

`action-workbench-shell-provider` → `create-app-action-executor` → `repository-factory` → `postgres-*` → `pg`

Secondary (after first cut):

`workbench-page` → `lib/clients` barrel → `repository-factory` → `pg`

Search path:

`legal-search-workflow-context` → persistence barrel → `trust-repository-factory` → `pg`
