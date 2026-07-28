# APZHUB Product KPI Catalogue

> **Programme:** APZHUB-PRODUCT-MANAGEMENT-001  
> **Classification:** DOCUMENTATION ONLY — definitions only; no dashboards  
> **Complements:** [GOVERNANCE-KPI-CATALOGUE](../governance/GOVERNANCE-KPI-CATALOGUE.md) (engineering governance)  
> **Date:** 2026-07-19

---

## Purpose

Define commercial and product-health KPIs. Measurement systems and dashboards are **not** authorised by this programme.

---

## KPI domains

### Adoption

| KPI                    | Definition                                | Notes                  |
| ---------------------- | ----------------------------------------- | ---------------------- |
| Active organisations   | Orgs with ≥1 productive session in period | Tenant-ready schema    |
| Active users (WAU/MAU) | Distinct users in Workbench               | Per product optional   |
| Module enablement rate | Orgs with module enabled / licensed       | Edition-aware later    |
| Time-to-first-value    | Deploy → first core action                | Per product definition |

### Retention

| KPI                  | Definition                        | Notes      |
| -------------------- | --------------------------------- | ---------- |
| Logo retention       | Orgs still active vs prior period | Commercial |
| User retention       | Returning users ratio             | Product    |
| Edition upgrade rate | Community → paid steps            | Commercial |

### Usage

| KPI                       | Definition                        | Notes             |
| ------------------------- | --------------------------------- | ----------------- |
| Core actions / user       | e.g. tasks, tickets, time entries | Product-specific  |
| Search queries            | Platform search usage             | Shared capability |
| Integration health uptime | Adapter healthy ratio             | Ops + product     |

### Revenue

| KPI          | Definition                 | Notes                                |
| ------------ | -------------------------- | ------------------------------------ |
| ARR / MRR    | Contracted recurring       | **Out of band** — not stored in repo |
| Attach rate  | Suite modules per logo     | Commercial                           |
| Vertical mix | Law vs suite revenue share | Commercial                           |

### Support

| KPI                  | Definition                     | Notes          |
| -------------------- | ------------------------------ | -------------- |
| Ticket volume        | Support requests about APZHUB  | Meta-support   |
| Time to resolve      | Median resolution              | Support ops    |
| Escapes to engine UI | Incidents of brand/engine leak | Quality signal |

### Quality

| KPI                        | Definition                 | Notes          |
| -------------------------- | -------------------------- | -------------- |
| Release defect density     | Sev1/2 per release         | Align QA-002   |
| Certification status       | PRWL / Production Ready    | Per product    |
| Known-limitation burn-down | Closed vs open limitations | Honesty metric |

### Performance

| KPI             | Definition         | Notes                       |
| --------------- | ------------------ | --------------------------- |
| p95 API latency | Gateway paths      | Observability SoR adjacency |
| Error rate      | 5xx / typed errors | Envelope categories         |
| Job backlog age | Outbox / workers   | Async health                |

---

## Product focus KPIs (minimum set)

| Product   | Primary usage KPI             | Primary quality KPI               |
| --------- | ----------------------------- | --------------------------------- |
| Projects  | Tasks created/updated         | Projects cert / limitations       |
| Time      | Time entries saved            | Time 1.0 limitations burn-down    |
| Support   | Tickets handled in Workbench  | Support PRWL items                |
| Documents | Documents opened/versioned    | Docs freeze compliance            |
| Analytics | Dashboard views (future)      | N/A until Concept exit            |
| Workflow  | Workflow definitions governed | Read-only non-goal compliance     |
| TCMS      | Test runs / cert artefacts    | TCMS vertical cert                |
| Law       | Matters active                | Validation / commercial readiness |

---

## Rules

1. KPIs never grant permissions.
2. Revenue figures stay outside the engineering repository unless Owner directs otherwise.
3. Do not build governance/product dashboards under this programme ([GOVERNANCE-001](../governance/ENGINEERING-GOVERNANCE-DASHBOARD.md) remains spec-only).

---

## Related

- [GO-TO-MARKET.md](./GO-TO-MARKET.md)
- [FEATURE-MANAGEMENT.md](./FEATURE-MANAGEMENT.md)
