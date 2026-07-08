# APZHUB v6.0 — Architecture Review

> **Platform Version:** 6.0 (engineering review baseline — not a code release)  
> **Review date:** 2026-07-08  
> **Milestone:** M16 — Platform Stabilisation & Engineering Review  
> **Scope:** M1–M7 platform + Law Platform + Persistence + APIs + Trust Accounting  
> **Type:** Analysis only — no redesign, no implementation  
> **Prior baseline:** [APZHUB v5.0 Platform Review](./APZHUB-v5.0-Platform-Review.md)

---

## Verdict

# **VERY GOOD**

APZHUB has achieved a coherent, manifest-driven enterprise platform architecture with seven capability frameworks, a comprehensive Law Platform validation application, PostgreSQL persistence with RLS, REST APIs, and a closed Trust Accounting milestone. Engineering discipline — phased delivery, ADR governance, 90%+ test coverage, extensive documentation — is exemplary for a validation-phase platform.

The platform is **not commercially GA-ready**. Validation-phase shortcuts (allow-all RBAC, default tenant, in-process stores, missing outbox workers) are documented and must not reach production without M8+ remediation.

**v5.0 verdict was:** APPROVED FOR PRODUCT VALIDATION  
**v6.0 verdict is:** VERY GOOD — **continue product validation; block commercial deployment until M8 + workers**

---

## Evidence summary

| Dimension           | v5.0 (M7)    | v6.0 (M16)            | Delta              |
| ------------------- | ------------ | --------------------- | ------------------ |
| Unit tests          | 1308         | 1846                  | +538 (Law + Trust) |
| Test files          | 238          | 370                   | +132               |
| Coverage            | 90.58%       | 90.24%                | Stable             |
| E2E specs           | 7 (36 tests) | 12 (~49 tests)        | +Law + Trust       |
| Platform frameworks | M1–M7        | M1–M7 (frozen)        | No change          |
| Product validation  | Planning     | LAW-001–015 delivered | Major advance      |
| Trust Accounting    | Not started  | Milestone closed      | New                |
| REST APIs           | Not started  | LAW-014 complete      | New                |
| Persistence         | Not started  | LAW-012 complete      | New                |

---

## Subsystem ratings (consolidated)

| Subsystem             | Rating                 |
| --------------------- | ---------------------- |
| Platform Runtime      | Excellent              |
| Workbench             | Very Good              |
| Action Framework      | Very Good              |
| Knowledge & Discovery | Very Good              |
| Event & Notification  | Very Good              |
| Activity & Timeline   | Very Good              |
| Law Platform          | Very Good              |
| Persistence           | Very Good              |
| API Framework         | Very Good              |
| Trust Accounting      | Very Good (validation) |
| Security              | Good                   |
| Testing               | Very Good              |
| Documentation         | Very Good              |
| Commercial readiness  | Validation Only        |

---

## Required review questions

### If APZHUB were started today, what would we build differently?

1. **Single app bootstrap package from day one** — avoid `web`/`law-platform` duplication
2. **Real RBAC before product validation** — M8 should have preceded Law implementation
3. **Outbox workers with first persistence story** — not deferred past LAW-012
4. **Separate `legal-persistence` package** — not embed Law schema in `@apzhub/config`
5. **CI/CD pipeline in SPR-001** — GitHub Actions from foundation, not manual gates
6. **Contract-first OpenAPI** — generate handlers from spec, not reverse

### Which platform decisions proved most successful?

1. **Manifest-first, registry-based architecture (M2)** — template for M3–M7
2. **Phased milestone delivery with formal review gates** — 124+ stories without architectural collapse
3. **Frozen Platform v5.0 baseline** — product validation did not destabilise frameworks
4. **Single Action executor (M4)** — audit → event → notification → activity pipeline
5. **Immutable trust journal (ADR-0037)** — accounting integrity from first principles
6. **Dual-mode repository factory (memory/postgres)** — enabled fast tests + real persistence
7. **Comprehensive documentation culture** — 120+ sprint reports, ADRs, architecture indexes

### Which proved least successful?

1. **Deferring M8 RBAC through product validation** — allow-all masks real permission UX
2. **Deferring outbox workers** — events written but never consumed; blocks projections
3. **Duplicating app bootstrap across two Next.js apps** — maintenance tax
4. **Pre-commit running full test suite** — slow feedback; contributors may skip hooks
5. **E2E CI environment** — Playwright specs delivered but not reliably green
6. **Trust workbench/API memory split** — unintentional divergence

### What should never change?

1. **Layered architecture (003)** — no module→connector bypass
2. **Platform owns permissions, not BetterAuth alone (007)**
3. **Immutable financial records (ADR-0037)**
4. **Manifest-first extension model (024)**
5. **Single desktop shell — no isolated page layouts (005/016)**
6. **Events publish only; Notification Framework delivers (012/021)**
7. **ADR governance for baseline changes**
8. **Quality gates — lint, types, build, test, coverage**

### What should eventually be redesigned?

