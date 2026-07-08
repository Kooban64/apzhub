# APZHUB Platform — Engineering Review

> **Milestone:** M16 — Platform Stabilisation & Engineering Review  
> **Date:** 2026-07-08  
> **Scope:** Platform Runtime through Trust Accounting (M1–M7 + Law Platform + LAW-012–015)  
> **Type:** Analysis only — no implementation  
> **Authority:** [APZHUB v5.0 Platform Review](./APZHUB-v5.0-Platform-Review.md) · [LAW-015 Trust Accounting Review](./LAW-015-Trust-Accounting-Review.md)

---

## Executive summary

APZHUB has evolved from a monorepo foundation (SPR-001) into a manifest-driven enterprise platform with seven capability frameworks, a full Law Platform validation application, PostgreSQL persistence, REST APIs, and a closed Trust Accounting milestone. Engineering discipline is strong: phased delivery, ADR governance, coverage gates, and extensive documentation.

The platform is **architecturally mature for product validation** but **not commercially GA-ready**. Primary gaps: real RBAC (M8), outbox workers, tenant claim wiring, app-layer duplication between `web` and `law-platform`, and production operational tooling.

**Overall platform engineering rating:** **VERY GOOD** (8.2/10)

---

## Review methodology

Each subsystem assessed against: architecture, consistency, maintainability, extensibility, scalability, security, performance, testing, documentation, developer experience.

Ratings: **Excellent** (9–10) · **Very Good** (7–8) · **Good** (5–6) · **Fair** (3–4) · **Poor** (1–2)

---

## 1. Platform Runtime (M2)

| Dimension            | Rating        | Notes                                                                |
| -------------------- | ------------- | -------------------------------------------------------------------- |
| Architecture         | **Excellent** | Manifest-first orchestrator; capability registry; lifecycle pipeline |
| Consistency          | **Very Good** | Registry pattern repeated across M3–M7                               |
| Maintainability      | **Very Good** | 40 test files; clear subsystem boundaries                            |
| Extensibility        | **Excellent** | Manifest schemas for module/service/integration/event                |
| Scalability          | **Good**      | In-process; external bus deferred to M10                             |
| Security             | **Good**      | Health aggregation; no auth in runtime itself                        |
| Performance          | **Very Good** | Bootstrap once; lazy discovery                                       |
| Testing              | **Excellent** | 85–100% per-subsystem coverage thresholds                            |
| Documentation        | **Very Good** | `platform-runtime.md`, ADRs 0010–0015                                |
| Developer experience | **Very Good** | Clear bootstrap sequence                                             |

**Strengths:** UI-agnostic orchestrator; dependency graph; health manager; configuration engine. Template for all subsequent frameworks.

**Weaknesses:** Bootstrap complexity for new contributors; manifest validation errors can be opaque.

**Risks:** Teams bypass runtime and hardcode capabilities (mitigated by Capability Matrix).

**Recommendations:** Maintain frozen v5.0 baseline; document bootstrap troubleshooting guide; no runtime changes until M8+ approved.

**Overall:** **Excellent (9.0)**

---

## 2. Workbench Framework (M3)

| Dimension            | Rating        | Notes                                            |
| -------------------- | ------------- | ------------------------------------------------ |
| Architecture         | **Excellent** | Eight engines; session restore; Request Bus      |
| Consistency          | **Very Good** | Engine contracts stable across apps              |
| Maintainability      | **Very Good** | 30 test files                                    |
| Extensibility        | **Excellent** | Manifest-driven navigation, layout, context      |
| Scalability          | **Good**      | Session in localStorage; server session deferred |
| Security             | **Good**      | Permission adapters; allow-all in dev/E2E        |
| Performance          | **Very Good** | Engine composition efficient                     |
| Testing              | **Very Good** | Engine unit tests; E2E via shell                 |
| Documentation        | **Very Good** | Workbench dev guide, ADRs                        |
| Developer experience | **Good**      | Learning curve for eight engines                 |

**Strengths:** Permanent shell contract (005/016); session persistence; permission adapter seam for M8.

**Weaknesses:** `AuthWorkbenchPermissionAdapter` not implemented (TD-P6-02); context panel wiring partial.

**Risks:** Product teams build isolated layouts instead of workbench modules.

**Recommendations:** Complete M8 permission adapter; document engine interaction diagrams.

**Overall:** **Very Good (8.5)**

---

## 3. Action Framework (M4)

