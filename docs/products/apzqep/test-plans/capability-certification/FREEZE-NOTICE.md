# Freeze Notice — Test Plans Capability 1.0.0

> **FROZEN** — Owner Freeze Decision 2026-07-28  
> Decision: [../freeze/OWNER-FREEZE-DECISION.md](../freeze/OWNER-FREEZE-DECISION.md)  
> Evidence: `20260728T092059Z-APZQEP-TEST-PLANS-1.0.0-FREEZE.json`

## Binding freeze scope

| Surface | Freeze rule |
| ------- | ----------- |
| Test Plans Domain | No uncontrolled changes |
| Test Plans Infrastructure | No uncontrolled changes |
| Test Plans Workbench | No uncontrolled changes |
| Public REST APIs (`/api/v1/qep/plans/*`) | No breaking / behavioural contract changes without new programme |
| Contracts (`@apzhub/qep-contracts` Test Plan types) | Frozen public contract |
| Domain events | Catalogue frozen |

## Patch line

**1.0.x** — defect fixes / security / errata only under new Owner Instruction.

## Recorded limitations (accepted in baseline)

L-01 · L-02 · L-03 · P-01 · P-02 · P-03 · P-04 — see [KNOWN-LIMITATIONS.md](./KNOWN-LIMITATIONS.md).

## Explicitly not frozen as part of this capability

Test Execution · Test Runs · Evidence · Defects · Reporting · AI · MCP — separate future programmes.

## Status

```text
@apzhub/qep-test-plans
1.0.0
CERTIFIED
FROZEN
BASELINE ESTABLISHED
```
