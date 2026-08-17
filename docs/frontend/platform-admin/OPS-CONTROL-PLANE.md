# Platform Admin — Operational Control Plane

| Field    | Value                                            |
| -------- | ------------------------------------------------ |
| Status   | **ACCEPTED** (Owner 2026-08-17)                  |
| Surfaces | Products · Provisioning · Providers · Operations |

## Chain

```text
WHAT APZ SELLS (Products)
      ↓
WHAT TENANTS RECEIVE (tenant commercial — already accepted)
      ↓
HOW IT IS PROVISIONED (Provisioning — real job records only)
      ↓
WHICH PROVIDERS IMPLEMENT IT (Providers — integration.yaml)
      ↓
WHETHER THE CAPABILITY IS HEALTHY (Operations — APZ language)
```

## Locked vocabulary

Healthy · Degraded · Unavailable · Unknown · Not configured

## Honesty

- Product tenant/user counts from durable subscriptions/grants.
- Provisioning queue never invented from entitlements.
- Provider health never marked Healthy without a live probe.
- Operations uses capability names; provider names only under Providers.
