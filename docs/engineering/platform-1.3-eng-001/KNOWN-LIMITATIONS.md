# Known Limitations — after Platform-1.3-ENG-001

---

## PL12-KL-01 — CLOSED

| Field        | Value                                                                                                                                                               |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Was**      | Search composition hooks / live Meilisearch drain not wired for Time/Law                                                                                            |
| **Now**      | **CLOSED** — Time + Law composition wired; journal drain live when `APZHUB_SEARCH_ORCHESTRATION_ENABLED=true`; optional Meilisearch mirror when endpoint configured |
| **Evidence** | This programme pack · unit tests · env docs                                                                                                                         |

---

## Residual honesty (not KL-01)

| ID          | Limitation                                 | Notes                                                             |
| ----------- | ------------------------------------------ | ----------------------------------------------------------------- |
| ENG001-R-01 | Orchestration deny-by-default              | Ops must enable flag after capacity check                         |
| ENG001-R-02 | Meilisearch mirror best-effort             | Mirror failures do not fail product mutations or journal success  |
| ENG001-R-03 | Projects / Support / Documents composition | Not activated in this programme (Time/Law only per epic)          |
| ENG001-R-04 | Background scheduler                       | Microtask + admin drain; dedicated worker still future (016 debt) |
| ENG001-R-05 | Law knowledge articles                     | Not wired in this programme (matter/client/document/task only)    |

---

## Unchanged Platform STOP / other KLs

Email SoR · FIN-001 · Workflow Execute · PL12-KL-02 Observe live · Support realtime · Notify delivery providers remain open under other programmes.
