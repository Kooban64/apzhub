# Gap Register — Unified Work Experience Validation

| Field     | Value                            |
| --------- | -------------------------------- |
| Programme | APZHUB-CAPABILITY-001-VALIDATION |
| Status    | **COMPLETE** (Owner closed)      |
| Timestamp | 20260805T103000Z                 |

## Classification legend

| Class                    | Meaning                                                      |
| ------------------------ | ------------------------------------------------------------ |
| **Portfolio capability** | Belongs to Unified Work Experience / platform coordination   |
| **Product capability**   | Belongs inside an owning product’s mission                   |
| **Operational process**  | Solved by operating discipline, not new software             |
| **Future programme**     | Separate Owner Auth (product mission, other Horizon 3, etc.) |

## Gaps

| ID      | Gap                                                          | Class                                                          | Severity | Notes                                                               | Action now                          |
| ------- | ------------------------------------------------------------ | -------------------------------------------------------------- | -------- | ------------------------------------------------------------------- | ----------------------------------- |
| G-UW-01 | No portfolio-level My Work aggregation surface               | Portfolio capability                                           | High     | ENG-001 delivered `/workspace/home` My Work + `GET /api/v1/my-work` | **Closed by ENG-001**               |
| G-UW-02 | Shared lifecycle projection / status mapping not implemented | Portfolio capability                                           | High     | Composer projects lifecycle; products keep native statuses          | **Addressed by ENG-001**            |
| G-UW-03 | Unified Approvals / Ready-to-release lenses not implemented  | Portfolio capability                                           | Medium   | Workflow inbox seed only; ready-to-release deferred                 | **Partial (ENG-001)**               |
| G-UW-04 | Cross-SoR work context links incomplete                      | Portfolio capability                                           | Medium   | Cards carry href + product ref; deep context deferred               | **Partial (ENG-001)**               |
| G-UW-05 | Work-first navigation not primary entry                      | Portfolio capability                                           | Medium   | Activity Bar label My Work; landing is composition surface          | **Addressed by ENG-001**            |
| G-UW-06 | Role lenses (Exec/Manager/…) not implemented                 | Portfolio capability                                           | Low      | Definition only                                                     | Deferred (post ENG-001)             |
| G-UW-07 | Document Review has no adopted Documents RI                  | Future programme                                               | Medium   | APZ Documents awaiting portfolio priority                           | Record only                         |
| G-UW-08 | Risk as first-class work lacks clear SoR                     | Future programme / Product capability                          | Low      | May sit in Projects/Support until Risk programme                    | Record only                         |
| G-UW-09 | Operational Decision (non-APZQEP) lacks single SoR           | Future programme / Operational process                         | Low      | Capture in owning artefact for now                                  | Record only                         |
| G-UW-10 | Attention → My Work feed not wired as unified experience     | Portfolio capability                                           | Medium   | Attention framework exists; product UX later                        | Deferred (post ENG-001)             |
| G-UW-11 | Projects “My Work” is product-local today                    | Product capability (retain) + Portfolio capability (aggregate) | Medium   | Product surface retained; portfolio aggregates                      | **Retained + aggregated (ENG-001)** |

## Explicitly not gaps

| Topic                                          | Why not a gap                                       |
| ---------------------------------------------- | --------------------------------------------------- |
| Product ownership for Task/Ticket/Time/Quality | Validated — unique owners                           |
| Second SoR for those entities                  | Not required if engineering follows projection rule |
| Native identity for RI products                | Already proven (N-02)                               |
| Engine branding                                | Already constrained by Native Adoption              |

## Rule

Portfolio gaps listed as **Promoted → ENG-001** are authorised under [OWNER-RESOLUTION.md](./OWNER-RESOLUTION.md). Future-programme and deferred gaps remain unimplemented until separate Owner Auth.
