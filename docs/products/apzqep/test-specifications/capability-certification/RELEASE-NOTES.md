# Release Notes — APZ QEP Test Specifications Capability 1.0.0

| Field               | Value                                       |
| ------------------- | ------------------------------------------- |
| Package             | `@apzhub/qep-test-specifications` **1.0.0** |
| Programme           | APZQEP-CERT-050D                            |
| Certification class | **PRODUCTION_READY_WITH_LIMITATIONS**       |
| Date                | 2026-07-27                                  |

## What's included

- Test Specification domain aggregate, lifecycle, policies, history, versions, relationships
- Persistence (migrations **0083** / **0084**), REST `/api/v1/qep/specifications/*`
- Permissions, audit, search hooks, observability
- Test Specifications Workbench: Dashboard, Explorer, Review, Search, Inspector, History, Versions, Relationships, Compare, Create/Edit, action dialogs
- Server-authoritative `availableActions` (ADR-0074 honoured)
- Presentation route/nav contracts under `/workspace/qep/test-specifications/*`

## What's not included (by design)

Evidence · Coverage · Impact · Certification Engine · AI · MCP · Rejected→Draft `returnToDraft` contract (ADR-0074 delta)

## Upgrade from 0.3.0

No breaking public API changes. SemVer major marks capability certification baseline. Domain/infra/workbench markers unified at **1.0.0**.
