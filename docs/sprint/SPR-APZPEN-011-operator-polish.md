# SPR-APZPEN-011 — Operator polish (dispatch target · intelligence apply · portal)

> **Status:** **DELIVERED** — 2026-08-14  
> **Depends on:** SPR-APZPEN-010  
> **Pillar:** [APZPEN Vision](../strategy/APZPEN-ENTERPRISE-SECURITY-ASSURANCE-PLATFORM.md)

## Goal

Close remaining API→UI asymmetries: dispatch target selection, intelligence apply actions, engagement schedule visibility, assessment sync, portal evidence/location, and expanded smoke coverage.

## Delivered

| Item               | Notes                                                                        |
| ------------------ | ---------------------------------------------------------------------------- |
| Dispatch target    | Scope `<select>` + pass `target` on dry/live; invalidate findings after live |
| Intelligence apply | Open finding links; FP review; assign top priority; start remediating        |
| Engagement list    | Schedule + next run columns                                                  |
| Assessment sync    | Suggested vs current; `sync_assessment` action                               |
| Portal             | Location + evidence links; schedule/next run in header                       |
| E2E                | Schedule, sync, finding detail, portal open, intelligence heading            |

## Non-goals (still deferred)

Security Graph depth · immutable certification ledger · non-GitHub SCM · PostgreSQL SoR · file evidence vault · background schedule worker