| Dimension            | Rating        | Notes                                    |
| -------------------- | ------------- | ---------------------------------------- |
| Architecture         | **Excellent** | Single executor; audit as event source   |
| Consistency          | **Very Good** | Action manifest schema uniform           |
| Maintainability      | **Very Good** | 29 test files                            |
| Extensibility        | **Excellent** | Gateways, toolbar, shortcuts, palette    |
| Scalability          | **Good**      | In-process execution                     |
| Security             | **Good**      | Permission gates on registry             |
| Performance          | **Very Good** | Registry lookup O(n) acceptable at scale |
| Testing              | **Very Good** | Executor integration tests               |
| Documentation        | **Very Good** | Onboarding guide complete                |
| Developer experience | **Very Good** | Clear manifest → action path             |

**Strengths:** Unified execution path; audit events feed M6/M7; no duplicate command systems.

**Weaknesses:** Gateway implementations deferred (TD-AF18-*); manifest bridge id mismatch (TD-AF20-01).

**Risks:** Automation/webhook gateways remain NOT_IMPLEMENTED.

**Recommendations:** Resolve bridge id convention in M8; gateway story before automation modules.

**Overall:** **Very Good (8.5)**

---

## 4. Knowledge & Discovery Framework (M5)

| Dimension            | Rating        | Notes                                    |
| -------------------- | ------------- | ---------------------------------------- |
| Architecture         | **Excellent** | Service boundary; provider projections   |
| Consistency          | **Very Good** | Ranking strategies pluggable             |
| Maintainability      | **Very Good** | 30 test files                            |
| Extensibility        | **Excellent** | Provider registration pattern            |
| Scalability          | **Good**      | In-process orchestrator (TD-DF15)        |
| Security             | **Good**      | Permission-filtered at query time (spec) |
| Performance          | **Good**      | Full scan in dev; index deferred         |
| Testing              | **Very Good** | Provider + ranking tests                 |
| Documentation        | **Very Good** | Onboarding guide                         |
| Developer experience | **Very Good** | Palette integration clear                |

**Strengths:** Clean separation from search UI; ranking extensibility; Law providers demonstrate pattern.

**Weaknesses:** Knowledge overlay not in default shell path (TD-DF15); no persistent index.

**Risks:** Modules build standalone search UIs (violates 020).

**Recommendations:** Wire overlay in shell default; OpenSearch/Meilisearch evaluation in M9+.

**Overall:** **Very Good (8.3)**

---

## 5. Event & Notification Framework (M6)

| Dimension            | Rating        | Notes                                               |
| -------------------- | ------------- | --------------------------------------------------- |
| Architecture         | **Excellent** | Event/notification separation; parallel subscribers |
| Consistency          | **Very Good** | Envelope standard across catalogue                  |
| Maintainability      | **Very Good** | 21 test files                                       |
| Extensibility        | **Excellent** | Manifest event + notification registration          |
| Scalability          | **Fair**      | In-process bus; no external broker                  |
| Security             | **Good**      | Session-scoped notification store                   |
| Performance          | **Very Good** | Synchronous publish acceptable for validation       |
| Testing              | **Very Good** | Pipeline integration tests                          |
| Documentation        | **Very Good** | Onboarding guide; 18 EN specs                       |
| Developer experience | **Very Good** | Hydration pattern documented                        |

**Strengths:** Action audit → notification pipeline proven; presentation layer decoupled.

**Weaknesses:** Persistent notification store deferred; external delivery (SMTP/WebSocket) not wired.

**Risks:** Event volume at scale without outbox workers.

**Recommendations:** Connect Law outbox to platform event bus in integration story.

**Overall:** **Very Good (8.2)**

---

## 6. Activity & Timeline Framework (M7)

| Dimension            | Rating        | Notes                                                |
| -------------------- | ------------- | ---------------------------------------------------- |
| Architecture         | **Excellent** | Activity registry + timeline registry + mapper       |
| Consistency          | **Very Good** | Parallel to M5/M6 patterns                           |
| Maintainability      | **Very Good** | 29 test files                                        |
| Extensibility        | **Excellent** | Activity types, timeline definitions                 |
| Scalability          | **Fair**      | Session store; no persistent projection              |
| Security             | **Good**      | Filter at query time                                 |
| Performance          | **Good**      | Static presentation until subscriptions (TD-AT15-01) |
| Testing              | **Very Good** | Mapper + service tests                               |
| Documentation        | **Very Good** | Onboarding guide                                     |
| Developer experience | **Very Good** | Context Panel integration                            |

