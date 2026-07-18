# APZHUB-QA-001 — Repository Production Quality Report

> **Programme:** APZHUB-QA-001  
> **Classification:** Quality Assurance — Repository-wide Certification  
> **Date:** 2026-07-18  
> **Scope:** Full monorepo inspection (no feature work; no automatic remediation)  
> **Authority:** Repository evidence only (`pnpm typecheck`, `pnpm lint`, Prettier, `pnpm audit`, ripgrep scans, sample Vitest)  
> **Status:** Report complete — awaiting Owner review

---

## Executive Summary

APZHUB’s Platform Foundation is architecturally mature and documented, but the repository **does not currently pass hard production quality gates** for zero TypeScript errors, zero ESLint errors, or consistent formatting.

| Gate                                                                       | Result                                                                                                                 |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| TypeScript (`pnpm typecheck`)                                              | **FAIL** — ≥2 packages fail (`configuration-core`, `platform-governance`); **131** `error TS*` lines under `--no-bail` |
| ESLint (`pnpm lint`)                                                       | **FAIL** — **96 errors**, **4 warnings** across **~60 files**                                                          |
| Prettier (`prettier --check`)                                              | **FAIL** — style issues in **2731 files**                                                                              |
| Forbidden suppressions (`@ts-ignore` / `@ts-nocheck` / `@ts-expect-error`) | **PASS** — **0** occurrences                                                                                           |
| Production `: any` / `as any` (non-test)                                   | **PASS** — **0** in production sources; **42** `as any` concentrated in one test file                                  |
| `// TODO` / `// FIXME` / `// HACK` comments                                | **PASS** — essentially **0** intentional debt markers in code                                                          |
| Integration SDK freeze                                                     | **PASS** — `@apzhub/integration-sdk` **1.0.0** unchanged                                                               |
| Sample core tests (outbox / event-bus / provisioning)                      | **PASS** — **25/25**                                                                                                   |
| Dependency audit (`pnpm audit --prod`)                                     | **FAIL / RISK** — **1 high**, **2 moderate**                                                                           |

**Certification verdict**

# PRODUCTION READY WITH MAJOR REMEDIATION

The platform is suitable to **continue controlled Product Engineering after remediation of Critical/High quality-gate failures**, but it is **not** “zero-defect CI green” today. Nothing below is suppressed.

---

## Overall Repository Score

| Dimension                 | Score (0–10) | Notes                                                               |
| ------------------------- | ------------ | ------------------------------------------------------------------- |
| Architecture / freezes    | **9**        | Freezes documented; SDK frozen; layering strong                     |
| Type safety culture       | **8**        | Almost no production `any`; intentional `unknown` usage             |
| Compile / lint hygiene    | **3**        | Typecheck + ESLint fail                                             |
| Formatting hygiene        | **2**        | 2731 Prettier mismatches                                            |
| Testing maturity          | **7**        | Broad pyramid + certification suites; full coverage not re-run here |
| Dependency security       | **5**        | High: drizzle-orm; moderate: esbuild, postcss                       |
| Documentation / KF        | **8**        | Strong KF + Product Framework; ~100 broken relative links           |
| Stub / limitation honesty | **8**        | Limitations documented (PRWL / placeholders)                        |
| **Composite**             | **6.0 / 10** | Architecture strong; CI quality gates weak                          |

---

## Critical Issues

| ID   | File / area                                                                                 | Problem                                                                          | Severity     | Recommendation                                                                                                                                                   |
| ---- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C-01 | `packages/configuration-core/src/service/create-platform-configuration-service.test.ts:156` | `error TS2554: Expected 1 arguments, but got 0` — breaks package typecheck       | **Critical** | Fix call site to match current API; restore green `pnpm --filter @apzhub/configuration-core typecheck`                                                           |
| C-02 | `packages/platform-governance` (+ pulled `@apzhub/config` / `legal-business-core` sources)  | Cascade of **`TS6059` rootDir** errors (~130 lines) when typechecking governance | **Critical** | Fix package `tsconfig` project references / `rootDir` / composite settings so workspace deps typecheck without pulling foreign sources into governance `rootDir` |
| C-03 | Repository CI gate                                                                          | `pnpm typecheck` fails (recursive stop / package failures)                       | **Critical** | Treat typecheck green as merge gate before Product Engineering programmes                                                                                        |
| C-04 | Repository CI gate                                                                          | `pnpm lint` fails: **96 errors**                                                 | **Critical** | Clear unused-vars + script escapes + `worker-outbox` `no-undef` before product work                                                                              |

