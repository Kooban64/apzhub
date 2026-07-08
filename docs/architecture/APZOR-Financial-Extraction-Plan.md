# APZOR Financial Engine — Extraction Plan

> **Story:** FIN-001 — Architecture extraction (planning only)  
> **Status:** **Proposed plan** — execution blocked pending owner approval  
> **Prerequisite verdict:** DEFER EXTRACTION (see [FIN-001 Architecture Review](../reviews/FIN-001-Architecture-Review.md))  
> **Last updated:** 2026-07-07

---

## 1. Purpose

If extraction is approved after deferral conditions are met, this document describes how to migrate the LAW-015 Trust Accounting implementation into reusable APZOR Financial Engine packages **without breaking the Law Platform**.

**FIN-001 does not execute this plan.** No files are moved in FIN-001.

---

## 2. Preconditions (must be true before extraction starts)

| #   | Precondition                                             | Rationale                                          |
| --- | -------------------------------------------------------- | -------------------------------------------------- |
| 1   | LAW-015-10 complete (APIs + PostgreSQL persistence)      | Extraction needs real adapters, not just in-memory |
| 2   | LAW-015-09 complete (Trust Dashboard)                    | Validates end-to-end product integration           |
| 3   | Full trust regression suite green on persistence         | Baseline for parity testing                        |
| 4   | Owner approval of FIN-001 verdict                        | Governance gate                                    |
| 5   | Second product (APZBNK or APZEX) requirements documented | Validates abstractions against real need           |
| 6   | ADR for Financial Engine ownership and semver policy     | Prevents ungoverned shared package drift           |

---

## 3. Proposed packages

### 3.1 Package structure

```text
packages/
  @apzor/financial-core/
    src/
      types/           # Money, Currency, Result, TenantScoped
      reference/       # ReferenceNumberGenerator (from legal-business-core)
      id/              # createFinancialId
    package.json

  @apzor/financial-engine/
    src/
      ledger/          # LedgerService, posting-builder, balance, validation
      workflow/        # TransactionWorkflowService, validator, audit
      allocation/      # AllocationService, balance, validator
      reconciliation/  # ReconciliationService, engine
      interest/        # InterestService, engine
      transfer/        # TransferService, validator
      reporting/       # ReportingService, engine
      events/          # In-memory event bus (dev/test)
      diagnostics/     # Shared diagnostics pattern
    package.json

  @apzor/financial-engine-testing/
    src/
      fixtures/        # createFinancialEngineFixture
      in-memory/       # All in-memory repository implementations
    package.json
```

### 3.2 Law Platform packages (remain in app)

```text
apps/law-platform/lib/trust/
  policy/
    law-trust-chart.ts
    law-trust-dimensions.ts
    law-trust-transfer-types.ts
    law-trust-posting-rules.ts
    law-trust-compliance.ts
  adapter/
    law-trust-engine-adapter.ts
  service/
    law-trust-platform-service.ts   # Platform Service boundary
  statements/
    client-trust-statement.ts
    matter-trust-statement.ts
  persistence/
    postgres-*-repository.ts        # Implements engine interfaces
```

### 3.3 Naming migration

| Current (Law)          | Target (Engine)               |
| ---------------------- | ----------------------------- |
| `TrustLedgerService`   | `LedgerService`               |
| `TrustAccount`         | `FinancialAccount`            |
| `TrustTransaction`     | `Transaction`                 |
| `TrustPosting`         | `Posting`                     |
| `TrustAllocation`      | `Allocation`                  |
| `createTrustId`        | `createFinancialId`           |
| `legal.trust.*` events | `financial.*` (+ Law mapping) |

Law Platform retains `Trust*` names in **public Law API** and UI — internal engine uses generic names.

---

## 4. Migration phases

### Phase 0 — Governance (FIN-002) — 2–3 days

