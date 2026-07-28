# Performance Model — APZQEP-ARCH-008

> Companion extract. Authoritative detail: [TRACEABILITY-WORKBENCH-ARCHITECTURE.md](./TRACEABILITY-WORKBENCH-ARCHITECTURE.md) §19.

## Scale classes

| Scale | Strategy |
| --- | --- |
| 100 Trace Links | Comfortable full list; light virtualisation optional |
| 1 000 | Virtual scrolling; server pagination default |
| 10 000 | Mandatory virtualisation; server filters; lazy group expansion |
| 100 000 | Windowed Matrix; bounded queries; no full-set client materialisation |

## Mandatory techniques

- Pagination / cursors on list and matrix queries  
- Incremental lineage loading  
- Server-side filtering  
- Lazy Explorer expansion  
- List summary contract (no N+1 detail)  
- Search as projection; authoritative detail on demand  
- No unbounded graph fetch  

Exact thresholds are engineering parameters under this architecture.
