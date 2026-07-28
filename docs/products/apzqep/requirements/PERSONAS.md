# APZ QEP — Personas

> **Programme:** APZQEP-REQ-001 · IDs: PSN-*

| ID      | Persona                        | Goals                                                            | Pain points                          | Success metrics                                   | Primary SR |
| ------- | ------------------------------ | ---------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------- | ---------- |
| PSN-001 | Executive                      | Portfolio quality & risk visibility; confident release decisions | Fragmented tools; late surprises     | Readiness signal clarity; reduced escaped defects | SR-001     |
| PSN-002 | Product Owner                  | Coverage vs backlog; certification per product                   | Unknown gaps; weak requirement links | % requirements verified; cert status              | SR-002     |
| PSN-003 | Business Analyst               | Clear, testable requirements; traceability                       | Ambiguous requirements; orphan cases | Requirements approved & linked                    | SR-003     |
| PSN-004 | Project Manager                | Status across req → verify → defect → release                    | Spreadsheet status; no single view   | Traceability completeness                         | SR-004     |
| PSN-005 | Developer                      | Fast defect context; fix verification                            | Tool hopping; opaque failures        | Time-to-reproduce; linked defects                 | SR-005     |
| PSN-006 | QA Engineer                    | Efficient manual verification authoring/execution                | Clunky TCMS UX; poor search          | Procedures executed / day                         | SR-006     |
| PSN-007 | Automation Engineer            | Reliable result ingestion; CI linkage                            | Flaky linkage; rewriting runners     | % automated runs linked                           | SR-007     |
| PSN-008 | Release Manager                | Evidence-backed go/no-go                                         | Ambiguous readiness                  | Cert packs complete; gate status                  | SR-008     |
| PSN-009 | Operations                     | Health, backup, observability                                    | Silent failures                      | Health green; RTO/RPO met                         | SR-009     |
| PSN-010 | Support                        | Supportable incidents; clear limitations                         | Unclear product identity             | MTTR; known limitations used                      | SR-010     |
| PSN-011 | Compliance Officer             | POPIA/GDPR/ISO-aligned controls                                  | Weak retention/audit                 | Policy coverage; retention OK                     | SR-011     |
| PSN-012 | Auditor                        | Prove who certified what                                         | Missing immutable trails             | Audit export completeness                         | SR-012     |
| PSN-013 | Customer (external enterprise) | Branded QEP; enterprise SSO                                      | Engine logins; brand leakage         | SSO success; brand-mask pass                      | SR-013     |
| PSN-014 | Third-party Integrator         | Stable APIs, webhooks, MCP tools                                 | Undocumented APIs                    | OpenAPI completeness; webhook reliability         | SR-014     |
| PSN-015 | AI Agent                       | Assist QE tasks within policy                                    | Unbounded tool access                | Tool calls authorised; zero auto-certify          | SR-015     |

## Persona notes

- **Superadmin** remains a Platform permission tier, not a normal QEP persona.
- **AI Agent** is a non-human actor constrained by AIR-* and MCP IR; never SoR.
