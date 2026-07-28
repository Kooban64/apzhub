# APZ Analytics — Implementation Readiness (Release 1.0)

> **Programme:** APZ-ANALYTICS-001  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19  
> **Evidence:** AI-MANIFEST · disk inventory · Definition Pack · OSS catalogue · EA / Commercial catalogues  
> **Prior pack:** [analytics/IMPLEMENTATION-READINESS.md](../analytics/IMPLEMENTATION-READINESS.md) (PRODUCTS-002)

---

## Overall maturity (after APZ-ANALYTICS-001)

# Planning

Promoted from **Concept** by completion of this Release Definition Pack.  
**Not** Implementation Ready.

---

## Final recommendation

# READY WITH CONDITIONS

| Option                    | Selected?                                            |
| ------------------------- | ---------------------------------------------------- |
| NOT READY                 | No — planning pack complete; platform patterns exist |
| **READY WITH CONDITIONS** | **Yes**                                              |
| IMPLEMENTATION READY      | **No** — blockers on disk                            |

**Meaning:** Owner may accept this planning programme and authorise **prerequisite** programmes (especially Metabase adapter + Analytics architecture ADR). Owner must **not** treat Analytics product code as authorised. A future readiness programme must re-assess to **IMPLEMENTATION READY** only after conditions are evidenced on disk.

---

## Dimension assessment

| Dimension                    | Status              | Evidence                                                                                                                                                    |
| ---------------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Current Product Maturity** | **Planning**        | Was Concept; Release 1.0 pack now exists; no SemVer; no module                                                                                              |
| **Architecture Readiness**   | **PARTIAL**         | ADR-0066/0067 Accepted; Information Model complete; contracts **0.1.0** on disk; Platform Services still absent                                             |
| **Integration Readiness**    | **PARTIAL**         | Metabase foundation **ACCEPTED**; contracts `@apzhub/analytics-contracts` **0.1.0** on disk; Analytics Services still absent                                |
| **Workbench Readiness**      | **PARTIAL**         | Analytics Workbench module filed (ANALYTICS-006 Awaiting Acceptance); commercial packaging absent                                                           |
| **Platform Readiness**       | **PARTIAL**         | Gateway, IAM, AuthZ, Redis, SDK **1.0.0**, Provisioning **0.1.0** ready; Analytics services absent; Metrics/Reporting/Observe are **different** frozen SoRs |
| **Documentation Readiness**  | **PASS** (planning) | Definition Pack + this Release Pack; commercial + EA entries                                                                                                |
| **Commercial Readiness**     | **PARTIAL**         | Catalogue/edition matrix exist; Analytics still Concept→Planning; no edition GA claims                                                                      |
| **Release Readiness**        | **FAIL**            | No `docs/releases/analytics/`; checklist defined but unexecutable                                                                                           |

---

## Conditions for future IMPLEMENTATION READY

All must be **true on disk** before IR promotion:

| #   | Condition                                                                                          | Current                                                                                                                                            |
| --- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | Metabase Integration SDK adapter present and certified (or Owner-accepted ADR alternative engine)  | **PASS** — `@apzhub/integration-metabase` **0.1.0** CERTIFIED_FOUNDATION **ACCEPTED**                                                              |
| C2  | Architecture ADR accepted: AnalyticsService boundary vs Metrics / Reporting / Observability        | **PASS** — ADR-0066/0067 **Accepted** (PLATFORM-ANALYTICS-001) · Information Model 002 filed                                                       |
| C3  | Analytics service contracts + permission catalogue in repo                                         | **PASS** — `@apzhub/analytics-contracts` **0.1.0** **ACCEPTED**                                                                                    |
| C4  | Platform Analytics service + HTTP surface scaffolded or explicitly scoped in approved sprint guide | **PASS** — Services + HTTP **ACCEPTED**; Workbench `/workspace/analytics/*` filed (ANALYTICS-006 Awaiting Acceptance); commercial packaging absent |
| C5  | Module manifest design accepted (may be docs-first)                                                | **FAIL**                                                                                                                                           |
| C6  | Named Owner Approval for Analytics implementation programme                                        | **FAIL** — not granted                                                                                                                             |
| C7  | This Release Definition Pack Owner-accepted                                                        | Pending APZ-ANALYTICS-001 Acceptance                                                                                                               |

Aligned with Time IR precedent: Workbench UI need not exist for IR, but **integration + platform service dependencies must**.

---

## What must not be confused with APZ Analytics

| On disk                              | Not a substitute for     |
| ------------------------------------ | ------------------------ |
| Platform Metrics SoR                 | APZ Analytics BI product |
| Platform Observability SoR           | Grafana-backed Analytics |
| Platform Reporting                   | Metabase dashboards      |
| `SupportAnalyticsService`            | Suite Analytics product  |
| Plane adapter `analytics` capability | APZ Analytics Workbench  |

---

## Implementation rule

A product may enter implementation only when:

1. Release / Definition packs complete
2. Architecture Owner-approved
3. Dependencies available on the platform
4. Marked **Implementation Ready**
5. **Named Owner Approval** of an implementation programme

Until then: **no production code** for APZ Analytics.

---

## Related

- [RELEASE-1.0-DEFINITION.md](./RELEASE-1.0-DEFINITION.md)
- [IMPLEMENTATION-PLAN.md](./IMPLEMENTATION-PLAN.md)
- [INTEGRATION-PRODUCT-CAPABILITY-INVENTORY](../../foundation/INTEGRATION-PRODUCT-CAPABILITY-INVENTORY.md)
