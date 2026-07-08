# LAW — Persistence Technical Debt Register

> **Consolidated:** LAW-012 final closeout (LAW-012-07 + LAW-012-08)  
> **Last updated:** 2026-07-06  
> **Supersedes:** Per-story debt tables in LAW-012-01 through LAW-012-06 completion reports

---

## Priority legend

| Priority     | Meaning                                      |
| ------------ | -------------------------------------------- |
| **Critical** | Blocks production deployment                 |
| **High**     | Blocks multi-tenant or financial correctness |
| **Medium**   | Functional gap with workaround               |
| **Low**      | Quality / DX improvement                     |

---

## 1. Cross-cutting persistence debt

| ID     | Priority        | Item                                                              | Source      | Resolution path                                                  |
| ------ | --------------- | ----------------------------------------------------------------- | ----------- | ---------------------------------------------------------------- |
| TD-P02 | **High**        | Auth has no real tenant claim — `DEFAULT_LAW_TENANT_ID` fallback  | LAW-012-02+ | Wire `@apzhub/auth` session firm ID into `LawPersistenceContext` |
| TD-P04 | **Medium**      | `runSync()` sync bridge over async postgres                       | LAW-012-02  | Async workflows or dedicated async executor path                 |
| TD-P12 | ✅ **Resolved** | Factory smoke tests fail when `DATABASE_URL` set without full env | LAW-012-04+ | Stub `db` in context — LAW-012-08                                |
| TD-P11 | **Medium**      | No DB foreign keys on cross-aggregate references                  | LAW-012-04  | Add FK constraints or document intentional omission              |
| TD-P10 | **Low**         | RLS cross-tenant denial not integration-tested                    | LAW-012-03  | Add test setting wrong `app.tenant_id`                           |

---

## 2. Outbox & projections

| ID     | Priority        | Item                           | Source     | Resolution path                                        |
| ------ | --------------- | ------------------------------ | ---------- | ------------------------------------------------------ |
| TD-P03 | ✅ **Resolved** | No outbox pattern              | LAW-012-01 | Implemented LAW-012-02+                                |
| TD-P18 | **High**        | Outbox workers not implemented | LAW-012-07 | Projection worker service consuming `law_outbox_event` |
| TD-P19 | **High**        | Event replay not implemented   | LAW-012-07 | Idempotent consumer + replay tooling                   |
| TD-P20 | **Medium**      | No dead-letter / retry policy  | LAW-012-07 | Outbox processing infrastructure                       |

---

## 3. Billing & financial

| ID         | Priority   | Item                                               | Source     | Resolution path                               |
| ---------- | ---------- | -------------------------------------------------- | ---------- | --------------------------------------------- |
| TD-L011-01 | **Medium** | Time entries stay `unbilled` after invoicing       | LAW-011    | InvoiceBillingSaga updates `billing_status`   |
| TD-L011-02 | **High**   | Mark Paid is status-only — no payment entity       | LAW-011    | `law_payment` table + payment workflow        |
| TD-010-01  | **Medium** | Expense/disbursement placeholders only             | LAW-010    | `law_expense` / `law_disbursement` entities   |
| TD-P16     | **Medium** | Invoice expense/disbursement on header only        | LAW-012-06 | Expense/disbursement line item entities       |
| TD-P17     | **Low**    | Invoice `issued`/`sent` both emit `updated` outbox | LAW-012-06 | Distinct outbox events if needed              |
| TD-P21     | **High**   | Trust accounting not implemented                   | LAW-012-07 | `law_trust_account` + `law_trust_transaction` |
| TD-P22     | **High**   | Tax engine missing                                 | Deferred   | Tax calculation service                       |
| TD-P23     | **Medium** | Invoice PDF generation missing                     | Deferred   | Document generation service                   |

---

## 4. API & deployment

