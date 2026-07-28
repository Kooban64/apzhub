# APZHUB Platform 1.2.0 — Lessons Learned

> **Programme:** APZHUB-POST-IMPLEMENTATION-001  
> **Date:** 2026-07-20

---

## What worked well

1. **Single-item Owner programmes** — One P0 backlog item per engineering programme (002–007) kept scope crisp and Acceptance atomic.
2. **Planning → Engineering → Readiness → Certification** — Clear stage gates; readiness waived Themes D–E explicitly rather than silently expanding P0.
3. **Architecture freezes as force multipliers** — Search Architecture Freeze and CI/CD Reference Adapter Standard enabled additive delivery without redesign debates.
4. **STOP discipline** — Email SoR / FIN-001 / Workflow Execute remained untouched across nine delivery programmes.
5. **Audit scripts for adapters** — `audit:search-time`, `audit:search-law`, `audit:gitlab-ci` reinforced package boundaries.
6. **PRWL honesty** — Certification class matched residual KL (live drain, alert delivery, mutations unsupported).
7. **Ops Framework leverage** — Theme A mapped directly to OPERATIONAL-RISK-REGISTER items (OPS-R-01/04/05).

---

## Improvement opportunities

1. **Documentation lag** — Some COMPLETION-REPORT / register strings lagged Owner Acceptance; prefer atomic register refresh with Acceptance closeout.
2. **Pre-existing audit pin drift** — Frozen search-publication wave audits showed version pin drift during SEARCH-01; schedule hygiene programmes separately from feature P0.
3. **Live wiring deferred by design** — Search publishers shipped without composition hooks / Meilisearch drain; future programmes should decide “publisher-only” vs “live path” in Acceptance Conditions up front.
4. **Portfolio QA re-cert (R12-QA-01)** — Remained P1; if Owner wants cert-time CI reaffirmation, make it an explicit readiness exit criterion earlier.
5. **Themes D–E waiver timing** — Waiver occurred at readiness; planning exit already allowed waive — call the waiver path in the first programme Acceptance Conditions to reduce ambiguity.
6. **Root SemVer vs platform SemVer** — `0.1.0-foundation` vs Platform **1.2.0** remains a DX confusion risk (R12-SEMVER-01).

---

## Achievements (condensed)

| Theme      | Outcome                                            |
| ---------- | -------------------------------------------------- |
| A Ops      | Restore drills · alert runbooks · host coexistence |
| B Search   | `search-time` · `search-law`                       |
| C TCMS     | GitLab CI metadata adapter                         |
| Governance | Full train closed under PDS without STOP breach    |