---

## High Issues

| ID   | File / area                                                | Problem                                                                                                         | Severity | Recommendation                                                                                                |
| ---- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------- |
| H-01 | Whole repo                                                 | Prettier check fails on **2731 files**                                                                          | **High** | Dedicated formatting remediation programme (or Owner-approved bulk format) — do not mix with product features |
| H-02 | `drizzle-orm` (<0.45.2)                                    | **High** advisory GHSA-gpj5-g38j-94v9 (SQL identifier escaping)                                                 | **High** | Upgrade drizzle-orm to ≥0.45.2 after compatibility validation                                                 |
| H-03 | `scripts/worker-outbox.mjs:96`                             | ESLint `no-undef` — `setTimeout` not defined (Node globals)                                                     | **High** | Add Node env to ESLint for scripts / use `node:` timers                                                       |
| H-04 | `apps/web/app/api/v1/configuration/**` (many routes)       | Cluster of unused `ALLOWED` bindings (`no-unused-vars`) — ~32 hits                                              | **High** | Prefix unused with `_` or remove; likely copy-paste auth constant leftovers                                   |
| H-05 | `packages/platform-event-bus/src/validate-source-event.ts` | Multiple unused destructured fields                                                                             | **High** | Use fields or omit from destructure                                                                           |
| H-06 | Documentation links                                        | ~**100** broken relative links under `docs/` (sample: wrong paths to foundation docs from `docs/architecture/`) | **High** | KF link-repair pass (docs-only)                                                                               |

---

## Medium Issues

| ID   | File / area                                        | Problem                                                                                                    | Severity   | Recommendation                                                                                                         |
| ---- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| M-01 | `esbuild` ≤0.24.2 (via drizzle-kit chain)          | Moderate advisory GHSA-67mh-4wv8-2f99                                                                      | **Medium** | Upgrade toolchain deps when safe                                                                                       |
| M-02 | `postcss` <8.5.10 (via next)                       | Moderate advisory GHSA-qx2v-qp2m-jg93                                                                      | **Medium** | Upgrade Next/postcss per release notes                                                                                 |
| M-03 | `packages/metrics-persistence/...postgres.test.ts` | **42×** `as any` + file-level `eslint-disable @typescript-eslint/no-explicit-any`                          | **Medium** | Replace with typed fixtures; remove blanket disable                                                                    |
| M-04 | Documented stubs                                   | `NOT_IMPLEMENTED` paths in command gateways, search SDK base, n8n/GHA OAuth placeholders, PlaceholderVault | **Medium** | Accept as **known limitations** only where certified PRWL; track in product KNOWN-LIMITATIONS when activating products |
| M-05 | Law Platform UI                                    | Many UI “placeholder” panels/activities (LAW programme history)                                            | **Medium** | Product Engineering (Law portfolio) — not platform defects; do not treat as silent production completeness             |
| M-06 | ESLint disables                                    | 5 disable sites (worker-outbox, performance baselines, metrics test)                                       | **Medium** | Register justification or remove unused disables (4 already “unused disable” warnings)                                 |
| M-07 | Scripts audit regex escapes                        | Multiple `no-useless-escape` in `scripts/apzsearch-*` / `apzworkflow-*`                                    | **Medium** | Clean regex strings                                                                                                    |
| M-08 | `unknown` annotations                              | Widespread intentional `unknown` (~344 files match `: unknown`)                                            | **Medium** | Generally good practice; review only where cast-heavy                                                                  |

---

## Low Issues

| ID   | File / area                                  | Problem                                               | Severity | Recommendation                                                |
| ---- | -------------------------------------------- | ----------------------------------------------------- | -------- | ------------------------------------------------------------- |
| L-01 | Structured logging (`console.info` JSON)     | Present in API logging helpers / event-bus logger     | **Low**  | Prefer keep; ensure no secrets; not raw debug spam            |
| L-02 | Auth email/reset `console.info` URLs         | Dev-oriented logging in `@apzhub/auth`                | **Low**  | Gate behind env; never log tokens in prod                     |
| L-03 | Non-null assertions in Law integration tests | Heavy `!.` usage in tests                             | **Low**  | Prefer asserts/`expect` narrowing                             |
| L-04 | `require()` in two testing harness files     | `@typescript-eslint/no-require-imports`               | **Low**  | Convert to ESM import                                         |
| L-05 | Full Vitest / Playwright / coverage          | Not re-executed repository-wide in this certification | **Low**  | Schedule full `pnpm test` + coverage job as remediation proof |

