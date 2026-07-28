# APZHUB-1.1-003 — Quality Evidence

> **Programme:** APZHUB-1.1-003  
> **Date:** 2026-07-20  
> **Scope:** Cross-platform Event Bus & Notification Foundation (Support first consumer)

---

## Gates executed

| Gate                                     | Command / evidence                                                                      | Result   |
| ---------------------------------------- | --------------------------------------------------------------------------------------- | -------- |
| Typecheck (platform-services)            | `pnpm --filter @apzhub/platform-services typecheck`                                     | **PASS** |
| Typecheck (event-notification-framework) | `tsc --noEmit`                                                                          | **PASS** |
| Typecheck (web)                          | `pnpm --filter @apzhub/web typecheck`                                                   | **PASS** |
| Lint (changed files)                     | eslint on touched paths                                                                 | **PASS** |
| Unit — domain event publish              | `support-domain-events.test.ts`                                                         | **PASS** |
| Integration — SupportService publish     | `support-platform-services.test.ts` (Event Bus publish)                                 | **PASS** |
| Notification regression                  | `support-event-notification-foundation.test.ts`                                         | **PASS** |
| Architecture boundary                    | No Support-owned notify package; publish from Platform Service; ENF Attention path only | **PASS** |
| Compatibility                            | See [COMPATIBILITY-STATEMENT.md](./COMPATIBILITY-STATEMENT.md)                          | **PASS** |

---

## Event / notification regression coverage

| Scenario                              | Expected                            | Covered |
| ------------------------------------- | ----------------------------------- | ------- |
| Publish without publisher             | Fail-soft `NO_PUBLISHER`            | Yes     |
| Publisher throws                      | Fail-soft; mutation path safe       | Yes     |
| create/assign/close Support request   | Catalogue event ids published       | Yes     |
| Client ENF Support register + publish | Notifications created (inbox/toast) | Yes     |
| `support.request.assigned`            | Maps to assigned inbox route        | Yes     |

---

## Not run (out of scope)

Full monorepo Playwright · Docker rebuild · Platform 1.1.0 certification · Zammad live webhook E2E
