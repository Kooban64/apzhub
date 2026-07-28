# APZHUB Release 1.2 — Production Readiness Review

> **Programme:** APZHUB-1.2-008  
> **Date:** 2026-07-20  
> **Classification:** DOCUMENTATION ONLY  
> **Baseline held:** Platform **1.1.0** **PRODUCTION_READY_WITH_LIMITATIONS**  
> **Target after certification:** Platform **1.2.0** (expected **PRWL**)

---

## 1. Purpose

Determine Production readiness posture for entering Platform **1.2.0** portfolio packaging and certification — not to certify the release in this programme.

---

## 2. Production readiness matrix

| Dimension                          | Result               | Notes                                                          |
| ---------------------------------- | -------------------- | -------------------------------------------------------------- |
| Authorised P0 engineering complete | **PASS**             | 002–007 ACCEPTED                                               |
| 1.1.0 baseline compatibility       | **PASS**             | SemVer held; additive only                                     |
| Architecture / security pipeline   | **PASS**             | Boundaries + STOP held                                         |
| Quality evidence (P0)              | **PASS**             | Programme QUALITY-EVIDENCE packs                               |
| Operational maturity (Theme A)     | **PASS WITH NOTES**  | See OPERATIONAL-READINESS                                      |
| Search / TCMS expansions           | **PASS WITH NOTES**  | Publishers + GitLab metadata; live wiring / mutations residual |
| Commercial product SemVer bumps    | **DEFERRED TO CERT** | Engineering did not bump product SemVer                        |
| Full portfolio Playwright re-cert  | **NOT DONE**         | R12-QA-01 P1; not P0 blocker for cert entry                    |
| STOP capabilities                  | **HELD**             | Email / FIN / Execute correctly absent                         |

---

## 3. Expected certification class

| Field     | Value                                                                                                                                 |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Class     | **PRODUCTION_READY_WITH_LIMITATIONS**                                                                                                 |
| Rationale | Residual KL (search live drain, alert live delivery, GitLab mutations, Themes D–E, STOP) documented and acceptable under PRWL honesty |
| Marketing | Must not claim GA for deferred/STOP surfaces                                                                                          |

---

## 4. Commercial products (current Production — unchanged by this review)

| Product   | SemVer           | 1.2 engineering impact                                  |
| --------- | ---------------- | ------------------------------------------------------- |
| Platform  | **1.1.0** (held) | Target **1.2.0** at certification                       |
| Projects  | **1.1.0**        | No P0 product programme                                 |
| Time      | **1.0.0**        | Search publisher adjacency only                         |
| Support   | **1.0.0**        | No Theme E delivery                                     |
| Documents | **1.0.0**        | Unchanged                                               |
| TCMS      | **1.0.0**        | GitLab metadata adapter (platform); product SemVer held |
| Law       | **1.0.0**        | Search publisher adjacency only                         |
| Analytics | **1.0.0**        | Unchanged                                               |
| Workflow  | **1.0.0**        | Execute remains gated                                   |

---

## 5. Conclusion

Production readiness for **entering** Platform **1.2.0** certification packaging is **affirmative under PRWL**. This programme does not itself publish Platform **1.2.0**.

**Supports:** **READY FOR RELEASE 1.2 CERTIFICATION**