---

## Technical Debt

1. **Formatting debt** — largest volume issue (2731 files).
2. **TS project-references / rootDir** — governance/config coupling surfaces as typecheck noise.
3. **Certified limitations** — PlaceholderVault, OAuth placeholders, command AI/voice stubs, Search SDK NOT_IMPLEMENTED base (by design for older milestones; Meilisearch adapter exists separately).
4. **Law Platform placeholder UX** — historical vertical completeness vs polish.
5. **Audit script quality** — useless escapes / unused helpers in certification scripts.

---

## Code Smells

| Smell                                    | Evidence                                             |
| ---------------------------------------- | ---------------------------------------------------- |
| Copy-pasted unused constants             | Configuration API routes — repeated unused `ALLOWED` |
| Destructure-without-use                  | `validate-source-event.ts`                           |
| Blanket eslint-disable for `any`         | metrics-persistence postgres test                    |
| Placeholder naming in production UI copy | Law Platform components                              |
| Intentional NOT_IMPLEMENTED returns      | Command framework gateways; search SDK contracts     |

---

## Architecture Findings

| Check                                       | Result                                               |
| ------------------------------------------- | ---------------------------------------------------- |
| Integration SDK public version              | **1.0.0** Architecture Frozen — **unchanged**        |
| Frozen SoRs / Search / Documents / Workflow | Documented freezes still present in AI-MANIFEST      |
| Layering rule Module → Service → Connector  | No QA evidence of new bypass introduced in this scan |
| Platform Services as canonical API          | Intact                                               |
| ADR discipline                              | Catalogue present; freezes require ADR + Owner       |
| Exceptional platform work policy            | Phase 3 directive in force                           |

**No architecture redesign performed or recommended by this programme.**

---

## Type Safety Findings

| Pattern                                           | Count / notes                                         |
| ------------------------------------------------- | ----------------------------------------------------- |
| `@ts-ignore` / `@ts-expect-error` / `@ts-nocheck` | **0**                                                 |
| Production `: any` / `as any`                     | **0** (non-test sources)                              |
| Test `as any`                                     | **42** in `metrics-persistence-postgres.test.ts` only |
| `: unknown`                                       | Common (preferred over `any`)                         |
| Non-null `!.`                                     | Concentrated in Law Platform tests                    |
| Type assertions `as T`                            | Widespread (normal); not enumerated exhaustively      |

---

## Testing Findings

| Check                         | Result                                                              |
| ----------------------------- | ------------------------------------------------------------------- |
| Sample platform packages      | outbox / event-bus / provisioning — **25 tests PASS**               |
| Full `pnpm test`              | **Not run** in this certification (time/scope) — residual risk      |
| Coverage / branch coverage    | **Not measured** here — residual risk                               |
| Certification / audit scripts | Present extensively; some fail ESLint themselves                    |
| Weak areas                    | Typecheck/lint gates currently red → CI cannot honestly claim green |

---

## Dependency Findings

| Issue                   | Severity     | Package                                                                          | Action          |
| ----------------------- | ------------ | -------------------------------------------------------------------------------- | --------------- |
| SQL identifier escaping | **High**     | `drizzle-orm` <0.45.2                                                            | Upgrade ≥0.45.2 |
| Dev-server request risk | **Moderate** | `esbuild` ≤0.24.2 (transitive)                                                   | Upgrade chain   |
| CSS stringify XSS       | **Moderate** | `postcss` <8.5.10 (via next)                                                     | Upgrade         |
| Workspace size          | Info         | **73** packages · **2** apps · **5** integrations on disk (+ search-sdk package) | Healthy scale   |

Unused/duplicate package detection was **not** fully automated (`depcheck` / `pnpm why` matrix not executed for every package). Residual risk: medium.

---

## Documentation Findings

| Area                          | Result                                                   |
| ----------------------------- | -------------------------------------------------------- |
| Knowledge Foundation          | Present and Phase-3 consistent                           |
| Product Engineering Framework | Present (`docs/products/`)                               |
| Catalogues / inventories      | Present                                                  |
| Broken relative links         | ~**100** under `docs/` (path mistakes / directory links) |
| Historical completion reports | Left unchanged (per programme rules)                     |

