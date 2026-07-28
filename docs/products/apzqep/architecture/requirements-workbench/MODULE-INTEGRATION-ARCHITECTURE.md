# Module Integration Architecture — APZQEP-ARCH-006

> Companion extract. Authoritative detail: [REQUIREMENTS-WORKBENCH-ARCHITECTURE.md](./REQUIREMENTS-WORKBENCH-ARCHITECTURE.md) §15.

## Extension points

| Slot | Contribution |
| --- | --- |
| Sidebar | Module navigation entries |
| Explorer providers | Trees / saved views |
| Editors | Main tab types |
| Inspectors | Selection inspectors |
| Search providers | Platform Search (020) |
| Commands | Command Palette (019) |
| Comparison providers | Diff views |
| Status contributions | Status bar items |

## Future modules

Traceability, Verification, Test Specifications, Test Cases, Execution, Evidence, and Certification **must** reuse this Workbench grammar. They consume Relationships via Platform Services; they must not create private Requirement graphs.

## Forbidden

Parallel shells; hardcoded module lists in shell; UI-authoritative security; module-owned notification subsystems.
