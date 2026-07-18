# APZHUB APZ TCMS — Release State Machine

**Milestone:** APZTCMS-014

## States

| State                    | Notes                                     |
| ------------------------ | ----------------------------------------- |
| `draft`                  | Initial                                   |
| `planning`               | Metadata / scope / evidence assembly      |
| `ready_for_review`       | Submitted for review                      |
| `ready_for_approval`     | Submitted for approval                    |
| `approved`               | Human approved                            |
| `conditionally_approved` | Human conditional approve                 |
| `rejected`               | Human rejected                            |
| `withdrawn`              | Withdrawn from process                    |
| `superseded`             | Replaced by another release               |
| `archived`               | Terminal archive (restorable to planning) |

## Allowed transitions

| From                   | To                                         |
| ---------------------- | ------------------------------------------ |
| draft                  | planning, archived                         |
| planning               | ready_for_review, archived                 |
| ready_for_review       | ready_for_approval                         |
| ready_for_approval     | approved, conditionally_approved, rejected |
| approved               | superseded, archived, withdrawn            |
| conditionally_approved | superseded, archived, withdrawn            |
| rejected               | withdrawn, archived, planning              |
| withdrawn              | archived, planning                         |
| superseded             | archived                                   |
| archived               | planning (restore)                         |

Illegal transitions throw `DomainRuleError`. No direct status mutation outside the state machine.
