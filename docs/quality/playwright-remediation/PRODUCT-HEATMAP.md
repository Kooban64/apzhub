# Product Heat Map

> **Programme:** APZHUB-QA-RECERT-001

---

## Failures by product surface

| Product / surface           | Failures | Dominant groups                                |
| --------------------------- | -------: | ---------------------------------------------- |
| APZHUB Platform             |       34 | RG-AUTH-SHELL, RG-HEALTH-503, RG-A11Y-CONTRAST |
| APZ Law                     |        7 | RG-LAW-DNS                                     |
| APZ TCMS                    |        5 | RG-TCMS-WB, RG-PW-API, RG-SELECTORS            |
| APZHUB Platform (Metrics)   |        2 | RG-METRICS-WB                                  |
| APZ Workflow                |        2 | RG-WORKFLOW-WB                                 |
| APZ Support                 |        2 | RG-VISUAL                                      |
| APZ Documents               |        1 | RG-SELECTORS                                   |
| APZHUB Platform (Reporting) |        1 | RG-PW-API                                      |
| APZHUB Platform (Search)    |        1 | RG-SELECTORS                                   |
| APZHUB Platform (Observe)   |        1 | RG-SELECTORS                                   |

---

## Interpretation

1. **APZHUB Platform** dominates — expected, because SPR shell + shared frameworks gate most commercial workbench journeys.
2. **APZ Law** is a concentrated Infrastructure spike (dns/pg), not seven distinct trust bugs.
3. Commercial products (Support, Documents, TCMS, Workflow, Metrics) show smaller unique residuals after accounting for shared shell/test defects.
