# Analytics Platform — Readiness Assessment

> **Programme:** APZHUB-PLATFORM-ANALYTICS-001  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19  
> **Evidence:** AI-MANIFEST · disk inventory · Metrics/Observe freeze notices · OSS catalogue · APZ-ANALYTICS-001 pack

---

## Recommendation

# FOUNDATION READY

| Option               | Selected?                                                                     |
| -------------------- | ----------------------------------------------------------------------------- |
| NOT READY            | No — architecture + ADRs + capability/integration models complete             |
| **FOUNDATION READY** | **Yes**                                                                       |
| IMPLEMENTATION READY | **No** — Metabase absent; no analytics contracts/services/HTTP/module on disk |

**Meaning:** The shared Analytics Platform **architecture foundation** is defined and may guide Owner-approved prerequisite programmes (P1–P2). It does **not** authorise Metabase adapter code, platform services, or APZ Analytics product implementation.

---

## Assessment dimensions

| Dimension                                 | Status            | Evidence                                           |
| ----------------------------------------- | ----------------- | -------------------------------------------------- |
| Purpose / boundaries documented           | **PASS**          | ANALYTICS-PLATFORM + ADR-0066                      |
| Separation from Observe/Metrics/Reporting | **PASS** (design) | ADR-0066; freeze notices respected                 |
| Service model defined                     | **PASS** (design) | ANALYTICS-SERVICE-ARCHITECTURE                     |
| Capability model defined                  | **PASS** (design) | ANALYTICS-CAPABILITY-MODEL                         |
| Integration model (Metabase)              | **PASS** (design) | ANALYTICS-INTEGRATION-MODEL · ADR-0067             |
| Provider on disk                          | **FAIL**          | Metabase **ABSENT**                                |
| Contracts / services / HTTP               | **FAIL**          | No analytics packages                              |
| Workbench module                          | **FAIL**          | Absent                                             |
| Frozen planes unmodified                  | **PASS**          | Docs-only; no package changes                      |
| Product planning dependency               | **PASS**          | APZ-ANALYTICS-001 ACCEPTED · READY WITH CONDITIONS |

---

## What FOUNDATION READY unlocks (after Acceptance)

1. Owner may approve **P1 Metabase Integration** programme (separate Approval).
2. Owner may approve **P2 Analytics Contracts** programme.
3. Product APZ Analytics remains **Planning** until platform prerequisites land and IR is reassessed.

---

## What remains forbidden

- Implementing Metabase / Analytics services / Workbench from this Acceptance alone
- Modifying frozen Metrics / Observability / Reporting / Integration SDK packages
- Claiming Grafana/Prometheus as Analytics Platform

---

## Related

- [ANALYTICS-IMPLEMENTATION-ROADMAP.md](./ANALYTICS-IMPLEMENTATION-ROADMAP.md)
- [README.md](./README.md)
