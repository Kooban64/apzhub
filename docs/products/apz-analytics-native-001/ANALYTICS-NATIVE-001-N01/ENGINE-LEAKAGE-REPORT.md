# Engine Leakage Report — APZ Analytics

| Field     | Value            |
| --------- | ---------------- |
| Slice     | N-01             |
| Status    | **COMPLETE**     |
| Timestamp | 20260805T174500Z |

## Named engine brand (Metabase)

| Check                | Result                                                  |
| -------------------- | ------------------------------------------------------- |
| UI component strings | **PASS** — boundary tests forbid metabase in components |
| Error sanitisation   | **PASS** — strips provider brand tokens                 |

## Product-visible identity risk

| Check                                      | Result                                                                 |
| ------------------------------------------ | ---------------------------------------------------------------------- |
| “Dashboard product” framing                | **FAIL** vs EDS identity (not engine brand, but product identity leak) |
| Chart-column Activity Bar as sole metaphor | **Risk** — reinforces viz-first identity                               |

## Conclusion

Named-engine branding is masked. **Dashboard-product identity** remains the Critical product leak against the APPROVED mission.
