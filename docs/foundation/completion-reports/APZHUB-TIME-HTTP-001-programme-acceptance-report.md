# APZHUB-TIME-HTTP-001 — Programme Acceptance Report

> **Programme:** APZHUB-TIME-HTTP-001  
> **Title:** Canonical Time HTTP API  
> **Status:** **ACCEPTED / CLOSED**  
> **Owner decision:** 2026-07-19 — formally ACCEPTED  
> **Certification:** [HTTP-API-CERTIFICATION](../../http/time/HTTP-API-CERTIFICATION.md)  
> **Next programme:** [APZHUB-TIME-READINESS-001](./APZHUB-TIME-READINESS-001-programme-acceptance-report.md)

---

## Owner decision

Canonical Time HTTP API is accepted as the only supported external HTTP interface for future Time products.

1. `/api/v1/time/*` (OpenAPI **1.10.0**) is the sole HTTP boundary over Time Platform Services.
2. Kimai **0.1.0** foundation limits remain (domain CRUD may return **501**).
3. APZ Time remains subject to readiness reassessment — Workbench / product require Implementation Ready + separate Owner Approval.

## Validation

| Check                            | Result |
| -------------------------------- | ------ |
| Time Platform Services unchanged | PASS   |
| Kimai Integration unchanged      | PASS   |
| Integration SDK unchanged        | PASS   |
| OpenAPI valid                    | PASS   |
| Quality evidence                 | PASS   |
| No Workbench / React / APZ Time  | PASS   |
