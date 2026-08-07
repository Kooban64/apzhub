# System of Record Boundary Validation — APZ Workflow

| Field       | Value                                                                          |
| ----------- | ------------------------------------------------------------------------------ |
| Slice       | N-01                                                                           |
| Status      | **COMPLETE**                                                                   |
| Timestamp   | 20260805T163000Z                                                               |
| Mission SoR | [../../apzworkflow/SYSTEM-OF-RECORD.md](../../apzworkflow/SYSTEM-OF-RECORD.md) |

## Expected SoR (mission)

APZ Workflow owns **process definition, governance, and visualisation of business intent**.  
It does **not** own project plans, tickets, time records, documents, or quality decisions.

## Observed

| Domain                                | Owner today (UX)                   | Boundary risk                                    |
| ------------------------------------- | ---------------------------------- | ------------------------------------------------ |
| Process definitions                   | Split: `/workflow` vs `/workflows` | Users cannot tell which plane is authoritative   |
| Execution/runtime                     | `/workflow` + engine               | Execution presented as peer product identity     |
| Engine admin                          | `/workflow-engine`                 | Should not be a product SoR surface              |
| Projects / Support / Time / Documents | Separate RI products               | Little journey linkage — glue gap, not SoR theft |

## Result

**GAPS IDENTIFIED** — not because Workflow steals foreign SoRs, but because **its own SoR is fragmented across three planes**, and execution is elevated to product parity with intent.
