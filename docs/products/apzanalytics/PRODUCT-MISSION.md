# APZ Analytics — Product Mission

| Field     | Value                                                                                     |
| --------- | ----------------------------------------------------------------------------------------- |
| Programme | APZ-ANALYTICS-000                                                                         |
| Status    | **APPROVED**                                                                              |
| Timestamp | 20260805T174500Z                                                                          |
| Approval  | [OWNER-APPROVAL.md](./OWNER-APPROVAL.md)                                                  |
| Board     | [PRODUCT-BOARD-ENTERPRISE-INSIGHT.md](./PRODUCT-BOARD-ENTERPRISE-INSIGHT.md) **IN FORCE** |

## Mission statement

> **APZ Analytics is the enterprise insight layer of APZHUB — Enterprise Decision Support that answers how the enterprise is performing by observing the operational business layer, without becoming the System of Record for any operational datum.**

## Product identity

| APZ Analytics **is**                            | APZ Analytics is **not**   |
| ----------------------------------------------- | -------------------------- |
| Enterprise Decision Support                     | A reporting product        |
| The product that answers performance questions  | A dashboard catalogue      |
| Interpretation, trends, KPIs, portfolio insight | An operational application |
| The memory of how work performs                 | The truth of the work      |

**Analytics asks:** _How is the enterprise performing?_  
**Operational products ask:** _How do we do the work?_

Keep those questions separate.

## Product purpose

APZ Analytics exists as the **Analytics & Insight** enterprise capability of APZHUB.

It explains. It does **not** own:

- project plans (APZ Projects)
- service requests (APZ Support)
- time records (APZ Time)
- document lifecycle (APZ Documents)
- process definitions (APZ Workflow)
- quality evidence / release decisions (APZQEP)

Those remain Systems of Record. Analytics **consumes** them. It never becomes one.

## Governing principles (complete set)

1. Analytics explains the business. It does not become the business.
2. Analytics consumes Systems of Record. It never becomes one.
3. Business questions come before visualisations.
4. Analytics exists to improve decisions, not simply to measure activity.

Horizons: Operational · Tactical · Strategic — see [INSIGHT-HORIZONS.md](./INSIGHT-HORIZONS.md).  
Questions: [ENTERPRISE-QUESTIONS.md](./ENTERPRISE-QUESTIONS.md).

Identity: **enterprise decision product** — never “the dashboard product.”

## Primary users

| Audience   | Role in the product                                               |
| ---------- | ----------------------------------------------------------------- |
| Executives | Ask whether the enterprise is healthy and where risk concentrates |
| Managers   | Ask whether delivery, SLAs, and bottlenecks are improving         |
| Team leads | Ask where effort and delay concentrate                            |
| Quality    | Ask whether releases are becoming safer                           |
| Operators  | Ask portfolio / operational health without owning the data        |

## Primary business problem

The five Reference Implementations generate rich operational truth, but leaders still reconstruct “how are we doing?” from tribal knowledge, exports, and disconnected tools. Without a governed insight product, APZHUB risks either (a) remaining blind at portfolio scale or (b) inventing a parallel SoR inside “analytics.” APZ Analytics exists to answer enterprise questions while protecting SoR discipline.

## Product principles

1. **Questions first** — scope starts with decisions to support, not charts to draw.
2. **Decision before measurement** — activity counters alone are not the product.
3. **Observe, never own** — derived insight only; operational truth stays in RI products.
4. **Decision support** — success is better decisions, not more widgets.
5. **Three horizons** — Operational / Tactical / Strategic answer paths.
6. **Native APZHUB experience** — users never navigate a separate BI-engine world.
7. **Engines stay invisible** — no BI vendor branding in product UX.
8. **Strong boundaries** — Analytics does not absorb Projects, Support, Time, Documents, or Workflow.
9. **Insight layer, not app layer** — observes the operational business layer; does not compete with it.

## Product promise

If a leader has an enterprise performance question that APZHUB should answer, they can ask it through APZ Analytics and trust that the answer is grounded in the Systems of Record — without Analytics becoming a second source of truth.

## Long-term vision

APZ Analytics becomes the trusted memory of how work performs across the operational business layer — while remaining an insight product that never forgets where truth lives.

See also: [PRODUCT-VISION.md](./PRODUCT-VISION.md) · [VALUE-PROPOSITION.md](./VALUE-PROPOSITION.md) · [RELATIONSHIP-TO-REFERENCE-IMPLEMENTATIONS.md](./RELATIONSHIP-TO-REFERENCE-IMPLEMENTATIONS.md)
