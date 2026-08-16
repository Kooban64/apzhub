# APZPEN — Complete UI/UX Build Specification

## Stream 3 — Penetration Testing & Security Assurance Platform

| Field             | Value                                                                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Document          | **UX-STREAM-003**                                                                                                                                       |
| Status            | **FROZEN SPEC · EXECUTION ORDER PENDING** — 2026-08-16                                                                                                  |
| Kind              | Authenticated APZPEN application UI/UX (screen-level)                                                                                                   |
| Product question  | **What security risk exists, how do we know, what was done about it, and can we prove the resulting security posture?**                                 |
| Architecture      | Reuse APZHUB services / connectors — **do not reinvent**; providers subordinate                                                                         |
| Shared capability | [APZ Source Workspace](./UX-SHARED-SOURCE-WORKSPACE.md) — consumed by QEP + PEN                                                                         |
| Complements       | [APZPEN vision](../strategy/APZPEN-ENTERPRISE-SECURITY-ASSURANCE-PLATFORM.md) · [UX-STREAM-002](./UX-STREAM-002-apzqep-quality-engineering-platform.md) |
| Sibling streams   | [UX-STREAM-001](./UX-STREAM-001-public-commercial-journey.md) · Stream 2 · Stream 4 (pending)                                                           |

### Locked before this stream (Owner)

1. **Cursor-quality UI/UX benchmark** — resizable panes, tree explorers, tabs, keyboard-first navigation, command palette, contextual sidebars, dense professional workspaces, stay-in-one-environment work.
2. **Shared Source Workspace** — not read-only context only; full professional source experience with permission-controlled write; **provider-neutral** (GitHub initially; GitLab / Bitbucket / self-hosted later). QEP and PEN overlay different context — neither owns source infrastructure.

---

## 1. Product Objective

Build APZPEN as an **Enterprise Security Assurance and Penetration Testing Platform**.

Not: vulnerability scanner · tool collection · report generator · Kali web UI · ticketing app.

Lifecycle:

```text
Organisation → Application / Asset → Repository / Source → Engagement
  → Scope & Authorisation → Attack Surface → Automated Assessment
  → Human Penetration Testing → Finding → Evidence → Remediation
  → Code Change → Retest → Security Assurance → Certification / Report
```

---

## 2. UX Character

Same APZ design system. Slightly more technical/dense than PRD.

**Do not:** black/green hacker UI · Matrix · terminal-only · aggressive red · skull aesthetics.

Think: **Cursor engineering workspace + modern AppSec + professional pentest workbench.**

---

## 3–4. Shell · Product Switcher

Sidebar groups: Home · My Work · ASSETS · ASSURANCE · RELEASE · Insights. Admin for authorised only.

Same APZ product switcher as QEP/PRD — no second login, no separate visual universe.

---

## 5–6. Security Home · Personas

`/security/home` — what requires attention (posture, overdue remediation, active engagements).

Persona prioritisation (same shell, different ranking): Pentester · Developer · Security Manager · CISO · Auditor · Customer (managed service).

---

## 7–10. Customers · Applications · Assets

Support **internal enterprise** and **security service provider** multi-customer models. Strong tenant isolation.

Applications table + detail tabs (Overview · Attack Surface · Repositories · Engagements · Findings · Remediation · Evidence · Assurance · History).

Assets beyond URLs: web · API · mobile · repos · domains · hosts · cloud · containers · infra · networks · endpoints.

---

## 11–15. Repository · Source Workspace · Finding → Source

APZ repositories (not “GitHub repositories” architecturally). Full Cursor-style workspace per [UX-SHARED-SOURCE-WORKSPACE](./UX-SHARED-SOURCE-WORKSPACE.md).

Security context panel on source. Findings navigate to file/line with explanation: what / where / why / how discovered / evidence.

---

## 16–20. Engagements · Scope · RoE · Authorisation

Engagement list/create wizard (customer → type → scope → RoE → team → schedule → authorisation → begin).

Scope explicit and history-tracked once authorised. RoE first-class. **No test execution until authorisation satisfied.** Legal/operational authorisation is a first-class object.

---

## 21–26. Engagement Workbench · Attack Surface · Testing · Human notes

**Signature:** Engagement Workbench (resizable · persistent · tabs).

Attack surface summary + discovered assets — **new discovery ≠ automatic in-scope**; require scope review.

Testing by security domain (framework mappings optional, not trap). Security tests: observe · evidence · finding · mark tested.

Human session notes with autosave; internal notes excludable from customer reports.

---

## 27–29. Tools · Normalisation

Provider-neutral tool centre for professionals only (SAST/DAST/deps/secrets/containers/infra/network categories). Normalise into APZPEN finding/evidence model; raw provider evidence retained.

---

## 30–37. Findings · Evidence · Workflow

