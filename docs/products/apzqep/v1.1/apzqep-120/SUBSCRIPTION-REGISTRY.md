# Subscription Registry — APZQEP-120-S12

| Field   | Value                                |
| ------- | ------------------------------------ |
| Package | `@apzhub/qep-notification` **0.1.0** |

## Purpose

Configurable registry of who subscribes to which domain events / projection facts. **No hard-coded subscriptions** in the delivery engine.

## Scope kinds

| Kind    | Meaning                     |
| ------- | --------------------------- |
| user    | Named user subject          |
| role    | Role subject                |
| team    | Team subject                |
| project | Project-scoped subscription |
| tenant  | Tenant-wide                 |
| global  | Platform-wide               |

## Surfaces

| API                    | Role                                        |
| ---------------------- | ------------------------------------------- |
| `SubscriptionRegistry` | Store / query definitions                   |
| `SubscriptionManager`  | Create / enable / disable / update channels |
| `SubscriptionResolver` | Match event type + tenant/project → subs    |

## Catalogue seeding

`seedEvidenceTenantSubscription` registers **configurable** Evidence event subscriptions (one per event type) for tests and bootstrap. Production wiring registers via `SubscriptionManager` — never engine hard-coding.
