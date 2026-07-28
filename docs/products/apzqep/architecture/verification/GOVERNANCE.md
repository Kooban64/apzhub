# Governance — APZQEP-ARCH-009

> Companion extract. Authoritative detail: [VERIFICATION-ARCHITECTURE.md](./VERIFICATION-ARCHITECTURE.md) §7.

## Pillars

| Pillar            | Rule                                                                    |
| ----------------- | ----------------------------------------------------------------------- |
| Ownership         | Tenant-scoped records under authenticated actors                        |
| Authority         | Explicit authority kind + actor; delegation does not bypass permissions |
| Approval / review | Policy-gated dual control where required                                |
| Supersession      | Predecessor/successor chains; bounded heads                             |
| History           | Domain history ≠ Platform Audit                                         |
| Immutability      | Closed/immutable-context decisions not silently rewritten               |
| Policy            | Rationale, waiver authority, expiry, kind compatibility                 |

Superadmin is an explicit audited tier, not a bypass.
