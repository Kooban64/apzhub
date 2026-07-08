# LAW-015-11 — Trust Persistence & REST APIs — Completion Report

> **Story:** LAW-015-11  
> **Status:** **Complete**  
> **Date:** 2026-07-07  
> **Verdict:** TRUST PERSISTENCE AND REST APIs DELIVERED — await owner approval before exports, bank integration, outbox workers, or Financial Engine extraction

---

## Summary

LAW-015-11 adds PostgreSQL persistence for the full Trust Accounting subsystem and exposes it through `/api/law/v1/trust/*` REST routes using the existing Law API framework. Memory mode (`LAW_REPOSITORY_MODE=memory`) continues to work unchanged. Outbox rows are recorded for trust ledger events when `LAW_OUTBOX_ENABLED=true`; no workers or replay were added.

---

## Deliverables

| Deliverable                   | Location                                                                                                                                                                       |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| SQL migrations (tables + RLS) | `packages/config/drizzle/0009_law_trust.sql`, `0010_law_trust_rls.sql`                                                                                                         |
| Drizzle schema                | `packages/config/src/db/legal-schema.ts`                                                                                                                                       |
| Postgres trust store          | `packages/config/src/db/adapters/postgres-trust-store.ts`                                                                                                                      |
| Row mappers                   | `packages/config/src/db/law-mappers/trust-row-mapper.ts`                                                                                                                       |
| Postgres repositories         | `apps/law-platform/lib/trust/postgres-trust-*.ts`                                                                                                                              |
| Repository factory            | `apps/law-platform/lib/persistence/trust-repository-factory.ts`                                                                                                                |
| Trust API layer               | `apps/web/lib/api/trust/*`                                                                                                                                                     |
| REST routes                   | `apps/web/app/api/law/v1/trust/**`                                                                                                                                             |
| Outbox draft helper           | `createTrustOutboxDraft()` in `packages/config/src/db/law-mappers/outbox-drafts.ts`                                                                                            |
| Architecture notes            | [LAW-015-11-Trust-Persistence-Notes.md](../architecture/LAW-015-11-Trust-Persistence-Notes.md), [LAW-015-11-Trust-API-Notes.md](../architecture/LAW-015-11-Trust-API-Notes.md) |

---

## API route groups

| Group            | Methods   | Path prefix                                  |
| ---------------- | --------- | -------------------------------------------- |
| Accounts         | GET, POST | `/accounts`                                  |
| Transactions     | GET, POST | `/transactions`                              |
| Post draft       | POST      | `/transactions/{draftId}/post`               |
| Reverse          | POST      | `/transactions/{trustTransactionId}/reverse` |
| Allocations      | GET       | `/allocations`                               |
| Reconciliation   | POST      | `/reconciliation`                            |
| Interest         | GET, POST | `/interest`                                  |
| Transfers        | GET, POST | `/transfers`                                 |
| Approvals        | GET       | `/approvals`                                 |
| Approve / reject | POST      | `/approvals/{id}/approve`, `/reject`         |
| Reports          | GET, POST | `/reports`                                   |
| Diagnostics      | GET       | `/diagnostics`                               |

---

## Persistence entities

| Entity                                                                               | Storage model                            |
| ------------------------------------------------------------------------------------ | ---------------------------------------- |
| Trust accounts, transactions, journal entries, balances                              | Normalised tables                        |
| Drafts, audits, allocations, transfers, approvals, interest, reconciliation, reports | JSONB `payload` columns                  |
| Approval history                                                                     | Append-only table (no UPDATE/DELETE RLS) |

---

## Outbox events (persistence layer)

| Event                              | When                        |
| ---------------------------------- | --------------------------- |
| `legal.trust.account.created`      | Account opened              |
| `legal.trust.account.updated`      | Account metadata updated    |
| `legal.trust.transaction.posted`   | Transaction appended        |
| `legal.trust.transaction.reversed` | Transaction marked reversed |

---

## Quality gates

| Gate                 | Result                         |
| -------------------- | ------------------------------ |
| `pnpm lint`          | Pass                           |
| `pnpm typecheck`     | Pass                           |
| `pnpm build`         | Pass                           |
| `pnpm test`          | Pass (1816 passed, 44 skipped) |
| `pnpm test:coverage` | Pass                           |

---

## Test report

| Area                        | Coverage                                                      |
| --------------------------- | ------------------------------------------------------------- |
| Memory mode Trust API       | `apps/web/lib/api/trust/trust-api.test.ts`                    |
| Repository factory parity   | `apps/law-platform/lib/trust/trust-repository-parity.test.ts` |
| Postgres tenant isolation   | `postgres-trust-ledger-repository.integration.test.ts`        |
| Outbox wiring               | Same integration test file                                    |
| Existing trust domain tests | Unchanged (118+ module tests)                                 |

---

## Technical debt

See [LAW-015-11-Technical-Debt.md](../architecture/LAW-015-11-Technical-Debt.md).

---

## Recommendation for LAW-015-12

See completion report section in [LAW-015-11-Technical-Debt.md](../architecture/LAW-015-11-Technical-Debt.md#recommendation-for-law-015-12).

---

## Stop condition

Trust persistence and REST APIs are complete. **Do not proceed** to exports, bank integration, outbox workers, or Financial Engine extraction without owner approval.
