# APZHUB Platform — Technical Debt Register

> **Milestone:** M16 — Platform Stabilisation & Engineering Review  
> **Consolidated:** 2026-07-08  
> **Supersedes:** Per-sprint debt tables as single cross-platform register  
> **Maintenance:** Update when closing stories; reference IDs in PRs

---

## Priority legend

| Priority     | Meaning                                                   |
| ------------ | --------------------------------------------------------- |
| **Critical** | Blocks production or causes data/security risk            |
| **High**     | Blocks multi-tenant, commercial, or financial correctness |
| **Medium**   | Functional gap with workaround                            |
| **Low**      | Quality, DX, or polish                                    |

---

## Critical

| ID         | Item                                                     | Origin            | Impact                              | Recommended milestone     | Effort |
| ---------- | -------------------------------------------------------- | ----------------- | ----------------------------------- | ------------------------- | ------ |
| TD-M16-C01 | App bootstrap duplicated across `web` and `law-platform` | M3–M7 integration | Bug fixes applied twice; drift risk | M17 app-bootstrap package | L      |
| TD-P24     | ~~No REST API layer~~                                    | LAW-012           | **Resolved** LAW-014                | —                         | —      |

---

## High

| ID         | Item                                                             | Origin     | Impact                                | Recommended milestone  | Effort |
| ---------- | ---------------------------------------------------------------- | ---------- | ------------------------------------- | ---------------------- | ------ |
| TD-P02     | Auth has no real tenant claim — `DEFAULT_LAW_TENANT_ID` fallback | LAW-012    | Multi-tenant bypass                   | M8 / LAW-014-02        | M      |
| TD-P18     | Outbox workers not implemented                                   | LAW-012    | Events unprocessed; projections stale | Post-M8 workers        | L      |
| TD-P19     | Event replay not implemented                                     | LAW-012    | No recovery from consumer failure     | Post-M8 workers        | M      |
| TD-M8-RBAC | Production RBAC not seeded — allow-all in dev                    | M3–M7      | All permissions granted in validation | M8 SPR-008             | L      |
| TD-L011-02 | Mark Paid status-only — no payment entity                        | LAW-011    | Billing incomplete                    | Payment records sprint | L      |
| TD-T03     | Client bundle PostgreSQL import leak (partial fix)               | LAW-015-13 | Browser may load server modules       | LAW-015-15             | M      |
| TD-T06     | No bank feeds / three-way reconciliation                         | LAW-015    | Commercial trust blocker              | Trust Phase 2          | XL     |

---

## Medium

| ID         | Item                                              | Origin     | Impact                         | Recommended milestone     | Effort |
| ---------- | ------------------------------------------------- | ---------- | ------------------------------ | ------------------------- | ------ |
| TD-P04     | `runSync()` sync bridge over async postgres       | LAW-012    | Thread blocking under load     | Async executor path       | M      |
| TD-P11     | No DB foreign keys on cross-aggregate refs        | LAW-012    | Referential integrity app-only | Schema hardening          | M      |
| TD-P20     | No dead-letter / retry policy for outbox          | LAW-012    | Poison messages block queue    | Worker infrastructure     | M      |
| TD-T01     | Workbench vs API separate in-memory trust bundles | LAW-015    | UI/API data divergence         | LAW-015-15                | M      |
| TD-T02     | No UI mutation forms (read-only trust workbench)  | LAW-015    | Ops must use API               | Trust Phase 2             | L      |
| TD-T04     | Playwright E2E not green in CI                    | LAW-015-13 | Validation gap                 | M17 CI                    | M      |
| TD-T07     | No outbox workers for trust events                | LAW-015-11 | Trust events not delivered     | Post-M8                   | M      |
| TD-T09     | Platform event/notification wiring deferred       | LAW-015    | No trust notifications         | Platform integration      | L      |
| TD-L011-01 | Time entries stay `unbilled` after invoicing      | LAW-011    | Billing accuracy               | Billing saga              | M      |
| TD-L011-03 | Archive has no audit trail                        | LAW-011    | Compliance gap                 | Audit sprint              | M      |
| TD-L011-04 | Activity not matter-filtered                      | LAW-011    | Timeline noise                 | Outbox projection         | M      |
| TD-DF15    | Knowledge overlay not in default shell path       | M5         | Discovery UX incomplete        | M8 UX                     | S      |
| TD-AT15-01 | Live activity subscriptions deferred              | M7         | Static presentation            | M8+                       | M      |
| TD-AT15-03 | Persistent activity store deferred                | M7         | Session-only timeline          | M8+                       | M      |
| TD-EN15    | Persistent notification store deferred            | M6         | Session-only notifications     | M8+                       | M      |
| TD-AF20-01 | Manifest bridge id mismatch                       | M4         | Some actions not resolved      | M8                        | S      |
| TD-AF18    | Gateway implementations deferred                  | M4         | No automation/webhook triggers | Automation story          | L      |
| TD-P16     | Invoice expense/disbursement header only          | LAW-012    | Billing detail incomplete      | Expense entities          | M      |
| TD-P14     | Time billing not linked to invoices in workflow   | LAW-012    | Revenue leakage risk           | Billing saga              | M      |
| TD-P01     | Managed* extra fields not in domain               | LAW-012    | Schema drift                   | Domain alignment          | M      |
| TD-P07     | `legal-business-core` types in `@apzhub/config`   | LAW-012    | Package boundary blur          | Extract legal-persistence | M      |
| TD-P09     | ALS session wiring not in all API routes          | LAW-012    | RLS context gap                | API middleware            | S      |
| TD-T05     | OpenAPI trust paths incomplete                    | LAW-015-12 | Integrator onboarding gap      | LAW-015-15                | S      |
| TD-M16-M01 | Law schema in `@apzhub/config` package            | M16 review | Platform/product coupling      | M17+                      | M      |
| TD-M16-M02 | No GitHub Actions CI workflow                     | M16 review | Manual quality gates only      | M17                       | M      |
| TD-M16-M03 | Pre-commit runs full test suite (~4 min)          | M16 review | Slow commit feedback           | M17                       | S      |

