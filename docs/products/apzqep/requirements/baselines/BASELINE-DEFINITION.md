# Baseline Definition

A **Requirement Baseline** is a governed configuration item owned by the
Requirements bounded context.

It is a named, numbered, tenant-scoped collection of immutable
**Requirement Content Versions**. Downstream quality activities must consume
baselines — never mutable live Requirements.

## Binding properties

| Property | Rule |
|---|---|
| Identity | Server-generated baseline identifier (`rbl_…`) |
| Number | Server-generated positive integer, unique per tenant |
| Membership | Requirement Content Version references only |
| States | Draft → Locked → Archived |
| Integrity | Deterministic SHA-256 fingerprint at lock |
| Unlock | Not authorised |
| Restore / delete | Not authorised |

See [DOMAIN-MODEL.md](./DOMAIN-MODEL.md), [MEMBERSHIP-RULES.md](./MEMBERSHIP-RULES.md),
and [INTEGRITY.md](./INTEGRITY.md).
