# Engineering Programmes — APZQEP v1.1+

Authoritative programme band structure for post-architecture engineering.  
**Supersedes** provisional IDs APZQEP-112…126 in [TECHNICAL-ROADMAP.md](./TECHNICAL-ROADMAP.md) (retained as historical planning).

**APZQEP-111** is **APPROVED**. Engineering implementation remains **not** authorised until Product Board reviews [APZQEP-120 execution planning](./apzqep-120/README.md) and issues a **per-slice** Owner directive.

Estimates: S / M / L / XL (planning bands).

---

## APZQEP-120 — Platform Foundation

| Field          | Value                                                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Title (Board)  | Platform Foundation (historically: Enterprise Core Platform)                                                             |
| Status         | **CERTIFIED · PROGRAMME COMPLETE · CLOSED** (20260802T163026Z)                                                           |
| Objective      | Event-driven enterprise runtime: Evidence, Events, Outbox, Processing, QKI, Notifications, Command Platform              |
| Delivered      | S01–S13 — [apzqep-120/APZQEP-120-PRODUCT-BOARD-CERTIFICATION.md](./apzqep-120/APZQEP-120-PRODUCT-BOARD-CERTIFICATION.md) |
| Out of scope   | Suites/Runs/Defects product domains (moved to APZQEP-140)                                                                |
| Business value | Critical — trust & platform integration                                                                                  |

> **Do not continue slices under APZQEP-120.**

---

## APZQEP-130 — Quality Engineering Core (HISTORICAL BAND)

| Field  | Value                                                                                           |
| ------ | ----------------------------------------------------------------------------------------------- |
| Status | **SUPERSEDED** — Board reassigned Core Quality Engineering to **APZQEP-140** (20260802T163026Z) |
| Note   | Retained for historical planning only. Do not open APZQEP-130.                                  |

---

## APZQEP-140 — Core Quality Engineering

| Field                | Value                                                                                                                      |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Title (Board)        | Core Quality Engineering                                                                                                   |
| Status               | **140-000 CERTIFIED** · Architecture APPROVED · READY FOR ENGINEERING                                                      |
| Objective            | User-facing QE capabilities on the closed APZQEP-120 runtime                                                               |
| Capabilities         | A Suites · B Runs · C Execution · D Defects · E Traceability · F Reporting                                                 |
| Architecture pack    | [apzqep-140/000/](./apzqep-140/000/README.md) — Board **CERTIFIED**                                                        |
| Progress             | [apzqep-140/CAPABILITY-PROGRESS.md](./apzqep-140/CAPABILITY-PROGRESS.md)                                                   |
| First impl programme | **APZQEP-140-A** Suite Management — Owner Auth Pack required                                                               |
| Historical note      | Prior planning used “140 = Executive Experience”. **Board redefinition (20260802):** 140 = Core QE. Executive UX deferred. |
| Hub                  | [apzqep-140/README.md](./apzqep-140/README.md)                                                                             |
| Dependencies         | APZQEP-120 **CLOSED**                                                                                                      |
| Business value       | High — competitive operating completeness                                                                                  |

### Former “Executive Experience” band

Role-aware dashboards / Release Readiness UX previously sketched as APZQEP-140 are **deferred** (likely under a future band or Capability D after Core QE). Not authorised.

---

## APZQEP-150 — AI Native Platform

| Field               | Value                                                                                                                                                               |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Objective           | Guarded AI assistants in production pilot                                                                                                                           |
| Scope               | Model abstraction; prompt library; RAG; draft/approve; Requirement Assistant; Test Engineer gen; Evidence summary; Release narrative; Chat MVP; audit; eval harness |
| Dependencies        | 120 search; AI Operational Framework; 140 AI Workspace UX shell                                                                                                     |
| Acceptance criteria | No write without approve; audit complete; kill switch; golden eval; security review                                                                                 |
| Release target      | 1.1                                                                                                                                                                 |
| Estimate            | XL                                                                                                                                                                  |
| Business value      | High — differentiation                                                                                                                                              |

---

## APZQEP-160 — Portfolio Intelligence

| Field               | Value                                                                                                            |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Objective           | Deep QI + portfolio-oriented intelligence                                                                        |
| Scope               | Full QI metric catalogue; history UX; coverage/impact engines; Certification Engine product; executive dashboard |
| Dependencies        | 130; 140; 150 soft                                                                                               |
| Acceptance criteria | Formula versioning; coverage/impact CERT; certification module non-stub                                          |
| Release target      | **1.2**                                                                                                          |
| Estimate            | XL                                                                                                               |
| Business value      | High — enterprise depth                                                                                          |

---

## APZQEP-170 — Integrations

| Field               | Value                                                                                                                |
| ------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Objective           | Connect APZQEP to ALM and documents ecosystems                                                                       |
| Scope               | Jira sync (defects/issues); Azure path design/MVP; Documents deep-link; CI enrichment; Integration SDK adapters only |
| Dependencies        | 130 Defects; Integration SDK 1.0.0                                                                                   |
| Acceptance criteria | No business logic in adapters; error translation; health; CERT integration pack                                      |
| Release target      | **1.2**                                                                                                              |
| Estimate            | L                                                                                                                    |
| Business value      | High — enterprise adoption                                                                                           |

---

## APZQEP-180 — Operational Excellence

| Field               | Value                                                                                                                          |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Objective           | Operate, observe, and prepare GA                                                                                               |
| Scope               | Evidence/TE/QI/AI observability; retention jobs; unified audit explorer; GA readiness programme artefacts; performance budgets |
| Dependencies        | Prior bands as applicable                                                                                                      |
| Acceptance criteria | Health hierarchy green; GA readiness pack for Owner; no silent components                                                      |
| Release target      | **1.3** (partial obs from 1.1 inside 120)                                                                                      |
| Estimate            | L                                                                                                                              |
| Business value      | Critical for GA decision                                                                                                       |

---

## Dependency overview

```text
111 (Architecture) ──approved──► 120 Foundation
                                  ├─► 130 Core ──► 140 Experience
                                  │                  └─► 150 AI
                                  └─► 160 / 170 (1.2)
                                         └─► 180 (1.3)
```
