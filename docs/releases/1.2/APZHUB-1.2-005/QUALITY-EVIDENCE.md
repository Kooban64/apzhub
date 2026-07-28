# APZHUB-1.2-005 — Quality Evidence

> **Programme:** APZHUB-1.2-005  
> **Date:** 2026-07-20

---

| Gate                    | Command / evidence                                                                                                                                                             | Result                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------- |
| Typecheck               | `pnpm --filter @apzhub/search-time typecheck`                                                                                                                                  | Pass                          |
| Lint                    | `pnpm --filter @apzhub/search-time lint`                                                                                                                                       | Pass                          |
| Unit tests              | `packages/search-time` (10)                                                                                                                                                    | Pass                          |
| Integration / contracts | `packages/search-contracts` (11) — catalogue includes `time`                                                                                                                   | Pass                          |
| Adapter audit           | `pnpm audit:search-time`                                                                                                                                                       | PASS (0 violations)           |
| Regression              | Frozen wave audits not required to green for additive publisher; pre-existing pin drift: `platform-services` expected 0.26.1 found 0.28.0 on `audit:search-publication` / wave | Pre-existing FAIL (unrelated) |
| Compatibility           | Additive `SearchProductId` only; no public API removals; frozen publisher packages unmodified                                                                                  | Pass                          |
| Architecture            | Package → search-integration + contracts only; no Kimai / Meilisearch / platform-services / sibling publishers; no Module→Connector                                            | Pass                          |

## Architecture verification

- Publication path: Time models → `@apzhub/search-time` → `@apzhub/search-integration` (in-memory sink in unit tests).
- Search Publication Architecture Freeze retained for 009–019 certified chain; `search-time` is additive Release 1.2 capacity per approved backlog.
- Financial / Kimai leakage rejected by validator + unit tests.