1. **App composition layer** — extract `@apzhub/app-bootstrap`
2. **In-process Event Bus** — external broker at M10 scale
3. **Session-only notification/activity stores** — persistent projections
4. **Law schema location** — move from `@apzhub/config`
5. **`runSync()` postgres bridge** — async-first workflows
6. **Search orchestrator** — external index (020)
7. **Trust workbench data path** — REST-backed or unified bundle

### Which components are mature enough to become reusable APZHUB platform capabilities?

| Component                      | Maturity   | Reuse potential                |
| ------------------------------ | ---------- | ------------------------------ |
| Platform Runtime               | **Mature** | ✅ Any APZHUB product          |
| Workbench Framework            | **Mature** | ✅ Any desktop product         |
| Action Framework               | **Mature** | ✅                             |
| Knowledge & Discovery          | **Mature** | ✅                             |
| Event & Notification           | **Mature** | ✅ (needs persistent store)    |
| Activity & Timeline            | **Mature** | ✅ (needs persistent store)    |
| Desktop Shell (`workspace`)    | **Mature** | ✅                             |
| Design System (`ui` + `theme`) | **Mature** | ✅                             |
| API envelope framework         | **Mature** | ✅ Law-proven pattern          |
| Repository factory pattern     | **Mature** | ✅ Adaptable to other products |

### Which components are still product-specific?

| Component                  | Notes                         |
| -------------------------- | ----------------------------- |
| `legal-business-core`      | Law domain types              |
| Law workflow services      | Client, matter, billing, etc. |
| Trust accounting services  | Regulatory; stays in Law      |
| Law Drizzle schema         | Should not remain in `config` |
| Law API handlers           | Product surface               |
| Law manifests (`modules/`) | Product registration          |
| FIN-001 generic ledger     | **Not extracted** — deferred  |

### What should become independent OSS projects?

| Candidate                      | Rationale                          | Priority                         |
| ------------------------------ | ---------------------------------- | -------------------------------- |
| `@apzhub/platform-runtime`     | Generic manifest orchestrator      | Medium — needs API stabilisation |
| `@apzhub/command-framework`    | Action/command palette framework   | Medium                           |
| `@apzhub/ui` + `@apzhub/theme` | Design system                      | Low — already separable          |
| Trust accounting engine        | **No** — too jurisdiction-specific | Not recommended                  |
| Full APZHUB platform           | **No** — integrated product        | Commercial product               |

### What should become commercial products?

| Product                     | Basis                                           |
| --------------------------- | ----------------------------------------------- |
| **APZHUB Platform**         | M1–M7 frameworks — enterprise workspace runtime |
| **Law Firm Platform**       | Law validation app — first enterprise product   |
| **Trust Accounting module** | Part of Law Platform — not standalone yet       |
| **APZOR Financial Engine**  | FIN-001 — deferred; future commercial engine    |

### What is the single biggest architectural risk?

**Production deployment without M8 RBAC and real tenant isolation (TD-P02, TD-M8-RBAC).**

A pilot deployed with allow-all permissions and default tenant would create a false sense of security readiness and risk data exposure between firms.

### What is the single biggest architectural strength?

**Manifest-first, registry-based platform architecture with strict layered dependencies and a single execution pipeline (Action → Event → Notification → Activity).**

This enables product teams to extend APZHUB without forking the platform — proven by Law Platform validating all seven frameworks without modifying them.

---

## Risks (updated from v5.0)

| ID      | Risk                            | Severity | Status                         |
| ------- | ------------------------------- | -------- | ------------------------------ |
| R-P5-01 | Product teams redesign platform | High     | Mitigated by Capability Matrix |
| R-P5-02 | RBAC gap                        | High     | **Still open** — M8 required   |
| R-P5-03 | Session stores                  | Medium   | **Still open**                 |
| R-P5-04 | In-process bus scaling          | Low      | Acceptable for validation      |
| R-P6-01 | Outbox workers missing          | **High** | **New** — critical path        |
| R-P6-02 | App bootstrap duplication       | Medium   | **New** — M17 target           |
| R-P6-03 | Client bundle server leak       | High     | **New** — trust/UI             |
| R-P6-04 | FIN-001 premature extraction    | Medium   | Mitigated — DEFERRED           |

---

## Recommendations

1. **Approve M8 (SPR-008)** as next implementation milestone
2. **Do not begin** Financial Engine extraction, Trust Phase 2, or new product features without owner approval
3. **Prioritise outbox workers** in parallel with M8
4. **Plan M17** for CI/CD and app bootstrap consolidation
5. **Maintain Platform v5.0 freeze** — bug fixes only in frameworks
6. **Block commercial pilot** until RBAC + tenant + workers delivered

---

## Sign-off

| Role              | Verdict                           |
| ----------------- | --------------------------------- |
| Engineering (M16) | **VERY GOOD**                     |
| Owner             | Await approval for next milestone |

---

_Related: [Platform Engineering Review](./APZHUB-Platform-Engineering-Review.md) · [Commercial Readiness](./APZHUB-Commercial-Readiness-Assessment.md) · [v6.0 Platform Review Release](../releases/APZHUB-v6.0-Platform-Review.md)_
