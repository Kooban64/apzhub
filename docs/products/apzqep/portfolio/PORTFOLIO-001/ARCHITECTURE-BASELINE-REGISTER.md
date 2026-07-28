# Architecture Baseline Register — APZQEP-PORTFOLIO-001

Consolidated register of every accepted architecture programme underpinning the First Capability Wave. All entries are **ACCEPTED**. Cited from `docs/foundation/ACTIVE-BACKLOG.md` and each programme's own pack — no new architecture decision is made here.

| Programme               | Title                                       | Capability          | Status                                                   | Pack                                                                                                                 |
| ----------------------- | ------------------------------------------- | ------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **APZQEP-ARCH-001**     | Enterprise Architecture Baseline            | Platform-wide       | **ACCEPTED**                                             | [architecture/README.md](../../architecture/README.md)                                                               |
| **APZQEP-ARCH-005**     | Requirements Relationship Architecture      | Requirements        | **ACCEPTED / CLOSED / COMPLETE**                         | [architecture/requirements-relationship/](../../architecture/requirements-relationship/README.md)                    |
| **APZQEP-ARCH-006**     | Requirements Workbench Architecture         | Requirements        | **ACCEPTED / CLOSED / COMPLETE**                         | [architecture/requirements-workbench/](../../architecture/requirements-workbench/README.md)                          |
| **APZQEP-ARCH-007**     | Requirements Traceability Architecture      | Traceability        | **ACCEPTED / CLOSED / COMPLETE**                         | [architecture/requirements-traceability/](../../architecture/requirements-traceability/README.md)                    |
| **APZQEP-ARCH-008**     | Traceability Workbench Architecture         | Traceability        | **ACCEPTED / CLOSED / COMPLETE**                         | [architecture/traceability-workbench/](../../architecture/traceability-workbench/README.md)                          |
| **APZQEP-ARCH-009**     | Verification Capability Architecture        | Verification        | **ACCEPTED**                                             | [architecture/verification/](../../architecture/verification/README.md)                                              |
| **APZQEP-ARCH-010**     | Verification Workbench Architecture         | Verification        | **ACCEPTED / CLOSED / COMPLETE**                         | [architecture/verification-workbench/](../../architecture/verification-workbench/README.md)                          |
| **APZQEP-ARCH-011**     | Test Specifications Capability Architecture | Test Specifications | **ACCEPTED**                                             | [architecture/test-specifications/](../../architecture/test-specifications/README.md)                                |
| **APZQEP-OES-ARCH-012** | Test Specifications Workbench Architecture  | Test Specifications | **ACCEPTED / ARCHITECTURE BASELINED**                    | [OES-ARCH-012](../../../../engineering/oes/APZQEP/OES-ARCH-012-Test-Specifications-Workbench-Architecture/README.md) |
| **APZQEP-ARCH-013**     | Test Plans Capability Architecture          | Test Plans          | **ACCEPTED / ARCHITECTURE BASELINED / CLOSED**           | [test-plans/OES-ARCH-013/](../../test-plans/OES-ARCH-013/README.md)                                                  |
| **APZQEP-ARCH-014**     | Test Plans Workbench Architecture           | Test Plans          | **ACCEPTED / ARCHITECTURE BASELINED / PROGRAMME CLOSED** | [test-plans/OES-ARCH-014/](../../test-plans/OES-ARCH-014/README.md)                                                  |

## Pattern observed

Every capability in the First Capability Wave followed the same shape: a capability-level architecture programme, followed (where a distinct Workbench layer existed) by a dedicated Workbench architecture programme, both accepted before any engineering began. Test Plans is the fullest expression of this pattern (**ARCH-013** capability architecture → **ARCH-014** Workbench architecture, feeding into the layered Domain/Infrastructure/Workbench engineering that followed).

## Totals

| Metric                                                      |                                                                                           Count |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------: |
| Architecture programmes accepted                            |                                                                                              11 |
| Capabilities with a dedicated capability-level architecture |                                                                                               5 |
| Capabilities with a dedicated Workbench architecture        | 4 (Requirements, Traceability, Verification, Test Plans) + Test Specifications via OES-ARCH-012 |

## STOP

This register consolidates existing, accepted architecture baselines. No architecture decision is made or revised by this document.