| Task                                       | Output               |
| ------------------------------------------ | -------------------- |
| ADR: Financial Engine as shared capability | Approved ADR         |
| Semver and breaking change policy          | Governance doc       |
| Package ownership and review process       | RACI                 |
| Generic domain model finalisation          | FIN-002 deliverables |

### Phase 1 — Extract core utilities (FIN-003) — 3–5 days

| Task                                                     | Risk                          |
| -------------------------------------------------------- | ----------------------------- |
| Create `@apzor/financial-core`                           | Low                           |
| Move `ReferenceNumberGenerator` from legal-business-core | Medium — update all consumers |
| Move ID generator                                        | Low                           |
| Law Platform re-exports for backward compatibility       | Low                           |

**Backward compatibility:** Law imports `@apzor/financial-core` through re-export shim in `legal-business-core` for one release cycle.

### Phase 2 — Extract ledger + workflow (FIN-004) — 5–8 days

| Task                                                             | Risk   |
| ---------------------------------------------------------------- | ------ |
| Move ledger engine to `@apzor/financial-engine/ledger`           | High   |
| Abstract `clientId`/`matterId` → generic dimensions              | High   |
| Move workflow layer                                              | Medium |
| Create `LawTrustPolicyAdapter`                                   | Medium |
| Law `lib/trust/` becomes thin wrapper importing engine + adapter | High   |

**Backward compatibility:** `apps/law-platform/lib/trust/index.ts` re-exports same public API (`TrustLedgerService`, etc.) as aliases to Law-wrapped engine services. **Zero import path changes for external consumers.**

### Phase 3 — Extract allocation, reconciliation (FIN-005) — 4–6 days

| Task                                                  | Risk   |
| ----------------------------------------------------- | ------ |
| Move allocation engine with dimension abstraction     | High   |
| Move reconciliation engine (pure — lower risk)        | Low    |
| Law allocation policy (matter segregation) in adapter | Medium |
| Regression: 50+ existing trust tests pass unchanged   | —      |

### Phase 4 — Extract interest, transfer, reporting (FIN-006) — 5–7 days

| Task                                         | Risk   |
| -------------------------------------------- | ------ |
| Move interest engine                         | Medium |
| Move transfer engine with type registry      | High   |
| Move reporting engine (generic reports only) | Medium |
| Law statements remain in Law Platform        | Low    |
| Regression: 94 trust tests pass              | —      |

### Phase 5 — Persistence adapter migration (FIN-007) — 5–8 days

| Task                                                | Risk   |
| --------------------------------------------------- | ------ |
| PostgreSQL repositories implement engine interfaces | High   |
| RLS policies unchanged (Law-owned)                  | Medium |
| Integration tests against real DB                   | Medium |
| Remove in-memory repos from production path         | Low    |

### Phase 6 — Second product validation (FIN-008) — 8–12 days

| Task                                      | Risk          |
| ----------------------------------------- | ------------- |
| APZBNK or APZEX implements policy adapter | Medium        |
| Proves dimension + chart extensibility    | High if fails |
| Documents gaps for engine v2              | —             |

---

## 5. Backward compatibility strategy

| Layer                                  | Strategy                                             |
| -------------------------------------- | ---------------------------------------------------- |
| Law public API (`/api/law/v1/trust/*`) | **Frozen** — DTO shapes unchanged                    |
| Law `lib/trust/index.ts` exports       | **Re-export aliases** for minimum 2 releases         |
| Event names `legal.trust.*`            | **Unchanged** — adapter maps from `financial.*`      |
| Permission keys                        | **Unchanged**                                        |
| Database schema                        | **Unchanged** — only repository implementation moves |
| Test file locations                    | May move with packages; test behaviour identical     |

### Compatibility shim example (conceptual)

```typescript
// apps/law-platform/lib/trust/trust-ledger-service.ts (shim)
export { LawTrustLedgerService as TrustLedgerService } from "./adapter/law-trust-engine-adapter";
```

Remove shims only after explicit owner approval and deprecation period.

---

## 6. Testing strategy

