# Platform 1.4 Architecture Drivers

| Driver                        | Relevance to theme                                   | Implies redesign?                             |
| ----------------------------- | ---------------------------------------------------- | --------------------------------------------- |
| Persistence durability        | Notification runtime must survive process restart    | No — extend Postgres/outbox ownership         |
| Fault isolation               | Worker vs API process isolation                      | Additive only                                 |
| Asynchronous processing       | Delivery already async; harden retries/DLQ           | No                                            |
| Replay safety                 | Event + delivery idempotency                         | Preserve ADR-0071/0072                        |
| Tenant isolation              | Unchanged mandatory                                  | No                                            |
| Provider isolation            | External provider = adapter only                     | No Email SoR                                  |
| Operational visibility        | Metrics/diagnostics/admin                            | Extend Administration surfaces                |
| Queue resilience              | Durable queue + DLQ                                  | ADR if ownership changes                      |
| Realtime scalability          | SSE capacity evidence; fan-out only if measured need | Future ADR if multi-instance fan-out required |
| Security posture              | Deny-by-default retained                             | No parallel authz                             |
| Compliance evidence           | POPIA pathway                                        | Compliance programme, not redesign            |
| Audit completeness            | Delivery/admin actions                               | Extend existing audit                         |
| Product boundary preservation | Products never call providers                        | Retain                                        |

## Principle

Do **not** redesign Presentation → Platform Services → Connector → Engine unless an authorised outcome cannot be met. Current architecture meets Platform 1.4 outcomes via **additive extension** and targeted ADRs.
