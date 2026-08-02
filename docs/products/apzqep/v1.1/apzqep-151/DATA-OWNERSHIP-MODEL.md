# Data Ownership Model

| Domain                                            | Authoritative owner                                                          |
| ------------------------------------------------- | ---------------------------------------------------------------------------- |
| Suites                                            | Capability A (`qep_suite`)                                                   |
| Execution plans                                   | Capability B (`qep_execution_plan`)                                          |
| Execution sessions and results                    | Capability C (`qep_execution_session`)                                       |
| Defects                                           | Capability D (`qep_defect`)                                                  |
| Requirements and explicit requirement-suite links | Capability E (`qep_enterprise_requirement`)                                  |
| Derived coverage and traceability                 | Capability E, calculated                                                     |
| Saved reports and reporting metadata              | Capability F (`qep_saved_report`)                                            |
| Trend samples                                     | Capability F (`qep_reporting_trend_sample`) — rebuildable analytical history |
| Derived reporting facts                           | Projection/read-model layer                                                  |
| Evidence                                          | Existing Evidence Platform                                                   |
| QKI projections                                   | Existing QKI                                                                 |
| Notifications                                     | Existing Notification Platform                                               |
| Commands                                          | Existing Command Platform                                                    |
| Idempotency keys                                  | Shared Cap table `qep_core_qe_idempotency`                                   |

No duplication of authoritative A–E facts into Cap F.
