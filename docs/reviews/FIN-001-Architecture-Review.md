# FIN-001 — APZOR Financial Engine Architecture Review

> **Story:** FIN-001  
> **Date:** 2026-07-07  
> **Reviewer:** Architecture extraction analysis (planning milestone)  
> **Scope:** LAW-015-01 through LAW-015-08 Trust Accounting implementation

---

## 1. Executive summary

FIN-001 analysed the complete Trust Accounting implementation (71 source files, 94 unit tests, 7 engine layers) to determine whether it should become a reusable **APZOR Financial Engine** shared across APZHUB products.

**Finding:** Approximately **70% of the implementation is generic financial capability** (double-entry ledger, workflow, sub-ledger allocation, reconciliation, interest, transfers, reporting). Approximately **30% is Law-specific** (matter segregation, LPC compliance, trust statements, legal chart naming, `legal.trust.*` catalogue).

The codebase is **well-layered and extraction-ready in design** (repository interfaces, pure engines, read-only reconciliation/reporting, single ledger authority). However, **extraction should not begin now** because:

1. Law trust is in-memory only — persistence and APIs are not yet implemented (LAW-015-09/10).
2. No second product has documented requirements to validate abstractions.
3. Significant Law coupling exists in type names and fixed `clientId`/`matterId` dimensions.
4. Premature extraction would disrupt the Law critical path without immediate reuse benefit.

---

## 2. Verdict

# DEFER EXTRACTION

Extraction is **architecturally justified** but **operationally premature**. Proceed with Law Platform completion (LAW-015-09 Dashboard, LAW-015-10 APIs/persistence) first. Revisit extraction as **FIN-002+** when preconditions in the extraction plan are met.

This is not **DO NOT EXTRACT** — the trust implementation demonstrates substantial reusable value.  
This is not immediate **EXTRACT** — conditions for safe migration are not yet satisfied.

---

## 3. Technical reasoning

### 3.1 Evidence for future extraction

| Factor                            | Assessment                                                                                                |
| --------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Layered architecture              | ✅ Clear service stack with ledger authority                                                              |
| Repository interfaces             | ✅ Persistence-ready; in-memory is swappable                                                              |
| Pure engines                      | ✅ posting-builder, balance, reconciliation-engine, interest-engine, reporting-engine are product-neutral |
| Immutability model                | ✅ Universal regulated-ledger pattern                                                                     |
| Test coverage                     | ✅ 94 trust tests; 1780 full suite — strong regression baseline                                           |
| Multi-product applicability       | ✅ Banking, escrow, wallet, treasury show high reuse potential                                            |
| No Platform modification required | ✅ Engine fits below Platform 5.0 boundary                                                                |

### 3.2 Evidence for deferral

| Factor                           | Assessment                                                                                                             |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| In-memory only                   | ❌ No PostgreSQL adapters to validate extraction boundaries                                                            |
| Not wired to product             | ❌ No APIs, workbench, or production path — lowest-risk time is before wiring, but abstraction needs persistence proof |
| Law-specific dimensions baked in | ⚠️ `clientId`, `matterId` hardcoded in types — abstraction cost non-trivial                                            |
| Transfer types law-specific      | ⚠️ `matter_to_matter` etc. need registry pattern                                                                       |
| Conflicting legacy model         | ⚠️ `legal-business-core` simplified TrustAccount unrelated to engine                                                   |
| Single consumer                  | ❌ Reuse is theoretical until second product validates                                                                 |
| LAW-015 incomplete               | ❌ Dashboard, APIs, persistence, E2E remain                                                                            |

### 3.3 Why not DO NOT EXTRACT

A **DO NOT EXTRACT** verdict would be appropriate if:

- The implementation were deeply entangled with Law domain entities — **it is not** (IDs only, no imports from clients/matters modules).
- Generic patterns were weak — **they are strong** (double-entry, append-only journal, sub-ledger, reconciliation).
- No other products could reuse — **assessment shows high reuse** for escrow, banking, client money, treasury.

Keeping the engine Law-only would duplicate effort when APZBNK or escrow products are built.

### 3.4 Why not immediate EXTRACT

An immediate **EXTRACT** verdict would require:

- Completed persistence layer to prove repository adapters — **missing**.
- Second product requirements — **not documented**.
- Stable Law API surface — **LAW-015-10 not started**.
- Governance (ADR, semver) — **not yet created**.

Extracting now adds 32–49 engineering days of risk during Law delivery with zero immediate consumer benefit.

---

## 4. Component classification summary

| Layer          | Generic % | Law-specific % | Extraction complexity |
| -------------- | :-------: | :------------: | :-------------------: |
| Ledger         |    85%    |      15%       |        Medium         |
| Workflow       |    80%    |      20%       |        Medium         |
| Allocation     |    65%    |      35%       |         High          |
| Reconciliation |    95%    |       5%       |          Low          |
| Interest       |    90%    |      10%       |          Low          |
| Transfer       |    70%    |      30%       |         High          |
| Reporting      |    75%    |      25%       |        Medium         |