Excellent finding detail (Description · Impact · Asset · Reproduction · Remediation · Evidence — not one giant RTE). Structured severity + audited override.

Evidence types + HTTP request/response viewer + integrity/classification (Internal · Customer · Restricted).

States: Draft → Confirmed → Reported → Accepted → Remediation → Ready for Retest → Retesting → Resolved → Risk Accepted → Closed.

---

## 38–45. Developer remediation · PR · Retest · Risk acceptance

Developer-facing finding view without full pentest system. Source-based fix via shared Source Workspace (branch · edit · commit · PR linked to finding). **Do not** force “Open GitHub to continue” for common flows.

Retest queue + side-by-side original/current · evidence required · immutable history.

Risk acceptance with reason, compensating controls, expiry, approver — never silent “fixed.”

---

## 46–54. Assurance · Certification · Reports · Customer portal

Assurance Centre (% · domains · gates). Multi-step certification: ASSURED · ASSURED WITH CONDITIONS · NOT ASSURED — not “secure.” Immutable records.

Report Centre (executive · technical · findings · retest · assurance · evidence index) from governed data.

Customer portal: customer-visible only. Collaboration comments audited; workflow remains primary.

---

## 55–58. Cross-product

QEP receives security **assurance outcome / evidence relationship** — not unrestricted PEN internals. QEP gate can BLOCK; deep-link requires permission.

APZPRD Projects for remediation delivery work. Support tickets only via policy — not every finding.

---

## 59–64. Search · Actions · Command Palette · Workspace primitives · Terminal

Permission-filtered search and quick actions. Universal command palette (`Ctrl/Cmd+Shift+P`).

Shared workspace primitives: Explorer · Editor · Context · Bottom · Tabs · Palette · Output.

Controlled engagement-scoped terminal/output for authorised professionals — **not** unrestricted shell for ordinary users.

---

## 65–66. Scope Guard · Professional tool entitlements

Out-of-scope test attempts blocked. Professional tools (Burp/scanner/source/terminal) entitlement-gated — executives get none of those.

---

## 67–71. Roles · Mobile · Platform security · Classification · Audit

Role templates map to capabilities. Mobile for review/approvals — desktop primary for source/pentest. MFA, isolation, reauth, download controls. Evidence classification. Full audit of critical actions.

---

## 72. No False Assurance

`NO DATA ≠ PASS`. States: PASS · FAIL · WARNING · BLOCKED · UNKNOWN · NOT TESTED · NOT APPLICABLE.

---

## 73–74. Onboarding · Signature experiences

Setup checklist with skip. Disproportionate effort on:

1. Application Security Posture
2. Source Security Workspace
3. Engagement Workbench
4. Finding Detail
5. Remediation Workspace
6. Retest
7. Assurance Centre

---

## 75–76. End-to-end · QEP + PEN together

Authorisation → Source → Test → Finding → Evidence → Fix → PR → Retest → Assurance — no five-dashboard reconciliation.

Share source infrastructure, identity, evidence where constitutionally appropriate. **Do not** blur security vs quality ownership.

---

## 77–78. Shared Source Workspace (mandatory)

See [UX-SHARED-SOURCE-WORKSPACE](./UX-SHARED-SOURCE-WORKSPACE.md).

**Verbatim build instruction:**

> Do not build a separate code browser for APZQEP and another for APZPEN. Build or consume the shared APZ Source Workspace. Cursor-inspired professional source experience with resizable explorer, editor, contextual panel, tabs, search, branch/diff/history and permission-controlled Git write operations. Source providers remain interchangeable. APZQEP overlays Quality context. APZPEN overlays Security context. Neither product owns source infrastructure.

---

## 79. What APZPEN must not become

Not Kali-in-browser · Burp clone · ZAP clone · defect tracker with CVSS · scanner aggregator.

APZPEN connects: **asset → source → authorised testing → human expertise → tools → finding → evidence → engineering remediation → retest → assurance.**

---

## 80. Definition of Done

| Persona          | Question                                                   |
| ---------------- | ---------------------------------------------------------- |
| Pentester        | What am I authorised to test and what have I discovered?   |
| Developer        | What must I fix and where in the source is it?             |
| AppSec           | What security weaknesses exist in our engineering estate?  |
| Security Manager | What risk remains?                                         |
| CISO             | What is our current security assurance posture?            |
| Customer         | What did the assessment find and what remains outstanding? |
| Auditor          | Prove the assessment, remediation and conclusion.          |

Continuous path: **Authorisation → Source → Test → Finding → Evidence → Fix → PR → Retest → Assurance.**

---

## Next

**Stream 4 — APZPRD** complete UI/UX (Workbench → Projects · Support · Time · Workflow · Analytics · Knowledge · Documents → unified platform chrome → admin / professional provider access).
