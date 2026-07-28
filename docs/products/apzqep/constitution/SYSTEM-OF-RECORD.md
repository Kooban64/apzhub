# APZ QEP — System of Record Constitution

> **Programme:** APZQEP-CONSTITUTION-001  
> **Authority:** Constitutional (Article IV)

## Authoritative domains

APZ QEP is the **authoritative System of Record** for:

| Domain                              | SoR meaning                                                                |
| ----------------------------------- | -------------------------------------------------------------------------- |
| **Requirements** (quality-relevant) | Approved requirements and their states live in QEP                         |
| **Verification**                    | Plans, procedures, suites, runs, and results of record                     |
| **Evidence**                        | Evidence metadata and authoritative references for quality claims          |
| **Certification**                   | Certification state, sign-off, and history                                 |
| **Quality Metrics**                 | Metrics derived for quality governance decisions                           |
| **Quality Intelligence**            | Governed insights grounded in QEP SoR (not vendor dashboards as authority) |
| **Audit**                           | Privileged and certification audit records for QEP actions                 |
| **Traceability**                    | Links among requirements, verifications, defects, evidence, releases       |

## Non-authoritative externals

External systems may **contribute**, **sync**, or **display** data, but shall not become authoritative for the domains above:

| External class                                   | Role                                   |
| ------------------------------------------------ | -------------------------------------- |
| ALM (Jira, Linear, Azure Boards, Plane/Projects) | Work adjacency; optional sync          |
| CI/CD (GitHub, GitLab, ADO Pipelines)            | Automation signals / metadata          |
| Test runners (JUnit, Playwright, Cypress, …)     | Execution engines — results ingested   |
| AI providers / agents                            | Assistants — drafts until human accept |
| Device clouds / observability engines            | Adjacent signals — not QEP SoR         |
| Spreadsheets / chat                              | Never SoR                              |

## Rules

1. **Write authority** for SoR domains ends at Platform Services for QEP.
2. **Connectors** translate; they do not own SoR truth.
3. **Modules/UI** never call engines or write SoR bypassing services.
4. **Caches/search indexes** are derived — never authoritative.
5. **Import/migration** may seed SoR; after accept, QEP remains authority.
6. **Conflict** between external tool and QEP SoR → QEP wins unless Owner amends Constitution.

## Multi-tenancy

SoR access is tenant-scoped. Cross-tenant authority is forbidden.
