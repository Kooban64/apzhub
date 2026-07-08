# LAW-014 — Integration Readiness Review

> **Review date:** 2026-07-06  
> **Scope:** LAW-014 planning deliverables (architecture and documentation only)  
> **Reviewer:** Engineering (LAW-014 planning milestone)

---

## Executive summary

The Law Platform has a **mature internal foundation** — workflow services, dual-mode repositories, transactional outbox, RLS tenant isolation, and a polished UX — but **no public integration surface** today.

LAW-014 planning defines a coherent path from the current architecture to secure, versioned, tenant-aware REST APIs, webhooks, background workers, and external service abstractions **without duplicating business logic**.

---

## Readiness verdict

# READY FOR INTEGRATION IMPLEMENTATION WITH OBSERVATIONS

Planning is complete. Implementation may begin with **LAW-014-01** after owner approval. The observations below must be tracked during implementation — they are not blockers for starting.

---

## 1. Foundation assessment

| Prerequisite            | Status             | Evidence                                                              |
| ----------------------- | ------------------ | --------------------------------------------------------------------- |
| Domain model canonical  | ✅ Ready           | [APZHUB-Law-Domain-Model](../architecture/APZHUB-Law-Domain-Model.md) |
| Workflow services       | ✅ Ready           | Seven `*WorkflowService` classes with integration tests               |
| Persistence (postgres)  | ✅ Ready           | LAW-012 closed; RLS + outbox on all aggregates                        |
| Repository factory      | ✅ Ready           | Memory/postgres switch; shared contracts                              |
| Permission namespace    | ✅ Ready           | `legal.*` keys in manifests                                           |
| UX composition patterns | ✅ Ready           | LAW-013 dashboard/client CRM patterns                                 |
| Outbox events           | ✅ Ready           | 23 event types written transactionally                                |
| Outbox workers          | ❌ Not implemented | Planned LAW-014-08                                                    |
| Public API layer        | ❌ Not implemented | Planned LAW-014-01+                                                   |
| Auth tenant claim       | ⚠️ Gap             | TD-P02 — session lacks `tenantId`                                     |
| BetterAuth integration  | ✅ Ready           | Platform auth operational for UI                                      |

---

## 2. Planning deliverables checklist

| #   | Deliverable                                                                                         | Status      |
| --- | --------------------------------------------------------------------------------------------------- | ----------- |
| 1   | [LAW-Integration-Reference-Architecture](../architecture/LAW-Integration-Reference-Architecture.md) | ✅ Complete |
| 2   | [LAW-API-Design-Standard](../specs/LAW-API-Design-Standard.md)                                      | ✅ Complete |
| 3   | [LAW-OpenAPI-Planning](../specs/LAW-OpenAPI-Planning.md)                                            | ✅ Complete |
| 4   | [LAW-Integration-Security-Model](../security/LAW-Integration-Security-Model.md)                     | ✅ Complete |
| 5   | [LAW-Webhook-Architecture](../architecture/LAW-Webhook-Architecture.md)                             | ✅ Complete |
| 6   | [LAW-Background-Job-Architecture](../architecture/LAW-Background-Job-Architecture.md)               | ✅ Complete |
| 7   | [LAW-External-Service-Abstractions](../architecture/LAW-External-Service-Abstractions.md)           | ✅ Complete |
| 8   | [LAW-014 Backlog](../backlog/LAW-014-integration-foundation-backlog.md)                             | ✅ Complete |
| 9   | This readiness review                                                                               | ✅ Complete |

---

## 3. Risks

| ID   | Risk                              | Severity | Mitigation                                                    |
| ---- | --------------------------------- | -------- | ------------------------------------------------------------- |
| R-01 | TD-P02 — no auth `tenantId` claim | **High** | LAW-014-02 must complete before any entity API                |
| R-02 | `runSync()` blocking in workflows | Medium   | Acceptable for v1 API; document async migration path (TD-P04) |
| R-03 | No FK constraints (TD-P11)        | Medium   | API validation must enforce referential integrity             |
| R-04 | Outbox workers untested at scale  | Medium   | Load test after LAW-014-08; start with PG queue               |
| R-05 | API key secret management         | Medium   | Secrets manager + rotation runbook in LAW-014-02              |
| R-06 | Webhook SSRF via subscription URL | Medium   | URL validation in LAW-014-09                                  |
| R-07 | Scope creep into Trust Accounting | Medium   | Payment/accounting interfaces deferred — enforce backlog      |
| R-08 | OpenAPI drift from implementation | Low      | Spectral CI gate in LAW-014-03                                |

---

## 4. Dependencies