| Level          | Approach                                                                    |
| -------------- | --------------------------------------------------------------------------- |
| Unit           | Engine packages: full test pyramid moved with code                          |
| Law regression | Existing 94 trust tests run against Law adapter — **must pass identically** |
| Integration    | PostgreSQL repository adapter tests                                         |
| Parity         | Snapshot comparison: pre/post extraction report payloads                    |
| Cross-product  | Second product adapter smoke tests                                          |
| CI             | `pnpm test`, `pnpm test:coverage` — no regression tolerance                 |

### Test migration order

1. Copy tests with engine extraction (same assertions)
2. Add engine-only tests for generic dimension behaviour
3. Add Law adapter tests for matter segregation rules
4. Add APZBNK/APZEX adapter tests when products exist

---

## 7. Risk analysis

| Risk                                          | Severity   | Mitigation                                                    |
| --------------------------------------------- | ---------- | ------------------------------------------------------------- |
| Premature abstraction (wrong dimension model) | **High**   | Defer until second product requirements documented            |
| Law regression during extraction              | **High**   | Shim layer + 94-test regression gate                          |
| legal-business-core type conflict             | **Medium** | Deprecate simplified TrustAccount; migration guide            |
| Team velocity impact on LAW-015               | **High**   | Complete LAW-015-09/10 first; extraction is separate FIN epic |
| Package semver drift                          | **Medium** | ADR + automated API compatibility checks                      |
| Over-engineering for hypothetical products    | **Medium** | Extract proven code only; no speculative features             |
| Platform 5.0 modification pressure            | **Low**    | Engine stays below platform; products integrate               |
| Persistence adapter complexity                | **High**   | Extract after LAW-015-10 proves schema                        |

---

## 8. Estimated effort

| Phase                                   | Effort | Calendar (1 engineer)       |
| --------------------------------------- | ------ | --------------------------- |
| FIN-002 Governance + domain             | S–M    | 2–3 days                    |
| FIN-003 Core utilities                  | S      | 3–5 days                    |
| FIN-004 Ledger + workflow               | L      | 5–8 days                    |
| FIN-005 Allocation + reconciliation     | L      | 4–6 days                    |
| FIN-006 Interest + transfer + reporting | L      | 5–7 days                    |
| FIN-007 Persistence adapters            | L      | 5–8 days                    |
| FIN-008 Second product validation       | XL     | 8–12 days                   |
| **Total**                               | **XL** | **~32–49 engineering days** |

Additional buffer: 20% for integration issues.

**Recommendation:** Do not start extraction until LAW-015-10 complete (~estimated 2–4 weeks remaining on Law trust critical path).

---

## 9. Rollback plan

| Trigger                     | Action                                                     |
| --------------------------- | ---------------------------------------------------------- |
| Regression test failure     | Revert package extraction PR; shim layer keeps Law working |
| Second product cannot adapt | Pause extraction; document gap; extend engine              |
| Persistence adapter failure | Keep in-memory engine in Law until adapter fixed           |

Monorepo advantage: extraction PRs are revertible without deployment impact (Law not yet in production trust path).

---

## 10. Success criteria

| Criterion              | Measure                                                    |
| ---------------------- | ---------------------------------------------------------- |
| Law trust tests        | 94/94 pass post-extraction                                 |
| Full suite             | No regression                                              |
| Law API DTOs           | Unchanged                                                  |
| Second product adapter | Implements ledger + allocation without engine fork         |
| Code duplication       | Law `lib/trust/` reduced to policy + adapter + persistence |
| Documentation          | Engine docs + Law adapter docs complete                    |

---

## 11. What this plan explicitly does NOT do

- Create microservices
- Modify APZHUB Platform 5.0
- Implement banking, wallet, or exchange products
- Change Law trust UI or permissions
- Force immediate extraction (preconditions required)

See [FIN-001 Architecture Review](../reviews/FIN-001-Architecture-Review.md) for the formal deferral recommendation.
