# APZ Workflow Version 1.0 — Engineering Evidence Pack

| Field     | Value                      |
| --------- | -------------------------- |
| Timestamp | 20260808T152000Z           |
| Status    | **COMPLETE** for Phase 1–3 |

## Phase 1 — Product Functionality

| ID       | Evidence                                                                                                           |
| -------- | ------------------------------------------------------------------------------------------------------------------ |
| WF-P1-01 | [../engineering/evidence/WF-P1-01-PRODUCT-STATUS-FACE.md](../engineering/evidence/WF-P1-01-PRODUCT-STATUS-FACE.md) |
| WF-P1-02 | [../engineering/evidence/WF-P1-02-EXECUTE-HONESTY.md](../engineering/evidence/WF-P1-02-EXECUTE-HONESTY.md)         |
| WF-P1-03 | [../engineering/evidence/WF-P1-03-DAILY-PATH.md](../engineering/evidence/WF-P1-03-DAILY-PATH.md)                   |
| WF-P1-04 | [../engineering/evidence/WF-P1-04-PROJECTS-BRIDGE.md](../engineering/evidence/WF-P1-04-PROJECTS-BRIDGE.md)         |

## Phase 2 — Production Readiness

| ID       | Evidence                                                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| WF-PR-01 | [../engineering/evidence/WF-PR-01-WORKFLOW-POSTGRES.md](../engineering/evidence/WF-PR-01-WORKFLOW-POSTGRES.md)                       |
| WF-PR-02 | [../engineering/evidence/WF-PR-02-BUSINESS-PROCESS-FAIL-CLOSED.md](../engineering/evidence/WF-PR-02-BUSINESS-PROCESS-FAIL-CLOSED.md) |
| WF-PR-03 | [../engineering/evidence/WF-PR-03-MIGRATION-VERIFICATION.md](../engineering/evidence/WF-PR-03-MIGRATION-VERIFICATION.md)             |
| WF-PR-04 | [../engineering/evidence/WF-PR-04-RUNTIME-DISPOSITION.md](../engineering/evidence/WF-PR-04-RUNTIME-DISPOSITION.md)                   |
| WF-PR-05 | [../engineering/evidence/WF-PR-05-API-AUTHZ.md](../engineering/evidence/WF-PR-05-API-AUTHZ.md)                                       |
| WF-PR-06 | [../engineering/evidence/WF-PR-06-OPS-READINESS.md](../engineering/evidence/WF-PR-06-OPS-READINESS.md)                               |

## Phase 3 — Hardening

| ID    | Evidence                                                                                               |
| ----- | ------------------------------------------------------------------------------------------------------ |
| WF-H1 | [../engineering/evidence/WF-H1-PRODUCT-JOURNEYS.md](../engineering/evidence/WF-H1-PRODUCT-JOURNEYS.md) |
| WF-H2 | [../engineering/evidence/WF-H2-ACCESSIBILITY.md](../engineering/evidence/WF-H2-ACCESSIBILITY.md)       |
| WF-H3 | [../engineering/evidence/WF-H3-PERFORMANCE.md](../engineering/evidence/WF-H3-PERFORMANCE.md)           |
| WF-H4 | [../engineering/evidence/WF-H4-SECURITY.md](../engineering/evidence/WF-H4-SECURITY.md)                 |
| WF-H5 | [../engineering/evidence/WF-H5-OPERATIONAL.md](../engineering/evidence/WF-H5-OPERATIONAL.md)           |

## Automated verification (20260808)

- Unit: permissions, definition honesty, bootstrap durability, store fail-closed, authz helper — **PASS**
- Playwright: `apz-workflow-v10-hardening.spec.ts` — **4/4 PASS**
- Migrations: `apzhub` + `apzhub_test` — **PASS**
