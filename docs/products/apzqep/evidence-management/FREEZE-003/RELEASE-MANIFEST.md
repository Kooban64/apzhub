# Release Manifest — APZQEP-FREEZE-003

| Field            | Value                                                                    |
| ---------------- | ------------------------------------------------------------------------ |
| RC ID            | **APZQEP-EVIDENCE-1.0.0-rc.1**                                           |
| Package          | `@apzhub/qep-evidence`                                                   |
| Version          | **1.0.0-rc.1**                                                           |
| Module           | `modules/qep-evidence` **1.0.0-rc.1**                                    |
| Build identifier | `FREEZE-003 / 20260730T091500Z`                                          |
| Class            | **PRODUCTION_READY_WITH_LIMITATIONS**                                    |
| Suitability      | **LIMITED_AVAILABILITY**                                                 |
| Freeze reference | APZQEP-FREEZE-003 · `20260730T091500Z-APZQEP-FREEZE-003-COMPLETION.json` |
| Certification    | APZQEP-CERT-003 **CLOSED**                                               |

## Paths

| Role         | Path                                                   |
| ------------ | ------------------------------------------------------ |
| Freeze pack  | `docs/products/apzqep/evidence-management/FREEZE-003/` |
| Release pack | `docs/releases/apzqep/evidence-management/1.0.0-rc.1/` |
| Package      | `packages/qep-evidence/`                               |
| Module       | `modules/qep-evidence/`                                |
| REST         | `apps/web/app/api/v1/qep/evidence/`                    |
| Workbench    | `apps/web/components/qep/qep-evidence-views.tsx`       |

## Version baseline (candidate)

| Field                                                 | Value                                 |
| ----------------------------------------------------- | ------------------------------------- |
| RC version                                            | **1.0.0-rc.1**                        |
| Recommended frozen version on Owner Freeze acceptance | **1.0.0**                             |
| Patch line after freeze                               | **1.0.x** — new Owner programmes only |

## Tagged release candidate

Logical tag identity for Owner-authorised source control:

```text
apzqep-evidence-1.0.0-rc.1
```

Physical git tag creation is an Owner/ops action after the RC tree is committed — not performed under FREEZE-003 automation without commit authority.

## Persistence condition

At freeze validation time, capability implementation and programme packs exist in the workspace but are **not fully committed** to `origin/main`. Production deploy **shall** use a commit that contains this RC tree.
