# Deviation Register — APZQEP-ENG-100D

| ID          | Deviation                                                                | Disposition                                                                                                         |
| ----------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| DEV-100D-01 | HTTP handlers under `apps/web/app/...` not `apps/web/src/app/...`        | **Accepted** — matches all frozen QEP APIs; documented IRR-01                                                       |
| DEV-100D-02 | `GET …/steps` projects DTO steps (no dedicated Application query)        | **Accepted** — IRR-02; Eng Spec route satisfied without Application redesign                                        |
| DEV-100D-03 | Optional `EvidenceAccessPort` wired into Application `associateEvidence` | **Accepted** — IRR-03; OES PART-04 security requirement                                                             |
| DEV-100D-04 | Package-local outbox/audit tables                                        | **Accepted** — IRR-05/06; Application ports require same-UoW persistence; aligns with Requirements audit convention |

No Architecture or Engineering Specification conflicts requiring Owner stop.
