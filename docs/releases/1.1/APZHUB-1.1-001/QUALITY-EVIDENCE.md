# APZHUB-1.1-001 — Quality Evidence

> **Programme:** APZHUB-1.1-001  
> **Date:** 2026-07-19  
> **Scope:** OBS-LAW-01 only

---

## Gates executed

| Gate                                       | Command / evidence                                                                                                                            | Result   |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Typecheck (workbench-framework)            | `pnpm --filter @apzhub/workbench-framework typecheck`                                                                                         | **PASS** |
| Typecheck (law-platform)                   | `pnpm --filter @apzhub/law-platform typecheck`                                                                                                | **PASS** |
| Typecheck (web)                            | `pnpm --filter @apzhub/web typecheck`                                                                                                         | **PASS** |
| Lint (changed files + workbench-framework) | eslint on touched paths · package lint                                                                                                        | **PASS** |
| Unit — Workbench AuthZ adapter             | `packages/workbench-framework/src/permission/*.test.ts`                                                                                       | **PASS** |
| Unit — platform-authorization              | `packages/platform-authorization/src/*.test.ts` (service, parity, tenant)                                                                     | **PASS** |
| Integration / AuthZ regression — Law API   | `apps/web/lib/api/law-api-auth.test.ts` (18 tests)                                                                                            | **PASS** |
| Architecture boundary                      | No new `workbench-framework` → `platform-authorization` dependency; local pattern match helper; Module→Service→Connector boundaries untouched | **PASS** |
| Compatibility                              | See [COMPATIBILITY-STATEMENT.md](./COMPATIBILITY-STATEMENT.md)                                                                                | **PASS** |

---

## Authorization regression coverage

| Scenario                                       | Expected                                                            | Covered |
| ---------------------------------------------- | ------------------------------------------------------------------- | ------- |
| Empty grants + auth mode                       | Deny Law keys                                                       | Yes     |
| Explicit `*`                                   | Allow                                                               | Yes     |
| `legal.*` pattern                              | Allow `legal.nav.dashboard.view`; deny `platform.impersonation.use` | Yes     |
| Dev registration flag with empty grants        | **No** `*` injection; adapterKind `auth`                            | Yes     |
| Missing non-Law permission on provisioned user | HTTP 403                                                            | Yes     |
| Provisioned Law operator `legal.*`             | HTTP allow for Law nav key                                          | Yes     |

---

## Not run (out of scope)

Full monorepo Playwright suite · Docker rebuild · Platform 1.1.0 certification packaging
