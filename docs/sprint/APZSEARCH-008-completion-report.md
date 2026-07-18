# APZHUB Programme — Milestone Completion Report

| Field              | Value                                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------------------------ |
| **Document ID**    | APZSEARCH-008-CR                                                                                                   |
| **Milestone**      | APZSEARCH-008 — Search Vertical Certification & Production Readiness                                               |
| **Programme**      | APZHUB Platform Search                                                                                             |
| **Status**         | **COMPLETE**                                                                                                       |
| **Classification** | **PRODUCTION_READY_WITH_LIMITATIONS**                                                                              |
| **Date**           | 2026-07-14                                                                                                         |
| **Authority**      | Knowledge Foundation · owner-approved certification milestone · ADRs 0060 / 0061 / 0064                            |
| **Predecessor**    | APZSEARCH-007 — Search HTTP API, Typed Client & Workbench (Complete)                                               |
| **Successor**      | APZSEARCH-009 — Cross-Product Search Integration Framework (**recommended; not started; requires owner approval**) |

---

## 1. Executive Summary

Certified the Platform Search vertical end-to-end as a production-ready APZHUB capability with documented limitations. **No new Search functionality.** Architecture frozen at the APZSEARCH-007 surface.

Vertical audit **0 violations**. Prior layered audits **001–007 PASS**. OpenAPI **Platform Search** validated. Certification harness delivered. Playwright / Next live `webServer` **LIMITED** by a **pre-existing** Testing dynamic-route slug conflict (not a Search defect). Live Meilisearch not required in unit CI. Public index HTTP omitted by design. No product indexers.

**Verdict:** **PRODUCTION_READY_WITH_LIMITATIONS** — same class as Documents (APZDOCS-006).

---

## 2. Certification Scope

| In scope                                                                         | Out of scope                            |
| -------------------------------------------------------------------------------- | --------------------------------------- |
| Architecture / dependency / boundary audits                                      | New HTTP routes                         |
| Security re-review (no redesign)                                                 | Provider capability changes             |
| HTTP / typed client / Workbench / gateway / platform / provider re-certification | Indexing / product adapters             |
| Coverage aggregation + harness                                                   | OCR / AI / semantic / vector            |
| Production readiness classification                                              | Event Bus / workers / notifications     |
| Documentation + foundation stop points                                           | OpenSearch / Typesense / PostgreSQL FTS |

---

## 3. Architecture

Certified path:

```text
Workbench → Typed Client → HTTP → PlatformServiceGateway → RequestPipeline
  → Production Authorization → Search Platform Services
    → Provider Resolver → Meilisearch Provider → Adapter → SDK → Meilisearch
```

Management and execution planes remain isolated. Canonical contracts only. No Meilisearch leakage into `apps/web`.

---

## 4. Architecture Audit

**PASS** — 0 violations. See [Architecture / Dependency / Boundary Audit](../reviews/APZSEARCH-008-architecture-dependency-boundary-audit.md).

---

## 5. Dependency Audit

**PASS** — Consumers → Workbench → Client → HTTP → Gateway → Platform Services → (execution) Adapter/SDK → Contracts. No reverse dependencies. Prior audits 001–007 also **PASS**.

**Certification fixes (pins only; no behaviour changes):**

