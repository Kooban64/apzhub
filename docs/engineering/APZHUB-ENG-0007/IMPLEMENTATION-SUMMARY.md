# APZHUB-ENG-0007 — Implementation Summary

> **Programme:** APZHUB-ENG-0007  
> **Title:** Implement RG-LAW-DNS Remediation  
> **Classification:** ENGINEERING  
> **Lifecycle:** Continuous Product Delivery  
> **Baseline:** Platform **1.2.0** (packaging unchanged)  
> **Date:** 2026-07-21  
> **Status:** **ACCEPTED / CLOSED** (Owner Decision with APZHUB-ENG-0008)

---

## Authorised remediation group

| Group          | Result                                                 |
| -------------- | ------------------------------------------------------ |
| **RG-LAW-DNS** | **Resolved** — 7/7 `law-015-trust-workflow` tests PASS |

---

## Root causes fixed

1. **Client `pg` / `dns` import graph** — `"use client"` shell imported domain barrels / in-memory modules that re-exported `repository-factory` (and search imported the persistence barrel). That pulled `Postgres*` adapters → `@apzhub/config` `createDb` → `pg` → `Can't resolve 'dns'`, replacing `/login` with a Build Error overlay.
2. **Client-safe persistence/session split** — session binding moved to `law-persistence-session.ts`; search tenant/scope helpers no longer import the persistence barrel or `node:async_hooks` on the client path.
3. **Workbench deep-link rewind** — an effect `router.push(activeView.route)` rewound `/workspace/law/trust/*` sub-routes back to the trust module base after DNS was fixed. Preserved deep links under the active view route; trust router mounts from URL `pathname`.

---

## Repository impact

| Area                                                             | Change                                        |
| ---------------------------------------------------------------- | --------------------------------------------- |
| `apps/law-platform/lib/*/in-memory-*-repository.ts`              | Own memory singletons (no factory re-export)  |
| `apps/law-platform/lib/persistence/repository-factory.ts`        | Memory path delegates to in-memory singletons |
| `apps/law-platform/lib/persistence/law-persistence-session.ts`   | New client-safe session binding               |
| `apps/law-platform/lib/persistence/law-persistence-scope.ts`     | ALS remains server-side; re-exports session   |
| `apps/law-platform/lib/search/legal-search-persistence-scope.ts` | No persistence barrel                         |
| `apps/law-platform/lib/knowledge/legal-search-tenant-scope.ts`   | Session-only tenant scope                     |
| Domain validation/workflow/composition/index barrels             | Import getShared* from in-memory modules      |
| `apps/law-platform/components/workbench-page.tsx`                | Deep-link preserve + trust pathname routing   |
| `testing/playwright/playwright.law.config.ts`                    | Env merge + Law globalSetup                   |
| `testing/playwright/global-setup-law.ts`                         | Health + DEV auth seed for Law base URL       |
| `testing/playwright/e2e/law-auth-helpers.ts`                     | API cookie sign-in for Law                    |
| `testing/playwright/e2e/law-015-trust-workflow.spec.ts`          | Uses Law auth helper                          |

---

## Architecture / SemVer

- **Architecture impact:** Package/boundary hygiene only — keep `pg` server-side; no Platform Service or Integration SDK contract changes.
- **SemVer impact:** None (no package version bumps).
- **Public APIs / DB:** Unchanged.
- **Platform 1.2.0 packaging:** Unchanged.

---

## Out of scope (not modified)

RG-A11Y-CONTRAST · RG-MOCK-FETCH · RG-PW-API · RG-SELECTORS · product workbench residuals · Email SoR · FIN-001 · Workflow Execute · Release 1.3 · ENG-0008

---

## Recommendation

# READY FOR OWNER ACCEPTANCE
