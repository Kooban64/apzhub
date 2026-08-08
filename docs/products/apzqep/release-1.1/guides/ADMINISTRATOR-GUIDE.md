# APZQEP 1.1 — Administrator Guide

| Audience | APZHUB administrators · Quality governors |
| -------- | ----------------------------------------- |
| Product  | APZQEP Version 1.1                        |

## Access

- Better Auth authenticates; APZHUB authorises (PermissionService).
- Cap roles: `qep-operator` (operate) · `qep-reader` (read).
- Default `tenant-member` does **not** receive Cap grants (fail-closed).
- Opt-in only: `APZQEP_QEP_AUTO_ASSIGN_OPERATOR` (dev/cert). Leave unset in production.
- Backend engine role names are never shown in UI.

## Permission catalogue (V1.1)

| Area                 | Read                                      | Operate                          |
| -------------------- | ----------------------------------------- | -------------------------------- |
| Quality Flows        | `qep.quality_flows.read`                  | `qep.quality_flows.operate`      |
| Automation           | `qep.automation.read`                     | `qep.automation.operate`         |
| SCM                  | `qep.scm.read`                            | `qep.scm.operate`                |
| Quality Intelligence | `qep.qi.read`                             | `qep.qi.operate`                 |
| Dashboards           | `qep.dashboards.read`                     | —                                |
| Caps A–F             | see Cap permission catalogue (APZQEP-152) | create/update/lifecycle variants |
| Evidence             | `qep.evidence.*`                          | domain security gate             |

## Administration responsibilities

1. Assign Cap roles deliberately — least privilege.
2. Confirm migrations applied on APZHUB Postgres (`:54334`) — see QX-PR-09 evidence.
3. Monitor `GET /api/health` (database · redis · runtime).
4. Backup/restore under platform ops authority (`docs/operations/BACKUP-AND-RECOVERY.md`).
5. Do not grant client-supplied permission elevation — APIs use session grants only.

## Deferred (Version 1.2)

Project membership attribute ACL (QX-P1-05) — Cap RBAC remains the V1.1 security boundary.

## Related

- [Operations Guide](./OPERATIONS-GUIDE.md)
- [Operational Runbook](../../engineering/APZQEP-V1.1-OPERATIONAL-RUNBOOK.md)
