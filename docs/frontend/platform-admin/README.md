# Platform Admin — control plane UX

| Field        | Value                                                              |
| ------------ | ------------------------------------------------------------------ |
| Status       | **LOCKED · INFORMATION ARCHITECTURE** — 2026-08-17                 |
| Audience     | Platform Administrators of the **APZ commercial platform**         |
| Not in scope | APZOR tenant administration (Org Admin / workspace administration) |
| Authority    | Owner literal screen specs — reproduce in Cursor                   |

## Definition

**Platform Admin** = administration of the **APZ commercial platform itself** (tenants, subscriptions, marketplace, provisioning, providers, platform IAM, ops, governance).

**APZOR** appears under **Tenants** exactly like every other customer. Platform authority is **above** tenants and must never be inferred from APZOR employment or APZOR tenant membership.

## Document map

| Doc                                                              | Contents                                                      |
| ---------------------------------------------------------------- | ------------------------------------------------------------- |
| [00-shell-and-ia.md](./00-shell-and-ia.md)                       | Overall shell · master menu · compact sidebar · secondary nav |
| [00-visual-standard.md](./00-visual-standard.md)                 | Density · honesty · cards vs tables · provider naming         |
| [screens/01-overview.md](./screens/01-overview.md)               | Overview (first visual)                                       |
| [screens/02-tenants.md](./screens/02-tenants.md)                 | Tenants master + tenant detail                                |
| [screens/03-products.md](./screens/03-products.md)               | Products catalogue + APZPRD capabilities                      |
| [screens/04-providers.md](./screens/04-providers.md)             | Privileged provider surfaces                                  |
| [screens/05-provisioning.md](./screens/05-provisioning.md)       | Queue · failures · inspector                                  |
| [screens/06-identity-access.md](./screens/06-identity-access.md) | Platform administrators (not tenant users)                    |
| [screens/07-billing.md](./screens/07-billing.md)                 | Commercial operations                                         |
| [screens/08-operations.md](./screens/08-operations.md)           | Capability-named health                                       |
| [screens/09-audit.md](./screens/09-audit.md)                     | Platform audit + event drawer                                 |
| [screens/10-global-search.md](./screens/10-global-search.md)     | Tenant lookup / global search                                 |
| [screens/11-responsive.md](./screens/11-responsive.md)           | Desktop-first · mobile critical path                          |
| [MOCKUP-SEQUENCE.md](./MOCKUP-SEQUENCE.md)                       | Ordered mockup stream (go slowly)                             |

## Relationship to existing `/ops` · `/console` shells

Legacy operator routes (`/console`, `/ops`, `/finance`, `/compliance`) remain in the codebase. This pack is the **target Platform Admin IA**. Migration / route unification is a later implementation decision — do not invent a parallel product; gap-map against existing shells when building.

## Mock-up posture

1. Lock IA (this pack) — **done**.
2. Mock screens **one by one** per [MOCKUP-SEQUENCE.md](./MOCKUP-SEQUENCE.md).
3. Prefer real APIs or explicit unavailable/loading/error — never fake healthy production metrics.
