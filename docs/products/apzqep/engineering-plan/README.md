# APZQEP-PLAN-001 — APZ QEP Engineering Delivery Plan & Implementation Roadmap

> **Programme:** APZQEP-PLAN-001  
> **Title:** APZ QEP Engineering Delivery Plan & Implementation Roadmap  
> **Classification:** ENGINEERING PLANNING  
> **Lifecycle:** Engineering Planning  
> **Baseline:** APZQEP-ARCH-001 (**ACCEPTED** — Enterprise Architecture Baseline 1.0.0-arch)  
> **Authoritative references:** Platform-1.4-CERT-001 · APZQEP-CONSTITUTION-001 · APZQEP-DEF-002 · APZQEP-ARCH-001  
> **Date:** 2026-07-24  
> **Rule:** Engineering Planning only — **no production code · no repository creation · no schemas · no API endpoint specifications**

## Status

| Field | Value |
| ----- | ----- |
| **Programme** | APZQEP-PLAN-001 |
| **Status** | **ACCEPTED** |
| **Plan version** | 1.0.0-plan |
| **Architecture baseline** | APZQEP-ARCH-001 (1.0.0-arch) |
| **Product baseline** | APZQEP-DEF-002 (1.0.0-def) |
| **Platform alignment** | APZHUB 1.4 **CERTIFIED** — reuse platform; do not rebuild identity, auth, shell, search, or notifications |
| **Recommendation** | **READY FOR OWNER ENGINEERING PLAN ACCEPTANCE** |

## Purpose

This pack is the **authoritative engineering delivery roadmap** for APZ QEP (APZ Quality Engineering Platform). It translates the accepted Enterprise Architecture Baseline into a sequenced, dependency-aware implementation plan from repository bootstrap through Version **1.0 General Availability**.

Engineering Planning defines **how** QEP will be built — not the build itself. No source code, database schemas, OpenAPI contracts, or production repositories are created under this programme.

## Central outcome

Every planning decision in this pack supports one product question inherited from Architecture:

> **Can this software be released with sufficient confidence?**

The roadmap delivers a **vertical-slice, manual-first MVP at release 0.9**, with **General Availability at 1.0** — without requiring AI, MCP, or advanced automation at any milestone.

---

## Pack index (13 deliverables)

| # | Document | Purpose | Status |
| - | -------- | ------- | ------ |
| 1 | [README.md](./README.md) | Pack control, philosophy, authority, stop conditions | **IMPLEMENTED** |
| 2 | [ENGINEERING-ROADMAP.md](./ENGINEERING-ROADMAP.md) | Full roadmap bootstrap → 1.0 GA; phases; vertical slices; mermaid timeline | **IMPLEMENTED** |
| 3 | [IMPLEMENTATION-PLAN.md](./IMPLEMENTATION-PLAN.md) | Bootstrap order, package creation, platform reuse, domain order, integration/testing/migration/release strategy | **IMPLEMENTED** |
| 4 | [RELEASE-PLAN.md](./RELEASE-PLAN.md) | Concrete releases 0.1–1.0 with scope, modules, exit criteria, dependencies | **IMPLEMENTED** |
| 5 | [EPICS.md](./EPICS.md) | Engineering epics per release (QEP-E-* IDs); complexity; parallelisation; risk | **IMPLEMENTED** |
| 6 | [SPRINT-ZERO.md](./SPRINT-ZERO.md) | Sprint 0 definition for APZQEP-ENG-010; monorepo layout intent; CI; local dev | **IMPLEMENTED** |
| 7 | [DEPENDENCY-MAP.md](./DEPENDENCY-MAP.md) | Critical path; parallel/independent/blocked/high-risk work; release dependency graph | **IMPLEMENTED** |
| 8 | [TEAM-PLAN.md](./TEAM-PLAN.md) | Recommended teams; responsibilities; capacity; RACI-style release mapping | **IMPLEMENTED** |
| 9 | [MVP-PLAN.md](./MVP-PLAN.md) | Must/Should/Could/Deferred MVP; release mapping; manual certification path | **IMPLEMENTED** |
| 10 | [TESTING-ROADMAP.md](./TESTING-ROADMAP.md) | Test pyramid mapped to releases; gates per 015 | **IMPLEMENTED** |
| 11 | [IMPLEMENTATION-CHECKLIST.md](./IMPLEMENTATION-CHECKLIST.md) | Validation checklist; architecture and module coverage; no-code confirmation | **IMPLEMENTED** |
| 12 | [COMPLETION-REPORT.md](./COMPLETION-REPORT.md) | Programme completion; recommendation; evidence reference | **IMPLEMENTED** |
| 13 | [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md) | Owner acceptance checklist — **ACCEPTED** | **ACCEPTED** |

**Total:** 13 deliverables in this pack.

---

## Authority hierarchy

