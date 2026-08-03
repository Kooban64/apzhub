# Operations Recertification — APZQEP-150R

| Field     | Value            |
| --------- | ---------------- |
| Result    | **PASS**         |
| Timestamp | 20260803T065345Z |

## Verified artefacts

| Artefact                        | Location                                       | Result                                                            |
| ------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------- |
| Backup / restore (Cap postgres) | `apzqep-151/BACKUP-AND-RESTORE.md`             | PASS                                                              |
| Persistence migrations          | `0095` / `0096` + journal                      | PASS                                                              |
| Security ops notes              | `apzqep-152` security pack                     | PASS                                                              |
| Historical 150 ops pack         | `apzqep-150/ops/*`                             | **Historical** — some text still describes pre-151 IN-MEMORY Caps |
| ENVIRONMENT.md                  | repo root                                      | PASS (host coexistence)                                           |
| Health                          | `GET /api/health` includes `coreQePersistence` | PASS (documented)                                                 |

## Supersession rule

```text
Current operational authority for Core QE persistence:
  APZQEP-151 docs + PRODUCT-STATUS

Current operational authority for Cap security:
  APZQEP-152 docs + PRODUCT-STATUS

APZQEP-150/ops remains immutable historical LIMITED_AVAILABILITY guidance.
```

No operational release blocker. Operators must follow 151/152 packs for production SoR and RBAC, not historical 150 IN-MEMORY statements.