### Internal dependencies

| Dependency                       | Required by                          |
| -------------------------------- | ------------------------------------ |
| LAW-012 persistence              | All API stories                      |
| LAW-013 UX (no code dep)         | Demo/partner onboarding              |
| BetterAuth session               | LAW-014-02                           |
| `legal-business-core` validators | API DTO validation                   |
| Platform Event Bus               | Worker side effects (in-process leg) |

### External dependencies (implementation phase)

| Dependency                | Required by               | Status                  |
| ------------------------- | ------------------------- | ----------------------- |
| PostgreSQL                | APIs, workers, jobs       | Available               |
| Redis (optional)          | Rate limiting, job queue  | Decision deferred       |
| S3-compatible storage     | File storage              | Required for LAW-014-11 |
| Email provider (SES/SMTP) | Email service             | Required for LAW-014-12 |
| Secrets manager           | API keys, webhook secrets | Required for production |

---

## 5. Open decisions

| ID   | Decision                            | Options                                 | Recommendation                          |
| ---- | ----------------------------------- | --------------------------------------- | --------------------------------------- |
| D-01 | Job queue technology                | PostgreSQL vs Redis/BullMQ              | PostgreSQL first (LAW-014-10)           |
| D-02 | API route location                  | `apps/web` vs dedicated `apps/api`      | `apps/web/app/api/law/v1/` for v1       |
| D-03 | API key storage                     | Dedicated table vs BetterAuth extension | Dedicated `law_api_key` table           |
| D-04 | Rate limit backend                  | Redis vs in-memory                      | Redis for production; in-memory for dev |
| D-05 | SDK publish target                  | npm private registry vs monorepo only   | Monorepo package first                  |
| D-06 | Cursor vs offset pagination default | Cursor recommended                      | Cursor — per API standard               |
| D-07 | Strict unknown field rejection      | On vs opt-out period                    | On with 90-day partner onboarding flag  |

**Owner input requested** on D-02 and D-04 before LAW-014-10/14.

---

## 6. Recommended first implementation story

### **LAW-014-01 — API Route Scaffold**

**Rationale:**

1. Lowest risk — no business logic, no auth complexity
2. Establishes error envelope, request IDs, and health endpoints that all subsequent stories depend on
3. Validates Next.js route structure before tenant/auth investment
4. Immediately testable with no database dependency

**Sequence after 01:**

```text
LAW-014-01 → LAW-014-02 → LAW-014-03 → LAW-014-04 (Client API)
```

Client API as first entity validates the full stack (auth → tenant → permission → workflow → DTO → audit) before scaling to remaining entities.

---

## 7. Quality gates (planning milestone)

| Gate                 | Result                                                        |
| -------------------- | ------------------------------------------------------------- |
| `pnpm lint`          | ✅ Pass (no code changes)                                     |
| `pnpm typecheck`     | ✅ Pass                                                       |
| `pnpm build`         | ✅ Pass                                                       |
| `pnpm test`          | ✅ Pass                                                       |
| `pnpm test:coverage` | ✅ Pass                                                       |
| E2E                  | ⚠️ Playwright Chromium unavailable in environment (unchanged) |

---

## 8. Observations (non-blocking)

1. **Planning aligns with persistence closeout** — outbox → worker → webhook chain is the natural extension of LAW-012.
2. **Workflow authority preserved** — API layer as thin adapter is consistently specified across all documents.
3. **Security model closes TD-P02** — explicitly tracked in LAW-014-02.
4. **External abstractions prevent vendor lock-in** in application code — adapters absorb provider specifics.
5. **Trust Accounting and payments correctly deferred** — interfaces defined but not scheduled in LAW-014 backlog.
6. **LAW-013 UX debt (TD-UX-01/02)** can proceed in parallel — no conflict with API work.

---

## 9. Approval gate

| Milestone                 | Status                      |
| ------------------------- | --------------------------- |
| LAW-014 planning          | **Complete**                |
| LAW-014-01 implementation | **Awaiting owner approval** |

---

## 10. Related documents

| Document                                                                                            | Purpose                |
| --------------------------------------------------------------------------------------------------- | ---------------------- |
| [LAW-014 Backlog](../backlog/LAW-014-integration-foundation-backlog.md)                             | Implementation stories |
| [LAW-Integration-Reference-Architecture](../architecture/LAW-Integration-Reference-Architecture.md) | Master architecture    |
| [LAW-012 Persistence Review](./LAW-012-persistence-foundation-review.md)                            | Persistence foundation |
| [LAW-013 Product Readiness](./LAW-013-product-readiness-assessment.md)                              | UX foundation          |
