# APZHUB Governance KPI Catalogue

> **Programme:** APZHUB-GOVERNANCE-001  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19  
> **Rule:** KPIs are definitions only — no collection pipelines authorised here

---

## Purpose

Catalogue of **key performance / health indicators** for the Engineering Governance Dashboard.  
Each KPI lists id, definition, unit, source class, and owner.

---

## 1. Repository KPIs

| KPI ID  | Name                   | Definition                           | Unit  | Source class           |
| ------- | ---------------------- | ------------------------------------ | ----- | ---------------------- |
| KPI-R01 | CI green rate          | % of `main` CI runs PASS over window | %     | CI/CD                  |
| KPI-R02 | Typecheck status       | Last typecheck outcome               | enum  | CI/CD                  |
| KPI-R03 | Lint status            | Last lint outcome                    | enum  | CI/CD                  |
| KPI-R04 | Test status            | Last full/scoped test outcome        | enum  | CI/CD                  |
| KPI-R05 | Build status           | Last build outcome                   | enum  | CI/CD                  |
| KPI-R06 | Repo certification     | QA certification label               | enum  | Documentation Metadata |
| KPI-R07 | Days since last CI     | Freshness of CI evidence             | days  | CI/CD                  |
| KPI-R08 | Open security findings | Count of unresolved high/critical    | count | Security / CI          |

---

## 2. Product portfolio KPIs

| KPI ID  | Name                      | Definition                                     | Unit  | Source class           |
| ------- | ------------------------- | ---------------------------------------------- | ----- | ---------------------- |
| KPI-P01 | Production product count  | Products with Production SemVer                | count | Release Metadata       |
| KPI-P02 | Products with limitations | Production + PRWL / documented limits          | count | Documentation Metadata |
| KPI-P03 | IR but not approved       | Implementation Ready awaiting Approval         | count | Documentation Metadata |
| KPI-P04 | Release lag               | Days since last Owner-accepted product release | days  | Release Metadata       |
| KPI-P05 | Known limitations open    | Count of material limitation themes            | count | Documentation Metadata |

---

## 3. Integration KPIs

| KPI ID  | Name                      | Definition                          | Unit  | Source class           |
| ------- | ------------------------- | ----------------------------------- | ----- | ---------------------- |
| KPI-I01 | Certified adapters        | Adapters with CERTIFIED* status     | count | Repository Metadata    |
| KPI-I02 | Adapters with limitations | CERTIFIED_WITH_LIMITATIONS / DOMAIN | count | Documentation Metadata |
| KPI-I03 | Absent planned engines    | Portfolio engines not on disk       | count | Documentation Metadata |
| KPI-I04 | SDK freeze integrity      | SDK version == frozen 1.0.0         | bool  | Repository Metadata    |

---

## 4. Programme KPIs

| KPI ID  | Name                 | Definition                      | Unit  | Source class           |
| ------- | -------------------- | ------------------------------- | ----- | ---------------------- |
| KPI-G01 | Pending acceptance   | Programmes Awaiting Acceptance  | count | Documentation Metadata |
| KPI-G02 | Blocked programmes   | Status BLOCKED                  | count | Documentation Metadata |
| KPI-G03 | Docs-only ratio      | Docs-only / all open programmes | %     | Documentation Metadata |
| KPI-G04 | Acceptance lead time | Approval → Acceptance duration  | days  | Documentation Metadata |

---

## 5. Release KPIs

| KPI ID  | Name                        | Definition                         | Unit  | Source class           |
| ------- | --------------------------- | ---------------------------------- | ----- | ---------------------- |
| KPI-L01 | Active production releases  | Rows in Portfolio Release Register | count | Release Metadata       |
| KPI-L02 | Pending release acceptances | Release Acceptance Awaiting        | count | Release Metadata       |
| KPI-L03 | Checklist compliance        | Last release checklist complete    | bool  | Documentation Metadata |

---

## 6. Quality KPIs

| KPI ID  | Name                     | Definition                       | Unit  | Source class           |
| ------- | ------------------------ | -------------------------------- | ----- | ---------------------- |
| KPI-Q01 | Line coverage (optional) | Aggregate coverage if configured | %     | Coverage Reports       |
| KPI-Q02 | Cert suites PASS         | Critical cert test files PASS    | bool  | CI/CD                  |
| KPI-Q03 | Doc link health          | Broken mandatory links           | count | Documentation Metadata |
| KPI-Q04 | Tech debt themes         | Open debt items in registers     | count | Documentation Metadata |

---

## 7. Automation readiness KPIs (future)

| KPI ID  | Name                       | Definition                     | Unit  | Source class           |
| ------- | -------------------------- | ------------------------------ | ----- | ---------------------- |
| KPI-A01 | Event catalogue coverage   | Domains with publish vs target | %     | Documentation Metadata |
| KPI-A02 | Cross-product XI delivered | XI-* items implemented         | count | Documentation Metadata |

---

## Ownership

| Area              | KPI owner                    |
| ----------------- | ---------------------------- |
| Repository / CI   | Technical Lead               |
| Product / Release | Product Owner + Release lead |
| Integration / SDK | Platform Architect           |
| Programme         | Owner / PM                   |
| Quality           | Technical Lead               |

---

## Related

- [GOVERNANCE-DASHBOARD-DATA-MODEL.md](./GOVERNANCE-DASHBOARD-DATA-MODEL.md)
- [ENGINEERING-GOVERNANCE-DASHBOARD.md](./ENGINEERING-GOVERNANCE-DASHBOARD.md)
