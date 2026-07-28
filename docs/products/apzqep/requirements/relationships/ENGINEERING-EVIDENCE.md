# APZQEP-ENG-020F Part 1 — Engineering Evidence

| Field                   | Value                                    |
| ----------------------- | ---------------------------------------- |
| Programme               | APZQEP-ENG-020F                          |
| Part                    | 1 — Domain Model and Business Rules      |
| Recorded                | 2026-07-26                               |
| Architecture compliance | Faithful to APZQEP-ARCH-005; no redesign |
| Package                 | `@apzhub/qep-requirements` **0.8.0**     |

## Validation

| Check                                              | Result                                                   |
| -------------------------------------------------- | -------------------------------------------------------- |
| `pnpm --filter @apzhub/qep-requirements typecheck` | PASS                                                     |
| `pnpm --filter @apzhub/qep-requirements test`      | PASS (includes 27 relationship domain tests)             |
| Domain infrastructure imports                      | None (no drizzle/postgres/HTTP in `domain/relationship`) |
| Persistence / API / UI for relationships           | Not present                                              |

## Test coverage themes

- Valid / invalid relationships
- Lifecycle transitions and immutability
- Duplicate rejection and symmetric canonicalisation
- Cycle detection
- Taxonomy and rationale rules
- Semantic profile / strength / criticality / classification / scope
- Supersession uniqueness and superseded event
- Baseline interaction rejection
- Content Version pin validation
- Endpoint existence contracts
- Append-only history preservation

## Portfolio evidence

- Implementation: `docs/operations/evidence/portfolio-recert/20260726T081600Z-APZQEP-ENG-020F-PART1.json`
- Owner acceptance: `docs/operations/evidence/portfolio-recert/20260726T083000Z-APZQEP-ENG-020F-PART1-ACCEPTANCE.json`

## Owner decision

Part 1 is **ACCEPTED / CLOSED / COMPLETE**. Part 2 is **AUTHORISED TO BEGIN**. Part 3 remains **NOT AUTHORISED**.
