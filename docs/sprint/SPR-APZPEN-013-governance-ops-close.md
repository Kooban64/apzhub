# SPR-APZPEN-013 — Governance & ops close (My Work · re-dispatch · perms · RoE window · file ingest)

> **Status:** **DELIVERED** — 2026-08-14  
> **Depends on:** SPR-APZPEN-012  
> **Pillar:** [APZPEN Vision](../strategy/APZPEN-ENTERPRISE-SECURITY-ASSURANCE-PLATFORM.md)

## Goal

Close remaining CE MVP governance and operator-loop gaps: assignee “My Work” queue, failed-job re-dispatch, granular certify/retest permissions, RoE testing window + methodology edit, and file-based provider ingest.

## Delivered

| Item                   | Notes                                                                   |
| ---------------------- | ----------------------------------------------------------------------- |
| My Work                | `/apzpen/my-work` + nav; `filterMyWorkQueue`; findings `?assignedToMe=` |
| Failed-job re-dispatch | `redispatchFailedJob` + dispatch POST `{ jobId }` + UI Re-run           |
| Permission honesty     | `requireApzpenAccess` modes: manage / test / retest / certify           |
| RoE completeness       | Testing window start/end + methodology on draft + approved view         |
| File ingest            | Upload artefact file into provider ingest textarea                      |

## Non-goals (closed in SPR-APZPEN-014)

Schedule worker · certification ledger · evidence vault · PostgreSQL SoR · thin Security Graph · GitLab SCM — see [SPR-APZPEN-014](./SPR-APZPEN-014-deferred-closeout.md).
