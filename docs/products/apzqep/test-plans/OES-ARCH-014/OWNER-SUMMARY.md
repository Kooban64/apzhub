# Owner Summary — APZQEP-ARCH-014

## Decision status

**ACCEPTED / APPROVED / ARCHITECTURE BASELINED / PROGRAMME CLOSED** — see [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md) for the recorded Owner Architecture Review (2026-07-28).

## What was delivered

An architecture-only Workbench pack defining, for the Test Plans capability:

- Shell placement (Activity Bar **APZ QEP**, Sidebar **Test Plans**), base route `/workspace/qep/test-plans`, deep links, and session restore (ids + UI state only)
- Dashboard widgets, Explorer, Review queue, and Search surfaces
- Plan Inspector panel structure: Summary, Metadata, Items/Linked Specifications, Relationships, History, Versions, Audit
- Edit Draft form and an action surface driven **exclusively** by server `availableActions`
- Dialogs mapped 1:1 to the certified Infrastructure action catalogue
- Governed unavailable slots (Execution console, Spec editor embed, and — pending Infrastructure limitation **L-01** — Version Compare, with an honest forward-compatible presentation contract)
- Persona journeys for Viewer, Tester, Lead, and QA Manager mapped to certified statuses and discrete lifecycle action endpoints
- Performance (pageSize ≤ 50, virtualisation SHOULD), WCAG AA accessibility, security (no client-invented grants), observability (UI telemetry events), and AI/MCP boundaries (no approve bypass)

## What was deliberately not delivered

No React components · no Next.js pages/routes · no hooks/stores/REST clients · no Domain changes · no Infrastructure changes · no database/migrations · no search engine implementation · no permissions enforcement code · no AI · no MCP · no Workbench Engineering authorisation.

## Why this programme was undertaken now

1. Test Plans Infrastructure is **CERTIFIED** (APZQEP-CERT-060B, 2026-07-28) at **INFRASTRUCTURE_PRODUCTION_READY_WITH_LIMITATIONS**, and the Owner Certification Decision explicitly **authorised preparation of APZQEP-ARCH-014**.
2. Continuing the proven APZOR cadence (Architecture → OES Acceptance → Engineering → ECR → Owner Acceptance → Certification) established for Test Specifications (ARCH-012) and the Test Plans Domain/Infrastructure streams.
3. Removes implementation ambiguity before any Workbench Engineering programme begins.
4. Honestly represents the two recorded Infrastructure limitations (L-01 deferred Compare; L-02 items-on-DTO variance) rather than silently working around them.

## What Owner Acceptance authorised

Architecture baseline only. Workbench Engineering required a **separate Owner Instruction**, which was issued as part of this Acceptance: preparation of **APZQEP-OES-ENG-070A** — Test Plans Workbench Engineering Specification — [canonical pack](../OES-ENG-070A/README.md), now **IMPLEMENTED / AWAITING OWNER ACCEPTANCE**.

## Programme status

```text
APZQEP-ARCH-014
ACCEPTED
APPROVED
ARCHITECTURE BASELINED
PROGRAMME CLOSED
```
