# APZ Support — Product Status

| Field             | Value                                                                                                    |
| ----------------- | -------------------------------------------------------------------------------------------------------- |
| Product           | **APZ Support**                                                                                          |
| Closeout target   | **Version 1.0 – Production Ready**                                                                       |
| Status            | **PRODUCTION READY** · **CLOSED**                                                                        |
| Product phase     | **OPERATIONAL LEARNING**                                                                                 |
| Classification    | **A – Mostly Complete** (closeout complete)                                                              |
| Engineering       | **COMPLETE**                                                                                             |
| Tag               | `apz-support-1.0`                                                                                        |
| Freeze branch     | `release/apz-support-1.0`                                                                                |
| Mission           | APZ-SUPPORT-000 **APPROVED / CLOSED**                                                                    |
| Native programme  | APZ-SUPPORT-NATIVE-001 **COMPLETE / FROZEN** (N-01…N-04)                                                 |
| Quality baseline  | APZQEP Version 1.1 — Enterprise Quality Baseline                                                         |
| Designation       | **REFERENCE IMPLEMENTATION #002** — [REFERENCE-IMPLEMENTATION-002.md](./REFERENCE-IMPLEMENTATION-002.md) |
| Engine (internal) | Certified support adapter — **not user-visible**                                                         |
| Timestamp         | 20260808T181500Z                                                                                         |

## Status statement

APZ Support Version 1.0 is **Production Ready** and **CLOSED** under the APZHUB Delivery Standard v1.0.

Owner Release Decision: [release-1.0/OWNER-RELEASE-DECISION.md](./release-1.0/OWNER-RELEASE-DECISION.md) — **RC1 APPROVED**.

The product enters **Operational Learning**. Support 2.0 and native programme expansion remain out of scope except via Product Board.

## Authoritative faces

| Face                   | Path                                                                                                       |
| ---------------------- | ---------------------------------------------------------------------------------------------------------- |
| Owner Release Decision | [release-1.0/OWNER-RELEASE-DECISION.md](./release-1.0/OWNER-RELEASE-DECISION.md)                           |
| Evidence pack          | [release-1.0/ENGINEERING-EVIDENCE-PACK.md](./release-1.0/ENGINEERING-EVIDENCE-PACK.md)                     |
| Inventory              | [engineering/APZSUP-002-FINITE-PRODUCT-INVENTORY.md](./engineering/APZSUP-002-FINITE-PRODUCT-INVENTORY.md) |
| Workstreams            | [engineering/APZSUP-003-ENGINEERING-WORKSTREAMS.md](./engineering/APZSUP-003-ENGINEERING-WORKSTREAMS.md)   |

## Accepted v1.0 characteristics

- Realtime not product-enabled (flag-gated)
- Attachments: 1 MiB max; no delete
- Mapping durable on Postgres with Support entity types
- Fail-closed authz via `requireSupportPermission`
