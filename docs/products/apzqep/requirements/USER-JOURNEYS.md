# APZ QEP — User Journeys

> **Programme:** APZQEP-REQ-001 · IDs: UJ-*  
> **Rule:** Journeys are requirements intent — UI/flow design belongs to Definition.

## Core journeys

| ID     | Journey                             | Primary persona(s)               | Steps (intent)                                                    | Outcome                                   | Linked requirements               |
| ------ | ----------------------------------- | -------------------------------- | ----------------------------------------------------------------- | ----------------------------------------- | --------------------------------- |
| UJ-001 | Create a requirement                | BA, Product Owner                | Draft → review → approve → link to product/release                | Approved requirement in SoR               | FR-002, FR-003                    |
| UJ-002 | Create verification                 | QA Engineer                      | Select requirement(s) → create procedure/suite → version          | Traceable verification procedure          | FR-004–FR-006, FR-014             |
| UJ-003 | Run verification (manual)           | QA Engineer                      | Start run → execute steps → record result → attach evidence       | Run result + evidence in SoR              | FR-012, FR-019                    |
| UJ-004 | Run / ingest automated verification | Automation Engineer              | CI completes → ingest via Service/Connector → link run            | Automated result in SoR                   | FR-007, FR-008, FR-039, IR-016    |
| UJ-005 | AI-assisted verification            | QA Engineer, AI Agent            | Request draft → review explanation → accept/edit/reject → commit  | Human-accepted procedure; AI audit logged | FR-009, AIR-003, AIR-013, AIR-016 |
| UJ-006 | Manage defects                      | Developer, QA                    | Fail run → raise defect → link → triage → resolve → re-verify     | Closed defect with verification link      | FR-015                            |
| UJ-007 | Prepare release                     | Release Manager, PM              | Select release → review coverage/gates/defects/evidence           | Readiness pack ready for cert             | FR-017, FR-036, RPT-004           |
| UJ-008 | Certification                       | Release Manager, Auditor         | Review pack → multi-role approve/reject → sign-off recorded       | Certified or held; immutable audit        | FR-018, FR-037, RR-009, RR-010    |
| UJ-009 | Executive reporting                 | Executive                        | Open executive dashboard → drill to risk/readiness                | Informed portfolio decision               | RPT-001, SR-001                   |
| UJ-010 | Continuous certification signal     | Release Manager, Ops             | Change detected → re-cert signal → human re-approval path         | Cert state updated only by human          | FR-018, FR-042                    |
| UJ-011 | Compliance audit export             | Auditor, Compliance              | Query audit → export cert/privileged history                      | Exportable evidence pack                  | RPT-005, RPT-009, SEC audit       |
| UJ-012 | Integrator API / MCP                | Third-party Integrator, AI Agent | Authenticate → call REST/MCP tool → gated write with user confirm | Authorised integration without SoR bypass | FR-029, FR-041, IR-019, IR-033    |

## Journey coverage by persona

Every PSN-* has at least one primary journey above or via dashboards/admin (PSN-009 Ops → health/observability IR-008; PSN-010 Support → known limitations NFR-016; PSN-011 Compliance → UJ-011).
