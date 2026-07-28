# Recovery Model

| Failure                            | Authoritative state      | Recovery                                                     |
| ---------------------------------- | ------------------------ | ------------------------------------------------------------ |
| App/API restart                    | Postgres                 | Intact; workers continue claiming                            |
| Worker crash before dispatch       | `processing` with lease  | Lease expiry → reclaim                                       |
| Worker crash after provider accept | try + provider_reference | Reconcile via provider ref / idempotent complete             |
| Database restart                   | Postgres                 | Resume after connectivity; workers back off                  |
| Redis restart                      | N/A (not required)       | —                                                            |
| Duplicate worker startup           | Leases                   | Safe concurrent claimants                                    |
| Provider timeout before accept     | try failed transient     | retry_scheduled                                              |
| Provider timeout after accept      | ambiguous                | Prefer provider_reference reconciliation; avoid blind resend |
| Network partition                  | local claims             | Expire leases; requeue                                       |
| Deployment interrupt               | leases                   | Drain / expire                                               |
| Expired lease                      | claim metadata           | Requeue eligible                                             |

No process-local Map is authoritative after cutover.
