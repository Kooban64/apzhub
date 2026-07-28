# APZHUB Release 1.2 — Quality Summary

> **Programme:** APZHUB-1.2-008  
> **Date:** 2026-07-20  
> **Sources:** Programme QUALITY-EVIDENCE.md packs under `docs/releases/1.2/APZHUB-1.2-00{2,3,4,5,6,7}/`

---

## Aggregated gates (authorised P0 engineering)

| Programme      | Typecheck | Lint | Unit / Integration / Regression         | Architecture / audit                                               | Compatibility   |
| -------------- | --------- | ---- | --------------------------------------- | ------------------------------------------------------------------ | --------------- |
| APZHUB-1.2-002 | PASS      | PASS | PASS (incl. live drill evidence)        | PASS                                                               | PASS            |
| APZHUB-1.2-003 | PASS      | PASS | PASS                                    | PASS (`audit` where filed)                                         | PASS            |
| APZHUB-1.2-004 | PASS      | PASS | PASS (incl. live coexistence audit)     | PASS                                                               | PASS            |
| APZHUB-1.2-005 | PASS      | PASS | PASS (adapter)                          | PASS (`audit:search-time`); frozen-wave pin drift **pre-existing** | PASS (additive) |
| APZHUB-1.2-006 | PASS      | PASS | PASS (adapter)                          | PASS (`audit:search-law`)                                          | PASS (additive) |
| APZHUB-1.2-007 | PASS      | PASS | PASS (adapter + providers + SoR import) | PASS (`audit:gitlab-ci`)                                           | PASS (additive) |

**Overall authorised-P0 quality posture:** **PASS**

---

## Explicitly not re-run under 1.2 P0 programmes (by design)

| Gate                                               | Status                                        |
| -------------------------------------------------- | --------------------------------------------- |
| Full monorepo Playwright (R12-QA-01)               | Not required by approved P0 scope; remains P1 |
| Docker rebuild / portfolio re-cert                 | Belongs to optional cert / P1 programme       |
| Platform 1.2.0 certification suite                 | Belongs to certification programme            |
| Live Meilisearch drain / product composition hooks | Explicit non-goals of SEARCH-01/02            |
| Live Observe alert evaluation/delivery             | Explicit residual of OPS-02                   |
| GitLab dispatch / binary download E2E              | STOP / unsupported ops                        |

Repository-wide **QA-002 PRODUCTION READY** certification remains **HELD** from prior Production Baseline.

---

## Architecture / boundary verification (aggregate)

| Rule                                                   | Held                           |
| ------------------------------------------------------ | ------------------------------ |
| No Module → Connector / backend bypass                 | Yes                            |
| Search Architecture Freeze retained for certified wave | Yes (additive publishers only) |
| GHA CI/CD Reference Adapter Standard not thawed        | Yes                            |
| Shared HTTP Transport for GitLab CI adapter            | Yes                            |
| No Workflow Execute unlock                             | Yes                            |
| No Email SoR / FIN-001                                 | Yes                            |
| Platform **1.1.0** SemVer held during engineering      | Yes                            |

---

## Quality risk for certification packaging

| Risk                                             | Severity   | Handling                                                                           |
| ------------------------------------------------ | ---------- | ---------------------------------------------------------------------------------- |
| Narrow programme scopes vs full portfolio CI     | Low–Medium | Certification may optionally reaffirm CI; not a blocker for entering certification |
| Pre-existing search-publication wave pin drift   | Low        | Documented in 1.2-005 QUALITY-EVIDENCE; unrelated to additive publishers           |
| Incomplete live search / alert wiring overstated | Medium     | PRWL + [KNOWN-LIMITATIONS.md](./KNOWN-LIMITATIONS.md)                              |

---

## Conclusion

Quality evidence for Owner-authorised Release **1.2** P0 engineering is sufficient to enter certification packaging.
