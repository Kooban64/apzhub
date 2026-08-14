# SPR-APZPEN-012 — Ops polish (re-ingest · due-soon · cert blockers · health)

> **Status:** **DELIVERED** — 2026-08-14  
> **Depends on:** SPR-APZPEN-011  
> **Pillar:** [APZPEN Vision](../strategy/APZPEN-ENTERPRISE-SECURITY-ASSURANCE-PLATFORM.md)

## Goal

Close remaining operator loops: re-ingest job artefacts, due-soon engagement triage, RoE notes, certification eligibility, code-security detail, and lightweight provider health.

## Delivered

| Item                | Notes                                                               |
| ------------------- | ------------------------------------------------------------------- |
| Job re-ingest       | `ingestDispatchJobArtefact` + `POST …/ingest { jobId }` + UI button |
| Due-soon filter     | Engagement list filter/sort by next run (≤7d / overdue)             |
| RoE notes           | Draft textarea + approved display                                   |
| Certification board | `canCertify` + blockers; disable Certify when blocked               |
| Code security       | Failed checks + finding overlap links; filter by engagement         |
| Providers health    | `GET /api/v1/apzpen/providers/health` (MobSF probe + GitHub auth)   |

## Non-goals (closed in SPR-APZPEN-014)

See [SPR-APZPEN-014](./SPR-APZPEN-014-deferred-closeout.md) — schedule worker, ledger, vault, Postgres SoR, thin graph, GitLab.
