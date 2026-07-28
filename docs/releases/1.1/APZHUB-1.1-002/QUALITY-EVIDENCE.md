# APZHUB-1.1-002 — Quality Evidence

> **Programme:** APZHUB-1.1-002  
> **Date:** 2026-07-19  
> **Scope:** OBS-LAW-02 only

---

## Gates executed

| Gate                                     | Command / evidence                                                         | Result   |
| ---------------------------------------- | -------------------------------------------------------------------------- | -------- |
| Typecheck (activity-timeline-framework)  | `tsc --noEmit`                                                             | **PASS** |
| Typecheck (event-notification-framework) | `tsc --noEmit`                                                             | **PASS** |
| Typecheck (law-platform)                 | `pnpm --filter @apzhub/law-platform typecheck`                             | **PASS** |
| Lint (changed files)                     | eslint on touched paths                                                    | **PASS** |
| Unit — persisted stores                  | ATF + ENF persisted store tests                                            | **PASS** |
| Operational regression                   | `apps/law-platform/lib/obs-law-02-persistence.regression.test.ts`          | **PASS** |
| Existing Law ENF/ATF composition tests   | `create-app-*-context.test.ts`                                             | **PASS** |
| Architecture boundary                    | No Law-owned notify subsystem; platform injection only; no OpenAPI changes | **PASS** |
| Compatibility                            | See [COMPATIBILITY-STATEMENT.md](./COMPATIBILITY-STATEMENT.md)             | **PASS** |

---

## Operational regression coverage

| Scenario                                               | Expected                         | Covered              |
| ------------------------------------------------------ | -------------------------------- | -------------------- |
| Notification append then new store instance (same key) | Items restored                   | Yes                  |
| Activity append then new store instance (same key)     | Items restored                   | Yes                  |
| Mark-as-read then restore                              | Read state retained              | Yes (ENF unit)       |
| Composition without persistenceScope                   | Memory default (tests/hydration) | Yes (existing tests) |

---

## Not run (out of scope)

Full monorepo Playwright suite · Docker rebuild · Platform 1.1.0 certification packaging · PostgreSQL projection migrations
