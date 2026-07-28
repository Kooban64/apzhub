# Idempotency Model

| Boundary                   | Key                                     | Behaviour                                                           |
| -------------------------- | --------------------------------------- | ------------------------------------------------------------------- |
| Intent creation            | `(tenant_id, idempotency_key)`          | Unique; return existing                                             |
| Delivery creation          | `(tenant_id, delivery idempotency_key)` | Unique per channel/recipient design                                 |
| Work claiming              | Row lease                               | At-most-one active claim                                            |
| Provider dispatch          | Attempt + provider_reference            | Store provider ref; retries must not blindly re-send without policy |
| Provider callback (future) | provider_reference + tenant             | Upsert by reference                                                 |
| Manual replay              | New idempotency namespace / replay id   | Explicit new attempt chain                                          |
| Automatic retry            | Same delivery id + new try number       | Continues same delivery                                             |

## Acknowledgement

External providers cannot guarantee exactly-once. Platform minimises duplicates via durable idempotency keys, leases, and provider reference recording. Clients must tolerate rare duplicates.
