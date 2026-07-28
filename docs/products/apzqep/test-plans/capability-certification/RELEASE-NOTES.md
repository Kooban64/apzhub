# Release Notes — APZ QEP Test Plans Capability 1.0.0

> **PUBLISHED.** APZQEP-CERT-080A is **CERTIFIED / APPROVED / CLOSED**; Version Promotion to **1.0.0** is **APPLIED**; APZQEP-FREEZE-080A is **FROZEN / APPROVED / CLOSED**. `@apzhub/qep-test-plans` is **1.0.0 CERTIFIED / FROZEN / BASELINE ESTABLISHED**.

| Field               | Value                                                          |
| ------------------- | -------------------------------------------------------------- |
| Package             | `@apzhub/qep-test-plans` **1.0.0 CERTIFIED / FROZEN**          |
| Programme           | APZQEP-CERT-080A (Certification) · APZQEP-FREEZE-080A (Freeze) |
| Certification class | **PRODUCTION_READY_WITH_LIMITATIONS**                          |
| Date                | 2026-07-28                                                     |

## What's included

- Test Plan domain aggregate, lifecycle (Draft → Submitted → Approved/Rejected → Ready → In Execution → Completed → Archived, plus Cancel/Clone/Supersede), policies, history
- Persistence (migrations **0085** / **0086**), REST `/api/v1/qep/plans/*`
- Permissions (`qep.plan.*`), audit, search hooks, observability
- Test Plans Workbench: Dashboard, Explorer, Review queue, Search, Inspector (Summary, Metadata, Items, Relationships, History, Versions), Create/Edit Draft, `availableActions`-only Action Bar (19 actions) and dialogs (`updateMetadata`, `transferOwnership`, `updateAssignment`, `updateSchedule`)
- Server-authoritative `availableActions` end-to-end (Domain → Infrastructure → Workbench) — binding invariant honoured throughout
- Presentation route/nav contracts under `/workspace/qep/test-plans/*`

## What's not included (by design)

Version comparison / diff (**L-01**, deferred) · dedicated items endpoint (**L-02**, items served on the Plan DTO) · Evidence · Coverage · Impact · Certification Engine integration · AI · MCP · named saved views (**P-04**, URL/session persistence only)

## Upgrade from 0.2.0

No breaking public API changes. SemVer major marks the integrated capability certification baseline. Domain/Infrastructure/Workbench markers unified at **1.0.0** upon Owner-authorised promotion.

## Status

**PUBLISHED / FROZEN.** See [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md) for the Owner Certification Decision and [../freeze/OWNER-FREEZE-DECISION.md](../freeze/OWNER-FREEZE-DECISION.md) for the Owner Freeze Decision. No further releases are authorised under existing identifiers; future work requires a new Owner-authorised programme.
