# Quality Results — Platform-1.3-CERT-001

> Honesty rule: never fabricate successful execution.

## Commands executed (2026-07-22)

| Command                                | Result                                                    | Notes                                                                                            |
| -------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `pnpm openapi:validate:platform`       | **PASS**                                                  | Spec valid; version **1.14.0**                                                                   |
| `pnpm lint`                            | **PASS**                                                  | eslint .                                                                                         |
| `pnpm typecheck`                       | **FAIL**                                                  | `@apzhub/observe-core` TS2540 readonly assign (`suppressedAt`/`suppressedBy`/`suppressedReason`) |
| `pnpm build`                           | **FAIL**                                                  | `@apzhub/web` — `notification-inbox-view.tsx` invalid Button `variant="secondary"`               |
| `pnpm format:check`                    | **FAIL**                                                  | 1209 files with Prettier drift (pre-existing scale)                                              |
| `pnpm certify:integration-sdk`         | **PASS** (re-run after CERT-001 milestone freeze wording) | Package **1.0.0**; initial run failed on milestone wording before CERT-001 update                |
| Platform 1.3 targeted Vitest           | **PARTIAL**                                               | 86/87 PASS; FAIL: `realtime.test.ts` expects OpenAPI `1.13.0` (actual `1.14.0`)                  |
| `packages/observe-core` Vitest         | **PASS**                                                  | 8/8 (typecheck still fails)                                                                      |
| Full `pnpm test`                       | **NOT RUN**                                               | Shared-host cost; limitation recorded                                                            |
| Playwright portfolio / `pnpm test:e2e` | **NOT RUN**                                               | Shared-host cost; limitation recorded                                                            |

## Blocking quality defects

1. **Web production build failure** — ENG-004 Workbench inbox TypeScript error.
2. **Repository typecheck failure** — observe-core ENG-002 evaluation domain readonly mutation.
3. **Stale OpenAPI version assertion** in realtime handler test.
4. **Format check** — large pre-existing drift (non-functional).
5. Integration SDK certify: **PASS** on re-run (PRWL / coverage LIMITED).

## Classification

Quality gates required for production release of Platform 1.3 web **do not pass**.
