# LAW-012-03 — Completion Report

> **Story:** LAW-012-03 — Persistence Hardening  
> **Status:** **Complete**  
> **Date:** 2026-07-06  
> **Prerequisite:** [LAW-012-02](./LAW-012-02-completion-report.md)

---

## 1. Objective

Stabilise the Client + Matter persistence foundation before expanding to additional aggregates.

**Result:** Achieved. Tenant binding, outbox wiring, RLS, diagnostics, and migration verification delivered without Document/Task/Calendar/Time/Billing persistence.

---

## 2. Deliverables

| Deliverable                        | Location                                                               | Status |
| ---------------------------------- | ---------------------------------------------------------------------- | ------ |
| Per-request/session tenant context | `tenant-resolver.ts`, `law-persistence-scope.ts`                       | ✅     |
| Session/auth tenant binding        | `action-workbench-shell-provider.tsx`, `create-app-action-executor.ts` | ✅     |
| Async workflow boundary plan       | `docs/architecture/LAW-012-03-Async-Workflow-Boundary-Plan.md`         | ✅     |
| Outbox wiring (Client + Matter)    | Config adapters + law-platform wrappers                                | ✅     |
| RLS policies                       | `0002_law_rls_policies.sql`                                            | ✅     |
| RLS design doc                     | `docs/architecture/LAW-012-03-RLS-Policy-Design.md`                    | ✅     |
| Persistence diagnostics            | `persistence-diagnostics.ts`, `/api/health`                            | ✅     |
| Migration verification             | `packages/config/src/db/migration-verification.ts`                     | ✅     |
| Tenant context spec                | `docs/architecture/LAW-012-03-Tenant-Context-Specification.md`         | ✅     |
| Outbox wiring notes                | `docs/architecture/LAW-012-03-Outbox-Wiring-Notes.md`                  | ✅     |

---

## 3. Diagnostics report

Exposed on `/api/health` under `lawPlatform.persistence`:

| Field                  | Description                                         |
| ---------------------- | --------------------------------------------------- |
| `repositoryMode`       | `memory` \| `postgres`                              |
| `tenantId`             | Active tenant                                       |
| `tenantSource`         | Resolution source (explicit, session, env, default) |
| `actorId`              | Session actor when bound                            |
| `postgresReady`        | Database connectivity                               |
| `postgresLatencyMs`    | Health check latency                                |
| `migrationsOk`         | Law schema + RLS verified                           |
| `migrationMissingTags` | Missing migration identifiers                       |
| `outboxEnabled`        | Outbox write flag state                             |

---

## 4. Test report

| Metric        | After LAW-012-03                                 |
| ------------- | ------------------------------------------------ |
| Test files    | **325**                                          |
| Tests passing | **1496**                                         |
| Skipped       | **8** (postgres integration when DB unavailable) |

### New tests

- `persistence-hardening.test.ts` — tenant resolution, session binding, diagnostics
- `outbox-wiring.integration.test.ts` — transactional outbox create (postgres)

### Compatibility

All existing Client/Matter workflow integration tests pass in memory mode.

---

## 5. Technical debt

| ID     | Description                                               | Priority |
| ------ | --------------------------------------------------------- | -------- |
| TD-P02 | Auth has no real tenant claim — single-firm fallback only | High     |
| TD-P04 | `runSync()` sync bridge remains                           | Medium   |
| TD-P09 | ALS server wiring not yet used in API routes              | Low      |
| TD-P10 | RLS cross-tenant denial integration test deferred         | Low      |

---

## 6. Recommendation for LAW-012-04

**Proposed scope:** Document + Task PostgreSQL persistence (per LAW-012-02 roadmap)

| Priority | Item                                                        |
| -------- | ----------------------------------------------------------- |
| 1        | Auth tenant claim / membership model                        |
| 2        | `PostgreSqlDocumentRepository` + `PostgreSqlTaskRepository` |
| 3        | Outbox wiring for Document/Task mutations                   |
| 4        | Async workflow facade spike (non-breaking)                  |
| 5        | Outbox worker skeleton (read unpublished rows only)         |

**Stop condition preserved:** Await owner approval before Calendar, Time, Billing, APIs, or Trust Accounting.

---

## 7. Enable hardened postgres mode

```bash
LAW_REPOSITORY_MODE=postgres
LAW_OUTBOX_ENABLED=true
pnpm docker:up
pnpm db:migrate   # applies 0001 + 0002 (RLS)
pnpm dev:law
```

---

## 8. Sign-off

LAW-012-03 persistence hardening is complete. Foundation is ready for owner review before LAW-012-04 aggregate expansion.
