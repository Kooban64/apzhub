# DEPENDENCY-MATRIX — APZQEP-165-PLAN

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-165-PLAN  |
| Timestamp | 20260804T060307Z |

## Mandatory predecessors

| Slice | Must follow                                                                 |
| ----- | --------------------------------------------------------------------------- |
| S01   | — (entry)                                                                   |
| S02   | S01                                                                         |
| S03   | S01, S02 (bindings need capability/flow ids; flow start may stub until S04) |
| S04   | S01, S02                                                                    |
| S05   | S04                                                                         |
| S06   | S04, S05                                                                    |
| S07   | S04, S06 (gates need selection/run context)                                 |
| S08   | S04, S07                                                                    |
| S09   | S07, S08                                                                    |
| S10   | S01 (stubs); full events track S03–S09 completions                          |
| S11   | S04, S06, S10                                                               |
| S12   | S03, S10                                                                    |
| S13   | S04, S07, S10                                                               |
| S14   | S04, S07, S10                                                               |
| S15   | S16 recommended first; needs S04+ projections (S09 for release views)       |
| S16   | S04 minimum; expands as S02–S09 land                                        |
| S17   | S16, S08; S15 parallel/after                                                |
| S18   | S01–S17 complete                                                            |

## Optional parallel work

| Parallel set          | Condition                                  |
| --------------------- | ------------------------------------------ |
| S11 ∥ S12 ∥ S13 ∥ S14 | After S04+S10 stable; S11 also needs S06   |
| S15 ∥ S17             | After S16; shared design tokens/components |
| S10 hardening         | Continuous alongside S03–S09               |

## Critical path

```text
S01 → S02 → S04 → S05 → S06 → S07 → S08 → S09 → S18
         ↘ S03 ↗        ↘ S11
         ↘ S10 ↗        ↘ S12 / S13 / S14
                              ↘ S16 → S15 / S17 → S18
```

**Bottlenecks:** S01 (package kernel), S04 (flow state machine + durable state), S08 (permissions/SoD), S18 (full regression).

## Certification dependencies

| Gate                         | Depends on                                              |
| ---------------------------- | ------------------------------------------------------- |
| Slice certify S0n            | That slice evidence + predecessor slices not regressing |
| Integration certify          | S11–S14 + S10                                           |
| Experience certify           | S15–S17                                                 |
| Programme certify (pre-165R) | S18                                                     |
| PBR-APZQEP-165               | APZQEP-165 eng complete + 165R                          |
