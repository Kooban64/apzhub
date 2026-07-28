# APZ Workflow — Compatibility Statement (Planning)

> **Programme:** APZ-WORKFLOW-001  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19  
> **Status:** Planning baseline — not a Production SemVer compatibility claim

---

## Current disk baseline (foundation)

| Component                                 | Version / status                                      | Notes                            |
| ----------------------------------------- | ----------------------------------------------------- | -------------------------------- |
| `@apzhub/integration-sdk`                 | **1.0.0**                                             | Architecture Frozen              |
| `@apzhub/integration-n8n`                 | **0.1.0**                                             | Reference Adapter · read-only    |
| `@apzhub/workflow-contracts`              | **0.3.0**                                             | SoR + engine gateway facets      |
| `@apzhub/workflow-core`                   | **0.1.1**                                             | Domain                           |
| `@apzhub/workflow-persistence`            | **0.1.1**                                             | Persistence                      |
| `@apzhub/platform-services`               | **0.28.0**                                            | Includes Workflow services       |
| Workflow HTTP                             | `/api/v1/workflows` + `/engine`                       | SoR + read-only engine           |
| Workbench                                 | `/workspace/workflows` · `/workspace/workflow-engine` | Dual facets                      |
| APZ Projects / Time / Support / Analytics | Production SemVers                                    | Unaffected by this planning pack |

---

## Release 1.0 compatibility rules (future)

1. Workbench consumes Platform HTTP only — no Module → Connector bypass.
2. Provider swaps (Temporal, etc.) must preserve Platform Service contracts.
3. Breaking Workflow HTTP requires Major SemVer + Owner Approval.
4. Integration SDK **1.0.0** changes require ADR + Owner.
5. Frozen APZWORKFLOW baselines remain until Owner-accepted unlock.

---

## This programme

Documentation only — **no** package or API version changes.