**Strengths:** Event-to-activity mapping without module coupling; Law timeline types registered.

**Weaknesses:** Live subscriptions deferred; E2E presentation refresh hook is test-only.

**Risks:** Timeline becomes write path instead of read projection.

**Recommendations:** Persistent activity store in M8+; remove E2E hooks when subscriptions land.

**Overall:** **Very Good (8.1)**

---

## 7. Law Platform

| Dimension            | Rating        | Notes                                       |
| -------------------- | ------------- | ------------------------------------------- |
| Architecture         | **Very Good** | Platform → Law → Modules; workflow services |
| Consistency          | **Good**      | Some naming variance across domains         |
| Maintainability      | **Good**      | 112 test files; large surface area          |
| Extensibility        | **Very Good** | Manifest modules; integration seams         |
| Scalability          | **Fair**      | In-memory + postgres dual mode              |
| Security             | **Good**      | RLS; permission keys; tenant gap (TD-P02)   |
| Performance          | **Good**      | `runSync()` bridge (TD-P04)                 |
| Testing              | **Very Good** | Integration tests per domain                |
| Documentation        | **Excellent** | LAW architecture index; sprint reports      |
| Developer experience | **Good**      | Two apps increase cognitive load            |

**Strengths:** Validates all M4–M7 frameworks under real domain; workflow service pattern; UX foundation (LAW-001-02).

**Weaknesses:** `web` vs `law-platform` duplication; no outbox workers; billing gaps (TD-L011).

**Risks:** Law-specific logic leaks into platform packages.

**Recommendations:** Extract shared app bootstrap package; complete M8 RBAC; outbox workers before commercial pilot.

**Overall:** **Very Good (7.8)**

---

## 8. Persistence (LAW-012)

| Dimension            | Rating        | Notes                                      |
| -------------------- | ------------- | ------------------------------------------ |
| Architecture         | **Very Good** | Repository factory; RLS; outbox skeleton   |
| Consistency          | **Very Good** | Dual memory/postgres mode                  |
| Maintainability      | **Good**      | Migrations 0001–0010; Drizzle schema       |
| Extensibility        | **Very Good** | Adapter pattern per aggregate              |
| Scalability          | **Good**      | Postgres ready; workers missing            |
| Security             | **Very Good** | RLS policies; tenant session               |
| Performance          | **Good**      | `runSync()` acceptable for v1              |
| Testing              | **Very Good** | Contract tests; integration (some skipped) |
| Documentation        | **Excellent** | Persistence roadmap; data model            |
| Developer experience | **Good**      | `LAW_REPOSITORY_MODE` switch clear         |

**Strengths:** Transactional outbox on writes; tenant-ready schema; trust tables delivered.

**Weaknesses:** TD-P02 tenant claim; TD-P18 workers; no FK constraints (TD-P11).

**Risks:** Outbox rows accumulate without consumers.

**Recommendations:** LAW-014-08 workers before production; wire tenant from auth.

**Overall:** **Very Good (7.9)**

---

## 9. API Framework (LAW-014)

| Dimension            | Rating        | Notes                                            |
| -------------------- | ------------- | ------------------------------------------------ |
| Architecture         | **Very Good** | Shared envelope; auth middleware; tenant binding |
| Consistency          | **Very Good** | Handler pattern repeated                         |
| Maintainability      | **Good**      | Per-resource handlers in `apps/web`              |
| Extensibility        | **Very Good** | OpenAPI scaffold; Bruno/Postman generators       |
| Scalability          | **Good**      | REST-first; no GraphQL yet                       |
| Security             | **Good**      | Permission gates; correlation IDs                |
| Performance          | **Good**      | Direct service calls                             |
| Testing              | **Very Good** | API test helpers; workflow validation            |
| Documentation        | **Very Good** | Legal API developer guide                        |
| Developer experience | **Very Good** | Swagger UI; collection generators                |

**Strengths:** Consistent error envelope; trust API full surface; developer experience spec.

**Weaknesses:** OpenAPI trust paths incomplete (TD-T05); TD-P02 blocks real multi-tenant.

**Risks:** API drift from domain services.

**Recommendations:** Spectral CI gate; complete OpenAPI registration.

**Overall:** **Very Good (8.0)**

---

## 10. Trust Accounting (LAW-015)

