# Test Suite Architecture — APZQEP-140-A

## Purpose

Enterprise Test Suite Management is the authoritative product capability for creating, organising, versioning, approving, reusing, sharing, governing, and archiving enterprise test suites within APZQEP.

## Layering

```text
Suite Workspace (Presentation)
  → Suite Application Service
    → Suite Aggregate / Repository (SoR)
    → Domain Events → Event Platform (S07–S09)
      → Suite Processors → QKI (S11) · Notifications (S12)
    → Command Registry (S13)
```

## Boundaries

| Layer        | Owns                                         | Must not                       |
| ------------ | -------------------------------------------- | ------------------------------ |
| Presentation | Suite Workspace UX, HTTP client DTOs         | Business rules, engine calls   |
| Application  | Commands/queries, permissions, orchestration | Persistence details of engines |
| Domain       | Lifecycle, structure, metadata, governance   | Notifications, search, UI      |
| Platform     | Events, QKI, notify, commands                | Suite business rules           |

## Package

`@apzhub/qep-suites` — compose via `createEnterpriseTestSuiteManagement()`.

## Out of scope

Test Cases · Runs · Execution · Scheduling · Defects · Requirements · Reporting · AI · Automation.
