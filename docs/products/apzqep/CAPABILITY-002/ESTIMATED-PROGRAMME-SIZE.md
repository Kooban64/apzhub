# Estimated Programme Size — Evidence Management

| Dimension                  | Estimate                                                                 |
| -------------------------- | ------------------------------------------------------------------------ |
| Overall size               | **L** (Large)                                                            |
| Architecture programme     | 1 (e.g. ARCH-016)                                                        |
| Engineering Specification  | 1 multi-part OES                                                         |
| Engineering waves          | Likely Domain → Application → Infrastructure/API → Workbench (4–5 waves) |
| Platform touchpoints       | Object storage connector; PermissionService ACL; audit; search; events   |
| Migrations                 | Expected (new SoR tables) — designed in Architecture/ES, not now         |
| Certification class target | PRODUCTION_READY_WITH_LIMITATIONS (typical first release)                |
| Governance tax target      | ≤10% of total effort                                                     |

## Comparative sizes (indicative)

| Capability            | Size         |
| --------------------- | ------------ |
| Test Suites           | M            |
| Test Runs             | M–L          |
| Evidence Management   | **L**        |
| Defects               | M–L          |
| Reporting / Analytics | L (later)    |
| AI Assistance         | L–XL (later) |
