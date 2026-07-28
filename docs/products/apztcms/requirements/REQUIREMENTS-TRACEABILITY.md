# APZ TCMS — Requirements Traceability Matrix

> **Programme:** APZTCMS-REQ-001  
> **Note:** Definition / Architecture / Test columns are **TBD** until later programmes. Status at Requirements Approval.

| Requirement ID  | Source       | Priority | Risk  | Definition ref | Architecture ref | Test ref | Status      |
| --------------- | ------------ | -------- | ----- | -------------- | ---------------- | -------- | ----------- |
| BR-001…BR-017   | Business     | mixed    | mixed | TBD (DEF-001)  | TBD              | TBD      | IN_BASELINE |
| SR-001…SR-014   | Stakeholders | mixed    | mixed | TBD            | TBD              | TBD      | IN_BASELINE |
| FR-001…FR-030   | Functional   | mixed    | mixed | TBD            | TBD              | TBD      | IN_BASELINE |
| UX-001…UX-007   | UX           | mixed    | mixed | TBD            | TBD              | TBD      | IN_BASELINE |
| NFR-001…NFR-015 | NFR          | mixed    | mixed | TBD            | TBD              | TBD      | IN_BASELINE |
| RR-001…RR-010   | Compliance   | mixed    | mixed | TBD            | TBD              | TBD      | IN_BASELINE |
| AIR-001…AIR-013 | AI           | mixed    | mixed | TBD            | TBD              | TBD      | IN_BASELINE |
| IR-001…IR-018   | Integration  | mixed    | mixed | TBD            | TBD              | TBD      | IN_BASELINE |
| CR-001…CR-011   | Commercial   | mixed    | mixed | TBD            | TBD              | TBD      | IN_BASELINE |

## Key P0 anchors (non-exhaustive)

| Requirement ID                | Links to                                             |
| ----------------------------- | ---------------------------------------------------- |
| BR-001 Native SoR             | FR-001…FR-012 · IR-018 excluded · CR-001             |
| BR-005 Certification/evidence | FR-011 · FR-012 · FR-027 · RR-007 · RR-008 · AIR-009 |
| BR-016 Layering               | All IR-* · FR-022                                    |
| SR-008 Release Manager        | FR-010 · FR-012 · FR-026                             |
| SR-011 Auditor                | FR-020 · RR-007 · NFR-008                            |
| AIR-009 Human gates           | FR-012 · FR-025                                      |
| IR-001 Identity               | UX-002 · FR-024 · NFR-007                            |

## Conflicts review

| Topic                 | Resolution                                                    |
| --------------------- | ------------------------------------------------------------- |
| AI vs certification   | AIR-009 / FR-012: AI never auto-certifies                     |
| CI admin vs TCMS      | BR-006 / FR-030 / IR-012–013: metadata not full admin console |
| Kiwi                  | IR-018 / BR-001: native SoR; Kiwi out of scope                |
| Workflow execute      | FR-017 / IR-004: gated on Platform unlock                     |
| Historical 1.0.0 PRWL | BR-017: context only; baseline may exceed with P1–P3          |

No unresolved conflicting requirements identified in this baseline.
