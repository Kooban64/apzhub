# Intent vs Execution Analysis — APZ Workflow

| Field     | Value                                                                        |
| --------- | ---------------------------------------------------------------------------- |
| Slice     | N-01                                                                         |
| Status    | **COMPLETE**                                                                 |
| Timestamp | 20260805T163000Z                                                             |
| Board     | [../PRODUCT-BOARD-INTENT-PRINCIPLE.md](../PRODUCT-BOARD-INTENT-PRINCIPLE.md) |

## Principle under test

> A workflow describes what the business intends to happen. It does not prescribe how technology makes it happen.

## Evidence

| Surface                | Dominant question answered | Verdict    |
| ---------------------- | -------------------------- | ---------- |
| Runtime: Runs          | What ran / is running?     | Execution  |
| Runtime: Schedules     | When does it run?          | Execution  |
| Runtime: Capabilities  | What can the provider do?  | Execution  |
| Engine workbench       | How do we connect/operate? | Execution  |
| SoR: Versions/Validate | How is definition stored?  | Mixed      |
| Business journey home  | What should happen?        | **Absent** |

## Workflow Test spot-check

| Label in UI today   | Passes Workflow Test? |
| ------------------- | --------------------- |
| Definitions         | No (software noun)    |
| Runs                | No                    |
| Schedules / Cron    | No                    |
| Workflow Engine     | No                    |
| Employee onboarding | Not present           |
| Project approval    | Not present           |

## Conclusion

**GAPS IDENTIFIED.** Product chrome currently teaches execution. Native Adoption must invert the mental model without becoming an automation console in disguise.
