# QX-PR-09 Migration Verification Evidence

| Field     | Value                                                                                     |
| --------- | ----------------------------------------------------------------------------------------- |
| Timestamp | 20260807T213800Z                                                                          |
| Authority | [OWNER-REVIEW-V1.1-PRODUCTION-READINESS.md](../OWNER-REVIEW-V1.1-PRODUCTION-READINESS.md) |
| Status    | **OWNER ACCEPTANCE CANDIDATE — CLOSED**                                                   |

---

## Supported environment targets (ENVIRONMENT.md)

| Target         | Host port | Database      | Result                                                              |
| -------------- | --------- | ------------- | ------------------------------------------------------------------- |
| APZHUB primary | 54334     | `apzhub`      | PASS — `pnpm db:migrate` applied; V1.1 SoR tables present           |
| APZHUB test    | 54334     | `apzhub_test` | PASS — migrate applied; same V1.1 SoR table set (64 `qep_*` tables) |

Legacy `apzpg:54333` is out of scope (host coexistence — not an APZHUB migrate target).

---

## V1.1 durability tables verified (both DBs)

| Programme | Tables                                                                                                               |
| --------- | -------------------------------------------------------------------------------------------------------------------- |
| QX-PR-01  | `qep_automation_execution`                                                                                           |
| QX-PR-02  | `qep_scm_repository`, `qep_scm_webhook_audit`, `qep_scm_webhook_idempotency`, `qep_scm_traceability_link`            |
| QX-PR-03  | `qep_qi_observation`, `qep_qi_signal`, `qep_qi_recommendation`, `qep_qi_explanation`, `qep_qi_score`, `qep_qi_audit` |
| QX-PR-04  | `qep_dashboard_layout`, `qep_dashboard_saved_view`                                                                   |
| QX-PR-05  | `qep_qo_document`, `qep_qo_trigger_idempotency`                                                                      |

---

## Commands

```bash
set -a && . ./.env && set +a
pnpm db:migrate                                          # primary
DATABASE_URL="$DATABASE_URL_TEST" pnpm db:migrate        # test
```

**Owner acceptance candidate:** QX-PR-09 CLOSED.
