# APZHUB-1.2-006 — Quality Evidence

> **Programme:** APZHUB-1.2-006  
> **Date:** 2026-07-20

---

| Gate                    | Command / evidence                                                                                                                                    | Result              |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| Typecheck               | `pnpm --filter @apzhub/search-law typecheck`                                                                                                          | Pass                |
| Lint                    | `pnpm --filter @apzhub/search-law lint`                                                                                                               | Pass                |
| Unit tests              | `packages/search-law` (9)                                                                                                                             | Pass                |
| Integration / contracts | `packages/search-contracts` (11) — catalogue includes `law`                                                                                           | Pass                |
| Adapter audit           | `pnpm audit:search-law`                                                                                                                               | PASS (0 violations) |
| Compatibility           | Additive `SearchProductId` only; frozen publisher packages unmodified                                                                                 | Pass                |
| Architecture            | Package → search-integration + legal-business-core + contracts; no engine/Meilisearch/platform-services/sibling publishers; FIN-001 surfaces excluded | Pass                |

## Architecture verification

- Publication path: Law models (`@apzhub/legal-business-core`) → `@apzhub/search-law` → `@apzhub/search-integration`.
- Search Publication Architecture Freeze retained for 009–019 certified chain; `search-law` is additive Release 1.2 capacity.
- Permission-filtered at query time remains Search Platform responsibility; publication carries permission metadata from context.
