# SPR-APZPEN-010 — Ops loop close (jobs · RoE · schedule · finding detail)

> **Status:** **DELIVERED** — 2026-08-14  
> **Depends on:** SPR-APZPEN-009  
> **Pillar:** [APZPEN Vision](../strategy/APZPEN-ENTERPRISE-SECURITY-ASSURANCE-PLATFORM.md)

## Goal

Close remaining operator loops: dispatch job history, editable RoE before approve, schedule `nextRunAt`, finding detail page, and re-wire workflow/certification action parity.

## Delivered

| Item             | Notes                                                              |
| ---------------- | ------------------------------------------------------------------ |
| Dispatch jobs    | `listDispatchJobs` + `GET …/dispatch`; engagement Jobs panel       |
| RoE edit         | `update_roe` before approve — techniques + emergency contact       |
| Schedule         | `nextRunAt` datetime for once/frequent                             |
| Finding detail   | `/apzpen/findings/[findingId]` — edit details, lifecycle, evidence |
| Findings filters | Open / Critical-High filters; title links to detail                |
| Workflow / cert  | Shared action bar restored; Certify + Report on board              |
| Providers        | Deep links (Dispatch, MobSF UI, Code security)                     |

## Non-goals (still deferred)

Security Graph depth · immutable certification ledger · non-GitHub SCM · PostgreSQL SoR · file evidence vault · background schedule worker
