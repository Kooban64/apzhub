# Performance Model — APZQEP-ARCH-010

> Companion extract. Authoritative detail: [VERIFICATION-WORKBENCH-ARCHITECTURE.md](./VERIFICATION-WORKBENCH-ARCHITECTURE.md) §17.

## Scale targets

| Scale   | Approach                                           |
| ------- | -------------------------------------------------- |
| 100     | Full facets comfortable                            |
| 1,000   | Pagination; virtual scroll optional                |
| 10,000  | Server filtering + virtual scroll                  |
| 100,000 | Strict pagination, incremental loading, aggregates |

## Techniques

pagination · server filtering · virtual scrolling · incremental loading · bounded queries · debounced filters.

## Forbidden

Unbounded client downloads · client-side full-tenant filtering · N+1 dashboard fetches.