---

## Low

| ID           | Item                                             | Origin     | Impact                        | Recommended milestone     | Effort |
| ------------ | ------------------------------------------------ | ---------- | ----------------------------- | ------------------------- | ------ |
| TD-P10       | RLS cross-tenant denial not integration-tested   | LAW-012    | Test gap                      | Security hardening        | S      |
| TD-P15       | Calendar `timeEntryId` not validated at adapter  | LAW-012    | Data quality                  | Adapter validation        | S      |
| TD-P17       | Invoice issued/sent same outbox event            | LAW-012    | Event granularity             | Optional                  | S      |
| TD-P13       | Task complete outbox path consistency            | LAW-012    | Event completeness            | Adapter review            | S      |
| TD-P22       | Tax engine missing                               | Deferred   | Jurisdiction compliance       | Future                    | XL     |
| TD-P23       | Invoice PDF generation missing                   | Deferred   | Billing output                | Document service          | L      |
| TD-T08       | PDF trust export not implemented                 | LAW-015-12 | Returns 422                   | Optional                  | M      |
| TD-T12       | Trust balance projection full recompute          | LAW-015-04 | Query cost at scale           | Materialised views        | M      |
| TD-AF20-03   | Duplicate theme toggle controls                  | M4         | UX redundancy                 | UX polish                 | S      |
| TD-AT15-05   | E2E presentation refresh test hook               | M7         | Test-only code in prod bundle | Remove with subscriptions | S      |
| TD-AT15-06   | Health loader independent context calls          | M7         | Redundant hydration           | Cache optimisation        | S      |
| TD-AT15-07   | Mapper actionRef from audit payload              | M7         | Delegation UX                 | Enhancement               | S      |
| TD-EN13-01   | Panel-only notification toggle generic           | M6         | UX polish                     | Future                    | S      |
| TD-L011-06   | No cross-module DB transaction                   | LAW-011    | Documented intentional        | —                         | —      |
| TD-LAW-18–21 | Legal business core gaps                         | LAW-002    | Factory/lookup coverage       | Administration            | M      |
| TD-P6-02     | `AuthWorkbenchPermissionAdapter` not implemented | M3         | Real RBAC in shell            | M8                        | M      |
| TD-P6-03     | Selection not exposed in shell UI                | M3         | UX gap                        | Future                    | S      |

---

## Resolved (reference)

| ID     | Resolution                                 |
| ------ | ------------------------------------------ |
| TD-P03 | LAW-012-02 outbox table                    |
| TD-P05 | LAW-012-03 outbox UoW wiring               |
| TD-P06 | LAW-012-03 RLS policies                    |
| TD-P08 | LAW-012-02 config dependency               |
| TD-P12 | LAW-012-08 factory smoke tests             |
| TD-P25 | LAW-012-08 DatabaseExecutor + web tsconfig |
| TD-P21 | LAW-015 trust accounting delivered         |
| TD-P24 | LAW-014 REST APIs delivered                |

---

## Debt by subsystem

| Subsystem             | Critical | High     | Medium | Low |
| --------------------- | -------- | -------- | ------ | --- |
| Platform M2–M3        | 0        | 1 (RBAC) | 2      | 3   |
| Action M4             | 0        | 0        | 2      | 1   |
| Knowledge M5          | 0        | 0        | 1      | 0   |
| Event/Notification M6 | 0        | 0        | 1      | 1   |
| Activity/Timeline M7  | 0        | 0        | 2      | 4   |
| Persistence           | 0        | 3        | 8      | 5   |
| Law Platform          | 0        | 1        | 6      | 4   |
| Trust Accounting      | 0        | 2        | 4      | 2   |
| App/CI (M16)          | 1        | 0        | 3      | 0   |

---

## Recommended resolution sequence

```text
1. M8 RBAC + tenant claim (TD-M8-RBAC, TD-P02)
2. Outbox workers (TD-P18, TD-P19, TD-P20)
3. App bootstrap consolidation (TD-M16-C01)
4. CI automation (TD-M16-M02, TD-T04)
5. Client bundle hardening (TD-T03)
6. Trust production readiness (TD-T01, TD-T05)
7. Billing/payment completion (TD-L011-01, TD-L011-02)
8. Platform integration (TD-T09, TD-AT15-01)
9. Commercial trust (TD-T06)
```

---

## Maintenance

1. New debt → assign `TD-{origin}-{nn}` ID
2. Close debt → move to Resolved section with story reference
3. M16 register reviewed at next platform milestone gate

---

_Related: [Duplication Review](./APZHUB-Platform-Duplication-Review.md) · [LAW Persistence Technical Debt](./LAW-Persistence-Technical-Debt.md)_
