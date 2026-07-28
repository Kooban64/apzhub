# Runbook — Platform PostgreSQL restore / data integrity

> **Service:** Platform PostgreSQL · **Owner:** Platform Ops Owner · **Priority:** P1 · **Policy:** `alert.platform-db.restore`

## 1. Title / service / owner

Platform PostgreSQL SoR. Owner: Platform Ops Owner.

## 2. Symptoms

DB unhealthy; migration failure; data corruption suspicion; restore required.

## 3. Severity guidance

**P1** — Tier A. Immediate Incident; Change control for Production restore.

## 4. Preconditions

- Change Approval for Production restore.
- Prefer isolated drill DB for practice ([BACKUP-RESTORE-DRILL-RUNBOOK](../BACKUP-RESTORE-DRILL-RUNBOOK.md)).
- Never restore over Production without approval.

## 5. Diagnosis steps

1. Confirm Postgres health / disk / connections.
2. Identify last good backup timestamp.
3. Check migration journal state.
4. Assess blast radius (platform metadata only vs engines — engines are separate).

## 6. Containment

- Stop writes if corruption risk.
- Freeze Releases/Changes.
- Preserve forensics if security-related.

## 7. Resolution / rollback

1. Follow [BACKUP-AND-RECOVERY.md](../BACKUP-AND-RECOVERY.md).
2. Restore verified dump; re-run migrations if required.
3. Validate app boot and health.
4. Record evidence (R12-OPS-01 pattern).

## 8. Verification

- Platform health green.
- Critical SoR reads succeed.
- Restore evidence filed.

## 9. Escalation

Platform Ops Owner → Platform Ops Lead → Owner.

## 10. Related KL / ADRs

R12-OPS-01 · OPS-R-04 · Document 011 SoR · Platform 1.1.0.