- APZSEARCH-003 audit version pins accept subsequent certified bumps (`search-contracts` **0.4.0**, `platform-services` **0.18.0`).
- Foundation harnesses `testing/search-foundation/apzsearch-001-foundation.test.ts` and `apzsearch-003-foundation.test.ts` assert the certified floor (**0.4.0** / **0.2.0** / **0.18.0**) so historical milestone smoke tests remain green on the certified stack.

---

## 6. Boundary Audit

**PASS** — handlers → gateway only; UI → typed client only; no Meilisearch in apps/web; adapter no platform-services; management ≠ execution; no internal index HTTP; no OCR/AI/semantic/vector/workers.

---

## 7. Security Review

**PASS** — authn/authz/tenant-org-classification isolation/provider selection/error-secret-diagnostics redaction/typed client safety/safe highlights. No security behaviour changes. See [Security Review](../reviews/APZSEARCH-008-security-review.md).

---

## 8. HTTP Certification

**PASS** — `/api/v1/search` query + management; OpenAPI parity; auth; permission maps; omitted index routes proven absent. See [HTTP Certification](../reviews/APZSEARCH-008-http-certification.md).

---

## 9. Typed Client Certification

**PASS** — full certified operation surface + mock parity; `/api/v1/search` only. See [Typed Client Certification](../reviews/APZSEARCH-008-typed-client-certification.md).

---

## 10. Workbench Certification

**PASS** (unit/component) — manifests, navigation, query/management views, a11y fundamentals. Playwright **LIMITED**. See [Workbench Certification](../reviews/APZSEARCH-008-workbench-certification.md).

---

## 11. Gateway Certification

**PASS** — `searchExecution*` + management facets; RequestPipeline; production authz; context; error mapping. See [Gateway & Platform Certification](../reviews/APZSEARCH-008-gateway-platform-certification.md).

---

## 12. Provider Certification

**PASS** — Meilisearch adapter **0.1.0** re-certified; capability/compatibility matrices unchanged; mock REST. See [Provider Certification](../reviews/APZSEARCH-008-provider-certification.md).

---

## 13. Platform Service Certification

**PASS** — provider resolver; mandatory tenant filters; permission enforcement; management/execution separation. See [Gateway & Platform Certification](../reviews/APZSEARCH-008-gateway-platform-certification.md).

---

## 14. Testing

| Gate                                                                | Result                                                            |
| ------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `pnpm audit:search-vertical`                                        | **PASS** (0 violations)                                           |
| Layered audits `audit:search-foundation` … `audit:search-workbench` | **PASS**                                                          |
| OpenAPI `pnpm openapi:validate:platform`                            | **PASS**                                                          |
| Certification harness `testing/search-vertical`                     | **PASS**                                                          |
| Prior unit suites (HTTP/client/Workbench/execution/adapter/SDK)     | Prior evidence **PASS**                                           |
| Playwright mocked e2e                                               | Spec present; live webServer **LIMITED** (external slug conflict) |

---

## 15. Coverage

Scoped Search vertical re-measure (008): **statements 97.04%** · **branches 89.33%** · **functions 97.57%** · **lines 97.04%** (≥95% lines/statements/functions). Layer baselines retained (007 HTTP/client/Workbench **98.73%** lines; 006 execution **97.75%**; 005 adapter **95.01%**; 004 SDK **98.01%**). Live Meilisearch/Postgres **LIMITED** in unit CI. Detail: [Coverage Baseline](../reviews/APZSEARCH-008-coverage-baseline.md).

---

## 16. Quality Gates

| Gate                                                                                                              | Result                                                        |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Vertical architecture / dependency / boundary audit                                                               | **PASS**                                                      |
| Security review (documentary + prior tests)                                                                       | **PASS**                                                      |
| OpenAPI validation                                                                                                | **PASS**                                                      |
| Search package typecheck (contracts / persistence / SDK / meilisearch / platform-services)                        | **PASS**                                                      |
| Search regression suites (170 tests)                                                                              | **PASS**                                                      |
| Product regressions (Documents / Support / Testing / Reporting / Projects plane)                                  | **PASS**                                                      |
| Package versions (contracts 0.4.0 / persistence 0.2.0 / SDK 0.1.0 / meilisearch 0.1.0 / platform-services 0.18.0) | **PASS**                                                      |
| Playwright live Next                                                                                              | **LIMITED** (external Testing slug conflict; predates Search) |

---

## 17. Production Classification

**PRODUCTION_READY_WITH_LIMITATIONS**

Evidence-based, same class as Documents: mocked e2e **LIMITED** by pre-existing Next slug conflict; no product indexers; public index HTTP omitted by design; live Meilisearch not required in unit CI.

---

## 18. Known Limitations

1. No product indexing adapters (Projects, Support, Documents, APZ TCMS, Reporting) — deferred to APZSEARCH-009.
2. Public index/document HTTP omitted (ADR-0064); gateway-only.
3. No OCR / AI / semantic / vector / Event Bus / workers.
4. Playwright against Next `webServer` may fail due to Testing slug conflict:
   - `apps/web/app/api/v1/testing/traceability/[relationshipId]`
   - `apps/web/app/api/v1/testing/traceability/[resourceType]/[resourceId]`  
     Predates Search; **not** a Search defect.
5. Live Meilisearch not exercised in unit CI (mock REST).
6. Postgres search persistence drivers typechecked but not fully unit-covered with live DB.

---

## 19. Technical Debt

- Resolve Next.js Testing `relationshipId` vs `resourceType` slug conflict to unlock Playwright / production `build` where blocked.
- Expand live Meilisearch / Postgres integration tests under ops-approved environments.
- APZSEARCH-009 product indexers await owner approval.

---

## 20. Package / artefact versions (certified)

| Artefact                          | Version    |
| --------------------------------- | ---------- |
| `@apzhub/search-contracts`        | **0.4.0**  |
| `@apzhub/search-persistence`      | **0.2.0**  |
| `@apzhub/integration-search-sdk`  | **0.1.0**  |
| `@apzhub/integration-meilisearch` | **0.1.0**  |
| `@apzhub/platform-services`       | **0.18.0** |
| OpenAPI Platform Search           | **1.1.0**  |

No package version bumps in APZSEARCH-008 (certification only).

---

## 21. Recommendation

**APZSEARCH-009 — Cross-Product Search Integration Framework**

Introduce product indexing adapters for Projects, Support, Documents, APZ TCMS, and Reporting. The Search Platform itself remains unchanged. **No implementation in this milestone.**

**Do not begin APZSEARCH-009 without explicit owner approval.**

---

## 22. Stop condition

**APZSEARCH-008 is COMPLETE.**

Stop before **APZSEARCH-009 — Cross-Product Search Integration Framework** without owner approval.

Do not start product indexing adapters, workers, OCR, AI, semantic/vector search, Event Bus, or public index HTTP without a new approved guide.

---

## Document control

| Item                  | Value                                                                            |
| --------------------- | -------------------------------------------------------------------------------- |
| Document ID           | **APZSEARCH-008-CR**                                                             |
| Report location       | `docs/sprint/APZSEARCH-008-completion-report.md`                                 |
| Overview              | `docs/reviews/APZSEARCH-008-search-vertical-certification.md`                    |
| Coverage baseline     | `docs/reviews/APZSEARCH-008-coverage-baseline.md`                                |
| Audit script          | `scripts/apzsearch-008-search-vertical-audit.mjs` / `pnpm audit:search-vertical` |
| Certification harness | `testing/search-vertical/apzsearch-008-certification.test.ts`                    |
| Programme stop point  | `docs/foundation/CURRENT-MILESTONE.md`                                           |
| Prepared for          | Owner filing / programme archive                                                 |

**End of report.**