---

## Forbidden Directives Inventory

| Occurrence                                                | File                                   | Justification today                                                  |
| --------------------------------------------------------- | -------------------------------------- | -------------------------------------------------------------------- |
| `eslint-disable-next-line no-constant-condition`          | `scripts/worker-outbox.mjs:93`         | Worker loop — **unused** disable (warning); should remove or fix env |
| `eslint-disable-next-line no-console` ×3                  | performance baseline tests             | **Unused** disables (warnings)                                       |
| `/* eslint-disable @typescript-eslint/no-explicit-any */` | `metrics-persistence-postgres.test.ts` | Test convenience — **not justified for long term**                   |

**No `@ts-ignore` / `@ts-expect-error` / `@ts-nocheck` found.**

---

## TODO / FIXME / HACK Inventory

| Marker                                                       | Result                                                                                                     |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `// TODO` / `/* TODO`                                        | **0** matches in TS/JS (excluding docs)                                                                    |
| `// FIXME` / `// HACK` / `// WORKAROUND`                     | **0**                                                                                                      |
| Broader word scan (`PLACEHOLDER`, `STUB`, `not implemented`) | Many **intentional** names / UI strings / certified limitations — listed under Medium, not as silent TODOs |

---

## Stub / Placeholder Inventory (representative)

| Area                                           | Nature                                          | Classification                           |
| ---------------------------------------------- | ----------------------------------------------- | ---------------------------------------- |
| Command framework AI/voice/automation gateways | Structured `NOT_IMPLEMENTED`                    | Documented stub                          |
| Integration Search SDK base operations         | `NOT_IMPLEMENTED` by design (APZSEARCH-004 era) | Documented; Meilisearch adapter separate |
| n8n / GitHub Actions OAuth / App auth          | Config placeholders; rejected if enabled        | Documented limitation                    |
| PlaceholderVault                               | Experimental secret provider                    | Documented SDK limitation                |
| Law Platform activity/event/UI placeholders    | Historical LAW-001+ scaffolding                 | Product polish debt                      |
| Evidence object storage network ops            | Explicit not implemented message                | Documented TCMS limit                    |

---

## Error Handling Findings

| Check                        | Result                                                                                       |
| ---------------------------- | -------------------------------------------------------------------------------------------- |
| Empty `catch {}` blocks      | **None found** by multiline scan                                                             |
| Swallowed exceptions         | No systematic empty-catch pattern detected                                                   |
| `console.log` in non-test TS | Limited; mostly structured `console.info` loggers / baselines                                |
| Ignored promises             | Some `void promise.then(...)` patterns (shell shortcuts, sync helpers) — review case-by-case |

---

## Dead Code Findings

| Signal                             | Result                                                    |
| ---------------------------------- | --------------------------------------------------------- |
| Unused vars (ESLint)               | **Primary lint failure class** (~unused imports/bindings) |
| Unused exports / obsolete packages | Not fully instrumented (needs knip/ts-prune programme)    |
| Duplicate implementations          | Not exhaustively proven                                   |

---

## Recommendations (remediation order — not auto-fixed)

1. **Fix Critical typecheck** (C-01, C-02) until `pnpm typecheck` is green.
2. **Clear ESLint errors** (C-04, H-03–H-05, script escapes).
3. **Owner-approved Prettier normalisation** (H-01) in an isolated docs/format programme.
4. **Upgrade drizzle-orm** (and follow-on moderate advisories) with regression tests.
5. **Documentation link repair** pass.
6. **Replace metrics-persistence test `as any`**.
7. Run **full** `pnpm test` + coverage + Playwright smoke as certification proof.
8. Only then open the first **Product Engineering** programme under Owner Approval.

---

## Success Classification

| Option                                      | Selected                                                                               |
| ------------------------------------------- | -------------------------------------------------------------------------------------- |
| PRODUCTION READY                            | No                                                                                     |
| PRODUCTION READY WITH MINOR REMEDIATION     | No                                                                                     |
| **PRODUCTION READY WITH MAJOR REMEDIATION** | **Yes**                                                                                |
| NOT PRODUCTION READY                        | No (architecture/foundation not collapsed; sample platform tests pass; freezes intact) |

---

## Confirmation

- No architecture redesign
- No new features / product code
- No Integration SDK public contract changes
- No automatic code fixes applied
- No next product programme recommended

**STOP.** Await Owner review of APZHUB-QA-001.
