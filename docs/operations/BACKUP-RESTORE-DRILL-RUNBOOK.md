# APZHUB Backup Restore Drill Runbook

> **Programme:** APZHUB-1.2-002  
> **Backlog item:** **R12-OPS-01**  
> **Risk:** OPS-R-04  
> **Date:** 2026-07-20  
> **Scope:** Platform PostgreSQL only

---

## Purpose

Prove that platform PostgreSQL backups can be restored and record dated recovery evidence. Mitigates **OPS-R-04** (backup restore never tested).

## Non-goals

- Email SoR · FIN-001 · Workflow Execute
- Engine DB drills (Plane, Zammad, Kimai, …) — separate OLAs
- Production host disruption without Change Approval
- Platform redesign

## Prerequisites

| Prerequisite                                       | Notes                                      |
| -------------------------------------------------- | ------------------------------------------ |
| [BACKUP-AND-RECOVERY.md](./BACKUP-AND-RECOVERY.md) | Strategy authority                         |
| Docker Compose platform Postgres                   | Dev: `apzhub-postgres` (port **54334**)    |
| Change window (Production)                         | Required for Production live drills        |
| Evidence directory                                 | `docs/operations/evidence/backup-restore/` |

## Drill database

Always use isolated DB **`apzhub_restore_drill`** — never restore over Production `apzhub` without explicit Change Approval.

## Commands

### Dry-run (procedure readiness)

```bash
pnpm ops:backup-restore-drill -- --mode dry-run
```

### Live drill (dev / approved env)

```bash
pnpm ops:backup-restore-drill -- --mode live
```

Live mode (default container `apzhub-postgres`):

1. Ensures artefacts exist
2. Creates/recreates `apzhub_restore_drill`
3. Writes marker row
4. `pg_dump` → local artefact under `.local/ops/backup-restore/` (gitignored)
5. Drops/recreates DB and restores dump
6. Verifies marker
7. Writes evidence JSON under `docs/operations/evidence/backup-restore/`

## Cadence

| Environment           | Cadence                                                     |
| --------------------- | ----------------------------------------------------------- |
| Dev / CI-capable host | On each Release 1.2 ops programme / after major DB changes  |
| Staging / Production  | Quarterly (per BACKUP-AND-RECOVERY) under Change Management |

## Pass criteria

- Evidence `verdict` = **PASS**
- `mode` = **live** for Production confidence
- Marker verified after restore
- No secrets in evidence JSON

## Failure

1. Stop drill
2. Preserve dump artefact path in evidence `notes`
3. Open Incident / Problem as appropriate
4. Do not claim OPS-R-04 mitigated until next PASS live evidence
