# SPR-APZPEN-014 — Deferred closeout (schedule · ledger · vault · SoR · graph · GitLab)

> **Status:** **DELIVERED** — 2026-08-14  
> **Depends on:** SPR-APZPEN-013  
> **Pillar:** [APZPEN Vision](../strategy/APZPEN-ENTERPRISE-SECURITY-ASSURANCE-PLATFORM.md)

## Goal

Close all previously deferred APZPEN mega-items with durable CE-complete slices and mark the APZPEN programme complete.

## Delivered

| Item                 | Notes                                                                         |
| -------------------- | ----------------------------------------------------------------------------- |
| Schedule worker      | `planScheduleTick` / `runScheduleTick` + `POST /api/v1/apzpen/schedule/tick`  |
| Certification ledger | Append-only `CertificationLedgerRecord` + ledger API + Certification UI       |
| Evidence vault       | Hashed blob store (`vault://`), upload/download API, operator file upload     |
| PostgreSQL SoR       | Drizzle `0144`/`0145` document tables + migrate API (`APZPEN_STORE=postgres`) |
| Thin Security Graph  | Nodes/edges + rebuild API + Assets page graph strip                           |
| GitLab SCM           | Active `GitLabScmProvider`; catalogue available; scope sync accepts gitlab    |

## Explicitly out of CE complete bar → **parked enterprise later**

Full SBOM graph · WORM crypto chain · ADO/Bitbucket/Gitea/Forgejo · legal-hold/retention · multi-host locks

See: [APZPEN Enterprise later options](../strategy/APZPEN-ENTERPRISE-LATER-OPTIONS.md) — **not** the active portfolio track.

## Programme status

**APZPEN CE programme complete** through SPR-APZPEN-014.  
**Portfolio priority shifts to APZQEP** — [SPR-APZQEP-200](./SPR-APZQEP-200-competitive-full-swing.md).
