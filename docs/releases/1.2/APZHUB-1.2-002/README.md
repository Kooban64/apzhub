# APZHUB-1.2-002 — Backup Restore Drill + Recovery Evidence (R12-OPS-01)

> **Programme:** APZHUB-1.2-002  
> **Title:** Backup Restore Drill + Recovery Evidence  
> **Backlog item:** **R12-OPS-01** (first P0 in [IMPLEMENTATION-BACKLOG](../../1.2-planning/IMPLEMENTATION-BACKLOG.md))  
> **Classification:** ENGINEERING  
> **Status:** **ACCEPTED / CLOSED**  
> **Recommendation:** **READY FOR OWNER ACCEPTANCE** (accepted)  
> **Production baseline:** APZHUB Platform **1.1.0** (unchanged)  
> **Standard:** [Platform Delivery Standard](../../../engineering/platform-delivery/PLATFORM-DELIVERY-STANDARD.md)  
> **Date:** 2026-07-20

---

## Selected backlog item

| Field          | Value                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------------- |
| ID             | **R12-OPS-01**                                                                                    |
| Item           | Backup restore drill + recovery evidence                                                          |
| Classification | Operational Improvement                                                                           |
| Priority       | **P0** (first in authoritative register)                                                          |
| Dependencies   | Backup docs — **complete** ([BACKUP-AND-RECOVERY.md](../../../operations/BACKUP-AND-RECOVERY.md)) |
| Risk           | OPS-R-04                                                                                          |

## Scope (done)

| Area                              | Change                                                              |
| --------------------------------- | ------------------------------------------------------------------- |
| `@apzhub/platform-operations`     | Drill evidence schema, dry-run builder, validators, currency helper |
| `scripts/backup-restore-drill.ts` | Dry-run + live runner (`pnpm ops:backup-restore-drill`)             |
| Ops docs                          | Runbook + evidence directory + BACKUP/RISK updates                  |
| Live evidence                     | Isolated DB `apzhub_restore_drill` on `apzhub-postgres` — **PASS**  |

## Out of scope (STOP)

R12-OPS-02 · R12-OPS-03 · Search publishers · Email SoR · FIN-001 · Workflow Execute · platform redesign · second backlog item

## Pack contents

| Document                                       | Purpose                  |
| ---------------------------------------------- | ------------------------ |
| [COMPLETION-REPORT.md](./COMPLETION-REPORT.md) | What was delivered       |
| [ACCEPTANCE-REPORT.md](./ACCEPTANCE-REPORT.md) | Owner Acceptance request |
| [QUALITY-EVIDENCE.md](./QUALITY-EVIDENCE.md)   | Gates executed           |
