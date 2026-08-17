# Tenant Products · Subscription · Provisioning

| Field  | Value                                                                         |
| ------ | ----------------------------------------------------------------------------- |
| Status | **ACCEPTED** (2026-08-17)                                                     |
| Routes | `/platform-admin/tenants/[id]/products` · `…/subscription` · `…/provisioning` |

## Honesty

- Org subscriptions + user grants from durable commercial SoR (Postgres → file fallback).
- **Licences / renewal / payment method / next billing / current period** → `Not configured` unless billing ledger has real rows.
- APZPRD modules listed Enabled / Not subscribed independently — IAM roles remain separate.
- Provisioning shows commerce entitlement readiness; **job queue Not configured** (no fake metrics).

## Entitlement chain preserved

Subscription → Tenant Product Entitlement → (licences N/C) → User Product Assignment → Product Role → Resource Scope → Effective Access.
