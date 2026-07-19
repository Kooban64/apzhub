# Product Lifecycle (Operating Model)

> **Programme:** APZHUB-OPERATIONS-001  
> **Related:** [docs/products/PRODUCT-LIFECYCLE.md](../products/PRODUCT-LIFECYCLE.md) · [APZHUB-PRODUCT-PORTFOLIO](../products/APZHUB-PRODUCT-PORTFOLIO.md) · [PRODUCT-CERTIFICATION-STANDARD](../products/PRODUCT-CERTIFICATION-STANDARD.md)

---

## Purpose

Operational maturity stages for APZHUB products in the Product Suite. Complements the programme-stage lifecycle in the Product Engineering Framework.

---

## Stages

```text
Concept
  → Planning
  → Architecture
  → Implementation Ready
  → Implementation
  → Testing
  → Certification
  → Production
  → Maintenance
  → Deprecation
  → Retirement
```

| Stage                    | Meaning                                                                | Typical evidence                       |
| ------------------------ | ---------------------------------------------------------------------- | -------------------------------------- |
| **Concept**              | Intent only                                                            | Portfolio entry; vision stub           |
| **Planning**             | Roadmapped; little/no delivery                                         | Pack themes; missing adapters          |
| **Architecture**         | Design/ADR/adapters ready; product delivery incomplete                 | Architecture Ready maturity            |
| **Implementation Ready** | Pack complete; deps available; ready for Owner Approval of a programme | PRODUCTS-003 style assessment          |
| **Implementation**       | Named programme coding                                                 | Sprint Guide; In Development           |
| **Testing**              | Pyramid + product tests executing                                      | Vitest / Playwright                    |
| **Certification**        | Product cert gates + Acceptance Report                                 | PRODUCT-CERTIFICATION-STANDARD         |
| **Production**           | Owner-accepted slice in suite (may retain limitations)                 | ACCEPTED / CLOSED; maturity Production |
| **Maintenance**          | Patches, limitations, polish under Owner-gated programmes              | Hotfix / maintenance releases          |
| **Deprecation**          | Scheduled removal; users warned                                        | Portfolio + ADR                        |
| **Retirement**           | Removed from suite; docs archived                                      | Owner Approval                         |

---

## Rules

1. Do not skip to Implementation without Implementation Ready + Owner Approval.
2. Production may be **with documented limitations** (honesty rule).
3. Deprecation/Retirement require Owner Approval and migration notes.
4. Maturity labels live in Portfolio + Readiness Matrix after Acceptance.

---

## Mapping to programme lifecycle

| Operating stage                | Programme lifecycle ([AI-WORKFLOW](../foundation/AI-WORKFLOW.md)) |
| ------------------------------ | ----------------------------------------------------------------- |
| Concept → Architecture         | Bootstrap + Recommendation prep                                   |
| Implementation Ready           | Ready for Owner Approval                                          |
| Implementation → Certification | Implementation → Testing → Certification → Acceptance Report      |
| Production                     | Owner Acceptance → CLOSED                                         |
| Maintenance+                   | New programmes / hotfixes                                         |
