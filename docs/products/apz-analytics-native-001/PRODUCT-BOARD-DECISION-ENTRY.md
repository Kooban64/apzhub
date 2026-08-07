# Product Board Principle — Decision Entry (APZ Analytics)

| Field     | Value                           |
| --------- | ------------------------------- |
| Programme | APZ-ANALYTICS-NATIVE-001        |
| Status    | **IN FORCE**                    |
| Timestamp | 20260805T180500Z                |
| Authority | Product Board (pre N-02)        |
| Gate      | **Recorded before N-02 begins** |

## Decision Entry Principle

> **Users enter Analytics through a business question, not through a dashboard.**

| Avoid (presentation-first) | Prefer (question-first)            |
| -------------------------- | ---------------------------------- |
| Sales Dashboard            | How healthy are our projects?      |
| Support Dashboard          | Where is delivery slowing down?    |
| Project Dashboard          | Which customers require attention? |
|                            | Which teams are overloaded?        |
|                            | What changed since last week?      |

The dashboard becomes an **answer**. Not the product.

## Insight → Decision Principle

> **Every insight should naturally lead to an operational decision.**

If a chart cannot help someone decide something, it probably is not useful enough for APZ Analytics.

## Companion identity directive (N-02)

> **The first thing users should see is the question they need answered—not the dashboard that happens to contain the answer.**

## Identity vocabulary

| Prefer (product identity)      | Avoid (presentation leak)    |
| ------------------------------ | ---------------------------- |
| Questions                      | Dashboard (as product noun)  |
| Decisions                      | Report (as product noun)     |
| Insights                       | Metrics catalogue            |
| Operational health             | Visualisation-first language |
| Risks · Opportunities · Trends |                              |

## Slice application

| Slice    | Application                                                                                                                                                             |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **N-02** | Session/RBAC + hide presentation-asset / operator surfaces from default identity; Activity Bar / primary grants use decision identity (`analytics.view`, APZ Analytics) |
| **N-03** | Full question-first experience; horizons; EQ catalogue as entry                                                                                                         |
| **N-04** | Ops language remains decision-support                                                                                                                                   |

Related: [PRODUCT-BOARD-ENTERPRISE-INSIGHT.md](./PRODUCT-BOARD-ENTERPRISE-INSIGHT.md) · [PRODUCT-VOCABULARY.md](./PRODUCT-VOCABULARY.md)
