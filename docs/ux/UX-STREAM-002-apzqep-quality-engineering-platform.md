# APZQEP — Complete UI/UX Build Specification

## Stream 2 — Quality Engineering Platform

| Field             | Value                                                                                                                                                     |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Document          | **UX-STREAM-002**                                                                                                                                         |
| Status            | **FROZEN SPEC · EXECUTION ORDER PENDING** — 2026-08-16                                                                                                    |
| Kind              | Authenticated APZQEP application UI/UX (screen-level)                                                                                                     |
| Product question  | **Can we release this software with confidence, and what evidence supports that conclusion?**                                                             |
| Architecture      | Reuse existing APZQEP / Platform Services / connectors — **do not reinvent architecture**                                                                 |
| Shared capability | [APZ Source Workspace](./UX-SHARED-SOURCE-WORKSPACE.md) — full professional source UX; QEP overlays quality context                                       |
| Complements       | [APZQEP vision](../strategy/APZQEP-ENTERPRISE-QUALITY-ENGINEERING-PLATFORM.md) · Product status / RCC / evidence packs already delivered                  |
| Sibling streams   | [UX-STREAM-001](./UX-STREAM-001-public-commercial-journey.md) · [UX-STREAM-003](./UX-STREAM-003-apzpen-security-assurance.md) · Stream 4 APZPRD (pending) |
| Owner note        | Collect all streams, then decide serial vs parallel execution                                                                                             |

### Locked design inputs (Owner — 2026-08-16)

1. **Cursor-quality UI/UX benchmark** — resizable panes, tree explorers, tabs, keyboard-first, command palette, contextual sidebars, dense professional workspaces, stay in one environment.
2. **Source is not merely read-only quality context.** With permission: full repository tree, branches, files, code search, diffs, blame/history, commits, PRs, and controlled edit/commit/branch/PR. Provider-neutral (GitHub initially; GitLab/Bitbucket/self-hosted later). Do not force QEP users into GitHub native UI for common work.

**Final instruction (Owner):** Do not design APZQEP as a test-management application with modules bolted on. Design every screen around one connected Quality Engineering model. Providers stay subordinate. Every status must be traceable to evidence. Release Certification is the culmination of the system.

---

## 1. Build Objective

Build APZQEP as an **Enterprise Quality Engineering Platform**, not a conventional test-management application.

Connected lifecycle:

```text
Requirement → Engineering Change → Source Code → Build → Verification
  → Evidence → Defect / Risk → Release Readiness → Certification → Production Learning
```

Testing is a major capability. It is not the whole product.

---

## 2. Fundamental UX Rule

Never make users navigate by underlying tools.

Organise around work:

```text
Home · My Work · Requirements · Coverage · Tests · Executions · Automation
Code · Repositories · Pull Requests · Defects · Evidence · Releases
Certification · Insights
```

Not primary nav: GitHub · Sonar · Playwright · ZAP · k6. Provider identity may appear inside technical evidence.

---

## 3. APZQEP Application Shell

Use existing APZ Workbench patterns. Collapsible sidebar. **Do not create a second unrelated shell for QEP.**

Conceptual layout: product header (APZ · Quality · search · notifications · help · persona) + grouped sidebar (Home / My Work · REQUIREMENTS · QUALITY · ENGINEERING · ASSURANCE · Insights) + current screen.

---

## 4. Product Switcher

Top-left: **APZ | Quality** → entitled products only (Quality / Productivity / Security). No second login on switch.

---

## 5. Project Context

Most work is project-scoped. Sticky context e.g. `APZSign · Release 2.8.0 · RC3`. Remember last project. Do not force re-select on every screen.

---

## 6–8. Home · Persona-aware · My Work

`/quality/home` — **What requires my attention?** Release readiness summary + My Work + recent quality events.

Persona prioritisation (same components, different ranking): QA Engineer · Developer · QA Lead · Release Manager · Executive.

`/quality/my-work` — All | Tests | Defects | Reviews | Approvals. Row → object.

---

## 9–12. Requirements · Detail · Traceability · Coverage

List with search/filters/create. Status never colour-only.

Detail tabs: Overview · Acceptance Criteria · Coverage · Code · Tests · Defects · Evidence · History.

Traceability is primary: implementation (issue/PR/commits/files) · verification (manual/auto/security/a11y) · evidence count.

`/quality/coverage` — by priority + **Coverage Gaps** with remediation links.

---

## 13–19. Tests · Plans · Execution · Exploratory

Modern split test repository (structure | cases), resizable panels — not dated TCMS UI.

Test detail: Steps · Automation · Requirements · Executions · Defects · Evidence · History. Document-like editing.

Test types as **metadata** (manual, automated, hybrid, exploratory, smoke, …) — one system.

Plans with suites/execution/defects/evidence.

**Manual execution must be excellent:** step focus, PASS/FAIL/BLOCKED/SKIP, evidence attach, keyboard shortcuts, autosave. FAIL opens contextual defect create with prepopulated context.

Exploratory sessions: charter, timer, notes, findings, defects, capture.

---

## 20–23. Automation Centre

Health summary + provider health (engineering context OK). Executions table → provider execution detail (Playwright: failures first, screenshot/video/trace/logs, linked requirement, create defect).

Flaky management: rates, assign, suppress with justification, link defect, resolve — never silent ignore.

---

## 24–29. Code · Repositories · Shared Source Workspace · PRs · Quality

Repositories list → overview (PRs, gate, coverage, security).

**Source:** consume [APZ Shared Source Workspace](./UX-SHARED-SOURCE-WORKSPACE.md) — **not** a QEP-owned read-only browser. With permission: full Cursor-style explorer/editor/search/diff/blame/commits/PRs and controlled write (branch/edit/commit/PR). Provider-neutral. Quality context overlay (requirements, tests, defects, findings, last PR).

