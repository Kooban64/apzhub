# APZ Analytics — Known Limitations (Release 1.0.0)

> **Programme:** APZ-ANALYTICS-002  
> **Release:** **1.0.0**  
> **Certification class:** PRODUCTION_READY_WITH_LIMITATIONS  
> **Date:** 2026-07-19  
> **Portfolio pack:** [../analytics/KNOWN-LIMITATIONS.md](../analytics/KNOWN-LIMITATIONS.md)

---

## Release 1.0 product limitations (shipped)

| Limitation                              | Notes                                                                      |
| --------------------------------------- | -------------------------------------------------------------------------- |
| Curated dashboards only                 | No end-user SQL builder                                                    |
| No AI / predictive / ML analytics       | Out of scope                                                               |
| No external BI engines as primary       | Metabase CE provider foundation only                                       |
| No customer-facing public report portal | Workbench operators only                                                   |
| No live visual embed HTTP               | Dashboard detail is metadata; Metabase signed-URL issuance not productised |
| In-memory analytics registry MVP        | Not Postgres SoR; provider path uses Metabase where configured             |
| Metabase CERTIFIED_FOUNDATION           | Not full CERTIFIED_DOMAIN; sufficient for Release 1.0 catalogue            |
| Catalogue search                        | Client-side filter over HTTP catalogue payloads                            |
| Search indexes metadata only            | Titles/descriptions — not full semantic index product                      |
| Engine branding masked                  | Metabase must not appear as primary UX                                     |
| Alerting                                | Metabase → platform notifications deferred / limited                       |
| Tenancy/sandbox                         | Constrained by Metabase CE capabilities                                    |

---

## Honesty rule

Limitations remain visible in certification and GTM. Do not treat Metrics Workbench, Observability, or Support domain analytics as APZ Analytics GA. Do not claim live-embed or AI analytics for Release 1.0.

---

## Related

- [RELEASE-1.0-DEFINITION.md](./RELEASE-1.0-DEFINITION.md) §5 exclusions
- [Compatibility](../../releases/analytics/APZ-ANALYTICS-1.0-COMPATIBILITY.md)
- [Certification Report](../../releases/analytics/APZ-ANALYTICS-1.0-CERTIFICATION-REPORT.md)
