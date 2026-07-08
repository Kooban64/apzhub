# LAW-012 — Persistence Foundation Review

> **Review date:** 2026-07-06  
> **Scope:** LAW-012-01 through LAW-012-08  
> **Verdict:** **PERSISTENCE FOUNDATION CLOSED WITH OBSERVATIONS — READY FOR NEXT-PHASE PLANNING** (not commercial GA)

---

## Executive summary

The Law Platform persistence foundation delivers PostgreSQL-backed repositories for seven aggregate roots (Client, Matter, Document, Task, Calendar, Time, Invoice) with tenant isolation, RLS, transactional outbox recording, and memory/postgres dual-mode operation. All validated workflows remain compatible with the in-memory default.

The foundation is **architecturally complete** for Phase 1 persistence goals. Primary quality gates (lint, typecheck, build, test, coverage) are **green** as confirmed in [LAW-012-08](../sprint/LAW-012-08-completion-report.md). Platform E2E was not completed — Playwright Chromium is unavailable in the current environment (environmental limitation, not a code regression).

Commercial deployment, search projections, audit compliance, and financial integrations remain deferred with documented technical debt.

---

## 1. Repository mode strategy

| Aspect          | Assessment                                                    |
| --------------- | ------------------------------------------------------------- |
| Flag            | `LAW_REPOSITORY_MODE=memory` (default) \| `postgres`          |
| Factory         | `repository-factory.ts` — single switch point per entity      |
| Shared repos    | Cached per `tenantId` in postgres mode with ordered seeding   |
| Context         | `LawPersistenceContext` + ALS session scope                   |
| Executor wiring | `createAppActionExecutorBundle` respects `persistenceContext` |

**Finding:** Strategy is sound. Default memory preserves fast CI and workflow tests. Postgres mode is opt-in and proven via contract suites.

**Resolved (LAW-012-08):** Factory smoke tests use stub `db` in context — no longer require full env when verifying adapter class selection.

---

## 2. In-memory vs PostgreSQL parity

| Mechanism             | Coverage                                                          |
| --------------------- | ----------------------------------------------------------------- |
| Shared contract tests | 7 `writable-*-repository.contract.test.ts` files                  |
| Postgres registration | Each integration test calls `registerWritable*RepositoryContract` |
| Filters               | Shared `*-repository-filters.ts` used by both modes               |
| Workflow tests        | Run on memory mode by default                                     |

**Finding:** Parity is **strong** for CRUD, list filters, soft lifecycle, and invoice line items. No dedicated `*parity*.test.ts` files — contract reuse is the parity mechanism.

**Gaps:**

- Time entry `billingStatus` not updated when invoiced (TD-L011-01)
- Calendar `timeEntryId` not validated at postgres adapter (TD-P15)
- No CI job mandating postgres integration tests (skipped without DB)

---

## 3. Tenant isolation

| Layer       | Mechanism                                                         |
| ----------- | ----------------------------------------------------------------- |
| Application | `tenantId` on every row; repository queries filter by context     |
| Session     | `applyPostgresTenantSession` sets `app.tenant_id` per transaction |
| Database    | RLS FORCE on all 9 Law tables                                     |
| Tests       | Tenant isolation suites per entity                                |

**Finding:** Dual-layer isolation (app + RLS) is correctly implemented.

**Gap (TD-P02):** Tenant ID defaults to `DEFAULT_LAW_TENANT_ID` — auth session does not yet supply firm tenant claim. Single-firm deployments work; multi-firm production requires auth wiring.

---

## 4. RLS policies

| Migration | Tables                                         |
| --------- | ---------------------------------------------- |
| 0002      | `law_client`, `law_matter`, `law_outbox_event` |
| 0004      | `law_document`, `law_task`                     |
| 0006      | `law_calendar_event`, `law_time_entry`         |
| 0008      | `law_invoice`, `law_invoice_line_item`         |

Policy pattern: `tenant_id = current_setting('app.tenant_id', true)` with ENABLE + FORCE RLS.

**Finding:** Complete and consistent across all Law tables.

**Gap (TD-P10):** Cross-tenant denial at RLS level not integration-tested (deferred in LAW-012-03).

---

## 5. Migration completeness

| Tag       | Status                                        |
| --------- | --------------------------------------------- |
| 0001–0008 | Applied · verified by `verifyLawMigrations()` |

**Finding:** All planned Phase 1 persistence migrations delivered. No pending schema for implemented aggregates.

---

## 6. Outbox coverage

| Aggregate | Events recorded                       | Worker |
| --------- | ------------------------------------- | ------ |
| client    | created, updated, deleted             | —      |
| matter    | created, updated, archived            | —      |
| document  | created, updated, archived            | —      |
| task      | created, updated, completed, archived | —      |
| calendar  | created, updated, cancelled           | —      |
| time      | created, updated, deleted             | —      |
| invoice   | created, updated, cancelled, paid     | —      |

Outbox writes are transactional with aggregate mutations when `LAW_OUTBOX_ENABLED=true`.

