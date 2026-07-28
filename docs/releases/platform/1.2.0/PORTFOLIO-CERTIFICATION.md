# APZHUB Platform 1.2.0 — Portfolio Certification Report

> **Programme:** APZHUB-1.2-009  
> **Classification:** DOCUMENTATION + PORTFOLIO CERTIFICATION  
> **Date:** 2026-07-20  
> **Bootstrap:** AI-MANIFEST · repository evidence only  
> **Standard:** [Platform Delivery Standard](../../../engineering/platform-delivery/PLATFORM-DELIVERY-STANDARD.md)  
> **Prerequisite:** [APZHUB-1.2-008 readiness](../../1.2/readiness/README.md) **ACCEPTED**

---

## Scope verified

| Area                                                               | Result   | Evidence                                                                   |
| ------------------------------------------------------------------ | -------- | -------------------------------------------------------------------------- |
| Platform 1.1.0 Production Baseline                                 | **PASS** | [platform/1.1.0](../1.1.0/README.md) **ACCEPTED** · PRWL                   |
| Release 1.2 Planning                                               | **PASS** | APZHUB-1.2-001 **ACCEPTED** · Themes A–C minimum bar                       |
| Release 1.2 Engineering 002–007                                    | **PASS** | Each programme **ACCEPTED / CLOSED** with quality + compatibility PASS     |
| Release 1.2 Readiness Review                                       | **PASS** | APZHUB-1.2-008 · **READY FOR RELEASE 1.2 CERTIFICATION** · **ACCEPTED**    |
| Knowledge Foundation                                               | **PASS** | AI-MANIFEST · CURRENT-* · OWNER-ACCEPTANCE-REGISTER                        |
| Platform Delivery Standard                                         | **PASS** | APZHUB-ENGINEERING-001 **ACCEPTED**                                        |
| Architecture                                                       | **PASS** | docs 000–029 · ENTERPRISE-ARCHITECTURE-CATALOGUE · ADRs · freezes held     |
| Operations Framework                                               | **PASS** | APZHUB-OPERATIONS-001 **ACCEPTED** · Theme A ops programmes                |
| Enterprise Governance                                              | **PASS** | APZHUB-GOVERNANCE-001 **ACCEPTED**                                         |
| Commercial Strategy                                                | **PASS** | APZHUB-STRATEGY-001 **ACCEPTED**                                           |
| Identity                                                           | **PASS** | BetterAuth · PermissionService — not redesigned in 1.2                     |
| Integration SDK                                                    | **PASS** | `@apzhub/integration-sdk` **1.0.0** Architecture Frozen                    |
| Platform Services                                                  | **PASS** | `platform-services` **0.28.0** · additive GitLab CI providers              |
| Search                                                             | **PASS** | Additive `search-time` / `search-law`; Search Architecture Freeze retained |
| Testing / TCMS                                                     | **PASS** | GHA frozen · GitLab CI metadata adapter **0.1.0**                          |
| Analytics / Workflow / Documents / Law / Time / Support / Projects | **PASS** | Product SemVer held; no unauthorised product majors                        |
| Known Limitations                                                  | **PASS** | [KNOWN-LIMITATIONS.md](./KNOWN-LIMITATIONS.md)                             |
| Risk Register                                                      | **PASS** | [RISK-REGISTER.md](./RISK-REGISTER.md)                                     |
| Operational / Production Readiness                                 | **PASS** | This pack + [1.2 readiness](../../1.2/readiness/)                          |
| QA-002                                                             | **HELD** | Repository **PRODUCTION READY**                                            |

---

## Verification (Release 1.2 packaging)

| Check                                                                       | Result                                             |
| --------------------------------------------------------------------------- | -------------------------------------------------- |
| Release 1.1 compatibility maintained                                        | **PASS**                                           |
| Architecture boundaries preserved                                           | **PASS**                                           |
| SemVer compatibility (platform **1.2.0** naming; product SemVers unchanged) | **PASS**                                           |
| Public API compatibility                                                    | **PASS**                                           |
| Quality evidence complete (authorised P0 programmes)                        | **PASS**                                           |
| Documentation complete (this pack + readiness)                              | **PASS**                                           |
| Portfolio consistency                                                       | **PASS**                                           |
| Repository consistency                                                      | **PASS WITH NOTES** (doc-lag hygiene non-blocking) |
| No production code / package / API changes in this programme                | **PASS**                                           |
| Themes D–E Owner-waived for cert entry                                      | **PASS** (residual KL)                             |
| STOP themes held                                                            | **PASS**                                           |

---

## Certification class

**PRODUCTION_READY_WITH_LIMITATIONS** — Release **1.2** P0 enhancements are production-grade within documented residuals; not defects blocking platform Production maturity for the authorised scope.

---

## Recommendation

# PRODUCTION_READY_WITH_LIMITATIONS

---

## STOP

Await Owner Acceptance. Do not implement P1 backlog, Email SoR, FIN-001, Workflow Execute unlock, or Release 1.3.
