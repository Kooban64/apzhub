# APZHUB Notification Platform Services Developer Guide

**Milestone:** APZNOTIFY-002

## Packages

| Package                                      | Role                            |
| -------------------------------------------- | ------------------------------- |
| `@apzhub/notification-contracts` **0.2.0**   | Gateway facet contracts         |
| `@apzhub/notification-core` **0.2.0**        | Domain service + lifecycle      |
| `@apzhub/notification-persistence` **0.1.0** | Repositories                    |
| `@apzhub/platform-services` **0.21.0**       | Thin wrappers + gateway + authz |

## Audit

```bash
pnpm audit:notification-platform-services
```

## Next (not authorised)

**APZNOTIFY-003 — Notification HTTP API & Production Typed Client**
