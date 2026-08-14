# F16 — ALM produce (APZ Projects / Support from QEP defects)

| Field       | Value                                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------------------------ |
| Status      | **IMPLEMENTED** 2026-08-10                                                                                   |
| Bar         | Defect → TaskService / SupportService (or record_only ledger) · external refs on defect metadata · soft-fail |
| Maps to     | WF-14 · IR-012 · [QUALITY-OPERATING-LOOP.md](../../QUALITY-OPERATING-LOOP.md)                                |
| Not claimed | QEP owning task/ticket SoR; Kimai; auto GO; inbound status sync hardening                                    |

## Pattern

```text
QA confirms findings → optional QEP defects
  → POST …/defects/{id}/alm-produce
     or POST …/qa-gate/…/alm-produce (batch confirmed defectIds)
  → record_only ledger  OR  live TaskService.createTask / SupportService.createSupportRequest
  → store refs on defect customMetadata.almProduce + produce ledger
```

Modules never call Plane/Zammad clients. Gateway → Platform Services → connectors.

## Env

| Flag                              | Meaning                             |
| --------------------------------- | ----------------------------------- |
| `APZHUB_ALM_PRODUCE_MODE`         | `record_only` (default) or `live`   |
| `APZHUB_ALM_PRODUCE_CHANNELS`     | `projects`, `support`, or both      |
| `APZHUB_ALM_PROJECTS_PROJECT_ID`  | Platform `proj_…` for live tasks    |
| `APZHUB_ALM_SUPPORT_GROUP_ID`     | Platform `sgrp_…` for live tickets  |
| `APZHUB_ALM_SUPPORT_REQUESTER_ID` | Platform `suser_…` for live tickets |

## APIs

| Method | Path                                             |
| ------ | ------------------------------------------------ |
| `POST` | `/api/v1/qep/defects/{defectId}/alm-produce`     |
| `GET`  | `/api/v1/qep/defects/{defectId}/alm-produce`     |
| `POST` | `/api/v1/qep/qa-gate/by-change/{id}/alm-produce` |
| `GET`  | `/api/v1/qep/qa-gate/by-change/{id}/alm-produce` |

## UI

Journey **QA Gate** → **Produce fix work items (F16)** (batch from confirmed defects).

## Proof

1. Units: `alm-produce-from-defect.test.ts` (record_only + soft-fail live)
2. No certification mutation; no engine clients in QEP lib

## Outs

- Duplicating Projects/Support SoR in QEP Postgres
- Kimai on critical path
- Treating produce as GO/NO-GO