```text
APZHUB Constitution (000) + Foundation (001–029)
  → APZQEP Constitution (ACCEPTED / CLOSED)
    → APZQEP Requirements + Discovery (ACCEPTED)
      → APZQEP-DEF-002 Product Definition (ACCEPTED)
        → APZQEP-ARCH-001 Enterprise Architecture (ACCEPTED)
          → APZQEP-PLAN-001 Engineering Planning (this pack)
            → APZQEP-ENG-010 Repository Bootstrap (authorised / under Foundation Acceptance)
```

On conflict: APZHUB Constitution wins; then QEP Constitution; then Product Definition; then Architecture; then this Engineering Plan. Implementation programmes must not contradict accepted upstream documents.

---

## Engineering philosophy

These principles govern all QEP engineering work defined in this pack and all downstream programmes.

| # | Principle | Planning meaning |
| - | --------- | ---------------- |
| E1 | **Vertical slice delivery** | Each release delivers a demonstrable end-to-end capability, not isolated layers |
| E2 | **Working software over partial frameworks** | Prefer releasable slices over long-running infrastructure-only sprints |
| E3 | **Platform reuse first** | Identity, auth, shell, search, notifications, audit, events come from Platform 1.4 — QEP adds domain services and modules only |
| E4 | **Modular monolith first** | Single deployable product with extraction-ready service boundaries (ARCH P4–P5) |
| E5 | **Module → Service → Connector → Engine** | No layer bypass; planning sequences respect the mandatory stack (003, 008, 009) |
| E6 | **Verification-first** | Build order follows the quality lifecycle: scope → requirements → verification → execution → evidence → traceability → readiness → certification |
| E7 | **Manual-first MVP** | Full MVP value without AI, MCP, or automation ingest enabled |
| E8 | **AI OFF by default** | M17, M18, M14 advanced AI features scheduled Phase 2+; never on critical path to MVP |
| E9 | **Human certification mandatory** | Certification release (0.9) requires named human actors; no auto-cert shortcuts |
| E10 | **Test-driven where practical** | Testing roadmap gates every release; pyramid per 015 |
| E11 | **Documentation-driven** | Manifest-first SDK compliance (024–029); docs updated with each slice |
| E12 | **Architecture and Constitution compliance** | Every epic validated against ARCH-001 and Constitution guardrails |
| E13 | **Incremental delivery** | Small releasable milestones 0.1–1.0; no big-bang integration |
| E14 | **Constitution compliance** | SoR, audit, evidence, and cert rules from Constitution are non-negotiable in sequencing |

---

## Relationship to 22 product modules

APZQEP-DEF-002 defines **22 product modules** (M01–M22). This plan schedules every module across releases 0.1–1.0:

| Horizon | Modules | Release band |
| ------- | ------- | ------------ |
| MVP core (manual lifecycle) | M01–M06, M08–M13, M15, M20–M22 | 0.2–0.9 |
| MVP foundation / GA depth | M07 (stub 0.6), M19 (foundation 0.3) | 0.3–0.6 foundation; depth 1.0 |
| Phase 2+ (AI/MCP OFF until authorised) | M14 (advanced), M16, M17, M18 | Post-MVP; M16–M18 scaffold at 1.0 |

Module identifiers and behaviour are **preserved** from Definition. Engineering may refine internal service decomposition (AS-01–AS-22) but must not alter product-visible behaviour without Owner amendment.

---

## Implementation strategy summary

| Dimension | Decision |
| --------- | -------- |
| **Repository** | QEP packages and modules within existing APZHUB pnpm monorepo — not a separate repository |
| **Bootstrap** | APZQEP-ENG-010 implements Sprint Zero per [SPRINT-ZERO.md](./SPRINT-ZERO.md) |
| **Platform components** | Reuse BetterAuth, PermissionService, shell, Search, Notification, Event Bus, Audit from Platform 1.4 |
| **Domain order** | Portfolio → Requirements → Verification → Execution → Evidence/Traceability → Defects/Risk → Readiness/Certification → GA polish |
| **Integration** | Connector-first; GitHub ingest foundation in MVP; ALM sync optional/later |
| **Testing** | Full pyramid per release; Playwright E2E on vertical slices from 0.4 onward |
| **Migration** | Greenfield QEP product; no legacy TCMS data migration in MVP plan |
| **Release** | Tag releases 0.1–1.0; internal dogfood from 0.6; MVP at 0.9; GA at 1.0 |

See [IMPLEMENTATION-PLAN.md](./IMPLEMENTATION-PLAN.md) and [RELEASE-PLAN.md](./RELEASE-PLAN.md) for full detail.

---

## Release overview

