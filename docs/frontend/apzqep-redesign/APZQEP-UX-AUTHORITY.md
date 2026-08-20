# APZQEP UI/UX replacement — presentation authority

> **Status:** IN FORCE for presentation. Does not authorise platform redesign, QEP backend rewrite, APZPEN/APZPRD redesign, or a second QEP product.  
> **Date:** 2026-08-18  
> **Companion:** [APZQEP-CAPABILITY-MAP.md](./APZQEP-CAPABILITY-MAP.md) · [APZQEP-ROLE-MATRIX.md](./APZQEP-ROLE-MATRIX.md) · [APZQEP-REDESIGN-STATUS.md](./APZQEP-REDESIGN-STATUS.md)

This document is the **presentation authority for APZQEP**. Where existing UI conflicts with this specification: **replace the existing APZQEP UI/UX**.

## Reuse vs replace

```text
DOMAIN / BACKEND CAPABILITY     Reuse where valid.
DATA / APIs / AUTHZ             Reuse and extend where valid.
EXISTING UI / UX                Replace where this authority specifies a different experience.
NEW PARALLEL BACKEND            Do not create unless a proven capability gap requires it.
```

Do not wrap old screens in a new sidebar. Do not preserve old dashboards because they work. Do not interpret “reuse existing capability” as “reuse existing UI.”

## Product

APZQEP is the **APZ Quality Engineering Platform**. It must operate standalone (APZQEP-only customer) **or** as the Quality discipline inside the APZHUB Workbench. APZPRD, APZPEN, and APZHUB business-product access are not mandatory to use APZQEP.

APZQEP is the quality assurance system of record and engineering workbench — not merely tests, runs, defects, and automation.

Lifecycle that must become visible:

Requirement → User Story → Acceptance Criteria → Test Design → Test Planning → Manual / Exploratory / UIUX / Automated Verification → Execution → Evidence → Defects → Fix / Source Context → Retest → Traceability → Coverage → Quality Risk → Release Readiness → Release Gates → Certification → Release Evidence Pack.

## Roles (UX composition, not security bypass)

QEP Master · QEP Administrator · Quality Lead · QA Engineer · Tester · Developer · Release Owner · Auditor · Viewer.

Distinct from platform/org roles. QEP Master = complete APZQEP authority, not Platform/Tenant Admin.

Landings: Master/Lead → Quality Command Centre; Administrator → QEP Administration; QA Engineer → My Work; Tester → My Testing; Developer → Quality Feedback; Release Owner → Release Decision; Auditor → Assurance Review; Viewer → Quality Overview.

## Master information architecture

HOME (Overview, My Work) · PORTFOLIO (Applications, Releases) · DEFINE (Requirements, User Stories) · TEST (Test Cases, Test Suites, Test Plans, Test Runs) · VERIFY (Manual Execution, Exploratory, UI/UX Verification, Automation) · ASSURE (Defects, Evidence, Traceability, Coverage, Quality Risk) · ENGINEERING (Builds & CI, Source) · RELEASE ASSURANCE (Readiness, Gates, Certification) · INSIGHTS (Quality Intelligence, Reports) · ADMINISTRATION (Applications, People & Access, Teams, Roles, Environments, Release Policies, Integrations, Settings, Audit).

Navigation from effective APZQEP permissions. Hide inaccessible sections; do not grey them. Server remains authoritative.

## Shell

Regions are capabilities, not permanent empty panels: Global Header · APZ Rail · Context Sidebar · Primary Workspace · Inspector · Contextual Bottom Panel · Status Bar.

Header: `APZ │ APZQEP │ {Application} ▾ │ {Release} ▾     Search QEP...     + Create 🔔 ? User`

Rail (suite): My Work, APZPRD, APZQEP, APZPEN, Search, Notifications, Administration — entitled only. APZQEP-only customers must not see meaningless PRD/PEN entries.

Progressive workspace: lists = Rail|Sidebar|Main; inspection adds Inspector; execution adds bottom results; Source = Explorer|Editor|Related Quality; traceability = wide matrix.

## Presentation standards (normative)

- Quality Command Centre is attention-first, not KPI-card disease. Only render supported facts.
- Tables: compact, sortable, filterable, keyboard, sticky headers. Inspector on selection; Open {Object} for depth.
- Tabs: restrained underlined. Filters: compact bars. Complex objects: main canvas, not cramped modals.
- Empty / Not configured / Unavailable / Permission restricted are distinct.
- Honesty: never invent readiness, scores, coverage, health, results, evidence, builds, defects, risk, certification, AI.
- Provider names only in admin, execution/source detail, diagnostics.
- Light and dark first-class. Tokens only. Precise, dense, engineering-oriented.
- No new AI UX in this pass. No Source write/commit/PR/merge/shell/Terminal unless separately authorised.
- Mobile: task + bottom nav; Tester execution is a signature surface, not a shrunk desktop table.
- Search, notifications, activity: existing platform services.

## Implementation sequence

0 Repository reconciliation (this gate) → 1 Foundation + Master (stop) → 2 Define (stop) → 3 Test management (stop) → 4 Execution (stop) → 5 Engineering (stop) → 6 Assurance (stop) → 7 Release assurance (stop) → 8 Role experiences (stop) → 9 Administration (stop) → 10 Complete product pass.

**Owner 2026-08-20 — programme closed:** the original 0–10 sequence is historical. As executed, Phases 1–7 (Workbench through AI Quality Companion) are **CLOSED · ACCEPTED · FROZEN**. Phase 8 is **NOT REQUIRED**. Items 8–10 are not numbered continuation. See [APZQEP-PROGRAMME-CLOSURE.md](./APZQEP-PROGRAMME-CLOSURE.md).

**Owner 2026-08-20:** after Phase 4 **CLOSED · ACCEPTED**, Phase 5 visual design is **COMPLETE**, domain reconciliation is **ACCEPTED**, and the domain lock is **RECORDED**. Implementation inventory is **DRAFTED FOR OWNER REVIEW**. Implementation **NOT AUTHORISED** until that inventory is explicitly authorised. See [APZQEP-PHASE-5-DOMAIN-LOCK.md](./APZQEP-PHASE-5-DOMAIN-LOCK.md) · [APZQEP-PHASE-5-IMPLEMENTATION-INVENTORY.md](./APZQEP-PHASE-5-IMPLEMENTATION-INVENTORY.md).

Phase 2 Define is **visual-first**: Screen 1 Requirements → Screen 2 Requirement Detail → Screen 3 User Story + Acceptance Criteria → domain/migration rules → one Cursor instruction. Do not implement from a single list visual. Do not treat the Requirements inspector as Requirement Detail.

Every phase: screenshots under `docs/frontend/apzqep-redesign/evidence/`, tests for route/tenant/role/permission/deep-link/responsive/writes/honesty. Demo data only via sanctioned seed. Gaps classified; material domain changes return to Owner.

## Prohibitions

Do not create another QEP; rewrite backend without cause; preserve old UX merely because it exists; wrap old screens; invent data/health/readiness/AI/Source mappings; enable Source write or Terminal; mix Platform/Org Admin with QEP Admin; collapse platform roles into QEP roles; make APZPRD/APZPEN/APZHUB mandatory; start APZPEN/APZPRD/APZHUB redesign.

## Classification used in the capability map

```text
A — Existing backend/domain capability is suitable
B — Existing capability exists but requires adaptation
C — Required capability is genuinely absent
D — Existing presentation exists but must be replaced
```
