# APZ Analytics — Product Status

| Field             | Value                                                                                                    |
| ----------------- | -------------------------------------------------------------------------------------------------------- |
| Product           | **APZ Analytics**                                                                                        |
| Closeout target   | **Version 1.0 – Production Ready**                                                                       |
| Status            | **PRODUCTION READY** · **CLOSED**                                                                        |
| Product phase     | **OPERATIONAL LEARNING**                                                                                 |
| Classification    | **A – Mostly Complete** (closeout complete)                                                              |
| Engineering       | **COMPLETE**                                                                                             |
| Tag               | `apz-analytics-1.0`                                                                                      |
| Freeze branch     | `release/apz-analytics-1.0`                                                                              |
| Mission           | APZ-ANALYTICS-000 **APPROVED / CLOSED**                                                                  |
| Native programme  | APZ-ANALYTICS-NATIVE-001 **COMPLETE** (N-01…N-04)                                                        |
| Quality baseline  | APZQEP Version 1.1 — Enterprise Quality Baseline                                                         |
| Designation       | **REFERENCE IMPLEMENTATION #006** — [REFERENCE-IMPLEMENTATION-006.md](./REFERENCE-IMPLEMENTATION-006.md) |
| Identity          | Decision Companion                                                                                       |
| Engine (internal) | Metabase CE foundation — **not user-visible**                                                            |
| Timestamp         | 20260808T191500Z                                                                                         |

## Status statement

APZ Analytics Version 1.0 is **Production Ready** and **CLOSED** under the APZHUB Delivery Standard v1.0.

Owner Release Decision: [release-1.0/OWNER-RELEASE-DECISION.md](./release-1.0/OWNER-RELEASE-DECISION.md) — **RC1 APPROVED**.

The product enters **Operational Learning**. Analytics 2.0 and native programme expansion remain out of scope except via Product Board.

## Authoritative faces

| Face                   | Path                                                                                                     |
| ---------------------- | -------------------------------------------------------------------------------------------------------- |
| Owner Release Decision | [release-1.0/OWNER-RELEASE-DECISION.md](./release-1.0/OWNER-RELEASE-DECISION.md)                         |
| Evidence pack          | [release-1.0/ENGINEERING-EVIDENCE-PACK.md](./release-1.0/ENGINEERING-EVIDENCE-PACK.md)                   |
| Inventory              | [engineering/APZAN-002-FINITE-PRODUCT-INVENTORY.md](./engineering/APZAN-002-FINITE-PRODUCT-INVENTORY.md) |
| Workstreams            | [engineering/APZAN-003-ENGINEERING-WORKSTREAMS.md](./engineering/APZAN-003-ENGINEERING-WORKSTREAMS.md)   |

## Accepted v1.0 characteristics

- Live embed not productised (metadata only)
- Analytics registry in-memory MVP (documented PRWL)
- Fail-closed authz via `requireAnalyticsPermission`
- Decision intelligence fail-closed in production
