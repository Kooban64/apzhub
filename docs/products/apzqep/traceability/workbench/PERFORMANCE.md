# Performance — APZQEP-ENG-030C

Architecture scale model: [PERFORMANCE-MODEL.md](../../architecture/traceability-workbench/PERFORMANCE-MODEL.md).

## Implemented techniques

| Technique | Workbench application |
| --- | --- |
| Bounded list queries | Server pagination on Explorer |
| Server-side filters | Type / lifecycle / endpoint kind / confidence / strength / origin |
| List then detail | Summary rows; detail fetch on demand |
| Matrix cap | 20×20 presentation window — no full-set client materialisation |
| Search projection | Discovery only; authoritative REST reload |

## Scale assumptions (ENG-030C)

| Scale | Expectation |
| --- | --- |
| ≤ 1 000 Trace Links | Comfortable with pagination |
| 10 000 | Relies on server filters + pagination (virtualisation may deepen later) |
| 100 000 | Must remain windowed; no unbounded Matrix/graph fetch |

No Coverage/Impact computation load in this programme.
