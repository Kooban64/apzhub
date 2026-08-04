# Adoption & Operations — APZQEP Version 1.1

| Field     | Value                         |
| --------- | ----------------------------- |
| Product   | APZQEP                        |
| Version   | **1.1**                       |
| Status    | **GUIDANCE RECORDED**         |
| Timestamp | 20260804T184100Z              |
| Mode      | Enterprise infrastructure use |

APZQEP Version 1.1 is **officially complete**. It is no longer a product under
construction. It is **enterprise infrastructure**.

## Evaluation rule for future work

| Question                                             | Default                                   |
| ---------------------------------------------------- | ----------------------------------------- |
| Does this require changing the baseline?             | **No**                                    |
| Can this be delivered as a provider?                 | Prefer                                    |
| Can this be delivered as an integration?             | Prefer                                    |
| Can this be delivered as an operational improvement? | Prefer                                    |
| Does it expose a weakness in the baseline itself?    | Only then consider reopening architecture |

## First adoption phase (recommended sequence)

1. **Internal engineering teams** — use APZQEP for every new engineering change and release.
2. **APZHUB products** — progressively onboard APZ Projects, APZ Support, APZ Time, APZ Law Platform, and other internal products.
3. **Major delivery programmes** — mandate APZQEP for initiatives such as ZFConnect and APZSign.
4. **Provider expansion** — only after real operational experience, authorise 170 / 180 / 190 / 200 programme families.

## Success metrics (post-freeze)

Success is measured by adoption and operational outcomes — not commits or features.

| Metric                            | Target                         |
| --------------------------------- | ------------------------------ |
| Products onboarded                | Increasing over time           |
| Releases certified through APZQEP | 100% of new internal releases  |
| Evidence completeness             | 100%                           |
| Automated quality activities      | Increasing as providers mature |
| Manual release effort             | Decreasing over time           |
| Release confidence                | Increasing over time           |
| Post-release defects              | Trending downward              |

## Change control

Before any enhancement request proceeds to engineering, classify it under
[APZQEP-CHANGE-CONTROL.md](./APZQEP-CHANGE-CONTROL.md).

## Next chapter

Adoption, operational learning, and carefully governed provider expansion.
Not further foundational engineering. Resist starting APZQEP-170 until real
internal use has produced operational friction and lessons.
