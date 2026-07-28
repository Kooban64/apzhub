# Release Notes — APZ QEP Verification Capability 1.0.0

| Field               | Value                                 |
| ------------------- | ------------------------------------- |
| Package             | `@apzhub/qep-verification` **1.0.0**  |
| Programme           | APZQEP-CERT-040D                      |
| Certification class | **PRODUCTION_READY_WITH_LIMITATIONS** |
| Date                | 2026-07-26                            |

## What's included

- Verification domain aggregate, lifecycle, policies, history, supersession
- Persistence (migrations **0081** / **0082**), REST `/api/v1/qep/verifications/*`
- Permissions, audit, search projection `verification_record`, observability
- Verification Workbench: Explorer, Queues, Dashboard, Inspector, Timeline, History, Search, Decision workflow
- Server-authoritative `availableActions`
- Presentation route/nav contracts under `/workspace/qep/verification/*`

## What's not included (by design)

Evidence · Coverage · Impact · Certification Engine · AI · MCP

## Upgrade from 0.3.0

No breaking public API changes. SemVer major marks capability certification baseline.
