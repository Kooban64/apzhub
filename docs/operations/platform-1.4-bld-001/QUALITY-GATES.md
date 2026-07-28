# Quality Gates — Platform-1.4-BLD-001

> **Date:** 2026-07-23

| Gate                                        | Result                                                             |
| ------------------------------------------- | ------------------------------------------------------------------ |
| `pnpm build` (`NODE_ENV=development`)       | **FAIL** — Environment trigger (documented)                        |
| `env -u NODE_ENV pnpm build`                | **PASS**                                                           |
| `NODE_ENV=test` web build (CI-like)         | **PASS**                                                           |
| `pnpm typecheck`                            | **PASS**                                                           |
| `pnpm lint`                                 | **PASS**                                                           |
| `pnpm format:check`                         | **PASS** (after pack formatting)                                   |
| Affected Vitest (delivery + RLS)            | **PASS** — 6 files / 60 tests                                      |
| Repository certification (notify/search/id) | **PASS** — APZNOTIFY-002/003/005 · APZSEARCH-003 · APZIDENTITY-002 |

## Notes

- Build FAIL under polluted shell is **expected** for this finding; success criterion for externally owned defects is evidence + ownership, not forcing a Platform code change.
- Clean packaging path validated: unset `NODE_ENV` or CI `NODE_ENV=test`.
