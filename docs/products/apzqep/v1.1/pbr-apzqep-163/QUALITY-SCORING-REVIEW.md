# QUALITY-SCORING-REVIEW — PBR-APZQEP-163

| Field      | Value            |
| ---------- | ---------------- |
| Resolution | PBR-APZQEP-163   |
| Timestamp  | 20260803T185717Z |
| Result     | **PASS**         |

## Score properties

| Property              | Assessment                                                                      |
| --------------------- | ------------------------------------------------------------------------------- |
| Derived               | Scores produced only via provider contributions + engine `deriveScores`         |
| Repeatable            | Same observation/signal set yields deterministic clamped values (0–100)         |
| Explainable           | Components include dimension/value/weight and `derivedFrom` / `sourceSignalIds` |
| Not manually editable | No API or store method permits arbitrary score mutation by users                |

## Dimensions supported

product · project · execution · requirement · automation · repository · evidence · overall

Overall is computed as the mean of non-overall dimensional scores when present.
