# Platform 1.4 Inherited Baseline

## Predecessor

Platform **1.3** — **CLOSED** — **PRODUCTION READY WITH LIMITATIONS** (CERT-002 **ACCEPTED**).

## Architecture retained (frozen unless future ADR)

```
Presentation → Platform Services → Connector → Engine
```

| Decision                                                 | Status                   |
| -------------------------------------------------------- | ------------------------ |
| Integration SDK **1.0.0**                                | Frozen                   |
| ADR-0070 Observe live alerts                             | Authoritative            |
| ADR-0071 Notification Delivery Option D                  | Authoritative            |
| ADR-0072 Realtime SSE                                    | Authoritative · SSE only |
| REST authoritative for mutations                         | Retained                 |
| Notification ≠ Email SoR                                 | Retained                 |
| Support owns ticket lifecycle                            | Retained                 |
| Observe owns alert lifecycle                             | Retained                 |
| Notification Delivery owns intent/delivery/routing/retry | Retained                 |
| Email SoR                                                | Excluded                 |
| Workflow Execute                                         | Gated                    |
| FIN-001                                                  | STOP                     |
| WebSockets                                               | Unauthorised             |

## Component classification (baseline confirmation)

| Component                                         | Classification                                                  |
| ------------------------------------------------- | --------------------------------------------------------------- |
| Platform Runtime                                  | **RETAIN**                                                      |
| Platform Services                                 | **EXTEND ADDITIVELY**                                           |
| Gateway / Request Pipeline                        | **RETAIN**                                                      |
| ProductionAuthorizationProvider                   | **RETAIN**                                                      |
| Event Bus                                         | **RETAIN** / extend consumers                                   |
| Outbox                                            | **EXTEND ADDITIVELY** (candidate for delivery durability)       |
| RealtimeSubscriptionService                       | **RETAIN** / operational harden                                 |
| Identity / Administration / Configuration / Audit | **RETAIN** / extend admin for delivery                          |
| Health / Diagnostics / Metrics                    | **EXTEND ADDITIVELY**                                           |
| Workbench                                         | **EXTEND ADDITIVELY** (ops surfaces only as needed)             |
| Integration SDK                                   | **RETAIN** (frozen)                                             |
| Product packages                                  | **RETAIN**                                                      |
| Provider adapters                                 | **EXTEND ADDITIVELY** (future interchangeable delivery adapter) |

## Historical evidence

CERT-001 · RR-001 · CERT-002 packs **must not be rewritten**.
