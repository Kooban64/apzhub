# Engineering Programmes — APZQEP v1.1+

Authoritative programme band structure for post-architecture engineering.  
**Supersedes** provisional IDs APZQEP-112…126 in [TECHNICAL-ROADMAP.md](./TECHNICAL-ROADMAP.md) (retained as historical planning).

Engineering is **not** authorised until Product Board approves APZQEP-111 and issues a programme directive.

Estimates: S / M / L / XL (planning bands).

---

## APZQEP-120 — Enterprise Foundation

| Field               | Value                                                                                                                                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Objective           | Make v1.0 LA capabilities trustworthy and wire cross-cutting discovery                                                                                                                            |
| Scope               | Evidence durable storage path + ACL; TE operability/E2E/OpenAPI; domain event publication; unified search providers; notifications; command palette registration; QI skeleton (QS/RC/EVCOMP/RISK) |
| Out of scope        | Suites/Runs/Defects UI domains; AI skills; ALM sync                                                                                                                                               |
| Dependencies        | APZQEP-111 approved; Owner ADR-0088 decision                                                                                                                                                      |
| Acceptance criteria | LA limitations updated; events on bus; search covers v1.0 entities + hooks for new; UCP actions for existing modules; QI API returns MVP scores; CERT delta pack                                  |
| Release target      | 1.1                                                                                                                                                                                               |
| Estimate            | XL (multi-track) — may split into 120A Evidence / 120B TE / 120C Discovery / 120D QI skeleton under same band                                                                                     |
| Business value      | Critical — trust & platform integration                                                                                                                                                           |

---

## APZQEP-130 — Quality Engineering Core

| Field               | Value                                                                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Objective           | Complete the daily QE operating model                                                                                                 |
| Scope               | Test Suites; Test Runs; Defects — domain, services, APIs, Workbench, permissions, events                                              |
| Dependencies        | 120 (events/search hooks preferred); TE/Evidence baselines                                                                            |
| Acceptance criteria | Non-stub modules; full lifecycle tests; Workbench flows; run↔execution links; defect links; CERT for each capability or combined CERT |
| Release target      | 1.1                                                                                                                                   |
| Estimate            | XL                                                                                                                                    |
| Business value      | High — competitive operating completeness                                                                                             |

---

## APZQEP-140 — Executive Experience

| Field               | Value                                                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------------------- |
| Objective           | Role-aware visibility and release confidence UX                                                               |
| Scope               | QEP Home; QA/Tester/Developer/Project/Risk dashboards; Release Readiness MVP; personal workspace; saved views |
| Dependencies        | 120 QI skeleton; 130 for run/defect widgets                                                                   |
| Acceptance criteria | Permission-aware dashboards; AA; tokens only; readiness read-only; no auto-release                            |
| Release target      | 1.1                                                                                                           |
| Estimate            | L                                                                                                             |
| Business value      | High — adoption & decision support                                                                            |

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