PR list + **PR Quality View** (signature): risk, quality impact, verification matrix, APZQEP assessment.

Code quality consolidation with provider attribution on drill-down.

---

## 30–32. Defects · Retest

My / All / Critical / Retest / Closed. Detail with engineering links. Retest compares original vs current; history immutable.

---

## 33–34. Evidence Centre

First-class destination. Filters · integrity · relationships. Certification-bound evidence cannot simply disappear.

---

## 35. Quality Graph

Object-centred relationship explorer (not decorative). List/table alternative for a11y.

---

## 36–38. Security · Performance · Accessibility domains

Security is a **release quality signal** — does not replace APZPEN. Open in APZPEN when entitled; otherwise show provider evidence without pretending PEN exists.

Performance vs baseline with clear regressions. Accessibility WCAG-oriented counts mapped to pages/criteria where possible.

---

## 39–44. Releases · Control Centre · Gates · Certification · Pack

Release list/cards. **Release Control Centre = flagship:** readiness %, domain matrix, approvals, Review for Certification.

Quality gates with explicit failure reasons.

Certification is multi-step (scope → gates → exceptions → evidence → decision): CERTIFY · CERTIFY WITH CONDITIONS · REJECT. Comment required for conditional/reject. Immutable record. Generate Evidence Pack for governance/audit.

---

## 45–46. Insights · Portfolio

Actionable indicators that drill into records. Portfolio quality for authorised executives (leave project context).

---

## 47–49. Search · Quick Actions · Notifications

Permission-filtered global search grouped by type. `Ctrl/Cmd+Shift+A` permission-filtered actions. Notifications deep-link to objects.

---

## 50–54. Administration

Projects · Users & Access · Repositories · Providers · Environments · Test Config · Gates · Evidence/Certification policy · Integrations · Audit.

Provider admin + GitHub connect/select/map flow (secure provider auth — no arbitrary credential paste). Provider health with freshness; never silent stale-as-current. Environments bound to executions/evidence.

---

## 55–56. Permissions · Role templates

Capability permissions (`quality.*`). Templates: QA Engineer · Developer · QA Lead · Release Manager · Auditor · Administrator — templates, not hard architecture limits.

---

## 57–58. Mobile · Tablet execution

Mobile: My Work, notifications, approvals, defect/result/release review — not full workstation. Tablet-optimised manual execution.

---

## 59–64. Empty · Freshness · No false green · Audit · Hierarchy · Surface patterns

Instructive empty states. Provider status freshness; UNKNOWN when stale; fail closed for certification where policy requires.

**No false green:** PASS · FAIL · WARNING · BLOCKED · UNKNOWN · NOT APPLICABLE — never “no data” → PASS.

Audit events for significant quality actions. Status components: meaning not colour-only. Page / Drawer / Dialog usage rules.

---

## 65–66. Cross-product

APZPEN when licensed: security assurance deep link. Without PEN: QEP still works.

APZPRD Projects when present: link delivery work — value without forced bundling.

---

## 67–68. Quality Intelligence (reserved)

Subtle, evidence-backed recommendations. AI must **never** autonomously certify, approve requirements, close defects, alter/waive evidence or gates, or manufacture evidence.

---

## 69–72. Onboarding · First useful moment · Import · Entitlements

Setup checklist with skip/defaults. Optimise for **First Quality Picture** via GitHub + CI evidence — do not force mass manual test entry first.

Controlled CSV import (later provider migration). Entitlement service gates capabilities; no broken controls; quiet upgrade prompts.

---

## 73. Design character

Technical without being intimidating. Dense without clutter. Evidence-driven without bureaucracy. Strong tables, resizable panels, filters, drill-downs, timelines, evidence previews, relationship views. Avoid endless colourful cards, giant widgets, gamification, excessive illustrations.

---

## 74. Signature experiences

**Disproportionate UX attention on six signatures** (plus shared Source Workspace as platform capability):

1. QEP Home
2. Test Execution
3. Pull Request Quality
4. Quality Graph
5. Evidence Centre
6. Release Control Centre

Source editing/browse for QEP users is delivered via the **shared** Source Workspace — not a seventh product-owned code browser.

---

## 75–76. End-to-end scenario · What QEP must not become

BA → Dev PR → QEP impact → CI evidence → QA manual/exploratory → defect → fix → retest → RCC → gates → CERTIFIED → pack — without spreadsheets or ten-dashboard reconciliation.

Must **not** become: Kiwi/TestRail/Jira/GitHub/IDE/CI/Sonar/pen-test platform/dashboard-only/AI toy. Those contribute; QEP connects them.

---

## 77. Definition of Done — Stream 2

Design/implementation supports:

```text
REQUIREMENT → SOURCE → PR → TEST → AUTOMATION → EXECUTION
  → DEFECT → REMEDIATION → RETEST → EVIDENCE → RELEASE → CERTIFICATION
```

And each actor can answer:

| User            | APZQEP must answer                        |
| --------------- | ----------------------------------------- |
| Developer       | What quality impact did my change create? |
| QA Engineer     | What needs testing?                       |
| QA Lead         | Where are the quality gaps?               |
| Product Owner   | Have the requirements been verified?      |
| Release Manager | Can we release?                           |
| Auditor         | Show me the evidence.                     |
| Executive       | How healthy is our software portfolio?    |

---

## Next stream (Owner)

**Stream 3 — APZPEN UI/UX** at the same screen-by-screen level: customer/asset → authorised engagement → attack surface → source/GitHub → automated tools → human pentester workspace → findings → evidence → developer remediation → retest → security certification → customer portal/reporting.
