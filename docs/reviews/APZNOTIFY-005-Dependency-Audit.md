# APZNOTIFY-005 — Dependency Audit

**Result:** PASS

## Package graph

| Package                                      | May depend on                      | Must not depend on                                       |
| -------------------------------------------- | ---------------------------------- | -------------------------------------------------------- |
| `@apzhub/notification-contracts` **0.2.0**   | shared primitives only             | core, persistence, platform-services, delivery SDKs      |
| `@apzhub/notification-core` **0.2.0**        | contracts                          | persistence impl, platform-services, apps, delivery SDKs |
| `@apzhub/notification-persistence` **0.1.0** | contracts (+ DB drivers)           | platform-services, UI, delivery SDKs                     |
| `@apzhub/platform-services` **0.21.0**       | contracts, core, persistence ports | nodemailer / twilio / push SDKs                          |
| Workbench / typed client                     | HTTP API only                      | gateway, platform-services, core, persistence            |

## Evidence

- Static scan: `pnpm audit:notification-vertical`
- Vitest: `testing/notification-vertical/apznotify-005-boundary.test.ts`
- Prior: APZNOTIFY-001–004 package audits

## Circular dependencies

None detected across the certified Notification packages.