| Release | Theme | Primary modules |
| ------- | ----- | ----------------- |
| **0.1** | Bootstrap, tooling, CI, quality gates | *(infrastructure)* |
| **0.2** | Identity, tenant, users, permissions (platform + QEP policy) | M20, M21, M22 (foundation), M01 (shell hook) |
| **0.3** | Portfolio and projects | M02, M19 (foundation) |
| **0.4** | Requirements | M03 |
| **0.5** | Verification library and design | M04, M05 |
| **0.6** | Execution and sessions | M06, M07 (foundation) |
| **0.7** | Evidence and traceability | M09, M10 |
| **0.8** | Defects and risk | M08, M11 |
| **0.9** | Certification, readiness, quality intelligence (basic) | M12, M13, M14 (basic), M15 |
| **1.0** | General Availability | All MVP modules hardened; Phase 2 scaffolds gated |

---

## Explicit exclusions (this programme)

The following are **out of scope** for APZQEP-PLAN-001 and **must not** be produced or inferred as approved:

| Excluded | Authorised in |
| -------- | ------------- |
| Source code, packages, repositories | APZQEP-ENG-010+ |
| Database schemas, migrations, ERD physical models | APZQEP-ENG-011+ (domain programmes) |
| REST paths, OpenAPI, protobuf contracts | Domain engineering programmes post-bootstrap |
| ADRs with technology selections | Named engineering programmes |
| UI component implementation | Module engineering programmes |
| Production deployment to customer environments | Post-1.0 operations programmes |
| Platform 1.4 modifications | Separate platform approval only |

---

## Upstream references

| Document | Relationship |
| -------- | ------------ |
| [Architecture pack](../architecture/README.md) | Structural contract — services, contexts, integration patterns |
| [Product Definition](../product-definition/README.md) | Behavioural contract — modules, workflows, MVP |
| [Constitution](../constitution/README.md) | Guardrails — SoR, AI, certification, security |
| [Requirements](../requirements/README.md) | Traced requirements baseline |
| APZHUB docs 000–029 | Platform mandatory standards |
| Platform 1.4 certification | Reuse baseline — no platform redesign |

---

## Downstream (not authorised)

| Programme | Prerequisite |
| --------- | ------------ |
| **APZQEP-ENG-010** | Owner **Engineering Plan Acceptance** of this pack |
| Domain implementation (ENG-011+) | ENG-010 complete + named Owner approvals |
| Schema / API design programmes | Named approvals per release |
| Platform 2.0 changes | Separate platform approval |

**Important:** The next authorised programme is **APZQEP-ENG-010** (Repository Bootstrap & Sprint Zero Implementation) — **not** APZQEP-ENG-001. Historical references to ENG-001 in upstream documents are superseded for QEP product delivery sequencing by this plan.

---

## STOP — Engineering Planning pack closed

```text
┌─────────────────────────────────────────────────────────────────┐
│  APZQEP-PLAN-001 ACCEPTED                                       │
│                                                                 │
│  Active programme: APZQEP-ENG-010 (Engineering Foundation).     │
│  DO NOT begin APZQEP-ENG-020 / Requirements / Verification /    │
│  Execution until Foundation Acceptance is recorded.             │
└─────────────────────────────────────────────────────────────────┘
```

| Gate | Condition |
| ---- | --------- |
| **Entry** | APZQEP-ARCH-001 accepted as architecture contract |
| **Exit** | Owner Engineering Plan Acceptance recorded — **COMPLETE** |
| **Blocked until Foundation Acceptance** | APZQEP-ENG-020, Requirements, Verification, Execution |

---

## Acceptance criteria (Owner)

Owner Engineering Plan Acceptance confirms:

1. All thirteen pack documents complete and internally consistent.
2. Philosophy E1–E14 and Architecture principles P1–P14 reflected without contradiction.
3. All twenty-two modules (M01–M22) scheduled across releases with dependencies resolved.
4. Platform 1.4 reuse strategy explicit — no duplicate platform rebuild planned.
5. MVP manual certification path achievable without AI/MCP.
6. Epics defined for every release with complexity and risk assessed.
7. No implementation artefacts introduced under PLAN-001.
8. Stop condition understood: ENG-010 awaits separate authorisation after Plan Acceptance.

---

## Related documents

| Document | Path |
| -------- | ---- |
| Owner Acceptance (Plan) | [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md) |
| Completion Report | [COMPLETION-REPORT.md](./COMPLETION-REPORT.md) |
| Architecture pack | [../architecture/](../architecture/README.md) |
| Evidence (on Acceptance) | `docs/operations/evidence/portfolio-recert/20260724T183600Z-APZQEP-PLAN-001.json` |

---

## Document control

| Version | Date | Change |
| ------- | ---- | ------ |
| 1.0.0-plan | 2026-07-24 | Initial Engineering Planning pack — APZQEP-PLAN-001 |
| 1.0.1-plan | 2026-07-24 | Release mappings aligned across pack to RELEASE-PLAN.md |