**Finding:** Recording layer complete. **No workers, replay, or projection consumers** — outbox is write-only skeleton.

---

## 7. Transaction boundaries

Seven `*UnitOfWork` classes with matching `runIn*UnitOfWork` runners. Invoice includes child line items in same transaction.

**Finding:** One-aggregate-one-transaction principle upheld. `runSync()` bridge (TD-P04) allows sync workflows over async postgres — acceptable technical debt.

---

## 8. Workflow compatibility

| Workflow             | Memory | Postgres (manual)   |
| -------------------- | ------ | ------------------- |
| Client               | ✅     | ✅                  |
| Matter               | ✅     | ✅                  |
| Document             | ✅     | ✅                  |
| Task                 | ✅     | ✅                  |
| Calendar             | ✅     | ✅                  |
| Time                 | ✅     | ✅                  |
| Invoice              | ✅     | ✅                  |
| Matter lifecycle E2E | ✅     | Not automated in CI |

**Finding:** All `*WorkflowService` classes unchanged in contract. `matter-lifecycle.integration.test.ts` validates full cross-module flow in memory mode.

---

## 9. Search projection readiness

| Prerequisite             | Status                        |
| ------------------------ | ----------------------------- |
| Outbox events            | ✅ Recorded                   |
| Outbox workers           | ❌ Not implemented            |
| Search projection tables | ❌ Not implemented            |
| Knowledge providers      | ✅ In-memory search (LAW-009) |

**Finding:** **Not ready** for event-driven search projections. In-memory knowledge providers continue to serve UI search.

---

## 10. Reporting readiness

| Prerequisite            | Status                                 |
| ----------------------- | -------------------------------------- |
| Persisted aggregates    | ✅ 7 entities                          |
| SQL reporting views     | ❌ Not implemented                     |
| WIP / billing summaries | ❌ Partial — data exists, views do not |
| Read replica / OLAP     | ❌ Not configured                      |

**Finding:** **Partially ready** — OLTP data supports ad-hoc SQL; formal reporting views (LAW-010 scope) not built.

---

## 11. Audit readiness

| Prerequisite                 | Status          |
| ---------------------------- | --------------- |
| Outbox (event sourcing lite) | ✅              |
| `audit_record` table         | ❌              |
| Archive audit trail          | ❌ (TD-L011-03) |
| Activity matter filtering    | ❌ (TD-L011-04) |

**Finding:** **Not ready** for compliance-grade audit. Platform activity timeline works from in-memory events, not persisted audit log.

---

## 12. Commercial readiness

| Criterion          | Status           |
| ------------------ | ---------------- |
| REST/GraphQL APIs  | ❌               |
| Payment processing | ❌               |
| Trust accounting   | ❌               |
| Invoice PDF        | ❌               |
| Tax engine         | ❌               |
| Multi-tenant auth  | ❌ (placeholder) |

**Finding:** **Not commercially ready**. Persistence is an internal foundation, not a deployable product surface.

---

## 13. Consolidated findings

| ID   | Severity | Finding                                                                         |
| ---- | -------- | ------------------------------------------------------------------------------- |
| F-01 | High     | Auth tenant claim placeholder blocks real multi-tenancy                         |
| F-02 | High     | No API layer — persistence not externally accessible                            |
| F-03 | Medium   | Outbox workers missing — projections cannot consume events                      |
| F-05 | Medium   | Billing saga incomplete — time entries stay unbilled after invoice              |
| F-07 | Low      | No DB foreign keys on cross-aggregate references                                |
| F-08 | Low      | E2E not run — Playwright Chromium unavailable in environment (not a regression) |

**Resolved in LAW-012-08:** F-04 (build/typecheck), F-06 (factory smoke tests).

---

## 14. Verdict

**PERSISTENCE FOUNDATION CLOSED WITH OBSERVATIONS**

The LAW-012 persistence programme (LAW-012-01 through LAW-012-06 implementation, LAW-012-07 closeout, LAW-012-08 quality gate remediation) has met its stated objectives. Seven aggregates are persisted with tenant isolation, RLS, outbox recording, and workflow parity.

### Quality gates (LAW-012-08)

| Gate                 | Status                                                            |
| -------------------- | ----------------------------------------------------------------- |
| `pnpm lint`          | ✅ Green                                                          |
| `pnpm typecheck`     | ✅ Green                                                          |
| `pnpm build`         | ✅ Green                                                          |
| `pnpm test`          | ✅ Green (1538 pass, 42 skip)                                     |
| `pnpm test:coverage` | ✅ Green (90.22% statements)                                      |
| `pnpm test:e2e`      | ⚠️ Not completed — Playwright Chromium unavailable in environment |

Reference: [LAW-012-08 completion report](../sprint/LAW-012-08-completion-report.md).

**Ready for next-phase planning. Not commercial GA.**

**Await owner approval** before any Phase 2 work (Trust Accounting, APIs, Reporting, Payment records, Outbox workers).
