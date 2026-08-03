# APZHUB Programme Lifecycle

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZHUB-ENG-003   |
| Timestamp | 20260803T075550Z |

## Programme types

| Type                                 | Engineering allowed?           | Examples                             |
| ------------------------------------ | ------------------------------ | ------------------------------------ |
| Product Engineering                  | Yes (when Owner Auth opens it) | Capability delivery, platform slices |
| Remediation                          | Yes (scoped to blockers)       | Persistence, security hardening      |
| Independent Audit / Re-certification | **No** — verify only           | Readiness, re-cert                   |
| Product Board Resolution             | **No** — decide only           | GO / NO-GO release                   |
| Operational Governance               | **No** — observe & govern      | Daily/weekly/monthly ops             |
| Enterprise Governance                | **No** — institutionalise      | ENG-002, ENG-003                     |

## Mandatory programme artefacts

| Artefact                          | When                         |
| --------------------------------- | ---------------------------- |
| Owner Authorisation               | Before any work              |
| Programme README / face           | Always                       |
| Scope & stop conditions           | Always                       |
| Completion report                 | On close                     |
| Timestamped evidence              | On close                     |
| PRODUCT-STATUS / portfolio update | When product posture changes |

## States

```text
AUTHORISED → IN PROGRESS → COMPLETE
                ↘ STOPPED (blocker / Owner decision)
```

## Slice engineering (within product programmes)

Follow APZHUB-ENG-001: inspect → implement → certify → clean. Slices do not bypass Product Board release authority.