| Dimension            | Rating        | Notes                                      |
| -------------------- | ------------- | ------------------------------------------ |
| Architecture         | **Very Good** | Service-layer isolation; immutable journal |
| Consistency          | **Very Good** | ADRs 0036–0039 enforced                    |
| Maintainability      | **Very Good** | 118+ unit tests; cohesive services         |
| Extensibility        | **Very Good** | Compliance profiles; approval rules        |
| Scalability          | **Fair**      | In-memory workbench split                  |
| Security             | **Good**      | RLS; permission gates; client bundle leak  |
| Performance          | **Good**      | Balance projection recompute               |
| Testing              | **Very Good** | Full workflow validation test              |
| Documentation        | **Excellent** | Canonical docs delivered LAW-015-14        |
| Developer experience | **Good**      | API vs workbench bundle confusion          |

**Strengths:** Complete subsystem in one milestone arc; formal closeout; accounting integrity.

**Weaknesses:** No bank feeds; workbench read-only; E2E not green in CI.

**Risks:** Premature Financial Engine extraction.

**Recommendations:** LAW-015-15 production readiness before commercial trust use.

**Overall:** **Very Good (7.7)** — validation milestone, not GA

---

## 11. Developer Tooling

| Dimension            | Rating        | Notes                                     |
| -------------------- | ------------- | ----------------------------------------- |
| Architecture         | **Very Good** | pnpm monorepo; strict TS; ESLint/Prettier |
| Consistency          | **Very Good** | Shared vitest config; husky pre-commit    |
| Maintainability      | **Good**      | 370 test files; growing                   |
| Extensibility        | **Good**      | Scripts for OpenAPI/collections           |
| Scalability          | **Good**      | CI-ready structure                        |
| Security             | **Good**      | `.secrets` gitignored; no secrets in repo |
| Performance          | **Good**      | lint-staged on commit                     |
| Testing              | **Excellent** | 90%+ coverage; Playwright configs         |
| Documentation        | **Very Good** | Engineering handbook; onboarding guides   |
| Developer experience | **Good**      | Pre-commit runs full test suite (slow)    |

**Strengths:** Quality gates enforced; Storybook for UI; multiple Playwright configs.

**Weaknesses:** Pre-commit latency; Playwright Chromium env gaps; two dev servers.

**Risks:** Contributors skip hooks with `--no-verify`.

**Recommendations:** Split pre-commit fast/slow paths; document `dev` vs `dev:law` ports.

**Overall:** **Very Good (8.0)**

---

## Cross-cutting summary

| Subsystem            | Rating            |
| -------------------- | ----------------- |
| Platform Runtime     | 9.0 Excellent     |
| Workbench            | 8.5 Very Good     |
| Actions              | 8.5 Very Good     |
| Knowledge            | 8.3 Very Good     |
| Events/Notifications | 8.2 Very Good     |
| Activity Timeline    | 8.1 Very Good     |
| Law Platform         | 7.8 Very Good     |
| Persistence          | 7.9 Very Good     |
| API Framework        | 8.0 Very Good     |
| Trust Accounting     | 7.7 Very Good     |
| Developer Tooling    | 8.0 Very Good     |
| **Platform average** | **8.2 Very Good** |

---

## Top platform strengths

1. Manifest-first, registry-based architecture across M2–M7
2. Strict layered dependencies — no framework bypass
3. Phased delivery with formal review gates
4. Comprehensive documentation and ADR governance
5. Strong test pyramid with coverage enforcement

## Top platform weaknesses

1. RBAC and tenant claim not production-ready (M8 deferred)
2. Outbox workers not implemented — events written but not consumed
3. `apps/web` and `apps/law-platform` bootstrap duplication
4. In-process stores limit notification/activity/search at scale
5. Commercial operational tooling (monitoring, DLQ, runbooks) absent

## Strategic recommendations

1. **Do not refactor** until owner approves post-M16 plan
2. **Prioritise M8** (Identity, Administration, RBAC) before new product features
3. **Implement outbox workers** before multi-firm pilot
4. **Consolidate app bootstrap** into shared package (recommendation only)
5. **Maintain Platform v5.0 freeze** — bug fixes only

---

_Related: [APZHUB v6.0 Architecture Review](./APZHUB-v6.0-Architecture-Review.md) · [Technical Debt Register](../architecture/APZHUB-Platform-Technical-Debt-Register.md)_