See [APZOR-Financial-vs-Law-Separation.md](../architecture/APZOR-Financial-vs-Law-Separation.md) for the complete matrix.

---

## 5. Product reuse assessment

| Product                                             | Reuse fit  | Notes                                              |
| --------------------------------------------------- | :--------: | -------------------------------------------------- |
| Law Platform                                        | ✅ Primary | Source implementation                              |
| APZBNK                                              |  ✅ High   | Ledger, recon, interest — adds bank feed           |
| Escrow Platform                                     |  ✅ High   | Structurally similar to trust                      |
| Client Money Platform                               |  ✅ High   | Jurisdiction profiles like Law                     |
| Wallet Platform                                     |  ✅ High   | Ledger + transfers                                 |
| Treasury Platform                                   |  ✅ High   | Interest + reporting                               |
| APZEX                                               | ⚠️ Medium  | Settlement patterns; less interest/statement reuse |
| Stablecoin / Payment / Merchant / Lending / Custody | ⚠️ Medium  | Core ledger; product-specific extensions           |

No product designs produced in FIN-001. Assessment is capability-level only.

---

## 6. Risks

| Risk                                 | If extract now                        | If defer                                        |
| ------------------------------------ | ------------------------------------- | ----------------------------------------------- |
| Law delivery delay                   | **High**                              | Low                                             |
| Wrong abstraction                    | **High**                              | Medium — mitigated by second product input      |
| Duplicate engines in future products | Low                                   | **Medium** — accept short-term duplication risk |
| Regression                           | **High** without persistence baseline | Low — extract with full adapter suite           |
| legal-business-core conflict         | **Medium**                            | Low — resolve in FIN-003                        |

---

## 7. Benefits of deferred extraction

| Benefit                                                           | Timeline        |
| ----------------------------------------------------------------- | --------------- |
| Law trust reaches production-ready (APIs, persistence, dashboard) | LAW-015-09/10   |
| Extraction validates against real PostgreSQL adapters             | Post LAW-015-10 |
| Second product requirements inform dimension abstraction          | FIN-008         |
| Engine ships with proven persistence story                        | FIN-007         |
| Zero disruption to LAW-015 critical path                          | Immediate       |

---

## 8. Recommended next steps

| Step | Story            | Owner action                                          |
| ---- | ---------------- | ----------------------------------------------------- |
| 1    | LAW-015-09       | Approve Trust Dashboard & Workbench                   |
| 2    | LAW-015-10       | Approve Trust REST APIs + persistence                 |
| 3    | FIN-002          | Governance ADR + generic domain package design        |
| 4    | Product planning | Document APZBNK or Escrow financial requirements      |
| 5    | FIN-003+         | Execute extraction plan phases when preconditions met |

---

## 9. Deliverables produced (FIN-001)

| #   | Deliverable                                                                                                          | Status |
| --- | -------------------------------------------------------------------------------------------------------------------- | :----: |
| 1   | [APZOR-Financial-Engine-Reference-Architecture.md](../architecture/APZOR-Financial-Engine-Reference-Architecture.md) |   ✅   |
| 2   | [APZOR-Financial-Engine-Domain-Model.md](../architecture/APZOR-Financial-Engine-Domain-Model.md)                     |   ✅   |
| 3   | [APZOR-Financial-vs-Law-Separation.md](../architecture/APZOR-Financial-vs-Law-Separation.md)                         |   ✅   |
| 4   | [APZOR-Financial-Integration-Model.md](../architecture/APZOR-Financial-Integration-Model.md)                         |   ✅   |
| 5   | [APZOR-Financial-Extraction-Plan.md](../architecture/APZOR-Financial-Extraction-Plan.md)                             |   ✅   |
| 6   | This review                                                                                                          |   ✅   |
| 7   | [FIN-001 completion report](../sprint/FIN-001-completion-report.md)                                                  |   ✅   |

---

## 10. Approval request

**Request owner approval of:**

1. **DEFER EXTRACTION** verdict
2. Proceed with **LAW-015-09** (Trust Dashboard) without extraction work
3. Schedule **FIN-002** (governance + domain package design) after LAW-015-10

**Do not approve:**

- Package creation or code movement in FIN-001
- Platform framework changes
- Interruption of Law trust delivery for extraction

---

## 11. Sign-off

| Role                | Verdict                             |
| ------------------- | ----------------------------------- |
| Architecture        | **DEFER EXTRACTION**                |
| Law Platform impact | No code changes in FIN-001          |
| Platform impact     | None — Platform 5.0 unchanged       |
| Quality gates       | No regressions (documentation only) |
