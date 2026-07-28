# APZHUB Repository Health Model

> **Programme:** APZHUB-GOVERNANCE-001  
> **Classification:** DOCUMENTATION ONLY  
> **Authority:** [QA-002](../foundation/completion-reports/APZHUB-QA-002-repository-quality-certification.md) · [DEFINITION-OF-DONE](../operations/DEFINITION-OF-DONE.md) · Document 015  
> **Date:** 2026-07-19

---

## Purpose

Define how **repository health** is measured for the Engineering Governance Dashboard — independent of any UI implementation.

---

## 1. Health dimensions

| Dimension      | Dashboard label          | Typical evidence                                 |
| -------------- | ------------------------ | ------------------------------------------------ |
| Certification  | Repository Certification | QA-002 status                                    |
| Overall status | Repository Status        | Derived from gates + certification               |
| QA             | QA Status                | Test suite outcome                               |
| Build          | Build Status             | `pnpm build` / CI build job                      |
| Lint           | Lint Status              | ESLint CI                                        |
| Types          | Typecheck Status         | `tsc` / typecheck CI                             |
| Security       | Security Status          | Audit scripts / dependency scans (as configured) |
| Documentation  | Documentation Status     | Required KF docs present + links                 |
| Architecture   | Architecture Status      | Freeze compliance + boundary audits              |

Each dimension uses Quality status: `PASS` | `FAIL` | `WARN` | `SKIPPED` | `UNKNOWN` ([PORTFOLIO-STATUS-MODEL](./PORTFOLIO-STATUS-MODEL.md)).

---

## 2. Aggregate repository health

```text
if any critical dimension == FAIL → UNHEALTHY
else if certification != PRODUCTION_READY* → DEGRADED or UNKNOWN
else if any WARN → DEGRADED
else → HEALTHY
```

**Critical dimensions (default):** Build, Typecheck, Lint, QA (tests), Certification.

**Non-critical (default WARN only):** Documentation freshness, coverage soft targets — unless Owner elevates.

---

## 3. Certification mapping

| QA label                         | Repository status                  | Health                    |
| -------------------------------- | ---------------------------------- | ------------------------- |
| PRODUCTION READY                 | `PRODUCTION_READY`                 | `HEALTHY` (if gates PASS) |
| PRODUCTION READY WITH EXCEPTIONS | `PRODUCTION_READY_WITH_EXCEPTIONS` | `DEGRADED`                |
| Not certified / revoked          | `DEGRADED` / `UNKNOWN`             | `UNHEALTHY` or `UNKNOWN`  |

Current baseline: **QA-002 ACCEPTED — PRODUCTION READY**.

---

## 4. Signal freshness

| Signal                 | Freshness rule (policy)                          |
| ---------------------- | ------------------------------------------------ |
| CI on `main`           | Last successful workflow for HEAD                |
| Local gate evidence    | Acceptable only when CI unavailable; mark `WARN` |
| Certification document | Valid until Owner supersedes                     |
| Docs presence          | Checked against DOCUMENT-MAP required set        |

Stale CI (>N days without run on `main` while commits exist) → `WARN` on Build/QA.

_(N is an operational parameter — default recommendation: 7 days; not implemented here.)_

---

## 5. Architecture health

| Check            | PASS when                                                      |
| ---------------- | -------------------------------------------------------------- |
| Freeze integrity | Frozen subsystems unchanged without ADR + Owner                |
| Boundary audits  | Vertical / SDK audits report 0 violations (or Owner exception) |
| Layering         | No Module→Connector / Service→Backend bypass in cert suites    |

Architecture Status `FAIL` forces aggregate health ≤ `DEGRADED`.

---

## 6. Documentation health

Minimum required for `PASS`:

- AI-MANIFEST, CURRENT-STATE, CURRENT-MILESTONE present
- PORTFOLIO-RELEASE-REGISTER present
- Active programme Acceptance Reports linked from CURRENT-MILESTONE
- No broken **mandatory** cross-links in KF entry docs (spot-check policy)

---

## 7. Security health

| Signal                        | Source (future automation)              |
| ----------------------------- | --------------------------------------- |
| Dependency audit              | CI / `pnpm audit` policy                |
| Secret scan                   | CI                                      |
| Architecture security reviews | docs/reviews when required by programme |

Absence of a configured scanner → `UNKNOWN` (not FAIL) until Owner mandates tool.

---

## Related

- [ENGINEERING-GOVERNANCE-DASHBOARD.md](./ENGINEERING-GOVERNANCE-DASHBOARD.md)
- [CERTIFICATION-LIFECYCLE.md](./CERTIFICATION-LIFECYCLE.md)
- [GOVERNANCE-KPI-CATALOGUE.md](./GOVERNANCE-KPI-CATALOGUE.md)
