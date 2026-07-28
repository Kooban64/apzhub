# Build Root Cause — Platform-1.4-BLD-001

> **Date:** 2026-07-23  
> **Symptom:** `pnpm build` → `@apzhub/web` `next build` fails prerendering `/_global-error`

## Failure signature

```
Error occurred prerendering page "/_global-error"
TypeError: Cannot read properties of null (reading 'useContext')
Export encountered an error on /_global-error/page: /_global-error, exiting the build.
```

Compile succeeds; failure occurs during static generation / export of `/_global-error`.

## Controlled experiments

| Condition                        | Result                                         |
| -------------------------------- | ---------------------------------------------- |
| Shell `NODE_ENV=development`     | **FAIL** — `/_global-error` `useContext`       |
| `env -u NODE_ENV pnpm build`     | **PASS** — 334/334 static pages                |
| `NODE_ENV=test` (CI job default) | **PASS** — 334/334 static pages                |
| `apps/web/app/global-error.tsx`  | Already minimal client boundary (no providers) |

Evidence logs: `/tmp/bld-001-build.log`, `/tmp/bld-001-build-unset-nodeenv.log`, `/tmp/bld-001-build-nodeenv-test.log`.

Next.js also warns when `NODE_ENV=development` is present during `next build`:

```
⚠ You are using a non-standard "NODE_ENV" value in your environment.
```

## Causal chain

1. Operator / IDE shell exports `NODE_ENV=development` (observed on host).
2. Root `pnpm build` → `apps/web` `next build` inherits that value.
3. Next.js 16 (16.2.9) + React 19 (19.2.4) production export path for `/_global-error` throws `useContext` on null dispatcher when `NODE_ENV` is `development`.
4. Build aborts after successful compile.

## Ownership classification

| Class           | Assessment                                                              |
| --------------- | ----------------------------------------------------------------------- |
| **Environment** | **PRIMARY** — polluted shell `NODE_ENV=development` is the trigger      |
| **Framework**   | **CONTRIBUTING** — Next 16 `/_global-error` prerender sensitivity       |
| Platform        | **Not responsible** — `global-error.tsx` already minimal; no app defect |
| Repository      | Scripts do not unset `NODE_ENV` (documented caveat only)                |
| Dependency      | Versions per stack (Next 16.2.9 / React 19.2.4); no Platform pin defect |
| Tooling         | Handbook already documents `env -u NODE_ENV pnpm build`                 |

## Prior documentation

- [ENGINEERING-HANDBOOK.md](../../foundation/ENGINEERING-HANDBOOK.md) — build note for `NODE_ENV=development`
- Historical OSS-101 / OSS-102 / OSS-110 completion reports — same `/_global-error` caveat

## Follow-on recommendation (not in this programme)

Optional **Repository / Tooling** hardening: make root / `@apzhub/web` `build` script invoke `env -u NODE_ENV next build` so operator shells cannot pollute production builds. Requires separate Owner authorisation — **not performed** under BLD-001 (non-Platform; no implementation change authorised when externally owned).