| ID     | Priority        | Item                                            | Source     | Resolution path                                            |
| ------ | --------------- | ----------------------------------------------- | ---------- | ---------------------------------------------------------- |
| TD-P24 | **Critical**    | No REST/GraphQL API layer for Law aggregates    | LAW-012-07 | API routes with auth + tenant context                      |
| TD-P25 | ✅ **Resolved** | `@apzhub/config` mapper types fail web build    | LAW-012-07 | `DatabaseExecutor` + `apps/web` tsconfig path — LAW-012-08 |
| TD-P07 | **Low**         | `legal-business-core` types in `@apzhub/config` | LAW-012-02 | Dependency boundary cleanup                                |
| TD-P09 | **Low**         | ALS session wiring not in API routes            | LAW-012-03 | Middleware sets persistence context per request            |

---

## 5. Audit & compliance

| ID         | Priority   | Item                         | Source  | Resolution path                        |
| ---------- | ---------- | ---------------------------- | ------- | -------------------------------------- |
| TD-L011-03 | **Medium** | Archive has no audit trail   | LAW-011 | `law_audit_record` + archive events    |
| TD-L011-04 | **Medium** | Activity not matter-filtered | LAW-011 | `activity_projection.matter_id` index  |
| TD-L011-06 | **Low**    | No cross-module transaction  | LAW-011 | Documented saga patterns (intentional) |

---

## 6. Domain & data model

| ID        | Priority   | Item                                                    | Source     | Resolution path                         |
| --------- | ---------- | ------------------------------------------------------- | ---------- | --------------------------------------- |
| TD-P01    | **Medium** | Managed* extra fields not in domain                     | LAW-012-01 | Migration columns or `extensions` JSON  |
| TD-P14    | **Medium** | Time billing fields not linked to invoices in workflow  | LAW-012-05 | Billing saga (see TD-L011-01)           |
| TD-P15    | **Low**    | Calendar `timeEntryId` not validated at adapter         | LAW-012-05 | Add validation in postgres adapter      |
| TD-P13    | **Low**    | Task `completeTask()` outbox only via repository update | LAW-012-04 | Ensure all completion paths emit outbox |
| TD-009-04 | **Low**    | Communication from tags                                 | LAW-009    | `contact` + `communication` tables      |

---

## 7. Resolved debt

| ID     | Resolution story                                                |
| ------ | --------------------------------------------------------------- |
| TD-P03 | LAW-012-02 — outbox table + drafts                              |
| TD-P05 | LAW-012-03 — outbox wired to UoW                                |
| TD-P06 | LAW-012-03 — RLS policies                                       |
| TD-P08 | LAW-012-02 — `pnpm install` after config dep                    |
| TD-P12 | LAW-012-08 — factory smoke tests use stub `db` in context       |
| TD-P25 | LAW-012-08 — `DatabaseExecutor` type + `apps/web` tsconfig path |

---

## 8. Debt by next-phase option

| Next phase           | Debts addressed                    |
| -------------------- | ---------------------------------- |
| **APIs**             | TD-P02, TD-P09, TD-P24             |
| **Outbox workers**   | TD-P18, TD-P19, TD-P20, TD-L011-04 |
| **Trust Accounting** | TD-P21, TD-L011-02 (partial)       |
| **Payment records**  | TD-L011-02, TD-L011-01             |
| **Reporting**        | TD-L011-04, new SQL views          |

---

## 9. Quality gate observations (LAW-012-08)

Primary gates are **green** as of [LAW-012-08](../sprint/LAW-012-08-completion-report.md):

| Gate                 | Status           |
| -------------------- | ---------------- |
| `pnpm lint`          | ✅               |
| `pnpm typecheck`     | ✅               |
| `pnpm build`         | ✅               |
| `pnpm test`          | ✅               |
| `pnpm test:coverage` | ✅               |
| `pnpm test:e2e`      | ⚠️ Not completed |

**E2E:** Playwright Chromium is unavailable in the current environment. This is an environmental limitation, not a code regression. No law-platform persistence E2E suite exists; platform E2E tests require browser installation.

---

## 10. Maintenance

Update this register when closing future LAW stories. Reference IDs in completion reports and PR descriptions.
