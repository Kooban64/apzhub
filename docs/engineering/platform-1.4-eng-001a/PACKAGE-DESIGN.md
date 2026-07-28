# Package Design

## Change map

| Area                                                                           | Change?              | Notes                                                                                    |
| ------------------------------------------------------------------------------ | -------------------- | ---------------------------------------------------------------------------------------- |
| `packages/platform-services`                                                   | **Yes**              | Replace process-local Maps with Postgres repository; claim worker loop                   |
| `packages/notification-contracts`                                              | **Maybe (additive)** | Lease fields on delivery types if not already present; no breaking public status changes |
| `packages/notification-persistence` or new `notification-delivery-persistence` | **Yes (preferred)**  | Thin Postgres repository for 0065(+0066) tables — keep SoR access out of Gateway         |
| `packages/config` (drizzle)                                                    | **Yes**              | Additive migration **0066** (leases / provider_reference) — SQL only in ENG-001B         |
| `apps/web`                                                                     | **Minimal**          | Bootstrap wiring to durable repos; admin routes if missing; feature flags                |
| `packages/platform-outbox`                                                     | **No required**      | Events remain after-commit fail-soft publish; not claim SoR                              |
| `packages/platform-event-bus`                                                  | **No required**      | Retain subscribe/publish                                                                 |
| `packages/integration-sdk`                                                     | **No**               | Frozen 1.0.0                                                                             |
| Modules / products                                                             | **No**               | Continue command/event intake only                                                       |
| Workbench                                                                      | **Minimal**          | Consume existing APIs; admin surfaces if new endpoints                                   |

## Per-package responsibilities

### `@apzhub/platform-services` (notification delivery)

|                |                                                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Responsibility | Delivery service orchestration: intake, policy, claim orchestration API, dispatch to in-app adapter, transitions, events |
| Inputs         | Commands, Event Bus envelopes, worker ticks, admin commands                                                              |
| Outputs        | Durable state mutations via repository ports; domain events                                                              |
| Dependencies   | notification-contracts; delivery persistence port; identity resolve; publisher                                           |

### Notification delivery persistence (new or extend existing)

|                |                                                             |
| -------------- | ----------------------------------------------------------- |
| Responsibility | Postgres CRUD + claim SQL (`FOR UPDATE SKIP LOCKED`)        |
| Inputs         | Repository method calls                                     |
| Outputs        | Rows / claim batches                                        |
| Dependencies   | `pg` / drizzle patterns used elsewhere; config DATABASE_URL |

### `@apzhub/notification-contracts`

|                |                                              |
| -------------- | -------------------------------------------- |
| Responsibility | Types, lifecycle asserts, service interfaces |
| Inputs         | —                                            |
| Outputs        | Shared types                                 |
| Dependencies   | none beyond workspace                        |

### `apps/web`

|                |                                                                              |
| -------------- | ---------------------------------------------------------------------------- |
| Responsibility | Gateway bootstrap, HTTP handlers, authz, OpenAPI paths for admin if extended |
| Inputs         | HTTP                                                                         |
| Outputs        | Envelope responses                                                           |
| Dependencies   | platform-services                                                            |

### Tests

| Suite                                   | Change                                    |
| --------------------------------------- | ----------------------------------------- |
| `eng004-notification-delivery.test.ts`  | Evolve / split into durable runtime suite |
| New concurrency / restart / lease tests | Required                                  |
| Handler / OpenAPI tests                 | Additive if admin paths added             |
| Migration tests                         | Required for 0066                         |

### Documentation

ENG-001B completion pack · runbooks · update KNOWN-LIMITATIONS (close P13-KL-ND-03 when done).
