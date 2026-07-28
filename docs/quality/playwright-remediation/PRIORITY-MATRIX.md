# Priority Matrix

> **Programme:** APZHUB-QA-RECERT-001

---

## By priority

| Priority | Count | Groups                                                               |
| -------- | ----: | -------------------------------------------------------------------- |
| P0       |    26 | RG-AUTH-SHELL, RG-HEALTH-503                                         |
| P1       |    21 | RG-A11Y-CONTRAST, RG-LAW-DNS, RG-MOCK-FETCH, RG-PW-API, RG-SELECTORS |
| P2       |     9 | RG-METRICS-WB, RG-SELECTORS, RG-TCMS-WB, RG-VISUAL, RG-WORKFLOW-WB   |

---

## Priority rubric (this analysis)

| Priority | Meaning                                                           |
| -------- | ----------------------------------------------------------------- |
| **P0**   | Blocks platform shell certification cascade (health + auth/shell) |
| **P1**   | Systemic product/infra/test defects with clear single fix         |
| **P2**   | Residual workbench/visual after shared fixes; capacity-gated      |

---

## Risk × size (groups)

| Group            | Priority | Size | Risk | Count |
| ---------------- | -------- | ---- | ---- | ----: |
| RG-HEALTH-503    | P0       | M    | M    |     6 |
| RG-AUTH-SHELL    | P0       | M    | H    |    20 |
| RG-LAW-DNS       | P1       | M    | M    |     7 |
| RG-A11Y-CONTRAST | P1       | S    | L    |     4 |
| RG-MOCK-FETCH    | P1       | S    | L    |     4 |
| RG-PW-API        | P1       | S    | L    |     3 |
| RG-SELECTORS     | P1       | S    | L    |     4 |
| RG-METRICS-WB    | P2       | M    | M    |     2 |
| RG-TCMS-WB       | P2       | M    | M    |     2 |
| RG-WORKFLOW-WB   | P2       | M    | M    |     2 |
| RG-VISUAL        | P2       | S    | L    |     2 |
